from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token, 
    jwt_required, get_jwt, get_jwt_identity
)
from datetime import datetime, timedelta
from ..models import db, User, TokenBlocklist, RefreshToken

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"message": "Missing email or password"}), 400
        
    user = User.query.filter_by(email=data['email']).first()
    
    if user and user.check_password(data['password']):
        access_token = create_access_token(identity=str(user.id), additional_claims={"role": user.role, "is_admin": user.is_admin})
        refresh_token = create_refresh_token(identity=str(user.id))
        
        # Persist Refresh Token
        from flask_jwt_extended import decode_token
        decoded_refresh = decode_token(refresh_token)
        jti = decoded_refresh["jti"]
        exp_timestamp = decoded_refresh["exp"]
        expires_at = datetime.fromtimestamp(exp_timestamp)
        
        db_token = RefreshToken(
            jti=jti,
            user_id=user.id,
            expires_at=expires_at
        )
        db.session.add(db_token)
        db.session.commit()

        return jsonify({
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": user.to_dict()
        })
    return jsonify({"message": "Invalid credentials"}), 401

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    claims = get_jwt()
    jti = claims["jti"]
    
    # Check if token exists in DB and is valid
    token_entry = RefreshToken.query.filter_by(jti=jti).first()
    
    if not token_entry or token_entry.revoked:
        return jsonify({"message": "Invalid or revoked refresh token"}), 401
        
    user = User.query.get(identity)
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    new_access_token = create_access_token(identity=str(identity), additional_claims={"role": user.role, "is_admin": user.is_admin})
    return jsonify({"access_token": new_access_token})

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "User already exists"}), 400
        
    new_user = User(email=email)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"message": "User registered successfully"}), 201

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.json
    email = data.get('email')
    
    if not email:
        return jsonify({"message": "Email is required"}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user:
        # We return 200 even if user doesn't exist for security (don't reveal registered emails)
        return jsonify({"message": "If this email is registered, you will receive a reset link shortly."})
        
    # In a real app, generate a token, save it, and send an actual link.
    # For this project, we'll simulate the email.
    return jsonify({"message": "If this email is registered, you will receive a reset link shortly."})

@auth_bp.route('/logout', methods=['DELETE'])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    blocked_token = TokenBlocklist(jti=jti)
    db.session.add(blocked_token)
    db.session.commit()
    return jsonify({"message": "Successfully logged out"})

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    return jsonify(user.to_dict())
