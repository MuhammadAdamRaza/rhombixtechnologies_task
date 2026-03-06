from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, AuditLog, User
from middleware import admin_required

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/audit', methods=['GET'])
@jwt_required()
@admin_required()
def get_audit_logs():
    logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).limit(100).all()
    logs_data = [
        {
            'id': log.id,
            'user_id': log.user_id,
            'action': log.action,
            'timestamp': log.timestamp.isoformat(),
            'username': log.user.username if log.user else None
        }
        for log in logs
    ]
    return jsonify(logs_data), 200
