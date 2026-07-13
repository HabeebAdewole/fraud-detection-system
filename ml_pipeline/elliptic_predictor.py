"""
Inference for the Flask app. Scores an existing Elliptic transaction by tx_id:
Random Forest is run live on the stored features; GraphSAGE probability is read
from the precomputed serving bundle.
"""
import json
import os
import joblib
import numpy as np

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
RF_PATH = os.path.join(MODEL_DIR, "elliptic_rf.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "elliptic_scaler.pkl")
SERVING_PATH = os.path.join(MODEL_DIR, "elliptic_serving.npz")

_rf = None
_scaler = None
_bundle = None
_index = None  # tx_id -> row


def _load():
    global _rf, _scaler, _bundle, _index
    if _rf is None:
        _rf = joblib.load(RF_PATH)
        _scaler = joblib.load(SCALER_PATH)
        _bundle = np.load(SERVING_PATH, allow_pickle=True)
        _index = {int(t): i for i, t in enumerate(_bundle["tx_ids"])}


def exists(tx_id: int) -> bool:
    _load()
    return int(tx_id) in _index


def screen_step(time_step: int, rf_threshold: float = 0.9, gnn_threshold: float = 0.99) -> dict:
    """Batch-screen every transaction in a time step (vectorized).
    Returns summary counts plus the flagged transactions with per-model scores.
    A transaction is flagged when EITHER model crosses ITS OWN threshold —
    per-model bars because the GNN's probabilities run overconfident, so its
    bar sits higher to keep alert precision comparable."""
    _load()
    steps = _bundle["time_step"]
    mask = steps == int(time_step)
    idxs = np.where(mask)[0]
    if len(idxs) == 0:
        return {"time_step": int(time_step), "screened": 0, "flagged": []}

    X = _scaler.transform(_bundle["X"][idxs])
    rf_probs = _rf.predict_proba(X)[:, 1]
    gnn_probs = _bundle["gnn_prob"][idxs]

    flagged = []
    for j, i in enumerate(idxs):
        rf_p, gnn_p = float(rf_probs[j]), float(gnn_probs[j])
        rf_hit, gnn_hit = rf_p >= rf_threshold, gnn_p >= gnn_threshold
        if rf_hit or gnn_hit:
            by = "both" if (rf_hit and gnn_hit) else ("rf" if rf_hit else "gnn")
            flagged.append({
                "tx_id": int(_bundle["tx_ids"][i]),
                "rf_probability": round(rf_p, 4),
                "gnn_probability": round(gnn_p, 4),
                "flagged_by": by,
                "true_label": str(_bundle["label"][i]),
            })
    return {"time_step": int(time_step), "screened": int(len(idxs)), "flagged": flagged}


def predict(tx_id: int, model: str = "rf") -> dict:
    """model: 'rf' or 'gnn'. Returns predicted_class + probability + both scores."""
    _load()
    i = _index[int(tx_id)]

    x = _scaler.transform(_bundle["X"][i].reshape(1, -1))
    rf_prob = float(_rf.predict_proba(x)[0][1])
    gnn_prob = float(_bundle["gnn_prob"][i])

    chosen = gnn_prob if model == "gnn" else rf_prob
    return {
        "model_type": "GraphSAGE" if model == "gnn" else "RandomForest",
        "predicted_class": int(chosen >= 0.5),
        "fraud_probability": round(chosen, 4),
        "rf_probability": round(rf_prob, 4),
        "gnn_probability": round(gnn_prob, 4),
        "true_label": str(_bundle["label"][i]),
    }
