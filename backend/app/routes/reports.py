import csv
import io
import os
from datetime import date, datetime

from flask import Blueprint, jsonify, request, send_file
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import db
from app.config import Config
from app.models.models import Alert, Prediction, Report, Transaction
from app.utils.helpers import role_required

report_bp = Blueprint("reports", __name__)


def _build_rows(start: date, end: date):
    rows = (
        db.session.query(Prediction, Transaction, Alert)
        .join(Transaction, Prediction.transaction_id == Transaction.transaction_id)
        .outerjoin(Alert, Alert.prediction_id == Prediction.prediction_id)
        .filter(
            Prediction.prediction_timestamp >= datetime.combine(start, datetime.min.time()),
            Prediction.prediction_timestamp <= datetime.combine(end, datetime.max.time()),
        )
        .all()
    )
    return rows


@report_bp.route("/", methods=["POST"])
@jwt_required()
@role_required("analyst", "admin")
def generate_report():
    data = request.get_json()
    user_id = get_jwt_identity()
    start = date.fromisoformat(data["date_range_start"])
    end = date.fromisoformat(data["date_range_end"])
    report_type = data.get("report_type", "fraud_summary")

    rows = _build_rows(start, end)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "prediction_id", "transaction_id", "type", "amount",
        "predicted_class", "fraud_probability", "prediction_timestamp",
        "alert_status", "resolved_at", "notes",
    ])
    for pred, tx, alert in rows:
        writer.writerow([
            pred.prediction_id, tx.transaction_id, tx.type, tx.amount,
            pred.predicted_class, pred.fraud_probability,
            pred.prediction_timestamp.isoformat(),
            alert.alert_status if alert else "",
            alert.resolved_at.isoformat() if alert and alert.resolved_at else "",
            alert.notes if alert else "",
        ])

    os.makedirs(Config.REPORT_DIR, exist_ok=True)
    filename = f"report_{report_type}_{start}_{end}_{int(datetime.utcnow().timestamp())}.csv"
    filepath = os.path.join(Config.REPORT_DIR, filename)
    with open(filepath, "w", newline="") as f:
        f.write(output.getvalue())

    report = Report(
        generated_by=user_id,
        report_type=report_type,
        date_range_start=start,
        date_range_end=end,
        file_path=filepath,
    )
    db.session.add(report)
    db.session.commit()

    return jsonify(report.to_dict()), 201


@report_bp.route("/", methods=["GET"])
@jwt_required()
def list_reports():
    reports = Report.query.order_by(Report.generated_at.desc()).all()
    return jsonify({"reports": [r.to_dict() for r in reports]}), 200


@report_bp.route("/<int:report_id>/download", methods=["GET"])
@jwt_required()
def download_report(report_id):
    report = Report.query.get_or_404(report_id)
    return send_file(report.file_path, as_attachment=True,
                     download_name=os.path.basename(report.file_path))
