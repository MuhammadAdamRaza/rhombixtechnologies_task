import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Search as SearchIcon, BookOpen, AlertCircle, CheckCircle,
    Book as BookIcon, Clock, ArrowRight
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
    const [newArrivalsPage, setNewArrivalsPage] = useState(1);
    const itemsPerPage = 20;

    // Load initial data (All books or Search results)
    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            try {
                let res;
                if (initialQuery) {
                    // If URL has query, search global
                    res = await api.get('/books/search-global', { params: { q: initialQuery } });
                    // Also set query state to match URL
                    setQuery(initialQuery);
                } else {
                    // Default: Show ALL library books (newest first)
                    res = await api.get('/books/recent');
                    // Local books are always in library
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

    // We no longer need separate "recentBooks" state since "results" holds main list
    // We no longer need separate "recentBooks" state since "results" holds main list
    // const [recentBooks, setRecentBooks] = useState([]); <--- REMOVED
    const [bookshelf, setBookshelf] = useState([]);

    // Fetch user history for "My Bookshelf" preview (optional, or remove if user wants pure catalog)
    // User asked to consolidate catalog. Let's keep specific user data on Dashboard. 
    // So Search.jsx becomes PURE catalog.

    // We already have 'borrowing' state at line 17. 
    // REMOVING DUPLICATE DECLARATION from previous edit failure overlap if any.
    // The previous edit inserted a duplicate. I need to clean up lines 46-66 roughly.

    // Calculate pagination for Results
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
                setMessage({ text: 'No books found.', type: 'info' });
            }
        } catch (err) {
            setMessage({ text: 'Search failed. Please try again.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (query) performSearch(query);
    };

    const handleBorrow = async (book) => {
        setBorrowing(book.library_id);
        try {
            const res = await api.post('/books/borrow', { book_id: book.library_id });
            setMessage({ text: res.data.message, type: 'success' });
            // Update local state by marking book as unavailable
            setResults(results.map(b => b.library_id === book.library_id ? { ...b, available: false } : b));
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Borrowing failed', type: 'error' });
        } finally {
            setBorrowing(null);
        }
    };
    const paginatedResults = results.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="animate-fade" style={{ padding: '0 2rem 4rem 2rem' }}>
            {/* Hero Section */}
            <section style={{ textAlign: 'center', padding: '5rem 0' }} className="hero-section">
                <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', fontWeight: 800 }} className="hero-h1">Library Catalog</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '3rem' }}>Browse and search our entire collection</p>
                <form onSubmit={handleSearchSubmit} style={{ maxWidth: '700px', margin: '0 auto', position: 'relative' }}>
                    <SearchIcon style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        className="input-field"
                        style={{
                            padding: '1.5rem 1.5rem 1.5rem 4rem',
                            borderRadius: '50px',
                            fontSize: '1.2rem',
                            boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                            border: '1px solid var(--glass-border)',
                            background: 'var(--glass)'
                        }}
                        placeholder="Search by title, author, or ISBN..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button type="submit" className="btn-primary" style={{ position: 'absolute', right: '0.6rem', top: '0.6rem', bottom: '0.6rem', borderRadius: '40px', padding: '0 2rem', fontSize: '1.1rem' }} disabled={loading}>
                        {loading ? 'Searching...' : 'Explore'}
                    </button>
                </form>
            </section>

            {message.text && (
                <div className="glass-card" style={{
                    maxWidth: '800px', margin: '0 auto 3rem auto',
                    padding: '1rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    borderColor: message.type === 'success' ? 'var(--success)' : (message.type === 'error' ? 'var(--danger)' : 'var(--primary)'),
                    background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : (message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)')
                }}>
                    {message.type === 'success' ? <CheckCircle color="var(--success)" /> : (message.type === 'error' ? <AlertCircle color="var(--danger)" /> : <BookOpen color="var(--primary)" />)}
                    <span style={{ fontWeight: 500 }}>{message.text}</span>
                </div>
            )}

            {/* Main Library Grid */}
            <section style={{ marginBottom: '5rem' }}>
                <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    {query ? 'Search Results' : 'Recently Added Books'}
                </h2>

                {loading ? (
                    <div className="loading" style={{ textAlign: 'center' }}>Loading library...</div>
                ) : (
                    <>
                        {/* Page Info */}
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
                            Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, results.length)} of {results.length} books
                        </div>

                        <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
                            {paginatedResults.map((book, idx) => (
                                <div key={idx} className="glass-card hover-lift" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ height: '280px', display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.05)', borderRadius: '8px', padding: '10px' }}>
                                        {book.cover_url ? (
                                            <img
                                                src={book.cover_url}
                                                alt={book.title}
                                                style={{ height: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: '4px', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}
                                                onError={(e) => { e.target.src = "https://via.placeholder.com/150x220?text=No+Cover"; }}
                                            />
                                        ) : (
                                            <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <BookIcon size={48} color="var(--text-muted)" />
                                            </div>
                                        )}
                                    </div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', lineHeight: 1.3, minHeight: '2.8em' }}>{book.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>{book.author}</p>

                                    <div style={{ marginTop: 'auto' }}>
                                        {book.in_library ? (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: book.available ? 'var(--success)' : 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                    {book.available ? <CheckCircle size={14} /> : <Clock size={14} />}
                                                    {book.available ? 'Available' : 'Borrowed'}
                                                </span>
                                                {book.available && (
                                                    <button
                                                        className="btn-primary"
                                                        style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                                                        disabled={borrowing === book.library_id}
                                                        onClick={() => handleBorrow(book)}
                                                    >
                                                        {borrowing === book.library_id ? 'Wait...' : 'Borrow'}
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                                Not in Inventory
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </section>
            <style>{`
                .hover-lift {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .hover-lift:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                }
                @keyframes flash {
                    0% { opacity: 1; }
                    50% { opacity: 0.4; }
                    100% { opacity: 1; }
                }
                .flash-alert {
                    animation: flash 1s infinite;
                }
            `}</style>
        </div>
    );
};



export default Search;
