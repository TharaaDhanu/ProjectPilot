from app import create_app
from models.user import User
from extensions import db

app = create_app()

with app.app_context():
    deleted = User.query.delete()
    db.session.commit()

    print(f"Successfully deleted {deleted} users.")