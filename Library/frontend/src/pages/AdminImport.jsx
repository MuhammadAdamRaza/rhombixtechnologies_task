import React, { useState } from 'react';
import api from '../services/api';
import { Search as SearchIcon, Import, CheckCircle, AlertCircle, Plus } from 'lucide-react';

const AdminImport = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query) return;
        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            const res = await api.get('/books/search-global', { params: { q: query } });

            setResults(res.data || []);
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
            setMessage({ text: `'${book.title}' added to library`, type: 'success' });
            setResults(results.map(b => b.isbn === book.isbn ? { ...b, in_library: true } : b));
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Import failed', type: 'error' });
        } finally {
            setImporting(null);
        }
    };

    return (
        <div className="animate-fade" style={{ padding: '2rem' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Import size={32} color="var(--primary)" /> Smart Import
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>Expand the catalog by fetching metadata from Google Books</p>
            </header>

            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <SearchIcon size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        className="input-field"
                        style={{ paddingLeft: '3rem' }}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search books to import..."
                    />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {message.text && (
                <div className="glass-card" style={{
                    padding: '1rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    borderColor: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
                    background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                }}>
                    {message.type === 'success' ? <CheckCircle color="var(--success)" /> : <AlertCircle color="var(--danger)" />}
                    <span>{message.text}</span>
                </div>
            )}

            <div className="responsive-grid" style={{ display: 'grid', gap: '1rem' }}>
                {results.map((book, idx) => (
                    <div key={idx} className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <img
                            src={book.cover_url || 'https://via.placeholder.com/60x90?text=No+Cover'}
                            alt={book.title}
                            style={{ width: '60px', borderRadius: '4px' }}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/60x90/334155/f8fafc?text=Book";
                            }}
                        />
                        <div style={{ flex: 1 }}>
                            <h4 style={{ marginBottom: '0.25rem' }}>{book.title}</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{book.author} • ISBN: {book.isbn || 'N/A'}</p>
                        </div>

                        {book.in_library ? (
                            <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                                <CheckCircle size={18} /> In Library
                            </div>
                        ) : (
                            <button
                                onClick={() => handleImport(book)}
                                className="btn-primary"
                                style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                disabled={importing === book.isbn}
                            >
                                {importing === book.isbn ? 'Scaling...' : <><Plus size={18} /> Add to Library</>}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminImport;
