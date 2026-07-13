"""
services/auth_service.py
------------------------
Business logic for authentication.

Responsibilities
----------------
- Validate uniqueness of email on registration.
- Hash the raw password before persisting.
- Verify password during login.
- Abstract all database interaction from the controller layer.

No Flask request/response objects are used here — this layer is
independently testable without an HTTP context.
"""

from typing import Optional, Tuple

from extensions import db
from models.user import User


class AuthServiceError(Exception):
    """Domain-level error raised by AuthService methods.

    Callers (controllers) catch this and convert it to an HTTP response.
    Carrying an http_status lets the controller set the right status code
    without coupling this layer to Flask.
    """

    def __init__(self, message: str, http_status: int = 400) -> None:
        super().__init__(message)
        self.message = message
        self.http_status = http_status


class AuthService:
    """Stateless service — all methods are class-level for easy import."""

    @staticmethod
    def register_user(name: str, email: str, password: str) -> User:
        """
        Create and persist a new User.

        Raises
        ------
        AuthServiceError  : If email already exists or validation fails.
        """
        # Input sanity (belt-and-suspenders — controller also validates)
        name = name.strip()
        email = email.strip().lower()

        if not name:
            raise AuthServiceError("Name is required.", 422)
        if not email:
            raise AuthServiceError("Email is required.", 422)
        if not password:
            raise AuthServiceError("Password is required.", 422)
        if len(password) < 8:
            raise AuthServiceError(
                "Password must be at least 8 characters.", 422
            )

        # Uniqueness check
        existing: Optional[User] = User.query.filter_by(email=email).first()
        if existing:
            raise AuthServiceError(
                "An account with this email already exists.", 409
            )

        # Create user
        user = User(name=name, email=email)
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        return user

    @staticmethod
    def authenticate_user(email: str, password: str) -> User:
        """
        Verify credentials and return the User.

        Raises
        ------
        AuthServiceError : If credentials are invalid.
        """
        email = email.strip().lower()

        user: Optional[User] = User.query.filter_by(email=email).first()

        # Deliberately vague error — don't reveal whether email exists
        if not user or not user.check_password(password):
            raise AuthServiceError("Invalid email or password.", 401)

        return user

    @staticmethod
    def get_user_by_id(user_id: int) -> Optional[User]:
        """Fetch a user by primary key — returns None if not found."""
        return db.session.get(User, user_id)

    @staticmethod
    def get_all_users() -> list[User]:
        """Fetch all registered users."""
        return User.query.order_by(User.name.asc()).all()
