import json
import os

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import db, bcrypt
from app.models.models import ModelMetrics, User
from app.utils.helpers import demo_readonly, json_body, role_required

admin_bp = Blueprint("admin", __name__)


def _would_strand_deployment(user, *, new_role=None):
    """True if this change removes the last administrator.

    Deleting the only admin, or demoting them to analyst, leaves a deployment
    with no way back in short of re-running seed_users.py against the database.
    Both doors lead to the same place, so both are checked here."""
    if user.role != "admin":
        return False
    if new_role == "admin":
        return False
    return User.query.filter_by(role="admin").count() <= 1


@admin_bp.route("/users", methods=["GET"])
@jwt_required()
@role_required("admin")
def list_users():
    users = User.query.all()
    return jsonify({"users": [u.to_dict() for u in users]}), 200


@admin_bp.route("/users", methods=["POST"])
@jwt_required()
@role_required("admin")
@demo_readonly
def create_user():
    data, err = json_body()
    if err:
        return err
    missing = [f for f in ("username", "email", "password") if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing required field(s): {', '.join(missing)}"}), 400
    if data.get("role", "analyst") not in ("analyst", "admin"):
        return jsonify({"error": "role must be 'analyst' or 'admin'"}), 400
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
@demo_readonly
def update_user(user_id):
    data, err = json_body()
    if err:
        return err
    user = User.query.get_or_404(user_id)
    if "role" in data:
        if data["role"] not in ("analyst", "admin"):
            return jsonify({"error": "role must be 'analyst' or 'admin'"}), 400
        if _would_strand_deployment(user, new_role=data["role"]):
            return jsonify({"error": "Cannot demote the only administrator"}), 409
        user.role = data["role"]
    if "email" in data:
        user.email = data["email"]
    if "password" in data:
        if not data["password"]:
            return jsonify({"error": "password must not be empty"}), 400
        user.password_hash = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
    db.session.commit()
    return jsonify(user.to_dict()), 200


@admin_bp.route("/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
@role_required("admin")
@demo_readonly
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    if user.user_id == int(get_jwt_identity()):
        return jsonify({"error": "Cannot delete your own account"}), 409
    if _would_strand_deployment(user):
        return jsonify({"error": "Cannot delete the only administrator"}), 409
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


CURVES_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "..", "models", "elliptic_eval_curves.json"
)


@admin_bp.route("/curves", methods=["GET"])
@jwt_required()
@role_required("admin")
def get_curves():
    """ROC curves, confusion matrices, and feature importances for the charts."""
    if not os.path.exists(CURVES_PATH):
        return jsonify({"error": "Run ml_pipeline/elliptic_eval_curves.py first."}), 404
    with open(CURVES_PATH) as f:
        return jsonify(json.load(f)), 200


@admin_bp.route("/metrics", methods=["POST"])
@jwt_required()
@role_required("admin")
@demo_readonly
def save_metrics():
    """Manually store metrics after a re-training run."""
    data = request.get_json(silent=True) or {}
    required = ["model_version", "accuracy", "precision", "recall", "f1_score", "auc_roc"]
    missing = [k for k in required if k not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400
    metrics = ModelMetrics(
        model_version=data["model_version"],
        model_type=data.get("model_type"),
        accuracy=data["accuracy"],
        precision=data["precision"],
        recall=data["recall"],
        f1_score=data["f1_score"],
        auc_roc=data["auc_roc"],
    )
    db.session.add(metrics)
    db.session.commit()
    return jsonify(metrics.to_dict()), 201
