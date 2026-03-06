from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from models import db, Comment, Post, User, AuditLog
from middleware import editor_or_admin_required

comment_bp = Blueprint('comments', __name__)

@comment_bp.route('/', methods=['POST'])
@jwt_required()
def create_comment():
    """All authenticated users (readers, editors, admins) can create a comment"""
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    post_id = data.get('post_id')
    content = data.get('content')
    
    if not post_id or not content:
        return jsonify({"error": "post_id and content are required"}), 400
        
    post = Post.query.get(post_id)
    if not post or not post.published:
        return jsonify({"error": "Post not found or not published"}), 404
        
    new_comment = Comment(
        content=content,
        user_id=current_user_id,
        post_id=post_id,
        is_approved=True  # Auto-approved by default in this implementation
    )
    
    db.session.add(new_comment)
    db.session.flush() # to get id if needed
    
    audit = AuditLog(user_id=current_user_id, action=f"Commented on post: {post.title}")
    db.session.add(audit)
    db.session.commit()
    
    author = User.query.get(current_user_id)
    return jsonify({
        "message": "Comment added successfully", 
        "comment": {
            "id": new_comment.id,
            "content": new_comment.content,
            "created_at": new_comment.created_at,
            "author": {
                "id": author.id,
                "username": author.username,
                "avatar_url": author.avatar_url
            }
        }
    }), 201


@comment_bp.route('/post/<int:post_id>', methods=['GET'])
def get_post_comments(post_id):
    """Public route to get approved comments for a post"""
    comments = Comment.query.filter_by(post_id=post_id, is_approved=True).order_by(Comment.created_at.asc()).all()
    
    comments_data = []
    for c in comments:
        author = User.query.get(c.user_id)
        comments_data.append({
            "id": c.id,
            "content": c.content,
            "created_at": c.created_at,
            "author": {
                "id": author.id,
                "username": author.username,
                "avatar_url": author.avatar_url
            }
        })
        
    return jsonify({"comments": comments_data}), 200


@comment_bp.route('/<int:comment_id>/flag', methods=['PUT'])
@jwt_required()
@editor_or_admin_required()
def flag_comment(comment_id):
    """Editor or Admin can flag (disapprove) a comment to hide it"""
    current_user_id = int(get_jwt_identity())
    claims = get_jwt()
    
    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({"error": "Comment not found"}), 404
        
    post = Post.query.get(comment.post_id)
    
    # Editors can only flag comments on their own posts. Admins can flag anything.
    if claims.get('role') != 'admin' and post.user_id != current_user_id:
        return jsonify({"error": "You can only moderate comments on your own posts"}), 403
        
    comment.is_approved = not comment.is_approved
    db.session.commit()
    
    status = "approved" if comment.is_approved else "flagged"
    return jsonify({"message": f"Comment has been {status}"}), 200


@comment_bp.route('/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    """Users can delete their own comments, Admins can delete any comment"""
    current_user_id = int(get_jwt_identity())
    claims = get_jwt()
    
    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({"error": "Comment not found"}), 404
        
    # Check permissions
    if comment.user_id != current_user_id and claims.get('role') != 'admin':
        return jsonify({"error": "You can only delete your own comments"}), 403
        
    db.session.delete(comment)
    db.session.commit()
    
    return jsonify({"message": "Comment deleted successfully"}), 200
