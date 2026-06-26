from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db, bcrypt
from app.models.models import User

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "")

    user = User.query.filter_by(username=username).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_access_token(identity=user.user_id)
    return jsonify({"access_token": token, "user": user.to_dict()}), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict()), 200


@auth_bp.route("/register", methods=["POST"])
def register():
    """Used by admin to seed initial accounts; remove or protect in production."""
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
