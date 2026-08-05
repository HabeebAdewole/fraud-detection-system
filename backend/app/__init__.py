from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()


def create_app(config=None):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object("app.config.Config")
    if config:
        app.config.update(config)

    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    from app.routes.auth import auth_bp
    from app.routes.transactions import tx_bp
    from app.routes.predictions import pred_bp
    from app.routes.reports import report_bp
    from app.routes.admin import admin_bp
    from app.routes.monitor import monitor_bp

    app.register_blueprint(auth_bp,    url_prefix="/api/auth")
    app.register_blueprint(tx_bp,      url_prefix="/api/transactions")
    app.register_blueprint(pred_bp,    url_prefix="/api/predictions")
    app.register_blueprint(report_bp,  url_prefix="/api/reports")
    app.register_blueprint(admin_bp,   url_prefix="/api/admin")
    app.register_blueprint(monitor_bp, url_prefix="/api/monitor")

    @app.get("/api/health")
    def health():
        """Unauthenticated liveness probe. Hosting platforms poll this, and it
        is the quickest way to tell whether the API is up and can reach the DB."""
        from sqlalchemy import text
        try:
            db.session.execute(text("SELECT 1"))
            database = "ok"
        except Exception as exc:                       # noqa: BLE001
            database = f"error: {type(exc).__name__}"
        return {
            "status": "ok" if database == "ok" else "degraded",
            "environment": app.config["ENV_NAME"],
            "database": database,
            "demo_mode": app.config["DEMO_MODE"],
        }, (200 if database == "ok" else 503)

    with app.app_context():
        db.create_all()

    return app
