"""
utils/response.py
-----------------
Standardised JSON response helpers.

Every API endpoint returns one of these two shapes:

Success:
    { "success": true,  "message": "...", "data": { ... } }

Error:
    { "success": false, "message": "...", "data": null }

Using a consistent envelope makes the frontend predictable and allows
global Axios interceptors to handle errors uniformly.
"""

from flask import jsonify, Response
from typing import Any, Optional


def success_response(
    data: Any = None,
    message: str = "Success",
    status_code: int = 200,
) -> tuple[Response, int]:
    """Return a 2xx JSON response with a success envelope."""
    return (
        jsonify(
            {
                "success": True,
                "message": message,
                "data": data,
            }
        ),
        status_code,
    )


def error_response(
    message: str = "An error occurred",
    status_code: int = 400,
    errors: Optional[Any] = None,
) -> tuple[Response, int]:
    """Return a 4xx/5xx JSON response with an error envelope."""
    body: dict = {
        "success": False,
        "message": message,
        "data": None,
    }
    if errors is not None:
        body["errors"] = errors
    return jsonify(body), status_code
