from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import cloudinary

from models import db
from config import Config

def create_app():
    app = Flask(__name__)
    app.url_map.strict_slashes = False
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": app.config['FRONTEND_URL']}})
    jwt = JWTManager(app)

    # Configure Cloudinary
    cloudinary.config(
        cloud_name=app.config['CLOUDINARY_CLOUD_NAME'],
        api_key=app.config['CLOUDINARY_API_KEY'],
        api_secret=app.config['CLOUDINARY_API_SECRET']
    )

    # Register Blueprints
    from routes.auth_routes import auth_bp
    from routes.post_routes import post_bp
    from routes.comment_routes import comment_bp
    from routes.admin_routes import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(post_bp, url_prefix='/api/posts')
    app.register_blueprint(comment_bp, url_prefix='/api/comments')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # Basic route for testing
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({"status": "healthy", "message": "Blogging platform API is running"})

    @app.route('/', methods=['GET'])
    def index():
        return jsonify({"message": "Welcome to the Blogging Platform API"})

    # Error Handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def server_error(error):
        return jsonify({"error": "Internal server error"}), 500

    return app

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        # Temporarily create all tables for local dev
        # In production, use Flask-Migrate
        db.create_all()
        
        # Seed categories if empty
        from models import Category
        if not Category.query.first():
            categories = ['Engineering', 'Design', 'Product', 'Culture', 'News']
            for name in categories:
                db.session.add(Category(name=name))
            db.session.commit()
            print("Categories seeded successfully.")
            
        print("Database tables created successfully.")
    
    app.run(debug=True, port=5000)
