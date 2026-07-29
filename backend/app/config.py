import os
from datetime import timedelta


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "change-me-in-production")
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        "mysql+pymysql://root:@localhost/elliptic_fraud"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jwt-change-me")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=8)
    REPORT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "reports")


# --- Alerting policy -------------------------------------------------------
# NOTE: these are ALERT thresholds, not classification thresholds. A model
# classifies at the conventional 0.5 cut (that is what the reported confusion
# matrices and F1 scores use); an alert is only raised on a HIGH-CONFIDENCE
# crossing, so the analyst queue stays reviewable. The GNN bar sits higher
# because its probabilities are less well spread — it concentrates near the
# extremes, so 0.9 would flag far too much.
# Used by BOTH the interactive scoring route and the Live Monitor so the two
# paths cannot disagree.
ALERT_THRESHOLDS = {"RandomForest": 0.9, "GraphSAGE": 0.99}
DEFAULT_ALERT_THRESHOLD = 0.9


def alert_threshold_for(model_type: str) -> float:
    """Alert threshold for a model, tolerant of the 'Monitor (X)' prefix."""
    for name, thr in ALERT_THRESHOLDS.items():
        if name in (model_type or ""):
            return thr
    return DEFAULT_ALERT_THRESHOLD
