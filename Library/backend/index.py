import os
from app import create_app, db
from app.models import User

app = create_app()
@app.route('/')
def home():
    return "Backend is running successfully!"
# -------------------------------------------

def init_db():
    with app.app_context():
        db.create_all()

if __name__ == '__main__':
    # Production ready configuration
    with app.app_context():
        db.create_all()
    
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "False").lower() == "true"
    app.run(host='0.0.0.0', port=port, debug=debug)
