# Phase Plan — Migrate to Elliptic + Graph Analysis

## Goal
Re-base the fraud system on the **Elliptic Bitcoin dataset** and add graph analysis:
a Random Forest baseline on the 166 features, then a Graph Neural Network (GCN/GraphSAGE)
as the novel contribution — reproducing & extending Weber et al. (2019),
*"Anti-Money Laundering in Bitcoin."*

## Key decisions (DISCUSS — agreed)
- Dataset: Elliptic (txs_features, txs_classes, txs_edgelist).
- Model: RF baseline → GNN showpiece → (stretch) RF + graph-embedding combo.
- **Temporal split** train/test by time step (train ≤34, test ≥35), NOT random — matches the paper.
- Analyst UX changes from "type a transaction" to "look up an existing transaction + view its subgraph."
- Built on branch `feature/elliptic-graph-analysis`; PaySim system stays intact on `develop`/`main`.
- Feature storage: keep the 166-feature matrix in files for ML; DB stores tx metadata (id, time_step, label, score) + an edges table for lookup/visualisation.

## Open methodology notes
- Only ~23% of nodes are labeled (illicit/licit); ~77% unknown. Train/eval on labeled only.
- Headline metrics = precision/recall/F1 on the **illicit** class (imbalanced ~10%).
- PyTorch Geometric needed for the GNN (CPU is fine at ~200k nodes).

---

## Task list

### 1 — Data & exploration
1.1 Place the 3 CSVs in `data/elliptic/`.
1.2 EDA script: shapes, label distribution, time-step range, edge counts, illicit rate.

### 2 — Data layer (schema)
2.1 Redesign `Transaction` for Elliptic: `tx_id` (PK), `time_step`, `label` (illicit/licit/unknown).
2.2 New `Edge` table: `source_tx`, `target_tx`.
2.3 Keep Prediction/Alert/Report/ModelMetrics; repoint FKs to `tx_id`.
2.4 Loader script: CSVs → MySQL (tx + edges), idempotent.

### 3 — ML pipeline (RF baseline)
3.1 Preprocess: merge features+classes, filter labeled, temporal split, scale.
3.2 Train RF (+ SMOTE on train), evaluate illicit precision/recall/F1/AUC.
3.3 Serialise model + metrics (reuse existing pattern).

### 4 — ML pipeline (GNN showpiece)
4.1 Install PyTorch + PyTorch Geometric; build the graph (nodes=tx, edges=edgelist).
4.2 Train GraphSAGE/GCN with temporal split; evaluate same metrics.
4.3 (Stretch) Combine RF + GNN node embeddings for the headline result.
4.4 Serialise GNN + metrics; store both model versions in ModelMetrics.

### 5 — Backend
5.1 Prediction service: score by `tx_id` (RF and/or GNN), not by typed input.
5.2 Endpoint: transaction lookup + k-hop subgraph (for visualisation).
5.3 Endpoint: browse/search transactions; keep alerts on illicit predictions.
5.4 Update metrics endpoint to expose both models.

### 6 — Frontend
6.1 Replace "Analyze Transaction" form with **transaction lookup/browse**.
6.2 Result view: risk score + **subgraph visualisation** (node coloured by risk, neighbours shown).
6.3 Update Overview/Model Health to the new numbers and the RF-vs-GNN comparison.
6.4 Reframe copy for Bitcoin AML context.

### 7 — Verify & Ship
7.1 Compare RF vs GNN; write results table.
7.2 Update README + report framing (mobile money → Bitcoin AML).
7.3 PR `feature/elliptic-graph-analysis` → `develop`.

## Out of scope (for now)
- Real-time blockchain ingestion (use the static dataset).
- The "unknown" 77% of nodes beyond optional semi-supervised mention.
- Replacing the auth/roles/reports skeleton (reused as-is).
