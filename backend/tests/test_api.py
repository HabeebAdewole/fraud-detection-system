"""API contract tests: auth, role enforcement, input validation."""


class TestAuth:
    def test_login_success(self, client):
        r = client.post("/api/auth/login", json={"username": "analyst", "password": "analystpw"})
        assert r.status_code == 200
        body = r.get_json()
        assert "access_token" in body
        assert body["user"]["role"] == "analyst"

    def test_login_wrong_password(self, client):
        r = client.post("/api/auth/login", json={"username": "analyst", "password": "wrong"})
        assert r.status_code == 401

    def test_open_registration_is_gone(self, client):
        r = client.post("/api/auth/register", json={
            "username": "rogue", "email": "r@x.com", "password": "x", "role": "admin"})
        assert r.status_code == 404  # endpoint must not exist

    def test_me_requires_token(self, client):
        assert client.get("/api/auth/me").status_code == 401


class TestRoleEnforcement:
    def test_analyst_cannot_list_users(self, client, analyst_headers):
        r = client.get("/api/admin/users", headers=analyst_headers)
        assert r.status_code == 403

    def test_admin_can_list_users(self, client, admin_headers):
        r = client.get("/api/admin/users", headers=admin_headers)
        assert r.status_code == 200
        assert len(r.get_json()["users"]) == 2

    def test_admin_create_user_and_new_login(self, client, admin_headers):
        r = client.post("/api/admin/users", headers=admin_headers, json={
            "username": "newbie", "email": "new@t.local", "password": "secret123", "role": "analyst"})
        assert r.status_code == 201
        r2 = client.post("/api/auth/login", json={"username": "newbie", "password": "secret123"})
        assert r2.status_code == 200


class TestPredictionValidation:
    def test_missing_tx_id_is_400(self, client, analyst_headers):
        r = client.post("/api/predictions/", headers=analyst_headers, json={})
        assert r.status_code == 400

    def test_non_numeric_tx_id_is_400(self, client, analyst_headers):
        r = client.post("/api/predictions/", headers=analyst_headers, json={"tx_id": "abc"})
        assert r.status_code == 400

    def test_unknown_tx_is_404(self, client, analyst_headers):
        r = client.post("/api/predictions/", headers=analyst_headers, json={"tx_id": 999999999})
        assert r.status_code == 404

    def test_bad_model_name_is_400(self, client, analyst_headers):
        r = client.post("/api/predictions/", headers=analyst_headers,
                        json={"tx_id": 3205536, "model": "quantum"})
        assert r.status_code == 400

    def test_prediction_requires_auth(self, client):
        assert client.post("/api/predictions/", json={"tx_id": 3205536}).status_code == 401


class TestExplain:
    def test_unknown_tx_is_404(self, client, analyst_headers):
        r = client.get("/api/predictions/999999999/explain", headers=analyst_headers)
        assert r.status_code == 404

    def test_explanation_shape_and_additivity(self, client, analyst_headers):
        r = client.get("/api/predictions/3205536/explain", headers=analyst_headers)
        assert r.status_code == 200
        e = r.get_json()
        assert e["model"] == "RandomForest"
        assert len(e["contributions"]) > 0
        for c in e["contributions"]:
            assert c["group"] in ("local", "aggregate")
        # Attributions must sum (base + all groups) to the model's probability
        total = e["base_value"] + e["group_totals"]["local"] + e["group_totals"]["aggregate"]
        assert abs(total - e["probability"]) < 0.01


class TestTransactions:
    def test_browse_requires_auth(self, client):
        assert client.get("/api/transactions/").status_code == 401

    def test_browse_and_filter(self, client, analyst_headers):
        r = client.get("/api/transactions/?label=illicit", headers=analyst_headers)
        assert r.status_code == 200
        body = r.get_json()
        assert body["total"] == 1
        assert body["transactions"][0]["tx_id"] == 3205536

    def test_subgraph_of_known_tx(self, client, analyst_headers):
        r = client.get("/api/transactions/3205536/subgraph", headers=analyst_headers)
        assert r.status_code == 200
        body = r.get_json()
        assert body["center"] == 3205536
        assert any(n["tx_id"] == 3205536 for n in body["nodes"])


class TestReports:
    """Regression cover for the report generator. This route was broken for
    weeks after the Elliptic migration (it still joined on the old PaySim
    column names) precisely because nothing tested it."""

    def test_requires_auth(self, client):
        assert client.post("/api/reports/", json={}).status_code == 401

    def test_missing_dates_is_400(self, client, analyst_headers):
        r = client.post("/api/reports/", headers=analyst_headers, json={})
        assert r.status_code == 400

    def test_bad_date_format_is_400(self, client, analyst_headers):
        r = client.post("/api/reports/", headers=analyst_headers,
                        json={"date_range_start": "01-01-2026", "date_range_end": "2026-12-31"})
        assert r.status_code == 400

    def test_reversed_range_is_400(self, client, analyst_headers):
        r = client.post("/api/reports/", headers=analyst_headers,
                        json={"date_range_start": "2026-12-31", "date_range_end": "2026-01-01"})
        assert r.status_code == 400

    def test_generates_report_and_lists_it(self, client, analyst_headers):
        r = client.post("/api/reports/", headers=analyst_headers, json={
            "report_type": "fraud_summary",
            "date_range_start": "2020-01-01",
            "date_range_end": "2030-12-31",
        })
        assert r.status_code == 201, r.get_json()
        body = r.get_json()
        assert body["report_type"] == "fraud_summary"
        assert body["file_path"]

        listed = client.get("/api/reports/", headers=analyst_headers)
        assert listed.status_code == 200
        assert any(rep["report_id"] == body["report_id"] for rep in listed.get_json()["reports"])

    def test_report_csv_has_elliptic_columns(self, client, analyst_headers):
        """The CSV must describe Elliptic transactions (tx_id/time_step/label),
        not the PaySim fields (type/amount) the old code referenced."""
        r = client.post("/api/reports/", headers=analyst_headers, json={
            "date_range_start": "2020-01-01", "date_range_end": "2030-12-31"})
        assert r.status_code == 201
        with open(r.get_json()["file_path"]) as f:
            header = f.readline()
        for col in ("tx_id", "time_step", "ground_truth_label", "model_type"):
            assert col in header
        assert "amount" not in header


class TestMonitor:
    def test_status_shape(self, client, analyst_headers):
        r = client.get("/api/monitor/status", headers=analyst_headers)
        assert r.status_code == 200
        body = r.get_json()
        assert body["final_step"] == 49
        assert 34 <= body["last_step"] <= 49
        assert set(body["thresholds"].keys()) == {"rf", "gnn"}

    def test_reset_rewinds_to_start(self, client, analyst_headers):
        r = client.post("/api/monitor/reset", headers=analyst_headers, json={})
        assert r.status_code == 200
        s = client.get("/api/monitor/status", headers=analyst_headers).get_json()
        assert s["last_step"] == 34
