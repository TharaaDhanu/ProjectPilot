"""
routes/project_routes.py
-------------------------
Flask Blueprint for all project-related endpoints.
Mounted at /api/projects in create_app().
All routes require a valid JWT.

Routes
------
GET    /api/projects                       → list (paginated, filterable)
POST   /api/projects                       → create
GET    /api/projects/statistics            → aggregate counts
GET    /api/projects/<id>                  → single project
PUT    /api/projects/<id>                  → full update
DELETE /api/projects/<id>                  → permanent delete
PATCH  /api/projects/<id>/archive          → archive
PATCH  /api/projects/<id>/restore          → restore from archive
"""

from flask import Blueprint
from flask_jwt_extended import jwt_required

from controllers.project_controller import (
    list_projects,
    get_project,
    create_project,
    update_project,
    delete_project,
    archive_project,
    restore_project,
    get_statistics,
)

project_bp = Blueprint("projects", __name__, url_prefix="/api/projects")

# Note: /statistics must be declared BEFORE /<int:project_id>
# to prevent Flask routing /statistics as a project_id.

project_bp.route("/statistics", methods=["GET"])(
    jwt_required()(get_statistics)
)

project_bp.route("", methods=["GET"])(
    jwt_required()(list_projects)
)

project_bp.route("", methods=["POST"])(
    jwt_required()(create_project)
)

project_bp.route("/<int:project_id>", methods=["GET"])(
    jwt_required()(get_project)
)
project_bp.route("/<int:project_id>", methods=["PUT"])(
    jwt_required()(update_project)
)
project_bp.route("/<int:project_id>", methods=["DELETE"])(
    jwt_required()(delete_project)
)
project_bp.route("/<int:project_id>/archive", methods=["PATCH"])(
    jwt_required()(archive_project)
)
project_bp.route("/<int:project_id>/restore", methods=["PATCH"])(
    jwt_required()(restore_project)
)
