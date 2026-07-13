import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "ml_pipeline"))

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from app.models.models import Alert, MonitorState, Prediction
from app.utils.helpers import role_required
from elliptic_predictor import screen_step

monitor_bp = Blueprint("monitor", __name__)

START_STEP = 34        # replay begins after this (test period = 35..49)
FINAL_STEP = 49
RF_THRESHOLD = 0.9     # RF is well-calibrated: 0.9 ≈ 94% precision
GNN_THRESHOLD = 0.99   # GNN runs overconfident, so its bar sits higher
ALERT_BUDGET = 25      # max auto-alerts per step (top-N by score) — models an
                       # ops floor's analyst capacity; all crossings still counted


def _state() -> MonitorState:
    s = MonitorState.query.first()
    if not s:
        s = MonitorState(last_step=START_STEP)
        db.session.add(s)
        db.session.commit()
    return s


@monitor_bp.route("/status", methods=["GET"])
@jwt_required()
def status():
    s = _state()
    open_alerts = Alert.query.filter_by(alert_status="open").count()
    return jsonify({
        "last_step": s.last_step,
        "next_step": s.last_step + 1 if s.last_step < FINAL_STEP else None,
        "final_step": FINAL_STEP,
        "done": s.last_step >= FINAL_STEP,
        "open_alerts": open_alerts,
        "thresholds": {"rf": RF_THRESHOLD, "gnn": GNN_THRESHOLD},
    }), 200


@monitor_bp.route("/advance", methods=["POST"])
@jwt_required()
@role_required("analyst", "admin")
def advance():
    """Screen the next time step: score every transaction in it, store
    predictions + open alerts for those either model flags at >= 0.9."""
    s = _state()
    if s.last_step >= FINAL_STEP:
        return jsonify({"error": "Replay complete — all 49 time steps screened. Reset to run again."}), 409

    step = s.last_step + 1
    user_id = int(get_jwt_identity())
    result = screen_step(step, RF_THRESHOLD, GNN_THRESHOLD)

    # Dedupe: skip transactions that already carry an alert
    flagged_ids = [f["tx_id"] for f in result["flagged"]]
    existing = set()
    if flagged_ids:
        rows = (db.session.query(Prediction.transaction_id)
                .join(Alert, Alert.prediction_id == Prediction.prediction_id)
                .filter(Prediction.transaction_id.in_(flagged_ids)).all())
        existing = {r[0] for r in rows}

    counts = {"rf": 0, "gnn": 0, "both": 0}
    for f in result["flagged"]:
        counts[f["flagged_by"]] += 1

    # Alert budget: only the top-N highest-scoring crossings become alerts
    ranked = sorted(result["flagged"],
                    key=lambda f: max(f["rf_probability"], f["gnn_probability"]),
                    reverse=True)[:ALERT_BUDGET]

    created = []
    for f in ranked:
        if f["tx_id"] in existing:
            continue
        top_model = "GraphSAGE" if f["gnn_probability"] >= f["rf_probability"] else "RandomForest"
        top_prob = max(f["rf_probability"], f["gnn_probability"])
        pred = Prediction(
            transaction_id=f["tx_id"], user_id=user_id,
            model_type=f"Monitor ({top_model})",
            predicted_class=1, fraud_probability=top_prob,
        )
        db.session.add(pred)
        db.session.flush()
        alert = Alert(
            prediction_id=pred.prediction_id, assigned_to=user_id,
            notes=f"Auto-flagged at step {step} — RF {f['rf_probability']:.2f} / GNN {f['gnn_probability']:.2f} ({f['flagged_by']})",
        )
        db.session.add(alert)
        created.append({**f})

    s.last_step = step
    db.session.commit()

    return jsonify({
        "time_step": step,
        "screened": result["screened"],
        "flagged": len(result["flagged"]),
        "new_alerts": len(created),
        "alert_budget": ALERT_BUDGET,
        "flagged_by": counts,
        "alerts": created[:20],
        "done": step >= FINAL_STEP,
    }), 200


@monitor_bp.route("/reset", methods=["POST"])
@jwt_required()
@role_required("analyst", "admin")
def reset():
    """Rewind the replay to the start of the test period (keeps alerts unless
    wipe=true). Open to analysts: this controls the replay simulation, not
    production data."""
    s = _state()
    s.last_step = START_STEP
    if (request.get_json(silent=True) or {}).get("wipe"):
        monitor_preds = Prediction.query.filter(Prediction.model_type.like("Monitor%")).all()
        ids = [p.prediction_id for p in monitor_preds]
        if ids:
            Alert.query.filter(Alert.prediction_id.in_(ids)).delete(synchronize_session=False)
            Prediction.query.filter(Prediction.prediction_id.in_(ids)).delete(synchronize_session=False)
    db.session.commit()
    return jsonify({"message": "Monitor reset to step 34", "last_step": s.last_step}), 200
