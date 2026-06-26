"""
ML Pipeline: Load PaySim CSV → preprocess → SMOTE → train Random Forest → evaluate → save model + metrics.
Run: python ml_pipeline/train.py --data data/paysim.csv
"""

import argparse
import json
import os
import joblib
import numpy as np
import pandas as pd
from imblearn.over_sampling import SMOTE
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (accuracy_score, f1_score, precision_score,
                             recall_score, roc_auc_score)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
METRICS_PATH = os.path.join(MODEL_DIR, "metrics.json")
MODEL_PATH = os.path.join(MODEL_DIR, "fraud_model.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")
FEATURE_PATH = os.path.join(MODEL_DIR, "features.json")

NUMERIC_COLS = ["step", "amount", "oldbalanceOrg", "newbalanceOrig",
                "oldbalanceDest", "newbalanceDest"]
TYPE_CATEGORIES = ["CASH_IN", "CASH_OUT", "DEBIT", "PAYMENT", "TRANSFER"]


def load_and_preprocess(csv_path: str):
    df = pd.read_csv(csv_path)

    # Drop columns not used in prediction
    df.drop(columns=["isFlaggedFraud", "nameOrig", "nameDest"], inplace=True)

    # Normalise type strings to match category names (PaySim uses hyphens)
    df["type"] = df["type"].str.upper().str.replace("-", "_")

    # One-hot encode transaction type
    type_dummies = pd.get_dummies(df["type"], prefix="type")
    for cat in TYPE_CATEGORIES:
        col = f"type_{cat}"
        if col not in type_dummies.columns:
            type_dummies[col] = 0
    type_dummies = type_dummies[[f"type_{c}" for c in TYPE_CATEGORIES]]

    df = pd.concat([df.drop(columns=["type"]), type_dummies], axis=1)

    feature_cols = NUMERIC_COLS + [f"type_{c}" for c in TYPE_CATEGORIES]
    X = df[feature_cols].values
    y = df["isFraud"].values
    return X, y, feature_cols


def train(csv_path: str):
    print("Loading data...")
    X, y, feature_cols = load_and_preprocess(csv_path)

    print(f"Dataset shape: {X.shape}, fraud rate: {y.mean():.4f}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )

    print("Applying SMOTE to training set...")
    smote = SMOTE(random_state=42)
    X_train_res, y_train_res = smote.fit_resample(X_train, y_train)
    print(f"After SMOTE — train size: {X_train_res.shape[0]}, fraud rate: {y_train_res.mean():.4f}")

    scaler = StandardScaler()
    X_train_res = scaler.fit_transform(X_train_res)
    X_test = scaler.transform(X_test)

    print("Training Random Forest...")
    clf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1, class_weight="balanced")
    clf.fit(X_train_res, y_train_res)

    y_pred = clf.predict(X_test)
    y_prob = clf.predict_proba(X_test)[:, 1]

    metrics = {
        "model_version": "1.0.0",
        "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
        "precision": round(float(precision_score(y_test, y_pred)), 4),
        "recall": round(float(recall_score(y_test, y_pred)), 4),
        "f1_score": round(float(f1_score(y_test, y_pred)), 4),
        "auc_roc": round(float(roc_auc_score(y_test, y_prob)), 4),
    }

    print("\n=== Model Metrics ===")
    for k, v in metrics.items():
        print(f"  {k}: {v}")

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(clf, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    with open(FEATURE_PATH, "w") as f:
        json.dump(feature_cols, f)
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"\nModel saved to {MODEL_PATH}")
    print(f"Metrics saved to {METRICS_PATH}")
    return metrics


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", required=True, help="Path to PaySim CSV file")
    args = parser.parse_args()
    train(args.data)
