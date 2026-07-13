from datetime import datetime
from app import db


class User(db.Model):
    __tablename__ = "user"
    user_id    = db.Column(db.Integer, primary_key=True)
    username   = db.Column(db.String(80), unique=True, nullable=False)
    email      = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role       = db.Column(db.Enum("analyst", "admin"), nullable=False, default="analyst")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {"user_id": self.user_id, "username": self.username,
                "email": self.email, "role": self.role,
                "created_at": self.created_at.isoformat()}


class Transaction(db.Model):
    """A Bitcoin transaction node from the Elliptic dataset."""
    __tablename__ = "transaction"
    tx_id      = db.Column(db.BigInteger, primary_key=True, autoincrement=False)
    time_step  = db.Column(db.Integer, index=True)
    label      = db.Column(db.String(10), index=True)  # illicit / licit / unknown

    def to_dict(self):
        return {"tx_id": self.tx_id, "time_step": self.time_step, "label": self.label}


class Edge(db.Model):
    """A directed payment-flow edge between two transactions."""
    __tablename__ = "edge"
    id        = db.Column(db.Integer, primary_key=True)
    source_tx = db.Column(db.BigInteger, index=True, nullable=False)
    target_tx = db.Column(db.BigInteger, index=True, nullable=False)


class Prediction(db.Model):
    __tablename__ = "prediction"
    prediction_id        = db.Column(db.Integer, primary_key=True)
    transaction_id       = db.Column(db.BigInteger, db.ForeignKey("transaction.tx_id"), nullable=False)
    user_id              = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)
    model_type           = db.Column(db.String(40), default="RandomForest")
    predicted_class      = db.Column(db.Integer, nullable=False)
    fraud_probability    = db.Column(db.Float, nullable=False)
    prediction_timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    transaction = db.relationship("Transaction", backref="predictions")
    user        = db.relationship("User", backref="predictions")

    def to_dict(self):
        return {
            "prediction_id": self.prediction_id,
            "transaction_id": self.transaction_id,
            "user_id": self.user_id,
            "model_type": self.model_type,
            "predicted_class": self.predicted_class,
            "fraud_probability": self.fraud_probability,
            "prediction_timestamp": self.prediction_timestamp.isoformat(),
        }


class Alert(db.Model):
    __tablename__ = "alert"
    alert_id     = db.Column(db.Integer, primary_key=True)
    prediction_id = db.Column(db.Integer, db.ForeignKey("prediction.prediction_id"), nullable=False)
    alert_status = db.Column(db.Enum("open", "resolved"), default="open", nullable=False)
    assigned_to  = db.Column(db.Integer, db.ForeignKey("user.user_id"))
    resolved_at  = db.Column(db.DateTime)
    notes        = db.Column(db.Text)

    prediction   = db.relationship("Prediction", backref="alerts")
    assignee     = db.relationship("User", backref="alerts")

    def to_dict(self):
        return {
            "alert_id": self.alert_id,
            "prediction_id": self.prediction_id,
            "alert_status": self.alert_status,
            "assigned_to": self.assigned_to,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
            "notes": self.notes,
            "transaction": self.prediction.transaction.to_dict() if self.prediction else None,
            "fraud_probability": self.prediction.fraud_probability if self.prediction else None,
            "model_type": self.prediction.model_type if self.prediction else None,
        }


class MonitorState(db.Model):
    """Replay-monitoring position: the last time step that has been screened."""
    __tablename__ = "monitor_state"
    id             = db.Column(db.Integer, primary_key=True)
    last_step      = db.Column(db.Integer, nullable=False, default=34)
    updated_at     = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Report(db.Model):
    __tablename__ = "report"
    report_id       = db.Column(db.Integer, primary_key=True)
    generated_by    = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)
    report_type     = db.Column(db.String(50), nullable=False)
    date_range_start = db.Column(db.Date)
    date_range_end   = db.Column(db.Date)
    generated_at    = db.Column(db.DateTime, default=datetime.utcnow)
    file_path       = db.Column(db.String(255))

    generator = db.relationship("User", backref="reports")

    def to_dict(self):
        return {
            "report_id": self.report_id,
            "generated_by": self.generated_by,
            "report_type": self.report_type,
            "date_range_start": str(self.date_range_start) if self.date_range_start else None,
            "date_range_end": str(self.date_range_end) if self.date_range_end else None,
            "generated_at": self.generated_at.isoformat(),
            "file_path": self.file_path,
        }


class ModelMetrics(db.Model):
    __tablename__ = "model_metrics"
    metric_id     = db.Column(db.Integer, primary_key=True)
    model_version = db.Column(db.String(40), nullable=False)
    model_type    = db.Column(db.String(40))
    accuracy      = db.Column(db.Float)
    precision     = db.Column(db.Float)
    recall        = db.Column(db.Float)
    f1_score      = db.Column(db.Float)
    auc_roc       = db.Column(db.Float)
    evaluated_at  = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "metric_id": self.metric_id,
            "model_version": self.model_version,
            "model_type": self.model_type,
            "accuracy": self.accuracy,
            "precision": self.precision,
            "recall": self.recall,
            "f1_score": self.f1_score,
            "auc_roc": self.auc_roc,
            "evaluated_at": self.evaluated_at.isoformat() if self.evaluated_at else None,
        }
