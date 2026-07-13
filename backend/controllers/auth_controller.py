"""
controllers/auth_controller.py
-------------------------------
HTTP-layer handlers for authentication endpoints.

Responsibilities
----------------
- Parse and validate incoming JSON payloads.
- Delegate business logic to AuthService.
- Generate JWT access tokens on successful login.
- Translate AuthServiceError → HTTP error responses.
- Return consistent JSON envelopes via response utils.

Controllers do NOT contain business logic — that belongs in services.
"""

from flask import request
from flask_jwt_extended import create_access_token, get_jwt_identity

from services.auth_service import AuthService, AuthServiceError
from utils.response import success_response, error_response


def register() -> tuple:
    """
    POST /api/auth/register

    Expected JSON body:
        { "name": "...", "email": "...", "password": "..." }

    Returns 201 with the new user's public data on success.
    """
    from flask import current_app
    current_app.logger.info("REGISTER endpoint hit — POST reached Flask")
    data: dict = request.get_json(silent=True) or {}

    name: str = data.get("name", "").strip()
    email: str = data.get("email", "").strip()
    password: str = data.get("password", "")

    # Basic presence validation (detailed validation in service)
    missing_fields = [f for f, v in [("name", name), ("email", email), ("password", password)] if not v]
    if missing_fields:
        return error_response(
            f"Missing required fields: {', '.join(missing_fields)}", 422
        )

    try:
        user = AuthService.register_user(name, email, password)
    except AuthServiceError as exc:
        return error_response(exc.message, exc.http_status)

    return success_response(
        data=user.to_dict(),
        message="Account created successfully.",
        status_code=201,
    )


def login() -> tuple:
    """
    POST /api/auth/login

    Expected JSON body:
        { "email": "...", "password": "..." }

    Returns 200 with a JWT access_token and user data on success.
    """
    from flask import current_app
    current_app.logger.info("LOGIN endpoint hit — POST reached Flask")
    data: dict = request.get_json(silent=True) or {}

    email: str = data.get("email", "").strip()
    password: str = data.get("password", "")

    if not email or not password:
        return error_response("Email and password are required.", 422)

    try:
        user = AuthService.authenticate_user(email, password)
    except AuthServiceError as exc:
        return error_response(exc.message, exc.http_status)

    # Create JWT — subject is the user's integer id (stored as string)
    access_token: str = create_access_token(identity=str(user.id))

    return success_response(
        data={
            "access_token": access_token,
            "user": user.to_dict(),
        },
        message="Login successful.",
        status_code=200,
    )


def get_me() -> tuple:
    """
    GET /api/auth/me  (JWT protected)

    Returns the authenticated user's profile.
    The route decorator applies @jwt_required() before calling this.
    """
    user_id: int = int(get_jwt_identity())
    user = AuthService.get_user_by_id(user_id)

    if not user:
        return error_response("User not found.", 404)

    return success_response(data=user.to_dict(), message="User fetched.")


def list_users() -> tuple:
    """
    GET /api/auth/users (JWT protected)
    Returns all registered users for task assignment.
    """
    try:
        users = AuthService.get_all_users()
        return success_response(
            data=[u.to_dict() for u in users],
            message="Users list fetched successfully."
        )
    except Exception as e:
        return error_response(f"Failed to fetch users: {str(e)}", 500)

