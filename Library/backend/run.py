import os
from flask import send_from_directory
from app import create_app, db

# 1. Initialize the App
app = create_app()

# 2. Define Static Folder Path (backend/static)
# This points to where you put your React build files
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_FOLDER = os.path.join(BASE_DIR, "static")

# 3. Catch-All Route for React SPA
# This fixes the "Not Found" error on refresh
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    # Check if the requested path refers to a real file (e.g., assets/main.js)
    if path != "" and os.path.exists(os.path.join(STATIC_FOLDER, path)):
        return send_from_directory(STATIC_FOLDER, path)
    
    # If not a file, it must be a React route (e.g., /dashboard), so serve index.html
    return send_from_directory(STATIC_FOLDER, "index.html")

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("Database tables checked/created.")
    
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "False").lower() == "true"
    
    print(f"🚀 Server starting on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=debug)