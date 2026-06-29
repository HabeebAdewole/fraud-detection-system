"""
Load the Elliptic transactions + edges into MySQL and seed ModelMetrics.
Idempotent: clears the transaction/edge/model_metrics tables first.

Run: backend/venv/Scripts/python.exe ml_pipeline/elliptic_load_db.py
"""
import json
import os
import pandas as pd
from sqlalchemy import create_engine, text

BASE = os.path.dirname(__file__)
DATA = os.path.join(BASE, "..", "data", "elliptic")
MODEL_DIR = os.path.join(BASE, "..", "models")
DB_URL = os.environ.get("DATABASE_URL", "mysql+pymysql://root:@localhost/elliptic_fraud")

METRIC_FILES = [
    ("elliptic_metrics.json", "elliptic-rf-1.0"),
    ("elliptic_gnn_metrics.json", "elliptic-gnn-1.0"),
    ("elliptic_combo_metrics.json", "elliptic-combo-1.0"),
]


def main():
    engine = create_engine(DB_URL)

    classes = pd.read_csv(os.path.join(DATA, "elliptic_txs_classes.csv"))
    feats_meta = pd.read_csv(os.path.join(DATA, "elliptic_txs_features.csv"),
                             header=None, usecols=[0, 1]).rename(columns={0: "txId", 1: "time_step"})
    edges = pd.read_csv(os.path.join(DATA, "elliptic_txs_edgelist.csv"))

    tx = feats_meta.merge(classes, on="txId", how="left")
    tx["label"] = tx["class"].map({"1": "illicit", "2": "licit"}).fillna("unknown")
    tx = tx.rename(columns={"txId": "tx_id"})[["tx_id", "time_step", "label"]]
    edges = edges.rename(columns={"txId1": "source_tx", "txId2": "target_tx"})

    with engine.begin() as conn:
        conn.execute(text("SET FOREIGN_KEY_CHECKS=0"))
        for t in ("alert", "prediction", "edge", "transaction", "model_metrics"):
            conn.execute(text(f"DELETE FROM {t}"))
        conn.execute(text("SET FOREIGN_KEY_CHECKS=1"))

    print(f"Loading {len(tx):,} transactions…")
    tx.to_sql("transaction", engine, if_exists="append", index=False, chunksize=5000, method="multi")
    print(f"Loading {len(edges):,} edges…")
    edges.to_sql("edge", engine, if_exists="append", index=False, chunksize=5000, method="multi")

    # Seed ModelMetrics from saved JSONs
    rows = []
    for fname, version in METRIC_FILES:
        p = os.path.join(MODEL_DIR, fname)
        if os.path.exists(p):
            m = json.load(open(p))
            rows.append({
                "model_version": m.get("model_version", version),
                "model_type": m.get("model_type"),
                "accuracy": m["accuracy"], "precision": m["precision"],
                "recall": m["recall"], "f1_score": m["f1_score"], "auc_roc": m["auc_roc"],
            })
    if rows:
        pd.DataFrame(rows).to_sql("model_metrics", engine, if_exists="append", index=False)
    print(f"Seeded {len(rows)} model metric rows.")
    print("Done.")


if __name__ == "__main__":
    main()
