"""Application entrypoint.

Local:       python run.py
Production:  gunicorn "run:app" --bind 0.0.0.0:$PORT --workers 1 --threads 4 --timeout 120

Use ONE worker. Each worker loads its own copy of the Random Forest and the
165-feature serving matrix (~162 MB), so two workers doubles the footprint for
no throughput gain on a small instance. One worker with threads is the right
shape for this app.
"""
import os

from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(
        host=os.environ.get("HOST", "127.0.0.1"),
        port=int(os.environ.get("PORT", 5000)),
        debug=app.config["DEBUG"],
    )
