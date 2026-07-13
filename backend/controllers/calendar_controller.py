"""
controllers/calendar_controller.py
----------------------------------
Flask request/response adapter for the Calendar/Scheduler module.
Delegates all business logic to CalendarService.
"""

from flask import request
from flask_jwt_extended import get_jwt_identity

from services.calendar_service import CalendarService, CalendarServiceError
from validation.calendar_validation import validate_event_payload
from utils.response import success_response, error_response


class CalendarController:

    @staticmethod
    def get_events() -> tuple:
        """GET /calendar/events - Fetch all manual and virtual events (with filters)."""
        user_id = int(get_jwt_identity())
        
        # Build filter dictionary
        filters = {
            "project_id": request.args.get("project_id", type=int),
            "task_id": request.args.get("task_id", type=int),
            "employee_id": request.args.get("employee_id", type=int),
            "priority": request.args.get("priority"),
            "status": request.args.get("status"),
            "event_type": request.args.get("event_type"),
            "search": request.args.get("search", "")
        }

        try:
            events = CalendarService.get_all(user_id=user_id, filters=filters)
            return success_response(data=events, message="Events fetched successfully.")
        except Exception as exc:
            return error_response(f"Unexpected error: {str(exc)}", 500)

    @staticmethod
    def get_event(event_id: int) -> tuple:
        """GET /calendar/events/<event_id> - Fetch a single manual event."""
        user_id = int(get_jwt_identity())
        try:
            event = CalendarService.get_by_id(event_id, user_id)
            if not event:
                return error_response("Calendar event not found.", 404)
            return success_response(data=event, message="Calendar event fetched.")
        except Exception as exc:
            return error_response(f"Unexpected error: {str(exc)}", 500)

    @staticmethod
    def create_event() -> tuple:
        """POST /calendar/events - Create a new manual event."""
        user_id = int(get_jwt_identity())
        data = request.get_json(silent=True) or {}

        # Validate payload before delegating to the service
        cleaned, errors = validate_event_payload(data, partial=False)
        if errors:
            return error_response("Validation failed.", 422, errors=errors)

        try:
            event = CalendarService.create(user_id=user_id, data=cleaned)
            return success_response(data=event, message="Event created successfully.", status_code=201)
        except CalendarServiceError as exc:
            return error_response(exc.message, exc.http_status)
        except Exception as exc:
            return error_response(f"Unexpected error: {str(exc)}", 500)

    @staticmethod
    def update_event(event_id: int) -> tuple:
        """PUT /calendar/events/<event_id> - Update an event (support drag-drop & resize)."""
        user_id = int(get_jwt_identity())
        data = request.get_json(silent=True) or {}

        # Validate only the fields present in a partial update
        cleaned, errors = validate_event_payload(data, partial=True)
        if errors:
            return error_response("Validation failed.", 422, errors=errors)

        try:
            event = CalendarService.update(event_id=event_id, user_id=user_id, data=cleaned)
            return success_response(data=event, message="Event updated successfully.")
        except CalendarServiceError as exc:
            return error_response(exc.message, exc.http_status)
        except Exception as exc:
            return error_response(f"Unexpected error: {str(exc)}", 500)

    @staticmethod
    def delete_event(event_id: int) -> tuple:
        """DELETE /calendar/events/<event_id> - Delete a manual event."""
        user_id = int(get_jwt_identity())
        try:
            CalendarService.delete(event_id=event_id, user_id=user_id)
            return success_response(message="Event deleted successfully.")
        except CalendarServiceError as exc:
            return error_response(exc.message, exc.http_status)
        except Exception as exc:
            return error_response(f"Unexpected error: {str(exc)}", 500)

    @staticmethod
    def get_upcoming() -> tuple:
        """GET /calendar/upcoming - Fetch upcoming events (next 30 days)."""
        user_id = int(get_jwt_identity())
        limit = request.args.get("limit", 8, type=int)
        try:
            upcoming = CalendarService.get_upcoming(user_id=user_id, limit=limit)
            return success_response(data=upcoming, message="Upcoming events fetched.")
        except Exception as exc:
            return error_response(f"Unexpected error: {str(exc)}", 500)

    @staticmethod
    def get_today() -> tuple:
        """GET /calendar/today - Fetch schedule items for today."""
        user_id = int(get_jwt_identity())
        try:
            today_events = CalendarService.get_today(user_id=user_id)
            return success_response(data=today_events, message="Today's schedule fetched.")
        except Exception as exc:
            return error_response(f"Unexpected error: {str(exc)}", 500)

    @staticmethod
    def get_statistics() -> tuple:
        """GET /calendar/statistics - Fetch aggregated scheduler statistics."""
        user_id = int(get_jwt_identity())
        try:
            stats = CalendarService.get_statistics(user_id=user_id)
            return success_response(data=stats, message="Statistics fetched successfully.")
        except Exception as exc:
            return error_response(f"Unexpected error: {str(exc)}", 500)

    @staticmethod
    def get_dashboard_data() -> tuple:
        """GET /calendar/dashboard - Fetch all sidebar/report aggregates in one call."""
        user_id = int(get_jwt_identity())
        try:
            data = CalendarService.get_dashboard_data(user_id=user_id)
            return success_response(data=data, message="Scheduler dashboard data fetched.")
        except Exception as exc:
            return error_response(f"Unexpected error: {str(exc)}", 500)
