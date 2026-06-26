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

    CORS(app, resources={r"/api/*": {"origins": "*"}})
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    from app.routes.auth import auth_bp
    from app.routes.transactions import tx_bp
    from app.routes.predictions import pred_bp
    from app.routes.reports import report_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(auth_bp,   url_prefix="/api/auth")
    app.register_blueprint(tx_bp,     url_prefix="/api/transactions")
    app.register_blueprint(pred_bp,   url_prefix="/api/predictions")
    app.register_blueprint(report_bp, url_prefix="/api/reports")
    app.register_blueprint(admin_bp,  url_prefix="/api/admin")

    with app.app_context():
        db.create_all()

    return app
