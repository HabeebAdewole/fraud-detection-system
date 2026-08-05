"""
Per-transaction XAI for the Random Forest via decision-path attribution
(the Saabas method — the direct precursor of TreeSHAP).

For every tree, we walk the decision path of the transaction; each split
changes the tree's expected illicit probability, and that change is credited
to the feature that made the split. Averaged over all 200 trees, this yields
per-feature contributions that sum EXACTLY to (prediction - base rate) —
the same additivity property SHAP provides.

Chosen over the shap library because Windows Application Control blocks
numba's unsigned DLLs on this machine; this implementation is pure
numpy/sklearn and dependency-free.

Elliptic's features are anonymised, so single-feature names carry no business
meaning; what IS meaningful is the split between the transaction's OWN
features (V1..V93, "local") and its NEIGHBOURHOOD-aggregate features
(V94..V165, "aggregate"). Explanations return both the top individual
contributions and the local-vs-aggregate group totals.
"""
import os

import joblib
import numpy as np

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
N_LOCAL = 93

_rf = None
_scaler = None
_bundle = None
_index = None


def _load():
    """Reuse the artifacts elliptic_predictor already holds rather than loading
    a second copy. The feature matrix alone is ~134 MB in memory, so two copies
    would roughly double the process footprint for no benefit."""
    global _rf, _scaler, _bundle, _index
    if _rf is not None:
        return
    import elliptic_predictor as ep
    ep._load()
    _rf, _scaler, _bundle, _index = ep._rf, ep._scaler, ep._bundle, ep._index


def _path_contributions(x_scaled):
    """Saabas attributions for one sample across the whole forest.
    Returns (contributions[n_features], base_value)."""
    n_features = x_scaled.shape[1]
    contribs = np.zeros(n_features)
    base = 0.0

    for est in _rf.estimators_:
        tree = est.tree_
        # Illicit-class probability at every node
        node_prob = tree.value[:, 0, 1] / tree.value[:, 0, :].sum(axis=1)

        node = 0
        base += node_prob[0]
        while tree.children_left[node] != -1:  # not a leaf
            feat = tree.feature[node]
            nxt = (tree.children_left[node]
                   if x_scaled[0, feat] <= tree.threshold[node]
                   else tree.children_right[node])
            contribs[feat] += node_prob[nxt] - node_prob[node]
            node = nxt

    n = len(_rf.estimators_)
    return contribs / n, base / n


def explain(tx_id: int, top_n: int = 8) -> dict:
    """Top feature contributions to the RF's illicit probability for tx_id."""
    _load()
    i = _index[int(tx_id)]
    x = _scaler.transform(_bundle["X"][i].reshape(1, -1))

    values, base = _path_contributions(x)
    order = np.argsort(np.abs(values))[::-1][:top_n]

    contributions = [{
        "feature": f"V{int(j)+1}",
        "group": "local" if j < N_LOCAL else "aggregate",
        "value": round(float(values[j]), 4),
    } for j in order]

    prob = float(_rf.predict_proba(x)[0][1])

    return {
        "tx_id": int(tx_id),
        "model": "RandomForest",
        "method": "decision-path attribution (Saabas)",
        "probability": round(prob, 4),
        "base_value": round(float(base), 4),
        "contributions": contributions,
        "group_totals": {
            "local": round(float(values[:N_LOCAL].sum()), 4),
            "aggregate": round(float(values[N_LOCAL:].sum()), 4),
        },
    }
