"""Shared fixtures: an isolated app on in-memory SQLite + seeded users."""
import pytest

from app import create_app, db, bcrypt
from app.models.models import Transaction, User


def _build_app(**overrides):
    app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "JWT_SECRET_KEY": "test-secret",
        **overrides,
    })
    return app


@pytest.fixture()
def app():
    app = _build_app()
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


# --- DEMO_MODE variant -----------------------------------------------------
# Same seeded app with the public-demo guard switched on, so the read-only
# behaviour can be asserted against the same routes.

@pytest.fixture()
def demo_app():
    app = _build_app(DEMO_MODE=True)
    with app.app_context():
        db.create_all()
        db.session.add_all([
            User(username="admin", email="a@t.local", role="admin",
                 password_hash=bcrypt.generate_password_hash("adminpw").decode()),
            User(username="analyst", email="n@t.local", role="analyst",
                 password_hash=bcrypt.generate_password_hash("analystpw").decode()),
        ])
        db.session.commit()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def demo_client(demo_app):
    return demo_app.test_client()


@pytest.fixture()
def demo_admin_headers(demo_client):
    return {"Authorization": f"Bearer {_token(demo_client, 'admin', 'adminpw')}"}
