import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from dotenv import load_dotenv
from .models import db, TokenBlocklist

load_dotenv()

mail = Mail()
jwt = JWTManager()

def create_app():
    # Calculate path to frontend dist folder (sibling to backend)
    # backend/app -> backend -> Library -> frontend -> dist
    base_dir = os.path.abspath(os.path.dirname(__file__))
    frontend_dist = os.path.join(base_dir, '..', '..', 'frontend', 'dist')
    
    app = Flask(__name__, static_folder=frontend_dist)
    
    # Configurations
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    # JWT Configurations
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
    # Use timedelta for explicit duration as requested
    from datetime import timedelta
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=1)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=7)
    app.config['JWT_BLACKLIST_ENABLED'] = True
    app.config['JWT_BLACKLIST_TOKEN_CHECKS'] = ['access', 'refresh']
    
    # Mail configurations
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT'))
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS') == 'True'
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = (
        os.getenv('MAIL_DEFAULT_SENDER_NAME'),
        os.getenv('MAIL_DEFAULT_SENDER_EMAIL')
    )

    # Initialize extensions
    db.init_app(app)
    CORS(app)
    jwt.init_app(app)
    mail.init_app(app)

    # JWT Blocklist handler
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload["jti"]
        token = TokenBlocklist.query.filter_by(jti=jti).first()
        return token is not None

    # Blueprints
    from .routes.auth import auth_bp
    from .routes.books import books_bp
    from .routes.admin import admin_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(books_bp, url_prefix='/api/books')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # Serve React App
    # Serve React App
    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_frontend(path):
        STATIC_FOLDER = app.static_folder
        file_path = os.path.join(STATIC_FOLDER, path)

        if path != "" and os.path.exists(file_path):
            return send_from_directory(STATIC_FOLDER, path)

        return send_from_directory(STATIC_FOLDER, "index.html")

    return app
