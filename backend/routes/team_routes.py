"""
routes/team_routes.py
----------------------
Flask Blueprint for the Team Management REST API.

Endpoints
---------
GET    /team                — list/search/filter employees
GET    /team/statistics     — aggregated team statistics
GET    /team/<id>           — employee detail
POST   /team                — create employee
PUT    /team/<id>           — update employee
DELETE /team/<id>           — delete employee
"""

from flask import Blueprint
from flask_jwt_extended import jwt_required

from controllers.team_controller import TeamController

team_bp = Blueprint("team", __name__, url_prefix="/team")


@team_bp.route("/statistics", methods=["GET"])
@jwt_required()
def get_statistics():
    return TeamController.get_statistics()


@team_bp.route("", methods=["GET"])
@team_bp.route("/", methods=["GET"])
@jwt_required()
def list_employees():
    return TeamController.list_employees()


@team_bp.route("/<int:user_id>", methods=["GET"])
@jwt_required()
def get_employee(user_id: int):
    return TeamController.get_employee(user_id)


@team_bp.route("", methods=["POST"])
@team_bp.route("/", methods=["POST"])
@jwt_required()
def create_employee():
    return TeamController.create_employee()


@team_bp.route("/<int:user_id>", methods=["PUT"])
@jwt_required()
def update_employee(user_id: int):
    return TeamController.update_employee(user_id)


@team_bp.route("/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_employee(user_id: int):
    return TeamController.delete_employee(user_id)
