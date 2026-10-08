import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Search as SearchIcon, BookOpen, AlertCircle, CheckCircle,
    Book as BookIcon, Clock, ArrowRight, Loader2, Sparkles, Plus
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import Pagination from '../components/Pagination';

const Search = () => {
    const [searchParams] = useSearchParams();
    const initialQuery = searchParams.get('q') || '';

    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [borrowing, setBorrowing] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Load initial data (All books or Search results)
    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            try {
                let res;
                if (initialQuery) {
                    res = await api.get('/books/search-global', { params: { q: initialQuery } });
                    setQuery(initialQuery);
                } else {
                    res = await api.get('/books/recent');
                    if (res.data && Array.isArray(res.data)) {
                        res.data = res.data.map(book => ({ ...book, in_library: true }));
                    }
                }
                setResults(res.data || []);
            } catch (err) {
                console.error("Failed to load books", err);
                setMessage({ text: 'Failed to load library catalog. Please try again.', type: 'error' });
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, [initialQuery]);

    const totalPages = Math.max(1, Math.ceil(results.length / itemsPerPage));

    const performSearch = async (q) => {
        setLoading(true);
        setMessage({ text: '', type: '' });
        setCurrentPage(1);
        try {
            let res;
            if (!q.trim()) {
                res = await api.get('/books/recent');
                if (res.data && Array.isArray(res.data)) {
                    res.data = res.data.map(book => ({ ...book, in_library: true }));
                }
            } else {
                res = await api.get('/books/search-global', { params: { q } });
            }
            setResults(res.data || []);
            if (!res.data || res.data.length === 0) {
                setMessage({ text: 'No titles matching your query were found.', type: 'info' });
            }
        } catch (err) {
            console.error('Book search failed', err);
            setMessage({ text: 'Search operation failed. Please verify connection.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (query) performSearch(query);
    };

    const handleBorrow = async (book) => {
        if (!book.isbn) {
            return setMessage({ text: 'Cannot borrow book without a valid ISBN identifier', type: 'error' });
        }

        setBorrowing(book.isbn);
        setMessage({ text: '', type: '' });

        try {
            const res = await api.post('/books/borrow', {
                isbn: book.isbn,
                title: book.title,
                author: book.author,
                cover_url: book.cover_url,
                description: book.description,
                category: book.category
            });

            setMessage({ text: res.data.message || `Loan approved for "${book.title}"`, type: 'success' });

            setResults(results.map(b =>
                b.isbn === book.isbn ? { ...b, in_library: true, available: false } : b
            ));
        } catch (err) {
            const msg = err.response?.data?.message || 'Unable to complete borrow request';
            setMessage({ text: msg, type: 'error' });
        } finally {
            setBorrowing(null);
        }
    };

    const paginatedResults = results.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="search-catalog-page animate-fade">
            {/* Search Header / Hero */}
            <section className="catalog-hero">
                <div className="catalog-hero-inner">
                    <span className="hero-eyebrow">Enterprise Library Catalog</span>
                    <h1 className="hero-h1">Discover & Borrow Titles</h1>
                    <p className="hero-subtext">Access physical inventory and global bibliographic resources</p>

                    <form onSubmit={handleSearchSubmit} className="search-bar-form">
                        <div className="search-input-wrap">
                            <SearchIcon size={18} className="search-field-icon" />
                            <input
                                className="search-text-input"
                                placeholder="Search by title, author, or ISBN..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn-primary search-submit-btn" disabled={loading}>
                            {loading ? <Loader2 size={16} className="spin" /> : 'Search Catalog'}
                        </button>
                    </form>
                </div>
            </section>

            {/* Notification message */}
            {message.text && (
                <div className={`notification-banner ${message.type}`}>
                    {message.type === 'success' ? (
                        <CheckCircle size={16} color="var(--success)" />
                    ) : message.type === 'error' ? (
                        <AlertCircle size={16} color="var(--danger)" />
                    ) : (
                        <BookOpen size={16} color="var(--primary)" />
                    )}
                    <span>{message.text}</span>
                </div>
            )}

            {/* Results Grid Section */}
            <section className="catalog-results-section">
                <div className="catalog-header-row">
                    <div>
                        <h2>{query ? `Results for "${query}"` : 'Recent Additions'}</h2>
                        {results.length > 0 && (
                            <p className="results-count-text">
                                Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, results.length)} of {results.length} titles
                            </p>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="loading">Searching catalog records...</div>
                ) : (
                    <>
                        <div className="books-grid">
                            {paginatedResults.map((book, idx) => (
                                <div key={idx} className="glass-card book-item-card hover-lift">
                                    <div className="book-cover-container">
                                        {book.cover_url ? (
                                            <img
                                                src={book.cover_url}
                                                alt={book.title}
                                                className="book-cover-image"
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.src = "https://placehold.co/150x220/1e2634/94a3b8?text=No+Cover";
                                                }}
                                            />
                                        ) : (
                                            <div className="book-placeholder-cover">
                                                <BookIcon size={36} color="var(--text-dim)" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="book-details">
                                        <h3 className="book-item-title" title={book.title}>{book.title}</h3>
                                        <p className="book-item-author">{book.author || 'Author Unspecified'}</p>
                                        {book.category && (
                                            <span className="book-category-tag">{book.category}</span>
                                        )}

                                        <div className="book-card-actions">
                                            {book.in_library ? (
                                                <div className="action-row">
                                                    <span className={`inventory-badge ${book.available ? 'available' : 'borrowed'}`}>
                                                        {book.available ? <CheckCircle size={12} /> : <Clock size={12} />}
                                                        <span className="badge-text">{book.available ? 'Available' : 'Borrowed'}</span>
                                                    </span>
                                                    {book.available && (
                                                        <button
                                                            className="btn-primary borrow-action-btn"
                                                            disabled={borrowing === book.isbn}
                                                            onClick={() => handleBorrow(book)}
                                                        >
                                                            {borrowing === book.isbn ? <Loader2 size={13} className="spin" /> : 'Borrow'}
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="action-row">
                                                    <span className="inventory-badge external">
                                                        <BookOpen size={12} /> <span className="badge-text">External</span>
                                                    </span>
                                                    <button
                                                        className="btn-secondary borrow-action-btn"
                                                        disabled={borrowing === book.isbn}
                                                        onClick={() => handleBorrow(book)}
                                                    >
                                                        {borrowing === book.isbn ? 'Acquiring...' : 'Borrow'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {results.length > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </>
                )}
            </section>

            <style>{`
                .catalog-hero {
                    padding: 2.5rem 1rem 3rem 1rem;
                    text-align: center;
                }

                .catalog-hero-inner {
                    max-width: 760px;
                    margin: 0 auto;
                }

                .hero-eyebrow {
                    display: inline-block;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: var(--primary);
                    margin-bottom: 0.5rem;
                }

                .hero-h1 {
                    font-size: 2.5rem;
                    line-height: 1.15;
                    margin-bottom: 0.5rem;
                }

                .hero-subtext {
                    font-size: 0.95rem;
                    color: var(--text-muted);
                    margin-bottom: 2rem;
                }

                .search-bar-form {
                    display: flex;
                    gap: 0.65rem;
                    background: #ffffff;
                    border: 1px solid var(--glass-border);
                    padding: 6px;
                    border-radius: var(--radius-md);
                    box-shadow: var(--shadow-md);
                }

                .search-input-wrap {
                    display: flex;
                    align-items: center;
                    flex: 1;
                    padding-left: 0.75rem;
                }

                .search-field-icon {
                    color: var(--text-dim);
                    margin-right: 0.65rem;
                    flex-shrink: 0;
                }

                .search-text-input {
                    width: 100%;
                    background: transparent;
                    border: none;
                    outline: none;
                    color: var(--text-main);
                    font-size: 0.95rem;
                }

                .search-text-input::placeholder {
                    color: var(--text-dim);
                }

                .search-submit-btn {
                    padding: 10px 22px;
                    white-space: nowrap;
                }

                .notification-banner {
                    max-width: 800px;
                    margin: 0 auto 1.5rem auto;
                    padding: 0.75rem 1.25rem;
                    border-radius: var(--radius-sm);
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                    font-size: 0.88rem;
                    font-weight: 500;
                }

                .notification-banner.success {
                    background: rgba(16, 185, 129, 0.12);
                    border: 1px solid rgba(16, 185, 129, 0.3);
                    color: var(--text-main);
                }

                .notification-banner.error {
                    background: rgba(239, 68, 68, 0.12);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    color: var(--text-main);
                }

                .notification-banner.info {
                    background: rgba(20, 184, 166, 0.12);
                    border: 1px solid rgba(20, 184, 166, 0.3);
                    color: var(--text-main);
                }

                .catalog-results-section {
                    margin-bottom: 3.5rem;
                }

                .catalog-header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: baseline;
                    margin-bottom: 1.25rem;
                    border-bottom: 1px solid var(--glass-border);
                    padding-bottom: 0.75rem;
                }

                .results-count-text {
                    font-size: 0.8rem;
                    color: var(--text-dim);
                    margin-top: 0.2rem;
                }

                .books-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                    gap: 1.25rem;
                    margin-bottom: 1.5rem;
                }

                .book-item-card {
                    padding: 1.15rem;
                    display: flex;
                    flex-direction: column;
                }

                .book-cover-container {
                    height: 220px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: #f1f5f9;
                    border-radius: var(--radius-sm);
                    padding: 6px;
                    margin-bottom: 0.85rem;
                }

                .book-cover-image {
                    max-height: 100%;
                    max-width: 100%;
                    object-fit: contain;
                    border-radius: 4px;
                    box-shadow: 0 4px 10px rgba(23, 43, 77, 0.14);
                }

                .book-placeholder-cover {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    width: 100%;
                }

                .book-details {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                }

                .book-item-title {
                    font-size: 0.92rem;
                    font-weight: 600;
                    line-height: 1.35;
                    margin-bottom: 0.25rem;
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    min-height: 2.6em;
                }

                .book-item-author {
                    font-size: 0.78rem;
                    color: var(--text-muted);
                    margin-bottom: 0.45rem;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .book-category-tag {
                    font-size: 0.7rem;
                    font-weight: 600;
                    color: var(--secondary);
                    background: rgba(20, 184, 166, 0.1);
                    padding: 2px 7px;
                    border-radius: 4px;
                    align-self: flex-start;
                    margin-bottom: 0.65rem;
                    border: 1px solid rgba(20, 184, 166, 0.2);
                }

                .book-card-actions {
                    margin-top: auto;
                    padding-top: 0.65rem;
                    border-top: 1px solid var(--glass-border);
                }

                .action-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 0.4rem;
                }

                .inventory-badge {
                    font-size: 0.74rem;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    gap: 3px;
                }

                .inventory-badge.available {
                    color: var(--success);
                }

                .inventory-badge.borrowed {
                    color: var(--warning);
                }

                .inventory-badge.external {
                    color: var(--text-muted);
                }

                .borrow-action-btn {
                    padding: 5px 12px;
                    font-size: 0.78rem;
                }

                .spin {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    100% { transform: rotate(360deg); }
                }

                @media (max-width: 768px) {
                    .catalog-hero {
                        padding: 1.25rem 0.25rem 1.75rem 0.25rem;
                    }

                    .hero-h1 {
                        font-size: 1.85rem;
                    }

                    .search-bar-form {
                        flex-direction: column;
                        background: var(--bg-card);
                        padding: 0.5rem;
                        gap: 0.5rem;
                    }

                    .search-input-wrap {
                        padding: 0.35rem;
                    }

                    .search-submit-btn {
                        width: 100%;
                    }

                    .books-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 0.75rem;
                    }

                    .book-item-card {
                        padding: 0.75rem;
                    }

                    .book-cover-container {
                        height: 155px;
                        margin-bottom: 0.5rem;
                    }

                    .book-item-title {
                        font-size: 0.82rem;
                    }

                    .book-item-author {
                        font-size: 0.72rem;
                    }

                    .borrow-action-btn {
                        padding: 4px 8px;
                        font-size: 0.72rem;
                    }

                    .badge-text {
                        font-size: 0.7rem;
                    }
                }

                @media (max-width: 520px) {
                    .books-grid {
                        grid-template-columns: 1fr;
                    }

                    .book-cover-container {
                        height: 190px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Search;