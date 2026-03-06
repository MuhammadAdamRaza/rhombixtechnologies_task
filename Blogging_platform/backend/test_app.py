import traceback
from app import create_app
from models import db, User

try:
    print("Testing app creation")
    app = create_app()
    with app.app_context():
        # try to query a user
        u = User.query.first()
        print(f"User query success: {u}")
except Exception as e:
    traceback.print_exc()
