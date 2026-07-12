import json
import os

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app import db, bcrypt
from app.models.models import ModelMetrics, User
from app.utils.helpers import role_required

admin_bp = Blueprint("admin", __name__)

METRICS_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "..", "models", "metrics.json"
)


@admin_bp.route("/users", methods=["GET"])
@jwt_required()
@role_required("admin")
def list_users():
    users = User.query.all()
    return jsonify({"users": [u.to_dict() for u in users]}), 200


@admin_bp.route("/users", methods=["POST"])
@jwt_required()
@role_required("admin")
def create_user():
    data = request.get_json()
    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "Username already exists"}), 409
    hashed = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
    user = User(
        username=data["username"],
        email=data["email"],
        password_hash=hashed,
        role=data.get("role", "analyst"),
    )
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201


@admin_bp.route("/users/<int:user_id>", methods=["PATCH"])
@jwt_required()
@role_required("admin")
def update_user(user_id):
    data = request.get_json()
    user = User.query.get_or_404(user_id)
    if "role" in data:
        user.role = data["role"]
    if "email" in data:
        user.email = data["email"]
    if "password" in data:
        user.password_hash = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
    db.session.commit()
    return jsonify(user.to_dict()), 200


@admin_bp.route("/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
@role_required("admin")
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted"}), 200


@admin_bp.route("/metrics", methods=["GET"])
@jwt_required()
@role_required("admin")
def get_metrics():
    """Return all trained models (RF, GNN, combined) for comparison."""
    rows = ModelMetrics.query.order_by(ModelMetrics.f1_score.desc()).all()
    if not rows:
        return jsonify({"error": "No metrics available. Run the training pipeline first."}), 404
    return jsonify({"models": [m.to_dict() for m in rows]}), 200


@admin_bp.route("/metrics", methods=["POST"])
@jwt_required()
@role_required("admin")
def save_metrics():
    """Manually store metrics after a re-training run."""
    data = request.get_json()
    metrics = ModelMetrics(
        model_version=data["model_version"],
        accuracy=data["accuracy"],
        precision=data["precision"],
        recall=data["recall"],
        f1_score=data["f1_score"],
        auc_roc=data["auc_roc"],
    )
    db.session.add(metrics)
    db.session.commit()
    return jsonify(metrics.to_dict()), 201
