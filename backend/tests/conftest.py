"""Shared fixtures: an isolated app on in-memory SQLite + seeded users."""
import pytest

from app import create_app, db, bcrypt
from app.models.models import Transaction, User


@pytest.fixture()
def app():
    app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "JWT_SECRET_KEY": "test-secret",
    })
    with app.app_context():
        db.create_all()
        db.session.add_all([
            User(username="admin", email="a@t.local", role="admin",
                 password_hash=bcrypt.generate_password_hash("adminpw").decode()),
            User(username="analyst", email="n@t.local", role="analyst",
                 password_hash=bcrypt.generate_password_hash("analystpw").decode()),
            # One known transaction row (also present in the serving bundle)
            Transaction(tx_id=3205536, time_step=1, label="illicit"),
        ])
        db.session.commit()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


def _token(client, username, password):
    r = client.post("/api/auth/login", json={"username": username, "password": password})
    return r.get_json()["access_token"]


@pytest.fixture()
def analyst_headers(client):
    return {"Authorization": f"Bearer {_token(client, 'analyst', 'analystpw')}"}


@pytest.fixture()
def admin_headers(client):
    return {"Authorization": f"Bearer {_token(client, 'admin', 'adminpw')}"}
