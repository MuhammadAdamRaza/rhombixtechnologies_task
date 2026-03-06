from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import cloudinary.uploader

from models import db, Post, Category, User, AuditLog, Like
from middleware import editor_or_admin_required
import re

post_bp = Blueprint('posts', __name__)

def generate_slug(title):
    return re.sub(r'[\W_]+', '-', title.lower()).strip('-')

@post_bp.route('', methods=['POST'])
@jwt_required()
@editor_or_admin_required()
def create_post():
    current_user_id = int(get_jwt_identity())
    data = request.form
    
    title = data.get('title')
    content = data.get('content')
    category_id = data.get('category_id') # optional
    published = data.get('published', 'false').lower() == 'true'
    
    if not title or not content:
        return jsonify({"error": "Title and content are required"}), 400
        
    slug = generate_slug(title)
        
    # Check if slug exists
    if Post.query.filter_by(slug=slug).first():
        return jsonify({"error": "A post with a similar title already exists. Try a different title."}), 409
        
    image_url = None
    if 'image' in request.files:
        image_file = request.files['image']
        if image_file.filename != '':
            # Upload to Cloudinary
            upload_result = cloudinary.uploader.upload(
                image_file, 
                folder="nexusblog_posts",
                resource_type="image"
            )
            image_url = upload_result.get('secure_url')
    
    new_post = Post(
        title=title,
        slug=slug,
        content=content,
        image_url=image_url,
        published=published,
        user_id=current_user_id,
        category_id=category_id if category_id else None
    )
    
    db.session.add(new_post)
    db.session.flush()
    
    audit = AuditLog(user_id=current_user_id, action=f"Created post: {new_post.title}")
    db.session.add(audit)
    db.session.commit()
    
    return jsonify({
        "message": "Post created successfully", 
        "post_id": new_post.id, 
        "slug": new_post.slug
    }), 201


