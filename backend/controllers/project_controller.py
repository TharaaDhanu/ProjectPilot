"""
controllers/project_controller.py
-----------------------------------
HTTP-layer handlers for project endpoints.

Responsibilities
----------------
- Parse and validate incoming JSON / query-string payloads.
- Delegate business logic to ProjectService.
- Translate ProjectServiceError → HTTP error responses.
- Return consistent JSON envelopes via response utils.

Controllers do NOT contain business logic — that belongs in services.
"""

from flask import request
from flask_jwt_extended import get_jwt_identity

from services.project_service import ProjectService, ProjectServiceError
from services.notification_service import NotificationService
from utils.response import success_response, error_response


def list_projects() -> tuple:
    """
    GET /api/projects
    Query params: status, priority, search, sort, page, per_page
    """
    user_id = int(get_jwt_identity())

    result = ProjectService.get_all(
        user_id=user_id,
        status=request.args.get("status"),
        priority=request.args.get("priority"),
        search=request.args.get("search", "").strip() or None,
        sort=request.args.get("sort", "newest"),
        page=max(1, int(request.args.get("page", 1))),
        per_page=min(100, int(request.args.get("per_page", 20))),
    )
    return success_response(data=result, message="Projects fetched.")


def get_project(project_id: int) -> tuple:
    """GET /api/projects/<project_id>"""
    user_id = int(get_jwt_identity())
    project = ProjectService.get_by_id(project_id, user_id)
    if not project:
        return error_response("Project not found.", 404)
    return success_response(data=project.to_dict(), message="Project fetched.")


def create_project() -> tuple:
    """POST /api/projects"""
    user_id = int(get_jwt_identity())
    data: dict = request.get_json(silent=True) or {}

    if not data.get("title", "").strip():
        return error_response("Title is required.", 422)

    try:
        project = ProjectService.create(user_id, data)
    except ProjectServiceError as exc:
        return error_response(exc.message, exc.http_status)

    # Serialise the project NOW while the session is still healthy.
    # The notification step below performs its own commit and may leave the
    # session in a state where lazy-loading relationships (e.g. `creator`)
    # would fail. Capturing the dict up front guarantees the success
    # response is correct even if notification creation has issues.
    project_data = project.to_dict()

    # Auto-generate notification for project creation (non-critical)
    try:
        NotificationService.create_notification(
            user_id=user_id,
            title="Project Created",
            message=f"Project '{project.title}' has been created successfully.",
            notification_type="project_created",
            priority="normal",
            related_project_id=project.id,
        )
    except Exception:
        pass

    return success_response(
        data=project_data,
        message="Project created successfully.",
        status_code=201,
    )


def update_project(project_id: int) -> tuple:
    """PUT /api/projects/<project_id>"""
    user_id = int(get_jwt_identity())
    data: dict = request.get_json(silent=True) or {}

    try:
        project = ProjectService.update(project_id, user_id, data)
    except ProjectServiceError as exc:
        return error_response(exc.message, exc.http_status)

    # Serialise the project NOW while the session is still healthy (see
    # create_project for the rationale regarding the notification commit).
    project_data = project.to_dict()

    # Auto-generate notification for project update (non-critical)
    try:
        is_completed = data.get("status") == "Completed"
        notif_type = "project_completed" if is_completed else "project_updated"
        notif_title = "Project Completed" if is_completed else "Project Updated"
        NotificationService.create_notification(
            user_id=user_id,
            title=notif_title,
            message=f"Project '{project.title}' has been {'completed' if is_completed else 'updated'}.",
            notification_type=notif_type,
            priority="high" if is_completed else "normal",
            related_project_id=project.id,
        )
    except Exception:
        pass

    return success_response(data=project_data, message="Project updated.")


def delete_project(project_id: int) -> tuple:
    """DELETE /api/projects/<project_id>"""
    user_id = int(get_jwt_identity())

    try:
        project = ProjectService.get_by_id(project_id, user_id)
        project_title = project.title if project else "Unknown"
        ProjectService.delete(project_id, user_id)
    except ProjectServiceError as exc:
        return error_response(exc.message, exc.http_status)

    # Auto-generate notification for project deletion
    try:
        NotificationService.create_notification(
            user_id=user_id,
            title="Project Deleted",
            message=f"Project '{project_title}' has been deleted.",
            notification_type="system_alert",
            priority="high",
        )
    except Exception:
        pass

    return success_response(data=None, message="Project deleted.")


def archive_project(project_id: int) -> tuple:
    """PATCH /api/projects/<project_id>/archive"""
    user_id = int(get_jwt_identity())

    try:
        project = ProjectService.archive(project_id, user_id)
    except ProjectServiceError as exc:
        return error_response(exc.message, exc.http_status)

    return success_response(data=project.to_dict(), message="Project archived.")


def restore_project(project_id: int) -> tuple:
    """PATCH /api/projects/<project_id>/restore"""
    user_id = int(get_jwt_identity())

    try:
        project = ProjectService.restore(project_id, user_id)
    except ProjectServiceError as exc:
        return error_response(exc.message, exc.http_status)

    return success_response(data=project.to_dict(), message="Project restored.")


def get_statistics() -> tuple:
    """GET /api/projects/statistics"""
    user_id = int(get_jwt_identity())
    stats = ProjectService.get_statistics(user_id)
    return success_response(data=stats, message="Statistics fetched.")
