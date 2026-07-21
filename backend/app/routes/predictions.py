import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "ml_pipeline"))

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.models import Transaction, Prediction, Alert
from app.utils.helpers import role_required
from elliptic_predictor import predict as ml_predict, exists as tx_exists

pred_bp = Blueprint("predictions", __name__)


@pred_bp.route("/", methods=["POST"])
@jwt_required()
@role_required("analyst", "admin")
def submit_prediction():
    """
    Score an EXISTING transaction by tx_id (Elliptic is a fixed graph — analysts
    look up real transactions, they don't author them). Body: {tx_id, model?}.
    Stores the prediction and raises an alert if the transaction is flagged illicit.
    """
    data = request.get_json() or {}
    tx_id = data.get("tx_id")
    model = data.get("model", "rf")
    if tx_id is None:
        return jsonify({"error": "tx_id is required"}), 400
    try:
        tx_id = int(tx_id)
    except (TypeError, ValueError):
        return jsonify({"error": "tx_id must be a number"}), 400

    tx = Transaction.query.get(tx_id)
    if not tx or not tx_exists(tx_id):
        return jsonify({"error": f"Transaction {tx_id} not found in the dataset"}), 404
    if model not in ("rf", "gnn"):
        return jsonify({"error": "model must be 'rf' or 'gnn'"}), 400

    user_id = int(get_jwt_identity())
    result = ml_predict(tx_id, model=model)

    prediction = Prediction(
        transaction_id=tx_id,
        user_id=user_id,
        model_type=result["model_type"],
        predicted_class=result["predicted_class"],
        fraud_probability=result["fraud_probability"],
    )
    db.session.add(prediction)
    db.session.flush()

    alert = None
    if result["predicted_class"] == 1:
        alert = Alert(prediction_id=prediction.prediction_id, assigned_to=user_id)
        db.session.add(alert)

    db.session.commit()

    return jsonify({
        "transaction": tx.to_dict(),
        "prediction": prediction.to_dict(),
        "scores": result,
        "alert": alert.to_dict() if alert else None,
    }), 201


@pred_bp.route("/<int:tx_id>/explain", methods=["GET"])
@jwt_required()
def explain_prediction(tx_id):
    """SHAP explanation of the RF's score for this transaction (XAI)."""
    if not tx_exists(tx_id):
        return jsonify({"error": f"Transaction {tx_id} not found in the dataset"}), 404
    from elliptic_explain import explain as shap_explain
    return jsonify(shap_explain(tx_id)), 200


@pred_bp.route("/", methods=["GET"])
@jwt_required()
def list_predictions():
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 25, type=int), 100)
    pagination = Prediction.query.order_by(Prediction.prediction_timestamp.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    return jsonify({
        "predictions": [p.to_dict() for p in pagination.items],
        "total": pagination.total,
        "pages": pagination.pages,
    }), 200


@pred_bp.route("/alerts", methods=["GET"])
@jwt_required()
def list_alerts():
    status = request.args.get("status")
    query = Alert.query.order_by(Alert.alert_id.desc())
    if status:
        query = query.filter_by(alert_status=status)
    return jsonify({"alerts": [a.to_dict() for a in query.all()]}), 200


@pred_bp.route("/alerts/<int:alert_id>", methods=["PATCH"])
@jwt_required()
@role_required("analyst", "admin")
def update_alert(alert_id):
    from datetime import datetime
    data = request.get_json() or {}
    alert = Alert.query.get_or_404(alert_id)
    if "alert_status" in data:
        alert.alert_status = data["alert_status"]
        if data["alert_status"] == "resolved":
            alert.resolved_at = datetime.utcnow()
    if "notes" in data:
        alert.notes = data["notes"]
    db.session.commit()
    return jsonify(alert.to_dict()), 200
