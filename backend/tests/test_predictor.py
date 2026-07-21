"""ML inference tests against the real trained artifacts (models/ must exist —
run the training pipeline first; these are integration tests by design)."""
import os
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "ml_pipeline"))
from elliptic_predictor import exists, predict, screen_step  # noqa: E402

KNOWN_ILLICIT = 3205536   # step 1, labeled illicit in the dataset
KNOWN_LICIT = 2984918     # step 22, licit hub (473 neighbours)


class TestExists:
    def test_known_tx(self):
        assert exists(KNOWN_ILLICIT) is True

    def test_unknown_tx(self):
        assert exists(999999999) is False


class TestPredict:
    def test_result_shape(self):
        r = predict(KNOWN_ILLICIT, model="rf")
        assert set(r.keys()) >= {"model_type", "predicted_class", "fraud_probability",
                                 "rf_probability", "gnn_probability", "true_label"}
        assert r["predicted_class"] in (0, 1)
        assert 0.0 <= r["fraud_probability"] <= 1.0
        assert 0.0 <= r["rf_probability"] <= 1.0
        assert 0.0 <= r["gnn_probability"] <= 1.0

    def test_known_illicit_is_flagged(self):
        r = predict(KNOWN_ILLICIT, model="rf")
        assert r["predicted_class"] == 1
        assert r["true_label"] == "illicit"

    def test_known_licit_is_cleared(self):
        r = predict(KNOWN_LICIT, model="rf")
        assert r["predicted_class"] == 0
        assert r["true_label"] == "licit"

    def test_deterministic(self):
        a = predict(KNOWN_ILLICIT, model="rf")
        b = predict(KNOWN_ILLICIT, model="rf")
        assert a["fraud_probability"] == b["fraud_probability"]

    def test_model_selector(self):
        rf = predict(KNOWN_ILLICIT, model="rf")
        gnn = predict(KNOWN_ILLICIT, model="gnn")
        assert rf["model_type"] == "RandomForest"
        assert gnn["model_type"] == "GraphSAGE"
        assert gnn["fraud_probability"] == gnn["gnn_probability"]


class TestScreenStep:
    def test_screens_a_real_step(self):
        r = screen_step(35, rf_threshold=0.9, gnn_threshold=0.99)
        assert r["time_step"] == 35
        assert r["screened"] > 0
        assert isinstance(r["flagged"], list)
        for f in r["flagged"][:5]:
            assert f["flagged_by"] in ("rf", "gnn", "both")
            assert f["rf_probability"] >= 0.9 or f["gnn_probability"] >= 0.99

    def test_empty_step(self):
        r = screen_step(9999)
        assert r["screened"] == 0
        assert r["flagged"] == []

    def test_higher_threshold_flags_fewer(self):
        low = screen_step(35, rf_threshold=0.5, gnn_threshold=0.5)
        high = screen_step(35, rf_threshold=0.95, gnn_threshold=0.999)
        assert len(high["flagged"]) <= len(low["flagged"])
