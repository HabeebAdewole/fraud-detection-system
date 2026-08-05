from functools import wraps
from flask import current_app, jsonify, request
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.models.models import User


def role_required(*roles):
    """Decorator that restricts an endpoint to users whose role is in `roles`."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user_id = int(get_jwt_identity())
            user = User.query.get(user_id)
            if not user or user.role not in roles:
                return jsonify({"error": "Forbidden"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def demo_readonly(fn):
    """Blocks an endpoint when DEMO_MODE is on.

    The hosted demo publishes its credentials, so every visitor arrives as an
    administrator. Read paths stay open — the point of the demo is to show the
    dashboards — but anything that mutates accounts or stored metrics would let
    a stranger lock the owner out of their own deployment."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if current_app.config.get("DEMO_MODE"):
            return jsonify({
                "error": "Disabled in the public demo",
                "detail": "This deployment runs with DEMO_MODE=true, which makes "
                          "account management and metric writes read-only. Run the "
                          "project locally for the full admin panel.",
            }), 403
        return fn(*args, **kwargs)
    return wrapper


def json_body():
    """Returns (data, error_response). Flask raises 415 on a bodyless POST and
    returns None for malformed JSON; both should read as 400 to the client."""
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return None, (jsonify({"error": "Request body must be a JSON object"}), 400)
    return data, None
