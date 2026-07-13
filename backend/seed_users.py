"""
Seed the initial user accounts (run once, locally, after the DB exists).

    cd backend
    venv\\Scripts\\python.exe seed_users.py

Idempotent: skips any username that already exists.
"""
from app import create_app, db, bcrypt
from app.models.models import User

SEED = [
    {"username": "admin",   "email": "admin@sentinel.local",   "password": "admin123",   "role": "admin"},
    {"username": "analyst", "email": "analyst@sentinel.local", "password": "analyst123", "role": "analyst"},
]

app = create_app()
with app.app_context():
    for u in SEED:
        if User.query.filter_by(username=u["username"]).first():
            print(f"  {u['username']}: already exists, skipped")
            continue
        db.session.add(User(
            username=u["username"],
            email=u["email"],
            password_hash=bcrypt.generate_password_hash(u["password"]).decode("utf-8"),
            role=u["role"],
        ))
        print(f"  {u['username']}: created ({u['role']})")
    db.session.commit()
    print("Done. Change these passwords for any non-local deployment.")
