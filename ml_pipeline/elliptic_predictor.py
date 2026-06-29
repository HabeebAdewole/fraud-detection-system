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
