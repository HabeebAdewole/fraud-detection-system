"""
Build a compact serving bundle the Flask app uses at request time:
  models/elliptic_serving.npz  ->  tx_ids, raw features, gnn_prob, time_step, label
RF is scored live from these features; GNN probability is precomputed here.

Run: backend/venv/Scripts/python.exe ml_pipeline/elliptic_build_serving.py
"""
import os
import numpy as np
import pandas as pd
import torch
import torch.nn.functional as F
from torch_geometric.data import Data
from torch_geometric.nn import SAGEConv

BASE = os.path.dirname(__file__)
DATA = os.path.join(BASE, "..", "data", "elliptic")
MODEL_DIR = os.path.join(BASE, "..", "models")
GNN_PATH = os.path.join(MODEL_DIR, "elliptic_gnn.pt")
OUT = os.path.join(MODEL_DIR, "elliptic_serving.npz")
SPLIT_STEP = 34


class GraphSAGE(torch.nn.Module):
    def __init__(self, in_dim, hidden=128):
        super().__init__()
        self.conv1 = SAGEConv(in_dim, hidden)
        self.conv2 = SAGEConv(hidden, hidden)
        self.lin = torch.nn.Linear(hidden, 2)

    def forward(self, x, edge_index):
        h = F.relu(self.conv1(x, edge_index))
        h = F.relu(self.conv2(h, edge_index))
        return self.lin(h)


def main():
    feats = pd.read_csv(os.path.join(DATA, "elliptic_txs_features.csv"), header=None)
    classes = pd.read_csv(os.path.join(DATA, "elliptic_txs_classes.csv"))
    edges = pd.read_csv(os.path.join(DATA, "elliptic_txs_edgelist.csv"))
    feats = feats.rename(columns={0: "txId", 1: "time_step"}).merge(classes, on="txId", how="left")

    label_str = feats["class"].map({"1": "illicit", "2": "licit"}).fillna("unknown").values
    tx_ids = feats["txId"].values.astype(np.int64)
    time_step = feats["time_step"].values.astype(np.int32)
    feature_cols = [c for c in feats.columns if c not in ("txId", "time_step", "class", "label")]
    X = feats[feature_cols].values.astype(np.float32)

    # GNN forward for per-node illicit probability
    id_to_idx = {tx: i for i, tx in enumerate(tx_ids)}
    e = edges[edges["txId1"].isin(id_to_idx) & edges["txId2"].isin(id_to_idx)]
    src = e["txId1"].map(id_to_idx).values
    dst = e["txId2"].map(id_to_idx).values
    edge_index = torch.tensor(np.vstack([np.concatenate([src, dst]),
                                         np.concatenate([dst, src])]), dtype=torch.long)
    model = GraphSAGE(X.shape[1])
    model.load_state_dict(torch.load(GNN_PATH))
    model.eval()
    with torch.no_grad():
        logits = model(torch.tensor(X), edge_index)
        gnn_prob = F.softmax(logits, dim=1)[:, 1].numpy().astype(np.float32)

    np.savez_compressed(OUT, tx_ids=tx_ids, X=X, gnn_prob=gnn_prob,
                        time_step=time_step, label=label_str)
    print(f"Saved serving bundle -> {OUT}")
    print(f"  {len(tx_ids):,} transactions | {X.shape[1]} features | gnn_prob range "
          f"[{gnn_prob.min():.3f}, {gnn_prob.max():.3f}]")


if __name__ == "__main__":
    main()
