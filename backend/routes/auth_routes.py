"""
routes/auth_routes.py
----------------------
Flask Blueprint for all authentication-related endpoints.

Mounted at /api/auth in create_app().

Routes
------
POST   /api/auth/register   → register a new user
POST   /api/auth/login      → login and receive a JWT
GET    /api/auth/me         → return authenticated user (JWT required)
"""

from flask import Blueprint
from flask_jwt_extended import jwt_required

from controllers.auth_controller import register, login, get_me, list_users

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

# Public routes
auth_bp.route("/register", methods=["POST"])(register)
auth_bp.route("/login", methods=["POST"])(login)

# Protected route — JWT must be present in Authorization header
auth_bp.route("/me", methods=["GET"])(jwt_required()(get_me))
auth_bp.route("/users", methods=["GET"])(jwt_required()(list_users))
