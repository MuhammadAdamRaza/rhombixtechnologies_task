from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from models import db, User, AuditLog
from middleware import admin_required

import traceback

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validation
        if not data or not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({"error": "Missing required fields"}), 400
            
        # Check if exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({"error": "Username already taken"}), 409
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"error": "Email already registered"}), 409
            
        # Create user (defaults to 'reader' role)
        hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')
        new_user = User(
            username=data['username'],
            email=data['email'],
            password_hash=hashed_password
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({"message": "User created successfully", "user_id": new_user.id}), 201
    except Exception as e:
        db.session.rollback()
        print(f"REGISTER ERROR: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Validation
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"error": "Missing credentials"}), 400
        
    user = User.query.filter_by(username=data['username']).first()
    
    if user and check_password_hash(user.password_hash, data['password']):
        # Include role in JWT claims for middleware checks
        additional_claims = {
            "role": user.role,
            "username": user.username,
            "avatar_url": user.avatar_url
        }
        
        audit = AuditLog(user_id=user.id, action="Logged in")
        db.session.add(audit)
        db.session.commit()
        
        access_token = create_access_token(
            identity=str(user.id), 
            additional_claims=additional_claims
        )
        
        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "role": user.role,
                "avatar_url": user.avatar_url
            }
        }), 200
        
    return jsonify({"error": "Invalid username or password"}), 401


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    user_id = int(get_jwt_identity())
    audit = AuditLog(user_id=user_id, action="Logged out")
    db.session.add(audit)
    db.session.commit()
    return jsonify({"message": "Logged out successfully"}), 200


# --- ADMIN ONLY ROUTES ---

@auth_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required()
def get_all_users():
    users = User.query.all()
    users_data = [{
        "id": u.id,
        "username": u.username,
        "email": u.email,
        "role": u.role,
        "created_at": u.created_at
    } for u in users]
    
    return jsonify(users_data), 200

@auth_bp.route('/roles/<int:user_id>', methods=['PUT'])
@jwt_required()
@admin_required()
def change_user_role(user_id):
    data = request.get_json()
    new_role = data.get('role')
    
    if new_role not in ['admin', 'editor', 'reader']:
        return jsonify({"error": "Invalid role specified"}), 400
        
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    user.role = new_role
    db.session.commit()
    # Create audit log entry for role change
    audit = AuditLog(user_id=user.id, action=f'Changed role to {new_role}')
    db.session.add(audit)
    db.session.commit()
    
    return jsonify({"message": f"User role updated to {new_role}"}), 200
