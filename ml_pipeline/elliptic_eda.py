"""
Stage 1 — Elliptic dataset exploration (read-only).
Confirms shapes, label distribution, time-step range, edge counts, and the
temporal split point before we design schema or models.
Run: backend/venv/Scripts/python.exe ml_pipeline/elliptic_eda.py
"""
import os
import pandas as pd

DATA = os.path.join(os.path.dirname(__file__), "..", "data", "elliptic")
F_FEATURES = os.path.join(DATA, "elliptic_txs_features.csv")
F_CLASSES = os.path.join(DATA, "elliptic_txs_classes.csv")
F_EDGES = os.path.join(DATA, "elliptic_txs_edgelist.csv")


def main():
    # Features file has NO header: col0 = txId, col1 = time step, col2.. = 165 more features
    feats = pd.read_csv(F_FEATURES, header=None)
    classes = pd.read_csv(F_CLASSES)
    edges = pd.read_csv(F_EDGES)

    n_feat_cols = feats.shape[1] - 1  # minus txId
    print("\n================ ELLIPTIC EDA ================")
    print(f"features.csv : {feats.shape[0]:,} rows x {feats.shape[1]} cols  ({n_feat_cols} features incl. time step)")
    print(f"classes.csv  : {classes.shape[0]:,} rows  | columns: {list(classes.columns)}")
    print(f"edgelist.csv : {edges.shape[0]:,} edges | columns: {list(edges.columns)}")

    # Time step is feature column index 1 (second column)
    time_step = feats[1]
    print(f"\nTime steps   : {int(time_step.min())} .. {int(time_step.max())}  ({time_step.nunique()} distinct)")
    print("Txns per time step (first 5):")
    print(time_step.value_counts().sort_index().head().to_string())

    # Label distribution: classes 'class' col has '1' (illicit), '2' (licit), 'unknown'
    label_col = classes.columns[1]
    dist = classes[label_col].value_counts(dropna=False)
    print(f"\nLabel distribution ('{label_col}'):")
    for k, v in dist.items():
        meaning = {"1": "ILLICIT", "2": "licit", "unknown": "unlabeled"}.get(str(k), str(k))
        print(f"  {str(k):8s} -> {meaning:9s} {v:>8,}  ({v/len(classes)*100:.1f}%)")

    labeled = dist.get("1", 0) + dist.get("2", 0)
    illicit = dist.get("1", 0)
    print(f"\nLabeled total: {labeled:,}  | illicit rate among labeled: {illicit/labeled*100:.2f}%")

    # Temporal split preview (paper splits ~34/35)
    id_col = classes.columns[0]
    merged = classes.merge(feats[[0, 1]].rename(columns={0: id_col, 1: "time_step"}), on=id_col, how="left")
    lab = merged[merged[label_col].isin(["1", "2"])]
    train = lab[lab["time_step"] <= 34]
    test = lab[lab["time_step"] >= 35]
    train_illicit = (train[label_col] == "1").sum()
    test_illicit = (test[label_col] == "1").sum()
    print(f"\nTemporal split @ t<=34 / t>=35:")
    print(f"  train labeled: {len(train):,}  (illicit {train_illicit:,})")
    print(f"  test  labeled: {len(test):,}  (illicit {test_illicit:,})")
    print("==============================================\n")


if __name__ == "__main__":
    main()
