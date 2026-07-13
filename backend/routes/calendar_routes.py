"""
routes/calendar_routes.py
-------------------------
Flask Blueprint for all Calendar and Scheduler REST API endpoints.
Mounted at /calendar in create_app().
All routes require a valid JWT.
"""

from flask import Blueprint
from flask_jwt_extended import jwt_required

from controllers.calendar_controller import CalendarController

calendar_bp = Blueprint("calendar", __name__, url_prefix="/calendar")

@calendar_bp.route("/statistics", methods=["GET"])
@calendar_bp.route("/statistics/", methods=["GET"])
@jwt_required()
def get_statistics():
    return CalendarController.get_statistics()

@calendar_bp.route("/dashboard", methods=["GET"])
@calendar_bp.route("/dashboard/", methods=["GET"])
@jwt_required()
def get_dashboard_data():
    return CalendarController.get_dashboard_data()

@calendar_bp.route("/upcoming", methods=["GET"])
@calendar_bp.route("/upcoming/", methods=["GET"])
@jwt_required()
def get_upcoming():
    return CalendarController.get_upcoming()

@calendar_bp.route("/today", methods=["GET"])
@calendar_bp.route("/today/", methods=["GET"])
@jwt_required()
def get_today():
    return CalendarController.get_today()

@calendar_bp.route("/events", methods=["GET"])
@calendar_bp.route("/events/", methods=["GET"])
@jwt_required()
def list_events():
    return CalendarController.get_events()

@calendar_bp.route("/events/<int:event_id>", methods=["GET"])
@calendar_bp.route("/events/<int:event_id>/", methods=["GET"])
@jwt_required()
def get_event(event_id: int):
    return CalendarController.get_event(event_id)

@calendar_bp.route("/events", methods=["POST"])
@calendar_bp.route("/events/", methods=["POST"])
@jwt_required()
def create_event():
    return CalendarController.create_event()

@calendar_bp.route("/events/<int:event_id>", methods=["PUT"])
@calendar_bp.route("/events/<int:event_id>/", methods=["PUT"])
@jwt_required()
def update_event(event_id: int):
    return CalendarController.update_event(event_id)

@calendar_bp.route("/events/<int:event_id>", methods=["DELETE"])
@calendar_bp.route("/events/<int:event_id>/", methods=["DELETE"])
@jwt_required()
def delete_event(event_id: int):
    return CalendarController.delete_event(event_id)
