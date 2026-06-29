from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy import or_
from app import db
from app.models.models import Transaction, Edge, Prediction

tx_bp = Blueprint("transactions", __name__)


@tx_bp.route("/", methods=["GET"])
@jwt_required()
def list_transactions():
    """Browse transactions. Filters: label (illicit/licit/unknown), time_step, q (tx_id search)."""
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 25, type=int), 100)

    query = Transaction.query
    label = request.args.get("label")
    if label in ("illicit", "licit", "unknown"):
        query = query.filter_by(label=label)
    time_step = request.args.get("time_step", type=int)
    if time_step:
        query = query.filter_by(time_step=time_step)
    q = request.args.get("q")
    if q and q.isdigit():
        query = query.filter(Transaction.tx_id == int(q))

    query = query.order_by(Transaction.time_step.asc(), Transaction.tx_id.asc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        "transactions": [t.to_dict() for t in pagination.items],
        "total": pagination.total,
        "pages": pagination.pages,
        "page": page,
    }), 200


@tx_bp.route("/<int:tx_id>", methods=["GET"])
@jwt_required()
def get_transaction(tx_id):
    tx = Transaction.query.get_or_404(tx_id)
    return jsonify(tx.to_dict()), 200


@tx_bp.route("/<int:tx_id>/subgraph", methods=["GET"])
@jwt_required()
def subgraph(tx_id):
    """The transaction plus its 1-hop neighbours and connecting edges."""
    center = Transaction.query.get_or_404(tx_id)

    edges = Edge.query.filter(
        or_(Edge.source_tx == tx_id, Edge.target_tx == tx_id)
    ).limit(200).all()

    neighbour_ids = set()
    edge_list = []
    for e in edges:
        edge_list.append({"source": e.source_tx, "target": e.target_tx})
        neighbour_ids.add(e.source_tx)
        neighbour_ids.add(e.target_tx)
    neighbour_ids.discard(tx_id)

    nodes = {tx_id: center.to_dict()}
    if neighbour_ids:
        for t in Transaction.query.filter(Transaction.tx_id.in_(neighbour_ids)).all():
            nodes[t.tx_id] = t.to_dict()

    return jsonify({
        "center": tx_id,
        "nodes": list(nodes.values()),
        "edges": edge_list,
        "neighbour_count": len(neighbour_ids),
    }), 200
