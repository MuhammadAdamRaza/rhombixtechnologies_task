import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from dotenv import load_dotenv
from .models import db

load_dotenv()

mail = Mail()
jwt = JWTManager()

def create_app():
    # ---------------------------------------------------
    # PATH CONFIGURATION
    # ---------------------------------------------------
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    static_folder = os.path.join(base_dir, 'static')
    
    # Initialize Flask
    # Note: We removed static_url_path='' so main.py handles serving
    app = Flask(__name__, static_folder=static_folder)

    # Configurations
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
    
    # Mail Config
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS') == 'True'
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = (os.getenv('MAIL_DEFAULT_SENDER_NAME'), os.getenv('MAIL_DEFAULT_SENDER_EMAIL'))

    # Initialize Extensions
    CORS(app)
    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)

    # Blueprints
    from .routes.auth import auth_bp
    from .routes.books import books_bp
    from .routes.admin import admin_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(books_bp, url_prefix='/api/books')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    return app