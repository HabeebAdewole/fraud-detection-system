"""
Build a presentation demo shortlist: well-connected transactions with
interesting stories (illicit hubs, unknowns the models disagree on, clean
licit hubs). Writes .plans/demo-shortlist.md.

Run: backend/venv/Scripts/python.exe ml_pipeline/make_demo_shortlist.py
"""
import os
import numpy as np
import pandas as pd
from sqlalchemy import create_engine, text
import joblib

BASE = os.path.dirname(__file__)
MODEL_DIR = os.path.join(BASE, "..", "models")
OUT = os.path.join(BASE, "..", ".plans", "demo-shortlist.md")
DB_URL = os.environ.get("DATABASE_URL", "mysql+pymysql://root:@localhost/elliptic_fraud")

rf = joblib.load(os.path.join(MODEL_DIR, "elliptic_rf.pkl"))
scaler = joblib.load(os.path.join(MODEL_DIR, "elliptic_scaler.pkl"))
bundle = np.load(os.path.join(MODEL_DIR, "elliptic_serving.npz"), allow_pickle=True)
idx = {int(t): i for i, t in enumerate(bundle["tx_ids"])}

engine = create_engine(DB_URL)
degrees = pd.read_sql(text("""
    SELECT t.tx_id, t.label, t.time_step, COUNT(*) AS degree
    FROM (SELECT source_tx AS tx FROM edge UNION ALL SELECT target_tx AS tx FROM edge) e
    JOIN transaction t ON t.tx_id = e.tx
    GROUP BY t.tx_id, t.label, t.time_step
    HAVING degree >= 5
    ORDER BY degree DESC
"""), engine)

def score(tx_id):
    i = idx[int(tx_id)]
    x = scaler.transform(bundle["X"][i].reshape(1, -1))
    return float(rf.predict_proba(x)[0][1]), float(bundle["gnn_prob"][i])

rows = []
for _, r in degrees.iterrows():
    if int(r.tx_id) not in idx:
        continue
    rf_p, gnn_p = score(r.tx_id)
    rows.append({**r.to_dict(), "rf": rf_p, "gnn": gnn_p, "gap": abs(rf_p - gnn_p)})
df = pd.DataFrame(rows)

illicit_hubs = df[df.label == "illicit"].nlargest(5, "degree")
licit_hubs = df[df.label == "licit"].nlargest(3, "degree")
unknown_hot = df[(df.label == "unknown") & (df.rf >= 0.5)].nlargest(5, "rf")
disagree = df[(df.label == "unknown") & (df.gap >= 0.3)].nlargest(5, "gap")

def table(sub):
    lines = ["| tx_id | label | step | neighbours | RF score | GNN score |",
             "|---|---|---|---|---|---|"]
    for _, r in sub.iterrows():
        lines.append(f"| `{int(r.tx_id)}` | {r.label} | {int(r.time_step)} | {int(r.degree)} "
                     f"| {r.rf*100:.1f}% | {r.gnn*100:.1f}% |")
    return "\n".join(lines)

md = f"""# Presentation Demo Shortlist
Generated from the live database + models. Search these IDs in the Analyze page.

## 1. Illicit hubs — the "wow" graphs (big red networks)
Known-illicit transactions with the most connections. Great for showing the subgraph view.
{table(illicit_hubs)}

## 2. Unknowns the model flags — genuine live predictions
Label is `unknown` (no ground truth exists anywhere). The model still flags them.
Say: "no one knows the answer here — this is real inference."
{table(unknown_hot)}

## 3. RF vs GNN disagreements on unknowns — proof the graph matters
Same transaction, two very different scores. The gap IS the network's contribution.
{table(disagree)}

## 4. Licit hubs — busy but clean (control case)
High connectivity alone is not suspicious; the model clears these.
{table(licit_hubs)}
"""
os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, "w", encoding="utf-8").write(md)
print(md)
print(f"\nSaved -> {OUT}")
