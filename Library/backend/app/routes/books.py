import os
import requests
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from flask_mail import Message
from datetime import datetime, timedelta
from ..models import db, Book, History, User
from .. import mail

books_bp = Blueprint('books', __name__)

# Fallback URL if env var is missing
GOOGLE_BOOKS_URL = os.getenv('GOOGLE_BOOKS_API_URL', 'https://www.googleapis.com/books/v1/volumes')
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')

@books_bp.route('/recent', methods=['GET'])
@jwt_required()
def get_recent_books():
    # Return all books, newest first (pagination handled on frontend)
    books = Book.query.order_by(Book.id.desc()).all()
    return jsonify([b.to_dict() for b in books])

@books_bp.route('/search-global', methods=['GET'])
@jwt_required()
def search_global():
    query = request.args.get('q')
    if not query:
        return jsonify({"message": "Query parameter 'q' is required"}), 400
        

    
    # 1. Setup Parameters
    params = {'q': query, 'maxResults': 40}
    if GOOGLE_API_KEY:
        params['key'] = GOOGLE_API_KEY

    try:
        # 2. First Attempt - Try WITHOUT key but WITH country=US (public quota)

        response = requests.get(GOOGLE_BOOKS_URL, params={'q': query, 'maxResults': 40, 'country': 'US'})
        data = response.json()
        
        # DEBUG: See what Google actually sent

        
        items = data.get('items', [])

        # 3. Fallback: If public API fails, try WITH key and country=US
        if not items and GOOGLE_API_KEY:

            params_with_key = {'q': query, 'maxResults': 40, 'key': GOOGLE_API_KEY, 'country': 'US'}
            response = requests.get(GOOGLE_BOOKS_URL, params=params_with_key)
            data = response.json()
            items = data.get('items', [])


        
        # FALLBACK: If Google Books returns nothing, try Open Library API
        if not items:

            try:
                # Open Library Search API - works globally without restrictions
                ol_url = "https://openlibrary.org/search.json"
                ol_response = requests.get(ol_url, params={'q': query, 'limit': 20})
                ol_data = ol_response.json()
                
                ol_docs = ol_data.get('docs', [])

                
                # Convert Open Library format to our format
                for doc in ol_docs:
                    # Get ISBN
                    isbn_list = doc.get('isbn', [])
                    isbn = isbn_list[0] if isbn_list else f"OL{doc.get('key', 'unknown').replace('/works/', '')}"
                    
                    # Get cover image
                    cover_id = doc.get('cover_i')
                    cover = f"https://covers.openlibrary.org/b/id/{cover_id}-L.jpg" if cover_id else None
                    
                    # Create item in Google Books format
                    items.append({
                        'id': isbn,
                        'volumeInfo': {
                            'title': doc.get('title', 'Unknown Title'),
                            'authors': doc.get('author_name', ['Unknown Author']),
                            'description': f"Published: {doc.get('first_publish_year', 'N/A')}. {doc.get('publisher', [''])[0] if doc.get('publisher') else ''}",
                            'imageLinks': {'thumbnail': cover} if cover else {},
                            'categories': doc.get('subject', ['General'])[:1],
                            'industryIdentifiers': [{'type': 'ISBN_13', 'identifier': isbn}]
                        }
                    })
                

            except Exception as e:
                pass

        
        results = []
        for item in items:
            info = item.get('volumeInfo', {})
            
            # Extract ISBN safely
            isbn_list = info.get('industryIdentifiers', [])
            isbn = None
            for id_obj in isbn_list:
                if id_obj.get('type') == 'ISBN_13':
                    isbn = id_obj.get('identifier')
                    break
            if not isbn and isbn_list:
                isbn = isbn_list[0].get('identifier')

            # Check local DB status
            book_in_db = Book.query.filter_by(isbn=isbn).first() if isbn else None
            
            # SAFE EXTRACTION (Prevents crashes if fields are missing)
            image_links = info.get('imageLinks', {})
            cover = image_links.get('thumbnail') or image_links.get('smallThumbnail')
            
            # Google Books sometimes returns HTTP URLs - force HTTPS
            if cover and cover.startswith('http://'):
                cover = cover.replace('http://', 'https://')
            
            # Fallback image if Google has no cover
            if not cover:
                cover = "https://placehold.co/150x220/334155/f8fafc?text=No+Cover"

            results.append({
                "google_id": item.get('id'),
                "title": info.get('title', 'Unknown Title'),
                "author": ", ".join(info.get('authors') or ['Unknown Author']),
                "isbn": isbn or 'N/A',
                "cover_url": cover,
                "description": info.get('description', 'No description available.')[:200] + "...",
                "category": ", ".join(info.get('categories') or ['General']),
                "in_library": book_in_db is not None,
                "available": book_in_db.available if book_in_db else False,
                "library_id": book_in_db.id if book_in_db else None
            })
        
        if not results:
             # Log warning to system log if needed, for now just suppress
             pass
            
        return jsonify(results)

    except Exception as e:
        pass

        return jsonify({"message": "Internal Server Error during search"}), 500

@books_bp.route('/borrow', methods=['POST'])
@jwt_required()
def borrow_book():
    data = request.json
    book_id = data.get('book_id')
    user_id = get_jwt_identity()
    
    book = Book.query.get(book_id)
    if not book:
        return jsonify({"message": "Book not found"}), 404
        
    if not book.available:
        return jsonify({"message": "Book is already borrowed"}), 400
        
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    # Update book status
    book.available = False
    
    # Create history record
    due_date = datetime.utcnow() + timedelta(days=14)
    history = History(
        user_id=user_id,
        book_id=book_id,
        due_date=due_date
    )
    
    db.session.add(history)
    db.session.commit()
    
    # Send Email Notification
    try:
        msg = Message(
            subject="Book Borrowed Successfully - BookHive",
            recipients=[user.email],
            body=f"Hi {user.email},\n\nYou have successfully borrowed '{book.title}'.\nReturn by: {due_date.strftime('%Y-%m-%d')}.\n\nHappy reading!\nBookHive Team"
        )
        mail.send(msg)
    except Exception as e:
        pass


    return jsonify({"message": "Book borrowed successfully", "due_date": due_date.isoformat()})

@books_bp.route('/history', methods=['GET'])
@jwt_required()
def get_user_history():
    user_id = get_jwt_identity()
    claims = get_jwt()
    is_admin = claims.get('is_admin', False)
    
    if is_admin:
        # Admin sees ALL employee borrow records
        history = History.query.order_by(History.borrow_date.desc()).all()
    else:
        # Employee sees only their own records
        history = History.query.filter_by(user_id=user_id).order_by(History.borrow_date.desc()).all()
    
    return jsonify([h.to_dict() for h in history])

@books_bp.route('/return', methods=['POST'])
@jwt_required()
def return_book():
    data = request.json
    history_id = data.get('history_id')
    
    history = History.query.get(history_id)
    if not history or history.return_date:
        return jsonify({"message": "Invalid history record"}), 400
        
    book = Book.query.get(history.book_id)
    book.available = True
    history.return_date = datetime.utcnow()
    
    db.session.commit()
    return jsonify({"message": "Book returned successfully"})