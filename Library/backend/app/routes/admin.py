from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from ..models import db, Book, History, User
from sqlalchemy import func
from datetime import datetime

admin_bp = Blueprint('admin', __name__)

def admin_required(fn):
    @jwt_required()
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if not claims.get('is_admin'):
            return jsonify({"message": "Admin access required"}), 403
        return fn(*args, **kwargs)
    wrapper.__name__ = fn.__name__
    return wrapper

@admin_bp.route('/import', methods=['POST'])
@admin_required
def import_book():
    data = request.json
    isbn = data.get('isbn')
    
    if Book.query.filter_by(isbn=isbn).first():
        return jsonify({"message": "Book already exists in library"}), 400
        
    new_book = Book(
        title=data.get('title'),
        author=data.get('author'),
        isbn=isbn,
        cover_url=data.get('cover_url'),
        description=data.get('description'),
        category=data.get('category'),
        available=True
    )
    
    db.session.add(new_book)
    db.session.commit()
    return jsonify({"message": "Book imported successfully", "book": new_book.to_dict()})

@admin_bp.route('/stats', methods=['GET'])
@admin_required
def get_stats():
    total_books = Book.query.count()
    borrowed_books = Book.query.filter_by(available=False).count()
    total_users = User.query.count()
    
    # Overdue count
    now = datetime.utcnow()
    overdue_count = History.query.filter(History.return_date == None, History.due_date < now).count()
    
    # Category distribution for Bar Chart
    categories = db.session.query(Book.category, func.count(Book.id)).group_by(Book.category).all()
    category_data = [{"name": cat if cat else "Uncategorized", "value": count} for cat, count in categories]
    
    # Inventory status for Pie Chart
    inventory_status = [
        {"name": "Available", "value": total_books - borrowed_books},
        {"name": "Borrowed", "value": borrowed_books}
    ]

    # Recent Transactions
    recent_history = History.query.order_by(History.borrow_date.desc()).limit(10).all()
    transactions = [{
        "user_name": h.user.email if h.user else "Unknown User",
        "book_title": h.book.title if h.book else "Unknown Title (Deleted)",
        "borrow_date": h.borrow_date.isoformat(),
        "status": "Returned" if h.return_date else ("Overdue" if h.due_date < now else "Borrowed")
    } for h in recent_history]
    
    return jsonify({
        "total_books": total_books,
        "borrowed_books": borrowed_books,
        "total_users": total_users,
        "overdue_count": overdue_count,
        "category_data": category_data,
        "inventory_status": inventory_status,
        "recent_transactions": transactions
    })

@admin_bp.route('/all-books', methods=['GET'])
@admin_required
def get_all_books():
    books = Book.query.all()
    return jsonify([b.to_dict() for b in books])

@admin_bp.route('/books/<int:book_id>', methods=['PUT', 'DELETE'])
@admin_required
def manage_book(book_id):
    book = Book.query.get(book_id)
    if not book:
        return jsonify({"message": "Book not found"}), 404
        
    if request.method == 'DELETE':
        if not book.available:
            return jsonify({"message": "Cannot delete a borrowed book"}), 400
        db.session.delete(book)
        db.session.commit()
        return jsonify({"message": "Book deleted successfully"})
        
    if request.method == 'PUT':
        data = request.json
        book.title = data.get('title', book.title)
        book.author = data.get('author', book.author)
        book.description = data.get('description', book.description)
        book.category = data.get('category', book.category)
        db.session.commit()
        return jsonify({"message": "Book updated successfully", "book": book.to_dict()})