@post_bp.route('/upload', methods=['POST'])
@jwt_required()
@editor_or_admin_required()
def upload_image():
    """Helper route to upload images to Cloudinary from the editor"""
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
        
    image_file = request.files['image']
    if image_file.filename == '':
        return jsonify({"error": "No image selected"}), 400
        
    try:
        upload_result = cloudinary.uploader.upload(
            image_file,
            folder="nexusblog_content",
            resource_type="image"
        )
        return jsonify({
            "url": upload_result.get('secure_url')
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@post_bp.route('/categories', methods=['GET'])
def get_categories():
    """Get all available categories"""
    categories = Category.query.all()
    return jsonify({
        "categories": [{"id": c.id, "name": c.name} for c in categories]
    }), 200


@post_bp.route('', methods=['GET'])
def get_posts():
    """Public route to get all published posts"""
    # Simple pagination
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    posts = Post.query.filter_by(published=True).order_by(Post.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    posts_data = []
    for p in posts.items:
        author = User.query.get(p.user_id)
        posts_data.append({
            "id": p.id,
            "title": p.title,
            "slug": p.slug,
            "excerpt": p.content[:150] + "..." if len(p.content) > 150 else p.content,
            "image_url": p.image_url,
            "created_at": p.created_at,
            "author": {
                "username": author.username,
                "avatar_url": author.avatar_url
            }
        })
        
    return jsonify({
        "posts": posts_data,
        "total": posts.total,
        "pages": posts.pages,
        "current_page": posts.page
    }), 200


@post_bp.route('/<slug>', methods=['GET'])
def get_post(slug):
    """Public route to get a single post by slug"""
    post = Post.query.filter_by(slug=slug, published=True).first()
    
    if not post:
        return jsonify({"error": "Post not found or not published"}), 404
        
    author = User.query.get(post.user_id)
    
    return jsonify({
        "post": {
            "id": post.id,
            "title": post.title,
            "slug": post.slug,
            "content": post.content,
            "image_url": post.image_url,
            "created_at": post.created_at,
            "updated_at": post.updated_at,
            "author": {
                "id": author.id,
                "username": author.username,
                "bio": author.bio,
                "avatar_url": author.avatar_url
            }
        }
    }), 200


@post_bp.route('/my_posts', methods=['GET'])
@jwt_required()
@editor_or_admin_required()
def get_my_posts():
    """Route for creators to see all their own posts including drafts"""
    current_user_id = int(get_jwt_identity())
    
    posts = Post.query.filter_by(user_id=current_user_id).order_by(Post.created_at.desc()).all()
    
    posts_data = []
    for p in posts:
        posts_data.append({
            "id": p.id,
            "title": p.title,
            "slug": p.slug,
            "image_url": p.image_url,
            "published": p.published,
            "created_at": p.created_at,
            "author": {
                "username": User.query.get(p.user_id).username
            }
        })
        
    return jsonify({"posts": posts_data}), 200


@post_bp.route('/<int:post_id>', methods=['PUT'])
@jwt_required()
@editor_or_admin_required()
def update_post(post_id):
    current_user_id = int(get_jwt_identity())
    post = Post.query.get(post_id)
    
    if not post:
        return jsonify({"error": "Post not found"}), 404
        
    # Check if user is author or admin
    from flask_jwt_extended import get_jwt
    claims = get_jwt()
    if post.user_id != current_user_id and claims.get('role') != 'admin':
        return jsonify({"error": "You can only edit your own posts"}), 403
        
    data = request.form
    
    if 'title' in data:
        post.title = data['title']
        post.slug = generate_slug(data['title'])
    if 'content' in data:
        post.content = data['content']
    if 'published' in data:
        post.published = data['published'].lower() == 'true'
        
    # Handle image update
    if 'image' in request.files:
        image_file = request.files['image']
        if image_file.filename != '':
            upload_result = cloudinary.uploader.upload(
                image_file, 
                folder="nexusblog_posts",
                resource_type="image"
            )
            post.image_url = upload_result.get('secure_url')
            
    db.session.commit()
    
    return jsonify({"message": "Post updated successfully", "slug": post.slug}), 200


@post_bp.route('/<int:post_id>', methods=['DELETE'])
@jwt_required()
@editor_or_admin_required()
def delete_post(post_id):
    current_user_id = int(get_jwt_identity())
    post = Post.query.get(post_id)
    
    if not post:
        return jsonify({"error": "Post not found"}), 404
        
    # Check if user is author or admin
    from flask_jwt_extended import get_jwt
    claims = get_jwt()
    if post.user_id != current_user_id and claims.get('role') != 'admin':
        return jsonify({"error": "You can only delete your own posts"}), 403
        
    # Note: Depending on Cloudinary logic, you might want to also delete the image from there
    # if post.image_url:
    #    ... extract public_id and delete ...
            
    db.session.delete(post)
    db.session.commit()
    
    return jsonify({"message": "Post deleted successfully"}), 200


@post_bp.route('/<int:post_id>/like', methods=['POST'])
@jwt_required()
def toggle_like(post_id):
    current_user_id = int(get_jwt_identity())
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404
        
    existing_like = Like.query.filter_by(user_id=current_user_id, post_id=post_id).first()
    if existing_like:
        db.session.delete(existing_like)
        action = "Unliked"
    else:
        new_like = Like(user_id=current_user_id, post_id=post_id)
        db.session.add(new_like)
        action = "Liked"
        
    audit = AuditLog(user_id=current_user_id, action=f"{action} post: {post.title}")
    db.session.add(audit)
    db.session.commit()
    return jsonify({"message": f"Successfully {action.lower()} post"}), 200

@post_bp.route('/liked', methods=['GET'])
@jwt_required()
def get_liked_posts():
    current_user_id = int(get_jwt_identity())
    likes = Like.query.filter_by(user_id=current_user_id).order_by(Like.created_at.desc()).all()
    posts_data = []
    for like in likes:
        p = Post.query.get(like.post_id)
        if p and p.published:
            author = User.query.get(p.user_id)
            posts_data.append({
                "id": p.id,
                "title": p.title,
                "slug": p.slug,
                "excerpt": p.content[:150] + "..." if len(p.content) > 150 else p.content,
                "image_url": p.image_url,
                "created_at": p.created_at,
                "author": {
                    "username": author.username,
                    "avatar_url": author.avatar_url
                }
            })
    return jsonify({"posts": posts_data}), 200
