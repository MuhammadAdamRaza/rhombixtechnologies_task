import traceback
import sys

try:
    from app import create_app
    app = create_app()
    with app.app_context():
        from models import db
        print("db imported ok")
        from models import User
        print("user imported ok")
        u = User.query.first()
        print("query ok")
except Exception:
    traceback.print_exc(file=sys.stdout)
