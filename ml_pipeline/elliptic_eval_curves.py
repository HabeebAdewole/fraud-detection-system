"""
Compute visual-evaluation data for the admin dashboard:
ROC curves + confusion matrices (RF & GNN, temporal test split) and RF global
feature importances grouped local vs aggregate.
Writes models/elliptic_eval_curves.json (served by /api/admin/curves).

Run: backend/venv/Scripts/python.exe ml_pipeline/elliptic_eval_curves.py
"""
import json
import os

import joblib
import numpy as np
from sklearn.metrics import auc, confusion_matrix, roc_curve

BASE = os.path.dirname(__file__)
MODEL_DIR = os.path.join(BASE, "..", "models")
OUT = os.path.join(MODEL_DIR, "elliptic_eval_curves.json")
SPLIT_STEP = 34
N_LOCAL = 93  # Elliptic: first 93 features (after time step) describe the tx itself


def downsample(fpr, tpr, n=80):
    idx = np.unique(np.linspace(0, len(fpr) - 1, n).astype(int))
    return [[round(float(fpr[i]), 4), round(float(tpr[i]), 4)] for i in idx]


def main():
    rf = joblib.load(os.path.join(MODEL_DIR, "elliptic_rf.pkl"))
    scaler = joblib.load(os.path.join(MODEL_DIR, "elliptic_scaler.pkl"))
    b = np.load(os.path.join(MODEL_DIR, "elliptic_serving.npz"), allow_pickle=True)

    labels = b["label"]
    test_mask = (b["time_step"] > SPLIT_STEP) & np.isin(labels, ["illicit", "licit"])
    y = (labels[test_mask] == "illicit").astype(int)
    X = scaler.transform(b["X"][test_mask])

    print(f"Test split: {test_mask.sum():,} labeled transactions ({y.sum():,} illicit)")

    rf_prob = rf.predict_proba(X)[:, 1]
    gnn_prob = b["gnn_prob"][test_mask]

    models = {}
    for name, prob in (("rf", rf_prob), ("gnn", gnn_prob)):
        fpr, tpr, _ = roc_curve(y, prob)
        tn, fp, fn, tp = confusion_matrix(y, (prob >= 0.5).astype(int)).ravel()
        models[name] = {
            "roc": downsample(fpr, tpr),
            "auc": round(float(auc(fpr, tpr)), 4),
            "confusion": {"tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)},
        }
        print(f"  {name}: AUC {models[name]['auc']} | TP {tp} FP {fp} FN {fn} TN {tn}")

    # RF global feature importance, top 15, grouped local vs aggregate
    imp = rf.feature_importances_
    order = np.argsort(imp)[::-1][:15]
    top_features = [{
        "name": f"V{int(i)+1}",
        "group": "local" if i < N_LOCAL else "aggregate",
        "importance": round(float(imp[i]), 4),
    } for i in order]
    group_share = {
        "local": round(float(imp[:N_LOCAL].sum()), 4),
        "aggregate": round(float(imp[N_LOCAL:].sum()), 4),
    }
    print(f"  importance share: local {group_share['local']:.2%} / aggregate {group_share['aggregate']:.2%}")

    json.dump({
        "test_size": int(test_mask.sum()),
        "test_illicit": int(y.sum()),
        "models": models,
        "feature_importance": {"top": top_features, "group_share": group_share},
    }, open(OUT, "w"), indent=1)
    print(f"Saved -> {OUT}")


if __name__ == "__main__":
    main()
