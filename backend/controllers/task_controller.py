"""
controllers/task_controller.py
------------------------------
Standard HTTP Controller layer for Task endpoints. Parses parameters,
calls the service layer, handles Service exceptions, and returns response envelopes.
"""

from flask import request
from flask_jwt_extended import get_jwt_identity

from services.task_service import TaskService, TaskServiceError
from utils.response import success_response, error_response


def list_tasks() -> tuple:
    """
    GET /api/tasks
    Query parameters:
      - project_id (int)
      - assigned_to (int)
      - status (str)
      - priority (str)
      - sort (str, default 'newest')
      - search (str)
    """
    try:
        user_id = int(get_jwt_identity())
        filters = {
            "project_id": request.args.get("project_id", type=int),
            "assigned_to": request.args.get("assigned_to", type=int),
            "status": request.args.get("status"),
            "priority": request.args.get("priority"),
            "start_date": request.args.get("start_date"),
            "end_date": request.args.get("end_date"),
        }
        # Clean None filters
        filters = {k: v for k, v in filters.items() if v is not None}

        sort = request.args.get("sort", "newest")
        search = request.args.get("search", "")

        tasks = TaskService.get_all_tasks(user_id, filters, sort, search)
        return success_response(
            data=[t.to_dict() for t in tasks],
            message="Tasks fetched successfully."
        )
    except Exception as e:
        return error_response(f"Failed to fetch tasks: {str(e)}", 500)


def search_tasks() -> tuple:
    """
    GET /api/tasks/search
    Query parameters:
      - query / search (str)
    """
    try:
        user_id = int(get_jwt_identity())
        search = request.args.get("query") or request.args.get("search") or ""
        tasks = TaskService.get_all_tasks(user_id, search=search)
        return success_response(
            data=[t.to_dict() for t in tasks],
            message="Search results fetched successfully."
        )
    except Exception as e:
        return error_response(f"Search failed: {str(e)}", 500)


def filter_tasks() -> tuple:
    """
    GET /api/tasks/filter
    Query parameters: same filters as list_tasks
    """
    return list_tasks()


def get_task(task_id: int) -> tuple:
    """GET /api/tasks/<task_id>"""
    try:
        task = TaskService.get_task_by_id(task_id)
        if not task:
            return error_response("Task not found.", 404)
        return success_response(data=task.to_dict(), message="Task fetched successfully.")
    except Exception as e:
        return error_response(f"Failed to fetch task: {str(e)}", 500)


def create_task() -> tuple:
    """POST /api/tasks"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json() or {}
        task_data = TaskService.create_task(user_id, data)
        return success_response(
            data=task_data,
            message=f"Task '{task_data.get('title', '')}' created successfully.",
            status_code=201
        )
    except TaskServiceError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response(f"Failed to create task: {str(e)}", 500)


def update_task(task_id: int) -> tuple:
    """PUT /api/tasks/<task_id>"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json() or {}
        task_data = TaskService.update_task(task_id, user_id, data)
        return success_response(
            data=task_data,
            message=f"Task '{task_data.get('title', '')}' updated successfully."
        )
    except TaskServiceError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response(f"Failed to update task: {str(e)}", 500)


def delete_task(task_id: int) -> tuple:
    """DELETE /api/tasks/<task_id>"""
    try:
        user_id = int(get_jwt_identity())
        TaskService.delete_task(task_id, user_id)
        return success_response(message="Task deleted successfully.")
    except TaskServiceError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response(f"Failed to delete task: {str(e)}", 500)


def get_statistics() -> tuple:
    """GET /api/tasks/statistics"""
    try:
        user_id = int(get_jwt_identity())
        stats = TaskService.get_statistics(user_id)
        return success_response(data=stats, message="Task statistics fetched successfully.")
    except Exception as e:
        return error_response(f"Failed to fetch task statistics: {str(e)}", 500)
