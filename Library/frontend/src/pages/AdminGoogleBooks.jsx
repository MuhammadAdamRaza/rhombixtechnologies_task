import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Globe, Search, BookOpen, Plus, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Pagination from '../components/Pagination';

const categories = [
    { name: 'Fiction', query: 'fiction bestseller' },
    { name: 'Programming', query: 'programming python javascript' },
    { name: 'Science', query: 'science physics chemistry' },
    { name: 'Business', query: 'business management startup' },
    { name: 'Self-Help', query: 'self help motivation' },
    { name: 'History', query: 'history world war' },
    { name: 'Biography', query: 'biography memoir' },
    { name: 'Technology', query: 'technology AI computer' }
];

const AdminGoogleBooks = () => {
    const [category, setCategory] = useState('Fiction');
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [importing, setImporting] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    const totalPages = Math.ceil(books.length / itemsPerPage);

    useEffect(() => {
        const loadCategory = async () => {
            setLoading(true);
            setMessage({ text: '', type: '' });
            setCurrentPage(1);
            const catQuery = categories.find(c => c.name === category)?.query || category;

            try {
                const res = await api.get('/books/search-global', { params: { q: catQuery } });
                setBooks(res.data || []);

                if (!res.data || res.data.length === 0) {
                    setMessage({
                        text: 'No results returned from Google Books API for this genre.',
                        type: 'warning'
                    });
                }
            } catch (err) {
                console.error('Unable to communicate with Google Books service', err);
                setMessage({ text: 'Unable to communicate with Google Books service', type: 'error' });
            } finally {
                setLoading(false);
            }
        };

        loadCategory();
    }, [category]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        setMessage({ text: '', type: '' });
        setCurrentPage(1);

        try {
            const res = await api.get('/books/search-global', { params: { q: searchQuery } });
            setBooks(res.data || []);

            if (res.data && res.data.length > 0) {
                setMessage({ text: `Found ${res.data.length} titles matching "${searchQuery}"`, type: 'success' });
            } else {
                setMessage({ text: `No titles found matching "${searchQuery}".`, type: 'warning' });
            }
        } catch (err) {
            console.error('Google Books search failed', err);
            setMessage({ text: 'Search request failed', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (book) => {
        setImporting(book.isbn);
        try {
            await api.post('/admin/import', {
                title: book.title,
                author: book.author,
                isbn: book.isbn,
                cover_url: book.cover_url,
                description: book.description,
                category: book.category
            });
            setMessage({ text: `"${book.title}" added to inventory`, type: 'success' });
            setBooks(books.map(b => b.isbn === book.isbn ? { ...b, in_library: true } : b));
        } catch (err) {
            console.error('Failed to import Google Books result', err);
            setMessage({ text: err.response?.data?.message || 'Import operation failed', type: 'error' });
        } finally {
            setImporting(null);
        }
    };

    return (
        <div className="animate-fade google-books-page" style={{ paddingBottom: '3rem' }}>
            <header style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
                    <Globe size={26} color="var(--primary)" />
                    <h1>Google Books Global Repository</h1>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Search worldwide bibliographic database and import records directly into local inventory
                </p>
            </header>

            {message.text && (
                <div style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '1.25rem',
                    background: message.type === 'success' ? 'rgba(16, 185, 129, 0.12)' :
                        message.type === 'warning' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' :
                        message.type === 'warning' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.88rem'
                }}>
                    {message.type === 'success' ? <CheckCircle size={16} color="var(--success)" /> : <AlertCircle size={16} color="var(--warning)" />}
                    {message.text}
                </div>
            )}

            {/* Search Bar */}
            <div className="glass-card" style={{ padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
                <form onSubmit={handleSearch} className="google-search-form">
                    <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                        <input
                            type="text"
                            placeholder="Search Google Books by title, author, or ISBN..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field"
                            style={{ paddingLeft: '40px' }}
                        />
                    </div>
                    <button type="submit" className="btn-primary search-google-btn" disabled={loading}>
                        {loading ? 'Searching...' : 'Search Google Books'}
                    </button>
                </form>
            </div>

            {/* Category Ribbon (Horizontal scroll on mobile) */}
            <div className="category-ribbon">
                {categories.map(cat => {
                    const isSelected = category === cat.name;
                    return (
                        <button
                            key={cat.name}
                            onClick={() => setCategory(cat.name)}
                            className={`category-pill ${isSelected ? 'active' : ''}`}
                        >
                            {cat.name}
                        </button>
                    );
                })}
            </div>

            {/* Books Grid */}
            {loading ? (
                <div className="loading">Connecting to Google Books API...</div>
            ) : (
                <>
                    <div className="google-books-grid">
                        {books
                            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                            .map((book, idx) => (
                                <div key={idx} className="glass-card google-book-card hover-lift">
                                    <div className="google-cover-wrap">
                                        <img
                                            src={book.cover_url || 'https://placehold.co/150x220/1e2634/94a3b8?text=No+Cover'}
                                            alt={book.title}
                                            className="google-cover-img"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.src = "https://placehold.co/150x220/1e2634/94a3b8?text=No+Cover";
                                            }}
                                        />
                                    </div>

                                    <h3 className="google-book-title" title={book.title}>
                                        {book.title}
                                    </h3>
                                    <p className="google-book-author">
                                        {book.author || 'Author Unknown'}
                                    </p>

                                    <div className="google-card-footer">
                                        {book.in_library ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--success)', fontSize: '0.78rem', fontWeight: 600 }}>
                                                <CheckCircle size={14} /> In Local Catalog
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleImport(book)}
                                                className="btn-primary"
                                                style={{ width: '100%', padding: '6px 10px', fontSize: '0.78rem', minHeight: '34px' }}
                                                disabled={importing === book.isbn}
                                            >
                                                {importing === book.isbn ? <Loader2 size={13} className="spin" /> : <><Plus size={13} /> Import</>}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>

                    {books.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </>
            )}

            <style>{`
                .google-search-form {
                    display: flex;
                    gap: 0.65rem;
                    flex-wrap: wrap;
                }

                .category-ribbon {
                    display: flex;
                    gap: 0.5rem;
                    overflow-x: auto;
                    padding-bottom: 0.5rem;
                    margin-bottom: 1.5rem;
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: none;
                }

                .category-ribbon::-webkit-scrollbar {
                    display: none;
                }

                .category-pill {
                    padding: 6px 14px;
                    border-radius: var(--radius-full);
                    border: 1px solid var(--glass-border);
                    background: #ffffff;
                    color: var(--text-main);
                    cursor: pointer;
                    font-weight: 500;
                    font-size: 0.82rem;
                    white-space: nowrap;
                    flex-shrink: 0;
                    transition: all 0.2s ease;
                }

                .category-pill:hover:not(.active) {
                    background: #f3f7fa;
                }

                .category-pill.active {
                    background: var(--primary);
                    color: #ffffff;
                    border-color: var(--primary);
                    font-weight: 600;
                    box-shadow: 0 2px 8px rgba(15, 118, 110, 0.2);
                }

                .google-books-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(min(220px, 100%), 1fr));
                    gap: 1.25rem;
                    margin-bottom: 2rem;
                }

                .google-book-card {
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                }

                .google-cover-wrap {
                    height: 200px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-bottom: 0.75rem;
                    background: #f1f5f9;
                    border-radius: var(--radius-sm);
                    padding: 6px;
                }

                .google-cover-img {
                    max-height: 100%;
                    max-width: 100%;
                    object-fit: contain;
                    border-radius: 4px;
                    box-shadow: 0 4px 10px rgba(23, 43, 77, 0.14);
                }

                .google-book-title {
                    font-size: 0.92rem;
                    font-weight: 600;
                    line-height: 1.35;
                    margin-bottom: 0.25rem;
                    overflow-wrap: anywhere;
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    min-height: 2.6em;
                }

                .google-book-author {
                    font-size: 0.78rem;
                    color: var(--text-muted);
                    margin-bottom: 0.5rem;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .google-card-footer {
                    margin-top: auto;
                    padding-top: 0.65rem;
                    border-top: 1px solid var(--glass-border);
                }

                @media (max-width: 768px) {
                    .google-search-form {
                        flex-direction: column;
                    }

                    .search-google-btn {
                        width: 100%;
                    }

                    .google-books-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        gap: 0.75rem;
                    }

                    .google-book-card {
                        padding: 0.75rem;
                    }

                    .google-cover-wrap {
                        height: 155px;
                        margin-bottom: 0.5rem;
                    }

                    .google-book-title {
                        font-size: 0.82rem;
                    }

                    .google-book-author {
                        font-size: 0.72rem;
                    }
                }

                @media (max-width: 520px) {
                    .google-books-grid {
                        grid-template-columns: minmax(0, 1fr);
                    }

                    .google-cover-wrap {
                        height: 190px;
                    }
                }
            `}</style>
        </div>
    );
};

export default AdminGoogleBooks;
