"""
Stage 4.3 — Combined model: Random Forest on [165 features + GNN embeddings].
Reproduces the Weber et al. (2019) finding that graph-learned embeddings boost
the feature-based classifier. Uses embeddings saved by elliptic_train_gnn.py.

Run: backend/venv/Scripts/python.exe ml_pipeline/elliptic_train_combo.py
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
EMB_PATH = os.path.join(MODEL_DIR, "elliptic_gnn_embeddings.npy")
COMBO_PATH = os.path.join(MODEL_DIR, "elliptic_combo.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "elliptic_combo_scaler.pkl")
METRICS_PATH = os.path.join(MODEL_DIR, "elliptic_combo_metrics.json")
SPLIT_STEP = 34


def main():
    feats = pd.read_csv(os.path.join(DATA, "elliptic_txs_features.csv"), header=None)
    classes = pd.read_csv(os.path.join(DATA, "elliptic_txs_classes.csv"))
    feats = feats.rename(columns={0: "txId", 1: "time_step"}).merge(classes, on="txId", how="left")

    emb = np.load(EMB_PATH)  # aligned with feats row order
    assert emb.shape[0] == len(feats), "embedding/feature row mismatch"

    feature_cols = [c for c in feats.columns if c not in ("txId", "time_step", "class", "label")]
    base_X = feats[feature_cols].values
    X_all = np.hstack([base_X, emb])  # features + GNN embeddings

    labeled = feats["class"].isin(["1", "2"]).values
    y_all = (feats["class"] == "1").astype(int).values
    ts = feats["time_step"].values

    tr = labeled & (ts <= SPLIT_STEP)
    te = labeled & (ts > SPLIT_STEP)
    X_train, y_train = X_all[tr], y_all[tr]
    X_test, y_test = X_all[te], y_all[te]
    print(f"Combined features: {X_all.shape[1]} dims ({base_X.shape[1]} raw + {emb.shape[1]} GNN)")

    X_train, y_train = SMOTE(random_state=42).fit_resample(X_train, y_train)
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)

    clf = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1, class_weight="balanced")
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    y_prob = clf.predict_proba(X_test)[:, 1]
    tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()

    metrics = {
        "model_version": "elliptic-combo-1.0",
        "model_type": "RandomForest + GNN embeddings",
        "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
        "precision": round(float(precision_score(y_test, y_pred)), 4),
        "recall": round(float(recall_score(y_test, y_pred)), 4),
        "f1_score": round(float(f1_score(y_test, y_pred)), 4),
        "auc_roc": round(float(roc_auc_score(y_test, y_prob)), 4),
    }
    print("\n=== Elliptic COMBINED (RF + GNN embeddings) ===")
    for k, v in metrics.items():
        print(f"  {k}: {v}")
    print(f"  confusion: TN={tn:,} FP={fp:,} FN={fn:,} TP={tp:,}")

    joblib.dump(clf, COMBO_PATH)
    joblib.dump(scaler, SCALER_PATH)
    json.dump(metrics, open(METRICS_PATH, "w"), indent=2)
    print(f"\nSaved combined model -> {COMBO_PATH}")


if __name__ == "__main__":
    main()
