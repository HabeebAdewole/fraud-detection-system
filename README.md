# Sentinel — ML-Based Financial Fraud Detection System
BSc Computer Science Final Year Project — Crescent University, Abeokuta

A web-based anti-money-laundering console for the Bitcoin blockchain. Two
machine-learning models — a **Random Forest** on transaction features and a
**GraphSAGE graph neural network** that also learns from each transaction's
position in the payment network — score real Bitcoin transactions for illicit
activity. Flagged transactions open alerts that human analysts review and
resolve. A **Live Monitor** replays the dataset's timeline as a stream,
screening every arriving transaction automatically.

**Dataset:** [Elliptic](https://www.kaggle.com/datasets/ellipticco/elliptic-data-set)
(Weber et al., 2019) — 203,769 real Bitcoin transactions, 234,355 payment-flow
edges, 49 time steps. Labels: 2.2% illicit · 20.6% licit · 77.1% unknown.

## Results (temporal split: train steps 1–34, test 35–49)

| Model | Accuracy | Precision | Recall | F1 (illicit) | AUC-ROC |
|---|---|---|---|---|---|
| **Random Forest** | 97.8% | 92.5% | 71.6% | **0.807** | 0.944 |
| GraphSAGE (GNN) | 96.7% | 84.7% | 59.3% | 0.697 | 0.897 |
| RF + GNN embeddings | 96.8% | 87.4% | 59.4% | 0.707 | 0.868 |

The RF result reproduces the published benchmark (Weber et al. report ≈0.79 F1).

## Architecture

```
React + Tailwind ("Sentinel" console)        Presentation
  Login · Overview · Live Monitor · Analyze (2-hop graph view)
  Alerts · Reports · Admin (users, model benchmark)
        │  JWT (role-based: analyst / admin)
Flask REST API                                Application
  auth · transactions · predictions · monitor · reports · admin
  ML services: live RF scoring + precomputed GNN probabilities
        │
MySQL (elliptic_fraud) + model artifacts      Data
  transaction · edge · prediction · alert · report
  model_metrics · monitor_state · user
  models/: elliptic_rf.pkl, elliptic_gnn.pt, elliptic_serving.npz
```

## Project structure

```
fraud-detection/
├── data/elliptic/          ← the 3 Elliptic CSVs (download from Kaggle)
├── models/                 ← trained artifacts (generated locally, gitignored)
├── ml_pipeline/
│   ├── elliptic_eda.py             dataset exploration
│   ├── elliptic_train_rf.py        Random Forest baseline (SMOTE, temporal split)
│   ├── elliptic_train_gnn.py       GraphSAGE training
│   ├── elliptic_train_combo.py     RF + GNN-embedding ensemble
│   ├── elliptic_build_serving.py   builds the serving bundle (features + GNN probs)
│   ├── elliptic_load_db.py         loads transactions/edges/metrics into MySQL
│   ├── elliptic_predictor.py       inference used by Flask (single + batch)
│   ├── make_demo_shortlist.py      curates presentation-ready transaction IDs
│   └── train.py / predictor.py / evaluate.py   (iteration 1: PaySim version)
├── backend/                Flask API (+ seed_users.py)
├── frontend/               React + Vite + Tailwind
├── PROJECT_EXPLAINER.md    plain-English defense guide + demo script
├── .plans/demo-shortlist.md  transaction IDs that demo well
└── start.bat               one-click launcher (MySQL + Flask + Vite)
```

## Setup (Windows, from scratch)

**Prereqs:** Python 3.11, Node 18+, XAMPP (MySQL).

```bash
# 1. Database
C:\xampp\mysql\bin\mysql.exe -u root -e "CREATE DATABASE elliptic_fraud CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Backend deps
cd backend
python -m venv venv
venv\Scripts\pip install -r requirements.txt
venv\Scripts\pip install torch --index-url https://download.pytorch.org/whl/cpu
venv\Scripts\pip install torch_geometric

# 3. Data: download the 3 CSVs from Kaggle (ellipticco/elliptic-data-set)
#    into data/elliptic/

# 4. Train + prepare (from repo root)
backend\venv\Scripts\python.exe ml_pipeline\elliptic_train_rf.py
backend\venv\Scripts\python.exe ml_pipeline\elliptic_train_gnn.py
backend\venv\Scripts\python.exe ml_pipeline\elliptic_build_serving.py
backend\venv\Scripts\python.exe ml_pipeline\elliptic_load_db.py

# 5. Seed logins (admin/admin123, analyst/analyst123 — local demo only)
cd backend && venv\Scripts\python.exe seed_users.py

# 6. Frontend deps
cd frontend && npm install
```

**Run it:** double-click `start.bat`, then open http://localhost:5173.

## Key API endpoints

| Method | Path | Role | Purpose |
|---|---|---|---|
| POST | /api/auth/login | public | JWT login |
| GET | /api/transactions/ | any | Browse/search (filter by label, tx id) |
| GET | /api/transactions/:id/subgraph | any | 2-hop network neighbourhood |
| POST | /api/predictions/ | analyst+ | Score a transaction (rf or gnn) |
| GET/PATCH | /api/predictions/alerts | analyst+ | Alert queue / resolve with notes |
| GET | /api/monitor/status | any | Replay position + thresholds |
| POST | /api/monitor/advance | analyst+ | Screen the next time step (auto-alerts) |
| POST | /api/monitor/reset | analyst+ | Rewind replay, wipe monitor alerts |
| POST | /api/reports/ | analyst+ | Generate CSV report |
| GET/POST/DELETE | /api/admin/users | admin | User management |
| GET | /api/admin/metrics | admin | All-model benchmark |

## Security notes (local demo scope)

- No open registration — accounts come from `seed_users.py` or an admin.
- Demo credentials and dev secrets are for localhost only; set `SECRET_KEY`,
  `JWT_SECRET_KEY` and `DATABASE_URL` via environment for anything beyond.
- CORS is wide-open and Flask runs in debug mode by design for development.

## Documentation

- **[PROJECT_EXPLAINER.md](PROJECT_EXPLAINER.md)** — how everything works in
  plain English, the 5-minute demo script, limitations, glossary.
- **[.plans/demo-shortlist.md](.plans/demo-shortlist.md)** — curated
  transaction IDs (illicit hubs, flagged unknowns, RF-vs-GNN disagreements).
