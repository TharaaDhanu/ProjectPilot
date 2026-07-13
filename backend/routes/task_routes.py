"""
routes/task_routes.py
----------------------
Flask Blueprint for all Task-related endpoints.

Mounted at /api/tasks in create_app().
"""

from flask import Blueprint
from flask_jwt_extended import jwt_required

from controllers.task_controller import (
    list_tasks, get_task, create_task, update_task, delete_task,
    get_statistics, search_tasks, filter_tasks
)

task_bp = Blueprint("tasks", __name__, url_prefix="/api/tasks")

# Aggregate and helper routes (must be placed before dynamic /<int:task_id> routes)
task_bp.route("/statistics", methods=["GET"])(jwt_required()(get_statistics))
task_bp.route("/search",     methods=["GET"])(jwt_required()(search_tasks))
task_bp.route("/filter",     methods=["GET"])(jwt_required()(filter_tasks))

# Core CRUD routes
task_bp.route("", methods=["GET"])(jwt_required()(list_tasks))
task_bp.route("", methods=["POST"])(jwt_required()(create_task))

task_bp.route("/<int:task_id>", methods=["GET"])(jwt_required()(get_task))
task_bp.route("/<int:task_id>", methods=["PUT"])(jwt_required()(update_task))
task_bp.route("/<int:task_id>", methods=["DELETE"])(jwt_required()(delete_task))
