"""
migrate_notifications.py
------------------------
Run this script once to add missing columns to the notifications table.
Usage: python migrate_notifications.py
"""

from extensions import db
from app import create_app
from sqlalchemy import text, inspect

app = create_app()

with app.app_context():
    inspector = inspect(db.engine)
    existing = [c['name'] for c in inspector.get_columns('notifications')]
    print('Existing columns:', existing)

    with db.engine.connect() as conn:
        if 'title' not in existing:
            conn.execute(text('ALTER TABLE notifications ADD COLUMN title VARCHAR(200) DEFAULT NULL'))
            print('Added: title')

        if 'priority' not in existing:
            conn.execute(text("ALTER TABLE notifications ADD COLUMN priority VARCHAR(20) DEFAULT 'normal'"))
            print('Added: priority')

        if 'is_read' not in existing:
            conn.execute(text('ALTER TABLE notifications ADD COLUMN is_read TINYINT(1) DEFAULT 0'))
            print('Added: is_read')
            if 'read' in existing:
                conn.execute(text('UPDATE notifications SET is_read = `read`'))
                print('Migrated: is_read from read column')

        if 'related_project_id' not in existing:
            conn.execute(text('ALTER TABLE notifications ADD COLUMN related_project_id INTEGER DEFAULT NULL'))
            print('Added: related_project_id')

        if 'related_task_id' not in existing:
            conn.execute(text('ALTER TABLE notifications ADD COLUMN related_task_id INTEGER DEFAULT NULL'))
            print('Added: related_task_id')

        conn.commit()

    # Verify
    inspector = inspect(db.engine)
    updated = [c['name'] for c in inspector.get_columns('notifications')]
    print('Updated columns:', updated)
    print('Migration complete!')