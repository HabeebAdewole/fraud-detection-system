"""
Stage 3 — Random Forest baseline on the Elliptic dataset.
Classifies transactions as illicit (1) vs licit (0) using the 165 node features
(excluding txId and time step). Temporal split: train t<=34, test t>=35.
SMOTE on the training partition only. Mirrors Weber et al. (2019) RF baseline.

Run: backend/venv/Scripts/python.exe ml_pipeline/elliptic_train_rf.py
"""
import json
import os
import joblib
import numpy as np
import pandas as pd
from imblearn.over_sampling import SMOTE
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (accuracy_score, f1_score, precision_score,
                             recall_score, roc_auc_score, confusion_matrix)
from sklearn.preprocessing import StandardScaler

BASE = os.path.dirname(__file__)
DATA = os.path.join(BASE, "..", "data", "elliptic")
MODEL_DIR = os.path.join(BASE, "..", "models")
RF_PATH = os.path.join(MODEL_DIR, "elliptic_rf.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "elliptic_scaler.pkl")
FEATURES_PATH = os.path.join(MODEL_DIR, "elliptic_features.json")
METRICS_PATH = os.path.join(MODEL_DIR, "elliptic_metrics.json")

SPLIT_STEP = 34  # train <= 34, test >= 35 (paper convention)


def load():
    feats = pd.read_csv(os.path.join(DATA, "elliptic_txs_features.csv"), header=None)
    classes = pd.read_csv(os.path.join(DATA, "elliptic_txs_classes.csv"))
    feats = feats.rename(columns={0: "txId", 1: "time_step"})
    feats = feats.merge(classes, left_on="txId", right_on="txId", how="left")
    # Keep labeled only: class '1' illicit -> 1, '2' licit -> 0
    feats = feats[feats["class"].isin(["1", "2"])].copy()
    feats["label"] = (feats["class"] == "1").astype(int)
    # Feature matrix: drop txId, time_step, class, label (use the 165 anonymized features)
    feature_cols = [c for c in feats.columns if c not in ("txId", "time_step", "class", "label")]
    return feats, feature_cols


def main():
    df, feature_cols = load()
    print(f"Loaded {len(df):,} labeled transactions, {len(feature_cols)} features")

    train = df[df["time_step"] <= SPLIT_STEP]
    test = df[df["time_step"] > SPLIT_STEP]
    X_train, y_train = train[feature_cols].values, train["label"].values
    X_test, y_test = test[feature_cols].values, test["label"].values
    print(f"Train: {len(X_train):,} ({y_train.sum():,} illicit) | Test: {len(X_test):,} ({y_test.sum():,} illicit)")

    print("Applying SMOTE to training set...")
    X_train, y_train = SMOTE(random_state=42).fit_resample(X_train, y_train)

    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)

    print("Training Random Forest...")
    clf = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1, class_weight="balanced")
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    y_prob = clf.predict_proba(X_test)[:, 1]
    tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()

    metrics = {
        "model_version": "elliptic-rf-1.0",
        "model_type": "RandomForest",
        "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
        "precision": round(float(precision_score(y_test, y_pred)), 4),
        "recall": round(float(recall_score(y_test, y_pred)), 4),
        "f1_score": round(float(f1_score(y_test, y_pred)), 4),
        "auc_roc": round(float(roc_auc_score(y_test, y_prob)), 4),
    }

    print("\n=== Elliptic RF baseline (illicit = positive) ===")
    for k, v in metrics.items():
        print(f"  {k}: {v}")
    print(f"  confusion: TN={tn:,} FP={fp:,} FN={fn:,} TP={tp:,}")
    print(f"  illicit caught: {tp}/{tp+fn} | false alarms: {fp}")

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(clf, RF_PATH)
    joblib.dump(scaler, SCALER_PATH)
    json.dump(feature_cols, open(FEATURES_PATH, "w"))
    json.dump(metrics, open(METRICS_PATH, "w"), indent=2)
    print(f"\nSaved model -> {RF_PATH}")


if __name__ == "__main__":
    main()
