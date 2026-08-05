import os
import secrets
from datetime import timedelta

# ENV=production switches on the deployment posture: secrets must come from the
# environment, CORS is restricted to the known frontend, and debug is off.
IS_PROD = os.environ.get("ENV", "development").lower() == "production"


def _secret(name: str, dev_default: str) -> str:
    """In production a real secret is required; refuse to boot without one.
    In development fall back to a fixed value so local setup stays frictionless."""
    value = os.environ.get(name)
    if value:
        return value
    if IS_PROD:
        raise RuntimeError(
            f"{name} must be set when ENV=production. "
            f"Generate one with: python -c \"import secrets; print(secrets.token_urlsafe(48))\""
        )
    return dev_default


class Config:
    ENV_NAME = "production" if IS_PROD else "development"
    DEBUG = not IS_PROD

    SECRET_KEY = _secret("SECRET_KEY", "dev-only-change-me")
    JWT_SECRET_KEY = _secret("JWT_SECRET_KEY", "dev-only-jwt-change-me")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=8)

    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        "mysql+pymysql://root:@localhost/elliptic_fraud"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # Hosted databases drop idle connections; recycle before they go stale.
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True, "pool_recycle": 280}

    REPORT_DIR = os.environ.get(
        "REPORT_DIR", os.path.join(os.path.dirname(__file__), "..", "..", "reports"))

    # Comma-separated list of allowed frontend origins. Wide open in dev.
    CORS_ORIGINS = [o.strip() for o in os.environ.get("CORS_ORIGINS", "*").split(",") if o.strip()]


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
