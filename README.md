# Tracer — ML-Based Financial Fraud Detection System

### 🌐 Live demo — **[tracer-web.onrender.com](https://tracer-web.onrender.com)**
Sign in as `analyst` / `analyst123` (or `admin` / `admin123` for the model dashboards).

> Hosted on a free tier, so the API sleeps after 15 minutes of inactivity. The
> first request wakes it and reloads ~162 MB of model artifacts, which takes
> about 50 seconds. Every request after that is fast.
>
> Because those credentials are public, the demo runs with `DEMO_MODE=true`:
> every dashboard is readable, but account management and metric writes are
> disabled so no visitor can lock the owner out. A local run has the full
> admin panel.

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
React + Tailwind ("Tracer" console)        Presentation
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
│   └── elliptic_eval_curves.py     ROC/confusion/importance data for the admin charts
├── backend/                Flask API (+ seed_users.py, tests/)
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

# 4. Train + prepare (from repo root — run in this order, each depends on the last)
backend\venv\Scripts\python.exe ml_pipeline\elliptic_train_rf.py      # Random Forest
backend\venv\Scripts\python.exe ml_pipeline\elliptic_train_gnn.py     # GraphSAGE (+ node embeddings)
backend\venv\Scripts\python.exe ml_pipeline\elliptic_train_combo.py   # RF + GNN embeddings (needs the GNN)
backend\venv\Scripts\python.exe ml_pipeline\elliptic_build_serving.py # serving bundle used at request time
backend\venv\Scripts\python.exe ml_pipeline\elliptic_eval_curves.py   # ROC / confusion / importance for the admin charts
backend\venv\Scripts\python.exe ml_pipeline\elliptic_load_db.py       # load transactions, edges + all 3 metric rows into MySQL

# 5. Seed logins (admin/admin123, analyst/analyst123 — local demo only)
cd backend && venv\Scripts\python.exe seed_users.py

# 6. Frontend deps
cd frontend && npm install
```

**Run it:** double-click `start.bat`, then open http://localhost:5173.

**Run the tests:** `cd backend && venv\Scripts\python.exe -m pytest tests/ -v`
(29 tests: auth, role enforcement, input validation, the no-open-registration
regression, ML inference determinism, batch screening, XAI additivity.)

## Key API endpoints

| Method | Path | Role | Purpose |
|---|---|---|---|
| POST | /api/auth/login | public | JWT login |
| GET | /api/transactions/ | any | Browse/search (filter by label, tx id) |
| GET | /api/transactions/:id/subgraph | any | 2-hop network neighbourhood |
| POST | /api/predictions/ | analyst+ | Score a transaction (rf or gnn) |
| GET | /api/predictions/:id/explain | any | XAI: per-feature contributions (decision-path attribution) |
| GET | /api/admin/curves | admin | ROC curves, confusion matrices, feature importances |
| GET/PATCH | /api/predictions/alerts | analyst+ | Alert queue / resolve with notes |
| GET | /api/monitor/status | any | Replay position + thresholds |
| POST | /api/monitor/advance | analyst+ | Screen the next time step (auto-alerts) |
| POST | /api/monitor/reset | analyst+ | Rewind replay, wipe monitor alerts |
| POST | /api/reports/ | analyst+ | Generate CSV report |
| GET/POST/DELETE | /api/admin/users | admin | User management |
| GET | /api/admin/metrics | admin | All-model benchmark |

## Deployment

The live demo runs on Render (API + static frontend, from `render.yaml`) with
the database on Neon. Full instructions are in
**[report/DEPLOYMENT.md](report/DEPLOYMENT.md)**.

| | |
|---|---|
| Frontend | Render static site — https://tracer-web.onrender.com |
| API | Render web service — https://tracer-api-68u0.onrender.com |
| Database | Neon PostgreSQL (Oregon) |
| Health check | `GET /api/health` |

Two notes on how the deployed build differs from local development:

**PostgreSQL rather than MySQL.** The project uses MySQL locally, which is what
Chapter Three of the report documents. Render offers no managed MySQL, so the
hosted copy runs on PostgreSQL. No application code differs — SQLAlchemy
generates the dialect's SQL — and `config.py` normalises whichever connection
string it is given. Only the bulk loader needed dialect awareness, because it
used a MySQL-specific statement to suspend foreign-key checks.

**No PyTorch in the deployed image.** GraphSAGE scores are precomputed into
`models/elliptic_serving.npz`, so nothing on the serving path imports torch.
Runtime dependencies live in `backend/requirements.txt`; training dependencies
are in `backend/requirements-train.txt`. This keeps the deployed image roughly
250 MB smaller and the process footprint at ~162 MB.

## Security notes

- No open registration — accounts come from `seed_users.py` or an admin.
- With `ENV=production` the app refuses to start unless `SECRET_KEY` and
  `JWT_SECRET_KEY` are supplied, debug is off, and CORS is restricted to the
  origins named in `CORS_ORIGINS`.
- In development those secrets fall back to fixed values, debug is on and CORS
  is open, which is deliberate and local-only.
- `DEMO_MODE=true` makes the admin panel's write half read-only — create,
  update, delete and metric-write all return 403 while the dashboards stay
  readable. It is set on the public deployment, where the credentials below
  are published, and off everywhere else.
- The admin panel cannot strand a deployment: it refuses to delete your own
  account, and refuses to delete or demote the last remaining administrator.
- The demo credentials above are published in this repository. Change them
  before putting anything that matters behind them.

## Documentation

- **[PROJECT_EXPLAINER.md](PROJECT_EXPLAINER.md)** — how everything works in
  plain English, the 5-minute demo script, limitations, glossary.
- **[report/DEPLOYMENT.md](report/DEPLOYMENT.md)** — deploying to Render + Neon,
  loading the database remotely, free-tier caveats.
- **[.plans/demo-shortlist.md](.plans/demo-shortlist.md)** — curated
  transaction IDs (illicit hubs, flagged unknowns, RF-vs-GNN disagreements).
