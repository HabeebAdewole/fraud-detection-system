"""
Inference module: loads the saved model + scaler and exposes a predict() function
called by the Flask ML Prediction Service.
"""

import json
import os
import joblib
import numpy as np

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
MODEL_PATH = os.path.join(MODEL_DIR, "fraud_model.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")
FEATURE_PATH = os.path.join(MODEL_DIR, "features.json")

TYPE_CATEGORIES = ["CASH_IN", "CASH_OUT", "DEBIT", "PAYMENT", "TRANSFER"]
NUMERIC_COLS = ["step", "amount", "oldbalanceOrg", "newbalanceOrig",
                "oldbalanceDest", "newbalanceDest"]

_model = None
_scaler = None
_features = None


def _load():
    global _model, _scaler, _features
    if _model is None:
        _model = joblib.load(MODEL_PATH)
        _scaler = joblib.load(SCALER_PATH)
        with open(FEATURE_PATH) as f:
            _features = json.load(f)


def predict(transaction: dict) -> dict:
    """
    transaction keys: step, type, amount, oldbalanceOrg, newbalanceOrig,
                      oldbalanceDest, newbalanceDest
    Returns: {"predicted_class": int, "fraud_probability": float}
    """
    _load()

    tx_type = str(transaction.get("type", "")).upper().replace("-", "_")

    row = {col: float(transaction.get(col, 0)) for col in NUMERIC_COLS}
    for cat in TYPE_CATEGORIES:
        row[f"type_{cat}"] = 1.0 if tx_type == cat else 0.0

    X = np.array([[row[f] for f in _features]])
    X_scaled = _scaler.transform(X)

    predicted_class = int(_model.predict(X_scaled)[0])
    fraud_probability = float(_model.predict_proba(X_scaled)[0][1])

    return {
        "predicted_class": predicted_class,
        "fraud_probability": round(fraud_probability, 4),
    }
