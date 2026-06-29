"""
Stage 4 — Graph neural network (GraphSAGE) on the Elliptic transaction graph.
Node classification: illicit (1) vs licit (0). Uses the graph structure
(edgelist) so each transaction is judged partly by its neighbours — the core
graph-analysis contribution. Temporal masks: train t<=34, test t>=35.

Run: backend/venv/Scripts/python.exe ml_pipeline/elliptic_train_gnn.py
"""
import json
import os
import numpy as np
import pandas as pd
import torch
import torch.nn.functional as F
from torch_geometric.data import Data
from torch_geometric.nn import SAGEConv
from sklearn.metrics import (accuracy_score, f1_score, precision_score,
                             recall_score, roc_auc_score, confusion_matrix)

BASE = os.path.dirname(__file__)
DATA = os.path.join(BASE, "..", "data", "elliptic")
MODEL_DIR = os.path.join(BASE, "..", "models")
GNN_PATH = os.path.join(MODEL_DIR, "elliptic_gnn.pt")
METRICS_PATH = os.path.join(MODEL_DIR, "elliptic_gnn_metrics.json")
EMB_PATH = os.path.join(MODEL_DIR, "elliptic_gnn_embeddings.npy")

SPLIT_STEP = 34
torch.manual_seed(42)


def build_graph():
    feats = pd.read_csv(os.path.join(DATA, "elliptic_txs_features.csv"), header=None)
    classes = pd.read_csv(os.path.join(DATA, "elliptic_txs_classes.csv"))
    edges = pd.read_csv(os.path.join(DATA, "elliptic_txs_edgelist.csv"))

    feats = feats.rename(columns={0: "txId", 1: "time_step"})
    feats = feats.merge(classes, on="txId", how="left")

    # Map labels: '1' illicit->1, '2' licit->0, else -1 (unknown, masked out)
    label_map = {"1": 1, "2": 0}
    feats["label"] = feats["class"].map(label_map).fillna(-1).astype(int)

    # Index every txId to a contiguous node id
    tx_ids = feats["txId"].values
    id_to_idx = {tx: i for i, tx in enumerate(tx_ids)}

    feature_cols = [c for c in feats.columns if c not in ("txId", "time_step", "class", "label")]
    x = torch.tensor(feats[feature_cols].values, dtype=torch.float)
    y = torch.tensor(feats["label"].values, dtype=torch.long)
    time_step = feats["time_step"].values

    # Edges -> index pairs (drop any endpoint not in node set), make undirected
    e = edges[edges["txId1"].isin(id_to_idx) & edges["txId2"].isin(id_to_idx)]
    src = e["txId1"].map(id_to_idx).values
    dst = e["txId2"].map(id_to_idx).values
    edge_index = torch.tensor(np.vstack([np.concatenate([src, dst]),
                                         np.concatenate([dst, src])]), dtype=torch.long)

    data = Data(x=x, y=y, edge_index=edge_index)
    labeled = feats["label"].values >= 0
    data.train_mask = torch.tensor(labeled & (time_step <= SPLIT_STEP))
    data.test_mask = torch.tensor(labeled & (time_step > SPLIT_STEP))
    return data


class GraphSAGE(torch.nn.Module):
    def __init__(self, in_dim, hidden=128):
        super().__init__()
        self.conv1 = SAGEConv(in_dim, hidden)
        self.conv2 = SAGEConv(hidden, hidden)
        self.lin = torch.nn.Linear(hidden, 2)

    def forward(self, x, edge_index, return_emb=False):
        h = F.relu(self.conv1(x, edge_index))
        h = F.dropout(h, p=0.3, training=self.training)
        h = F.relu(self.conv2(h, edge_index))
        if return_emb:
            return h
        return self.lin(h)


def main():
    print("Building graph…")
    data = build_graph()
    print(f"Nodes: {data.num_nodes:,} | Edges: {data.edge_index.size(1):,} | "
          f"train {int(data.train_mask.sum()):,} / test {int(data.test_mask.sum()):,}")

    model = GraphSAGE(data.num_node_features)
    opt = torch.optim.Adam(model.parameters(), lr=0.01, weight_decay=5e-4)
    # Class weights to counter imbalance (illicit is the minority)
    y_train = data.y[data.train_mask]
    w = torch.tensor([1.0, (y_train == 0).sum() / max((y_train == 1).sum(), 1)], dtype=torch.float)

    print("Training GraphSAGE…")
    for epoch in range(1, 201):
        model.train()
        opt.zero_grad()
        out = model(data.x, data.edge_index)
        loss = F.cross_entropy(out[data.train_mask], data.y[data.train_mask], weight=w)
        loss.backward()
        opt.step()
        if epoch % 40 == 0:
            print(f"  epoch {epoch:3d}  loss {loss.item():.4f}")

    model.eval()
    with torch.no_grad():
        logits = model(data.x, data.edge_index)
        prob = F.softmax(logits, dim=1)[:, 1].numpy()
        pred = logits.argmax(dim=1).numpy()
        emb = model(data.x, data.edge_index, return_emb=True).numpy()

    m = data.test_mask.numpy()
    yt = data.y.numpy()[m]
    yp = pred[m]
    pr = prob[m]
    tn, fp, fn, tp = confusion_matrix(yt, yp).ravel()

    metrics = {
        "model_version": "elliptic-gnn-1.0",
        "model_type": "GraphSAGE",
        "accuracy": round(float(accuracy_score(yt, yp)), 4),
        "precision": round(float(precision_score(yt, yp, zero_division=0)), 4),
        "recall": round(float(recall_score(yt, yp, zero_division=0)), 4),
        "f1_score": round(float(f1_score(yt, yp, zero_division=0)), 4),
        "auc_roc": round(float(roc_auc_score(yt, pr)), 4),
    }
    print("\n=== Elliptic GraphSAGE (illicit = positive) ===")
    for k, v in metrics.items():
        print(f"  {k}: {v}")
    print(f"  confusion: TN={tn:,} FP={fp:,} FN={fn:,} TP={tp:,}")

    os.makedirs(MODEL_DIR, exist_ok=True)
    torch.save(model.state_dict(), GNN_PATH)
    np.save(EMB_PATH, emb)
    json.dump(metrics, open(METRICS_PATH, "w"), indent=2)
    print(f"\nSaved GNN -> {GNN_PATH}")


if __name__ == "__main__":
    main()
