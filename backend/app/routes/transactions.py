from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.models import Transaction
from app.utils.helpers import role_required

tx_bp = Blueprint("transactions", __name__)


@tx_bp.route("/", methods=["GET"])
@jwt_required()
def list_transactions():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    pagination = Transaction.query.order_by(Transaction.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    return jsonify({
        "transactions": [t.to_dict() for t in pagination.items],
        "total": pagination.total,
        "pages": pagination.pages,
        "page": page,
    }), 200


@tx_bp.route("/<int:transaction_id>", methods=["GET"])
@jwt_required()
def get_transaction(transaction_id):
    tx = Transaction.query.get_or_404(transaction_id)
    return jsonify(tx.to_dict()), 200


@tx_bp.route("/", methods=["POST"])
@jwt_required()
@role_required("analyst", "admin")
def create_transaction():
    data = request.get_json()
    tx = Transaction(
        step=data["step"],
        type=data["type"],
        amount=data["amount"],
        name_orig=data.get("nameOrig"),
        old_balance_orig=data.get("oldbalanceOrg", 0),
        new_balance_orig=data.get("newbalanceOrig", 0),
        name_dest=data.get("nameDest"),
        old_balance_dest=data.get("oldbalanceDest", 0),
        new_balance_dest=data.get("newbalanceDest", 0),
    )
    db.session.add(tx)
    db.session.commit()
    return jsonify(tx.to_dict()), 201
