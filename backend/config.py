"""
config.py
---------
Centralised application configuration.
All sensitive values are loaded from backend/.env via python-dotenv.
Uses an Application-Factory-compatible class-based config pattern.
"""

import os
from datetime import timedelta
from dotenv import load_dotenv

# Load .env from the backend directory (works regardless of cwd)
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))


class Config:
    """Base configuration — loaded by create_app()."""

    # ------------------------------------------------------------------ #
    # Flask core
    # ------------------------------------------------------------------ #
    SECRET_KEY: str = os.getenv("SECRET_KEY", "changeme-in-production")
    DEBUG: bool = False
    TESTING: bool = False

    # ------------------------------------------------------------------ #
    # Database  (Aiven MySQL via PyMySQL)
    # ------------------------------------------------------------------ #
    _DB_USER: str = os.getenv("DB_USER", "")
    _DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    _DB_HOST: str = os.getenv("DB_HOST", "localhost")
    _DB_PORT: str = os.getenv("DB_PORT", "3306")
    _DB_NAME: str = os.getenv("DB_NAME", "projectpilotdb")

    # Aiven requires SSL — append ssl_ca param (PyMySQL handles ssl_mode via ssl dict)
    SQLALCHEMY_DATABASE_URI: str = (
        f"mysql+pymysql://{_DB_USER}:{_DB_PASSWORD}"
        f"@{_DB_HOST}:{_DB_PORT}/{_DB_NAME}"
        f"?ssl_disabled=false"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS: bool = False
    SQLALCHEMY_ENGINE_OPTIONS: dict = {
        "pool_pre_ping": True,       # Detect stale connections
        "pool_recycle": 280,         # Recycle before Aiven's 300 s timeout
        "connect_args": {
            "ssl": {
                "ssl_disabled": False   # Enforce TLS for Aiven
            }
        },
    }

    # ------------------------------------------------------------------ #
    # JWT
    # ------------------------------------------------------------------ #
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "changeme-jwt-in-production")
    JWT_ACCESS_TOKEN_EXPIRES: timedelta = timedelta(hours=1)
    JWT_TOKEN_LOCATION: list = ["headers"]
    JWT_HEADER_NAME: str = "Authorization"
    JWT_HEADER_TYPE: str = "Bearer"


class DevelopmentConfig(Config):
    """Development overrides."""
    DEBUG = True


class ProductionConfig(Config):
    """Production overrides."""
    DEBUG = False


# Map string name → config class (used in create_app)
config_map: dict = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}
