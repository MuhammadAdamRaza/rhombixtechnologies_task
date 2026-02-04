import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Globe, Search, BookOpen, Plus, CheckCircle } from 'lucide-react';
import Pagination from '../components/Pagination';

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

    useEffect(() => {
        loadCategory(category);
    }, [category]);

    const loadCategory = async (cat) => {
        setLoading(true);
        setMessage({ text: '', type: '' });
        setCurrentPage(1); // Reset to first page
        const catQuery = categories.find(c => c.name === cat)?.query || cat;

        try {
            const res = await api.get('/books/search-global', { params: { q: catQuery } });

            setBooks(res.data || []);

            if (!res.data || res.data.length === 0) {
                setMessage({
                    text: 'No results from Google Books API. This may be due to regional restrictions. Try using a VPN or search for specific titles.',
                    type: 'warning'
                });
            } else {
                setMessage({ text: `Showing ${res.data.length} ${cat} books from Google Books`, type: 'success' });
            }
        } catch (err) {
            setMessage({ text: 'Failed to load books from Google Books API', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        setMessage({ text: '', type: '' });
        setCurrentPage(1); // Reset to first page

        try {
            const res = await api.get('/books/search-global', { params: { q: searchQuery } });
            setBooks(res.data || []);

            if (res.data && res.data.length > 0) {
                setMessage({ text: `Found ${res.data.length} books matching "${searchQuery}"`, type: 'success' });
            } else {
                setMessage({ text: `No results for "${searchQuery}". Google Books API may be blocked in your region.`, type: 'warning' });
            }
        } catch (err) {
            setMessage({ text: 'Search failed', type: 'error' });
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
            setMessage({ text: `"${book.title}" imported successfully!`, type: 'success' });
            setBooks(books.map(b => b.isbn === book.isbn ? { ...b, in_library: true } : b));
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Import failed', type: 'error' });
        } finally {
            setImporting(null);
        }
    };

    return (
        <div className="animate-fade" style={{ padding: '2rem' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Globe size={32} color="var(--primary)" />
                    Browse Google Books Library
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>Explore and import books from Google's 40+ million title collection</p>
            </header>

            {message.text && (
                <div style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' :
                        message.type === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${message.type === 'success' ? 'var(--success)' :
                        message.type === 'warning' ? 'var(--warning)' : 'var(--danger)'}`,
                    color: message.type === 'success' ? 'var(--success)' :
                        message.type === 'warning' ? 'var(--warning)' : 'var(--danger)'
                }}>
                    {message.text}
                </div>
            )}

            {/* Search Bar */}
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search Google Books by title, author, or ISBN..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field"
                            style={{ paddingLeft: '40px' }}
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </form>
            </div>

            {/* Category Filters */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                {categories.map(cat => (
                    <button
                        key={cat.name}
                        onClick={() => setCategory(cat.name)}
                        className="hover-lift"
                        style={{
                            padding: '10px 20px',
                            borderRadius: '20px',
                            border: `2px solid ${category === cat.name ? 'var(--primary)' : 'var(--glass-border)'}`,
                            background: category === cat.name ? 'var(--primary)' : 'var(--glass)',
                            color: category === cat.name ? 'white' : 'var(--text-main)',
                            cursor: 'pointer',
                            fontWeight: category === cat.name ? 600 : 400,
                            transition: 'all 0.3s'
                        }}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Books Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <BookOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                    <p>Loading books from Google Books API...</p>
                </div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {books
                            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                            .map((book, idx) => (
                                <div key={idx} className="glass-card hover-lift" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ height: '240px', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                                        <img
                                            src={book.cover_url || 'https://placehold.co/150x220/334155/f8fafc?text=No+Cover'}
                                            alt={book.title}
                                            style={{ maxHeight: '100%', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
                                            onError={(e) => {
                                                if (e.target.src !== "https://placehold.co/150x220/334155/f8fafc?text=No+Cover") {
                                                    e.target.src = "https://placehold.co/150x220/334155/f8fafc?text=No+Cover";
                                                }
                                            }}
                                        />
                                    </div>

                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', lineHeight: 1.3, minHeight: '2.6rem' }}>
                                        {book.title}
                                    </h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                        {book.author}
                                    </p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', flex: 1 }}>
                                        {book.description?.substring(0, 100)}...
                                    </p>

                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            background: 'rgba(99, 102, 241, 0.1)',
                                            fontSize: '0.75rem',
                                            color: 'var(--primary)'
                                        }}>
                                            {book.category}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                            {book.isbn}
                                        </span>
                                    </div>

                                    {book.in_library ? (
                                        <button disabled className="btn-primary" style={{ background: 'var(--success)', borderColor: 'var(--success)', cursor: 'default' }}>
                                            <CheckCircle size={16} /> In Library
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleImport(book)}
                                            className="btn-primary"
                                            disabled={importing === book.isbn}
                                        >
                                            <Plus size={16} /> {importing === book.isbn ? 'Importing...' : 'Add to Library'}
                                        </button>
                                    )}
                                </div>
                            ))}
                    </div>

                    {/* Pagination Controls */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />

                    {/* Pagination Info */}
                    {books.length > 0 && (
                        <div style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, books.length)} of {books.length} books
                        </div>
                    )}

                </>
            )}

            {
                !loading && books.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        <BookOpen size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.2 }} />
                        <h3 style={{ marginBottom: '0.5rem' }}>No Books Found</h3>
                        <p>Google Books API may be blocked in your region. Try:</p>
                        <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '1rem auto', lineHeight: 1.8 }}>
                            <li>Using a VPN to connect to US/UK/Canada</li>
                            <li>Searching for specific book titles</li>
                            <li>Checking your internet connection</li>
                        </ul>
                    </div>
                )
            }
        </div >
    );
};

export default AdminGoogleBooks;
