"""
app.py
------
Application Factory for ProjectPilot Flask backend.

Usage
-----
Development  : python app.py
Production   : gunicorn "app:create_app()"

The create_app() pattern enables:
  - Environment-specific configuration
  - Circular-import-free extension initialisation
  - Easy unit testing with isolated app instances
"""

import os
from flask import Flask, request

from config import config_map
from extensions import db, jwt, bcrypt, migrate, cors
from routes.auth_routes    import auth_bp
from routes.project_routes import project_bp
from routes.task_routes    import task_bp
from routes.notification_routes import notification_bp
from routes.team_routes    import team_bp
from routes.calendar_routes import calendar_bp
from middleware.error_handlers import register_error_handlers


def create_app(env: str = None) -> Flask:
    """
    Create, configure, and return the Flask application.

    Parameters
    ----------
    env : str, optional
        Configuration environment key ('development', 'production').
        Falls back to FLASK_ENV env var, then 'default'.
    """
    app = Flask(__name__)

    # ------------------------------------------------------------------ #
    # Load configuration
    # ------------------------------------------------------------------ #
    env = env or os.getenv("FLASK_ENV", "default")
    app.config.from_object(config_map[env])

    # ------------------------------------------------------------------ #
    # Initialise extensions (order matters — db before migrate)
    # ------------------------------------------------------------------ #
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    migrate.init_app(app, db)
    # Allow both common React dev ports (3000 and 3001) plus any explicit CORS_ORIGINS override.
    # IMPORTANT: Flask-CORS treats a *string* origins value as a single literal pattern and does
    # NOT split on commas. Passing "a,b" as one string will never match either origin, so the
    # preflight (OPTIONS) response omits Access-Control-Allow-Origin and the browser blocks the
    # real POST. We must pass a LIST so any listed origin is matched individually.
    _cors_env = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001")
    _cors_origins = [o.strip() for o in _cors_env.split(",") if o.strip()]

    # Log every request (method + path + origin) so we can confirm POST reaches Flask.
    @app.before_request
    def _log_requests():
        app.logger.info(
            "REQUEST %s %s | Origin: %s",
            request.method,
            request.path,
            request.headers.get("Origin"),
        )

    cors.init_app(
        app,
        resources={
            r"/api/*": {"origins": _cors_origins},
            r"/team": {"origins": _cors_origins},
            r"/team/*": {"origins": _cors_origins},
            r"/calendar": {"origins": _cors_origins},
            r"/calendar/*": {"origins": _cors_origins},
        },
        supports_credentials=True,
    )

    # ------------------------------------------------------------------ #
    # Register Blueprints
    # ------------------------------------------------------------------ #
    app.register_blueprint(auth_bp)
    app.register_blueprint(project_bp)
    app.register_blueprint(task_bp)
    app.register_blueprint(notification_bp)
    app.register_blueprint(team_bp)
    app.register_blueprint(calendar_bp)

    # ------------------------------------------------------------------ #
    # Register global error handlers
    # ------------------------------------------------------------------ #
    register_error_handlers(app)

    # ------------------------------------------------------------------ #
    # Auto-create database tables (idempotent — safe to run on every start)
    # ------------------------------------------------------------------ #
    with app.app_context():
        # Import all models so SQLAlchemy knows about them before create_all
        from models.user    import User, project_members    # noqa: F401
        from models.project import Project  # noqa: F401
        from models.task    import Task     # noqa: F401
        from models.notification import Notification # noqa: F401
        from models.calendar_event import CalendarEvent # noqa: F401

        db.create_all()
        app.logger.info("Database tables verified/created.")

    # ------------------------------------------------------------------ #
    # Health-check endpoint
    # ------------------------------------------------------------------ #
    @app.route("/api/health", methods=["GET"])
    def health():
        from utils.response import success_response
        return success_response(data={"status": "ok"}, message="ProjectPilot API is running.")

    return app


# ------------------------------------------------------------------ #
# Development server entry point
# ------------------------------------------------------------------ #
if __name__ == "__main__":
    flask_app = create_app()
    flask_app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5000)),
        debug=True,
    )
