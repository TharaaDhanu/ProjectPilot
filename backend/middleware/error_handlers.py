"""
middleware/error_handlers.py
-----------------------------
Global Flask error handlers.

Ensures that ALL error responses — including Flask's built-in 404/405/500
and Flask-JWT-Extended JWT errors — return JSON, never HTML.

Usage
-----
Call register_error_handlers(app) inside create_app() after extensions
are initialised.
"""

from flask import Flask
from flask_jwt_extended.exceptions import (
    NoAuthorizationError,
    InvalidHeaderError,
    JWTDecodeError,
    RevokedTokenError,
)
from jwt.exceptions import ExpiredSignatureError
from werkzeug.exceptions import HTTPException

from utils.response import error_response


def register_error_handlers(app: Flask) -> None:
    """Attach all global error handlers to the Flask app instance."""

    # ------------------------------------------------------------------ #
    # Standard HTTP errors (werkzeug)
    # ------------------------------------------------------------------ #

    @app.errorhandler(400)
    def bad_request(e):
        return error_response("Bad request.", 400)

    @app.errorhandler(401)
    def unauthorized(e):
        return error_response("Unauthorised. Please log in.", 401)

    @app.errorhandler(403)
    def forbidden(e):
        return error_response("Forbidden. You do not have access.", 403)

    @app.errorhandler(404)
    def not_found(e):
        return error_response("The requested resource was not found.", 404)

    @app.errorhandler(405)
    def method_not_allowed(e):
        return error_response("HTTP method not allowed on this endpoint.", 405)

    @app.errorhandler(500)
    def internal_server_error(e):
        app.logger.error("Internal server error: %s", str(e))
        return error_response("Internal server error. Please try again later.", 500)

    @app.errorhandler(HTTPException)
    def handle_http_exception(e):
        return error_response(e.description, e.code)

    # ------------------------------------------------------------------ #
    # Flask-JWT-Extended errors
    # ------------------------------------------------------------------ #

    @app.errorhandler(NoAuthorizationError)
    def missing_token(e):
        return error_response("Authorization token is missing.", 401)

    @app.errorhandler(InvalidHeaderError)
    def invalid_token_header(e):
        return error_response("Invalid authorization header format.", 401)

    @app.errorhandler(JWTDecodeError)
    def invalid_token(e):
        return error_response("Token is invalid.", 401)

    @app.errorhandler(ExpiredSignatureError)
    def expired_token(e):
        return error_response("Token has expired. Please log in again.", 401)

    @app.errorhandler(RevokedTokenError)
    def revoked_token(e):
        return error_response("Token has been revoked.", 401)
