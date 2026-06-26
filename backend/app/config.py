import os
from datetime import timedelta


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "change-me-in-production")
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        "mysql+pymysql://root:password@localhost/fraud_detection"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jwt-change-me")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=8)
    REPORT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "reports")
