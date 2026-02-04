import os
import requests
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime, timedelta

from ..models import db, Book, History
from .. import mail

books_bp = Blueprint('books', __name__)

GOOGLE_BOOKS_URL = os.getenv(
    'GOOGLE_BOOKS_API_URL',
    'https://www.googleapis.com/books/v1/volumes'
)
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
OPEN_LIBRARY_URL = "https://openlibrary.org/search.json"


@books_bp.route('/recent', methods=['GET'])
@jwt_required()
def get_recent_books():
    """Returns ALL books so frontend pagination can work."""
    books = Book.query.order_by(Book.id.desc()).all()
    return jsonify([b.to_dict() for b in books])


@books_bp.route('/search-global', methods=['GET'])
@jwt_required()
def search_global():
    query = request.args.get('q')
    if not query:
        return jsonify({"message": "Query parameter 'q' is required"}), 400

    results = []

    try:
        params = {'q': query, 'maxResults': 40, 'printType': 'books'}
        if GOOGLE_API_KEY:
            params['key'] = GOOGLE_API_KEY

        response = requests.get(GOOGLE_BOOKS_URL, params=params, timeout=5)
        data = response.json()

        for item in data.get('items', []):
            info = item.get('volumeInfo', {})

            identifiers = info.get('industryIdentifiers', [])
            isbn = next(
                (i['identifier'] for i in identifiers if i['type'] == 'ISBN_13'),
                identifiers[0]['identifier'] if identifiers else 'N/A'
            )

            image_links = info.get('imageLinks', {})
            cover = (
                image_links.get('thumbnail')
                or image_links.get('smallThumbnail')
                or "https://placehold.co/128x192/e2e8f0/1e293b?text=No+Cover"
            )

            results.append({
                "google_id": item.get('id'),
                "title": info.get('title', 'Unknown Title'),
                "author": (info.get('authors') or ['Unknown Author'])[0],
                "isbn": isbn,
                "cover_url": cover.replace('http://', 'https://'),
                "description": info.get('description', '')[:300],
                "category": (info.get('categories') or ['General'])[0],
                "source": "Google Books"
            })
    except Exception as e:
        print("Google Books API failed:", e)

    final_results = []
    for book in results:
        local = Book.query.filter_by(isbn=book['isbn']).first()
        book['in_library'] = local is not None
        book['available'] = local.available if local else False
        book['library_id'] = local.id if local else None
        final_results.append(book)

    return jsonify(final_results)


@books_bp.route('/borrow', methods=['POST'])
@jwt_required()
def borrow_book():
    data = request.json
    user_id = get_jwt_identity()
    isbn = data.get('isbn')

    if not isbn:
        return jsonify({"message": "Book has no ISBN"}), 400

    book = Book.query.filter_by(isbn=isbn).first()

    if not book:
        book = Book(
            title=data.get('title'),
            author=data.get('author'),
            isbn=isbn,
            cover_url=data.get('cover_url'),
            description=data.get('description'),
            category=data.get('category', 'General'),
            available=True
        )
        db.session.add(book)
        db.session.commit()

    if not book.available:
        return jsonify({"message": "Book is already borrowed"}), 400

    history = History(
        user_id=user_id,
        book_id=book.id,
        due_date=datetime.utcnow() + timedelta(days=14)
    )

    book.available = False
    db.session.add(history)
    db.session.commit()

    return jsonify({"message": "Book borrowed successfully"})


@books_bp.route('/return', methods=['POST'])
@jwt_required()
def return_book():
    history_id = request.json.get('history_id')
    history = History.query.get(history_id)

    if not history:
        return jsonify({"message": "Record not found"}), 404

    history.return_date = datetime.utcnow()
    history.book.available = True
    db.session.commit()

    return jsonify({"message": "Book returned successfully"})


@books_bp.route('/history', methods=['GET'])
@jwt_required()
def get_user_history():
    user_id = get_jwt_identity()
    is_admin = get_jwt().get('is_admin', False)

    history = (
        History.query.order_by(History.borrow_date.desc()).all()
        if is_admin
        else History.query.filter_by(user_id=user_id)
        .order_by(History.borrow_date.desc()).all()
    )

    return jsonify([h.to_dict() for h in history])
