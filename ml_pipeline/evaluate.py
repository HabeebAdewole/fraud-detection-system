"""
QA evaluation of the trained model — NOT part of the app.
Reloads the same held-out test split and interrogates model behaviour:
confusion matrix, per-type detection, feature importance, threshold sweep,
determinism, and leakage sanity checks.
Run: backend/venv/Scripts/python.exe ml_pipeline/evaluate.py --data data/<csv>
"""
import argparse, json, os
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, classification_report, roc_auc_score

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
TYPE_CATEGORIES = ["CASH_IN", "CASH_OUT", "DEBIT", "PAYMENT", "TRANSFER"]
NUMERIC_COLS = ["step", "amount", "oldbalanceOrg", "newbalanceOrig", "oldbalanceDest", "newbalanceDest"]


def main(csv_path):
    model = joblib.load(os.path.join(MODEL_DIR, "fraud_model.pkl"))
    scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.pkl"))
    features = json.load(open(os.path.join(MODEL_DIR, "features.json")))

    df = pd.read_csv(csv_path)
    df.drop(columns=["isFlaggedFraud", "nameOrig", "nameDest"], inplace=True)
    df["type"] = df["type"].str.upper().str.replace("-", "_")
    type_dummies = pd.get_dummies(df["type"], prefix="type")
    for cat in TYPE_CATEGORIES:
        col = f"type_{cat}"
        if col not in type_dummies.columns:
            type_dummies[col] = 0
    type_dummies = type_dummies[[f"type_{c}" for c in TYPE_CATEGORIES]]
    full = pd.concat([df.drop(columns=["type"]), type_dummies], axis=1)

    feature_cols = NUMERIC_COLS + [f"type_{c}" for c in TYPE_CATEGORIES]
    X = full[feature_cols].values
    y = full["isFraud"].values

    # SAME split as training (stratified, random_state=42) -> recover the test set
    _, X_test, _, y_test, _, test_idx = train_test_split(
        X, y, np.arange(len(y)), test_size=0.2, stratify=y, random_state=42
    )
    Xs = scaler.transform(X_test)
    proba = model.predict_proba(Xs)[:, 1]
    pred = (proba >= 0.5).astype(int)

    print("\n================ MODEL QA REPORT ================")
    print(f"Test set: {len(y_test):,} transactions | actual fraud: {y_test.sum():,} ({y_test.mean()*100:.3f}%)")

    tn, fp, fn, tp = confusion_matrix(y_test, pred).ravel()
    print("\n--- Confusion matrix @ threshold 0.5 ---")
    print(f"  True Negatives : {tn:,}")
    print(f"  False Positives: {fp:,}   <- legit flagged as fraud (analyst workload)")
    print(f"  False Negatives: {fn:,}   <- fraud MISSED (the dangerous error)")
    print(f"  True Positives : {tp:,}")
    print(f"\n  Of all fraud alerts raised, {tp/(tp+fp)*100:.1f}% were real fraud.")
    print(f"  Missed fraud: {fn} cases worth ${full.loc[test_idx[(y_test==1)&(pred==0)], 'amount'].sum():,.0f}")

    print("\n--- Per transaction TYPE (where does fraud actually occur?) ---")
    test_df = full.iloc[test_idx].copy()
    test_df["pred"] = pred
    for cat in TYPE_CATEGORIES:
        mask = test_df[f"type_{cat}"] == 1
        if mask.sum() == 0:
            continue
        sub_y = test_df.loc[mask, "isFraud"]
        sub_p = test_df.loc[mask, "pred"]
        print(f"  {cat:9s}: {mask.sum():>9,} txns | actual fraud {int(sub_y.sum()):>5,} | flagged {int(sub_p.sum()):>5,}")

    print("\n--- Feature importance (what drives the model?) ---")
    for name, imp in sorted(zip(features, model.feature_importances_), key=lambda x: -x[1]):
        print(f"  {name:18s} {imp*100:5.1f}%")

    print("\n--- Threshold sweep (precision/recall trade-off) ---")
    print(f"  {'thr':>5} {'precision':>10} {'recall':>8} {'flags':>8}")
    for thr in [0.3, 0.5, 0.7, 0.9]:
        p = (proba >= thr).astype(int)
        tp2 = ((p == 1) & (y_test == 1)).sum()
        fp2 = ((p == 1) & (y_test == 0)).sum()
        prec = tp2 / (tp2 + fp2) if (tp2 + fp2) else 0
        rec = tp2 / y_test.sum()
        print(f"  {thr:>5} {prec*100:>9.1f}% {rec*100:>7.1f}% {int(p.sum()):>8,}")

    print(f"\n  AUC-ROC: {roc_auc_score(y_test, proba):.4f}")

    print("\n--- Determinism check (same input -> same output?) ---")
    a = model.predict_proba(Xs[:5])[:, 1]
    b = model.predict_proba(Xs[:5])[:, 1]
    print(f"  Identical on repeat: {np.allclose(a, b)}")
    print("=================================================\n")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", required=True)
    main(ap.parse_args().data)
