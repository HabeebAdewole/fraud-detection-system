from flask import Blueprint, current_app, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db, bcrypt
from app.models.models import User

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    username = data.get("username", "").strip()
    password = data.get("password", "")

    user = User.query.filter_by(username=username).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_access_token(identity=str(user.user_id))
    return jsonify({
        "access_token": token,
        "user": user.to_dict(),
        "demo_mode": current_app.config.get("DEMO_MODE", False),
    }), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    """The client reads `demo_mode` from here to disable the account-management
    controls, so the public demo does not offer buttons that only return 403."""
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    return jsonify({**user.to_dict(), "demo_mode": current_app.config.get("DEMO_MODE", False)}), 200


# NOTE: there is deliberately no open /register endpoint. Initial accounts are
# seeded with backend/seed_users.py; afterwards only admins can create users
# via POST /api/admin/users (JWT + role check).
