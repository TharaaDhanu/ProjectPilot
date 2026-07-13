"""
extensions.py
-------------
All Flask extension instances are created here — NOT bound to an app yet.
The Application Factory (create_app) calls extension.init_app(app) at startup.

This pattern prevents circular imports: models can import `db` from here
without importing the app object.
"""

from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from flask_cors import CORS

# SQLAlchemy ORM — shared across all models
db: SQLAlchemy = SQLAlchemy()

# JWT authentication manager
jwt: JWTManager = JWTManager()

# Password hashing utility
bcrypt: Bcrypt = Bcrypt()

# Database migration engine (Alembic wrapper)
migrate: Migrate = Migrate()

# Cross-Origin Resource Sharing handler
cors: CORS = CORS()
