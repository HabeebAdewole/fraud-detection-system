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


MAX_HOP1 = 40   # cap first ring (hubs can have hundreds)
MAX_HOP2 = 60   # cap second ring


def _neighbours_of(tx_ids):
    """All edges touching any tx in tx_ids -> (edge dicts, neighbour id set)."""
    edges = Edge.query.filter(
        or_(Edge.source_tx.in_(tx_ids), Edge.target_tx.in_(tx_ids))
    ).limit(600).all()
    edge_list, found = [], set()
    for e in edges:
        edge_list.append({"source": e.source_tx, "target": e.target_tx})
        found.add(e.source_tx)
        found.add(e.target_tx)
    return edge_list, found


@tx_bp.route("/<int:tx_id>/subgraph", methods=["GET"])
@jwt_required()
def subgraph(tx_id):
    """The transaction plus its 2-hop neighbourhood (matches the GNN's
    2-layer message-passing reach). Nodes carry their hop distance."""
    center = Transaction.query.get_or_404(tx_id)

    # Hop 1
    edges1, found1 = _neighbours_of([tx_id])
    hop1 = sorted(found1 - {tx_id})
    total_hop1 = len(hop1)
    hop1 = hop1[:MAX_HOP1]

    # Hop 2 (neighbours of hop-1 nodes, excluding already-seen)
    edges2, found2 = ([], set())
    if hop1:
        edges2, found2 = _neighbours_of(hop1)
    hop2 = sorted(found2 - set(hop1) - {tx_id})
    total_hop2 = len(hop2)
    hop2 = hop2[:MAX_HOP2]

    keep = {tx_id} | set(hop1) | set(hop2)
    edge_list, seen = [], set()
    for e in edges1 + edges2:
        key = (e["source"], e["target"])
        if key in seen or e["source"] not in keep or e["target"] not in keep:
            continue
        seen.add(key)
        edge_list.append(e)

    hop_of = {tx_id: 0, **{t: 1 for t in hop1}, **{t: 2 for t in hop2}}
    nodes = []
    for t in Transaction.query.filter(Transaction.tx_id.in_(keep)).all():
        d = t.to_dict()
        d["hop"] = hop_of.get(t.tx_id, 2)
        nodes.append(d)

    return jsonify({
        "center": tx_id,
        "nodes": nodes,
        "edges": edge_list,
        "neighbour_count": total_hop1,
        "hop2_count": total_hop2,
        "truncated": total_hop1 > MAX_HOP1 or total_hop2 > MAX_HOP2,
    }), 200
