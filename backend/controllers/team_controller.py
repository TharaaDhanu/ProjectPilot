"""
controllers/team_controller.py
--------------------------------
Flask request/response adapter for the Team module.
Delegates all business logic to TeamService.
"""

from flask import request
from flask_jwt_extended import get_jwt_identity

from services.team_service import TeamService, TeamServiceError
from utils.response import success_response, error_response


class TeamController:

    @staticmethod
    def list_employees():
        """GET /api/team — list, search, and filter employees."""
        search      = request.args.get("search", "").strip() or None
        role        = request.args.get("role", "").strip() or None
        designation = request.args.get("designation", "").strip() or None
        status      = request.args.get("status", "").strip() or None
        sort        = request.args.get("sort", "name_asc")

        employees = TeamService.get_all(
            search=search,
            role=role,
            designation=designation,
            status=status,
            sort=sort,
        )
        return success_response(data={"employees": employees, "total": len(employees)})

    @staticmethod
    def get_statistics():
        """GET /api/team/statistics — aggregated employee statistics."""
        stats = TeamService.get_statistics()
        return success_response(data=stats)

    @staticmethod
    def get_employee(user_id: int):
        """GET /api/team/<user_id> — detailed employee profile."""
        employee = TeamService.get_by_id(user_id)
        if not employee:
            return error_response("Employee not found.", 404)
        return success_response(data={"employee": employee})

    @staticmethod
    def create_employee():
        """POST /api/team — create a new employee."""
        data = request.get_json(silent=True) or {}
        actor_id = get_jwt_identity()
        try:
            employee = TeamService.create(data, actor_id=actor_id)
            return success_response(data={"employee": employee}, message="Employee created successfully.", status_code=201)
        except TeamServiceError as exc:
            return error_response(exc.message, exc.http_status)
        except Exception as exc:
            return error_response(f"Unexpected error: {str(exc)}", 500)

    @staticmethod
    def update_employee(user_id: int):
        """PUT /api/team/<user_id> — update employee."""
        data = request.get_json(silent=True) or {}
        actor_id = get_jwt_identity()
        try:
            employee = TeamService.update(user_id, data, actor_id=actor_id)
            return success_response(data={"employee": employee}, message="Employee updated successfully.")
        except TeamServiceError as exc:
            return error_response(exc.message, exc.http_status)
        except Exception as exc:
            return error_response(f"Unexpected error: {str(exc)}", 500)

    @staticmethod
    def delete_employee(user_id: int):
        """DELETE /api/team/<user_id> — remove employee."""
        actor_id = get_jwt_identity()
        try:
            TeamService.delete(user_id, actor_id=actor_id)
            return success_response(message="Employee deleted successfully.")
        except TeamServiceError as exc:
            return error_response(exc.message, exc.http_status)
        except Exception as exc:
            return error_response(f"Unexpected error: {str(exc)}", 500)
