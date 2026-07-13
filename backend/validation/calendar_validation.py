"""
validation/calendar_validation.py
----------------------------------
Request validation helpers for the Calendar/Scheduler module.

Centralises field rules so the controller and service stay thin and
consistent. Each validator returns a (data, errors) tuple where `errors`
is a list of human-readable messages (empty when valid).
"""

from datetime import date

# Allowed enumerations (kept in sync with the frontend EventFormModal)
EVENT_TYPES = [
    "Project", "Task", "Meeting", "Deadline", "Milestone",
    "Leave", "Birthday", "Work Anniversary", "Holiday",
    "Reminder", "Personal",
]

PRIORITIES = ["Low", "Medium", "High", "Critical"]
STATUSES = ["Confirmed", "Pending", "Cancelled"]
REPEAT_TYPES = ["None", "Daily", "Weekly", "Monthly", "Yearly"]

MAX_TITLE_LEN = 200


def _parse_date(value):
    if not value:
        return None, "Start date is required."
    try:
        if "T" in str(value):
            value = str(value).split("T")[0]
        return date.fromisoformat(str(value)), None
    except (ValueError, TypeError):
        return None, "Invalid date format. Use YYYY-MM-DD."


def validate_event_payload(data: dict, partial: bool = False) -> tuple:
    """
    Validate a create/update payload for a manual calendar event.

    Parameters
    ----------
    data : dict
        Raw JSON body from the request.
    partial : bool
        When True (PUT), only the fields present are validated.

    Returns
    -------
    (cleaned: dict, errors: list[str])
    """
    errors = []
    cleaned = {}

    # ── Title ──
    if "title" in data:
        title = (data.get("title") or "").strip()
        if not title:
            errors.append("Title is required.")
        elif len(title) > MAX_TITLE_LEN:
            errors.append(f"Title must be at most {MAX_TITLE_LEN} characters.")
        else:
            cleaned["title"] = title

    # ── Start date ──
    if "start_date" in data:
        start_d, err = _parse_date(data.get("start_date"))
        if err:
            errors.append(err)
        else:
            cleaned["start_date"] = start_d

    # ── End date (optional) ──
    if "end_date" in data and data.get("end_date"):
        end_d, err = _parse_date(data.get("end_date"))
        if err:
            errors.append("Invalid end date format. Use YYYY-MM-DD.")
        else:
            cleaned["end_date"] = end_d

    # ── Cross-field date ordering ──
    start_d = cleaned.get("start_date")
    end_d = cleaned.get("end_date")
    if start_d and end_d and end_d < start_d:
        errors.append("End date cannot be before start date.")

    # ── Enumerated fields ──
    if "event_type" in data:
        et = data.get("event_type")
        if et not in EVENT_TYPES:
            errors.append(f"Invalid event_type. Must be one of: {', '.join(EVENT_TYPES)}.")
        else:
            cleaned["event_type"] = et

    if "priority" in data:
        pr = data.get("priority")
        if pr not in PRIORITIES:
            errors.append(f"Invalid priority. Must be one of: {', '.join(PRIORITIES)}.")
        else:
            cleaned["priority"] = pr

    if "status" in data:
        st = data.get("status")
        if st not in STATUSES:
            errors.append(f"Invalid status. Must be one of: {', '.join(STATUSES)}.")
        else:
            cleaned["status"] = st

    if "repeat_type" in data:
        rt = data.get("repeat_type")
        if rt not in REPEAT_TYPES:
            errors.append(f"Invalid repeat_type. Must be one of: {', '.join(REPEAT_TYPES)}.")
        else:
            cleaned["repeat_type"] = rt

    # ── Free-text / optional fields (pass through, trimmed) ──
    for field in ("description", "location", "color", "notes"):
        if field in data:
            val = data.get(field)
            cleaned[field] = (val or "").strip() or None

    # ── Boolean / integer linked fields ──
    if "is_all_day" in data:
        cleaned["is_all_day"] = bool(data.get("is_all_day"))

    for fk in ("project_id", "task_id", "employee_id", "created_by"):
        if fk in data:
            raw = data.get(fk)
            cleaned[fk] = int(raw) if raw not in (None, "", "null") else None

    # ── Time fields (kept as strings; service parses them) ──
    for tf in ("start_time", "end_time"):
        if tf in data:
            cleaned[tf] = data.get(tf) or None

    return cleaned, errors