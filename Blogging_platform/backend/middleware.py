from functools import wraps
from flask_jwt_extended import get_jwt, verify_jwt_in_request
from flask import jsonify

def role_required(*roles):
    """
    Decorator to check if user has required roles
    :param roles: list of strings (e.g., 'admin', 'editor')
    """
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            try:
                verify_jwt_in_request()
            except Exception as e:
                return jsonify({"error": "Missing or invalid token", "details": str(e)}), 401
                
            claims = get_jwt()
            print(f"DEBUG: JWT Claims: {claims}") # Server side log
            
            user_role = claims.get('role')
            if not user_role or user_role not in roles:
                return jsonify({
                    "msg": f"Access strictly prohibited! Required role(s): {', '.join(roles)}",
                    "your_role": user_role
                }), 403
                
            return fn(*args, **kwargs)
        return decorator
    return wrapper

def admin_required():
    return role_required('admin')

def editor_or_admin_required():
    return role_required('admin', 'editor')
