# ML-Based Financial Fraud Detection System
BSc Computer Science Final Year Project — Crescent University, Abeokuta

## Project Structure
```
fraud-detection/
├── data/                  ← place paysim.csv here
├── models/                ← fraud_model.pkl, scaler.pkl, features.json, metrics.json (auto-generated)
├── ml_pipeline/
│   ├── train.py           ← full training pipeline
│   └── predictor.py       ← inference module used by Flask
├── backend/
│   ├── run.py
│   ├── requirements.txt
│   └── app/
│       ├── config.py
│       ├── models/models.py
│       ├── routes/        ← auth, transactions, predictions, reports, admin
│       └── utils/helpers.py
└── frontend/
    ├── src/
    │   ├── pages/         ← Login, AnalystDashboard, PredictTransaction, Alerts, Reports, AdminDashboard, AdminUsers
    │   ├── context/       ← AuthContext
    │   └── services/api.js
    └── package.json
```

## Setup Instructions

### 1. MySQL — create the database
```sql
CREATE DATABASE fraud_detection CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
pip install -r requirements.txt
```

Set environment variables (or edit `app/config.py` directly for dev):
```
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost/fraud_detection
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
```

Start Flask:
```bash
python run.py
```

### 3. Train the ML model
Download PaySim CSV from Kaggle and place it at `data/paysim.csv`, then:
```bash
python ml_pipeline/train.py --data data/paysim.csv
```
This writes `models/fraud_model.pkl`, `models/scaler.pkl`, and `models/metrics.json`.

### 4. Seed an admin account
```bash
# Flask shell or via POST /api/auth/register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@example.com","password":"admin123","role":"admin"}'
```

### 5. Frontend
```bash
cd frontend
npm install
npm run dev
# opens at http://localhost:3000
```

## API Endpoints
| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | /api/auth/login | public | Login, returns JWT |
| GET | /api/auth/me | any | Current user info |
| POST | /api/predictions/ | analyst/admin | Submit transaction → get prediction + alert |
| GET | /api/predictions/ | any | List predictions |
| GET | /api/predictions/alerts | any | List fraud alerts |
| PATCH | /api/predictions/alerts/:id | analyst/admin | Resolve alert with notes |
| POST | /api/reports/ | analyst/admin | Generate CSV report |
| GET | /api/reports/:id/download | any | Download report |
| GET | /api/admin/users | admin | List all users |
| POST | /api/admin/users | admin | Create user |
| DELETE | /api/admin/users/:id | admin | Delete user |
| GET | /api/admin/metrics | admin | Latest model metrics |
