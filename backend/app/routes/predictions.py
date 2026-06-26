import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "ml_pipeline"))

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.models import Transaction, Prediction, Alert
from app.utils.helpers import role_required
from predictor import predict as ml_predict

pred_bp = Blueprint("predictions", __name__)


@pred_bp.route("/", methods=["POST"])
@jwt_required()
@role_required("analyst", "admin")
def submit_prediction():
    """
    Accepts transaction features, stores the transaction, runs ML inference,
    stores the prediction, and creates an alert if fraud is detected.
    """
    data = request.get_json()
    user_id = get_jwt_identity()

    # Store transaction
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
    db.session.flush()  # get transaction_id before commit

    # Run inference
    result = ml_predict({
        "step": data["step"],
        "type": data["type"],
        "amount": data["amount"],
        "oldbalanceOrg": data.get("oldbalanceOrg", 0),
        "newbalanceOrig": data.get("newbalanceOrig", 0),
        "oldbalanceDest": data.get("oldbalanceDest", 0),
        "newbalanceDest": data.get("newbalanceDest", 0),
    })

    prediction = Prediction(
        transaction_id=tx.transaction_id,
        user_id=user_id,
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

    response = {
        "transaction": tx.to_dict(),
        "prediction": prediction.to_dict(),
        "alert": alert.to_dict() if alert else None,
    }
    return jsonify(response), 201


@pred_bp.route("/", methods=["GET"])
@jwt_required()
def list_predictions():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
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
    alerts = query.all()
    return jsonify({"alerts": [a.to_dict() for a in alerts]}), 200


@pred_bp.route("/alerts/<int:alert_id>", methods=["PATCH"])
@jwt_required()
@role_required("analyst", "admin")
def update_alert(alert_id):
    from datetime import datetime
    data = request.get_json()
    alert = Alert.query.get_or_404(alert_id)
    if "alert_status" in data:
        alert.alert_status = data["alert_status"]
        if data["alert_status"] == "resolved":
            alert.resolved_at = datetime.utcnow()
    if "notes" in data:
        alert.notes = data["notes"]
    db.session.commit()
    return jsonify(alert.to_dict()), 200
