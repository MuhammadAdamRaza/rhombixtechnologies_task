import React, { useState } from 'react';
import api from '../services/api';
import { Search as SearchIcon, Import, CheckCircle, AlertCircle, Plus, Loader2 } from 'lucide-react';

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
            if (!res.data || res.data.length === 0) {
                setMessage({ text: 'No matching titles found on Google Books.', type: 'info' });
            }
        } catch (err) {
            console.error('Google Books search failed', err);
            setMessage({ text: 'Search operation failed.', type: 'error' });
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
            setMessage({ text: `"${book.title}" successfully added to inventory`, type: 'success' });
            setResults(results.map(b => b.isbn === book.isbn ? { ...b, in_library: true } : b));
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Import operation failed', type: 'error' });
        } finally {
            setImporting(null);
        }
    };

    return (
        <div className="animate-fade admin-import-page" style={{ paddingBottom: '3rem' }}>
            <header style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
                    <Import size={26} color="var(--primary)" />
                    <h1>Quick Catalog Intake</h1>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Rapidly intake books into the library repository by ISBN or title lookup
                </p>
            </header>

            <form onSubmit={handleSearch} className="import-search-form">
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                    <SearchIcon size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                    <input
                        type="text"
                        className="input-field"
                        style={{ paddingLeft: '40px' }}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search books by title, author, or ISBN..."
                    />
                </div>
                <button type="submit" className="btn-primary search-import-btn" disabled={loading}>
                    {loading ? <Loader2 size={16} className="spin" /> : 'Search Metadata'}
                </button>
            </form>

            {message.text && (
                <div style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.88rem',
                    background: message.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : (message.type === 'error' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(20, 184, 166, 0.12)'),
                    border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : (message.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(20, 184, 166, 0.3)')}`,
                    color: 'var(--text-main)'
                }}>
                    {message.type === 'success' ? <CheckCircle size={16} color="var(--success)" /> : <AlertCircle size={16} color="var(--danger)" />}
                    <span>{message.text}</span>
                </div>
            )}

            <div className="import-results-list">
                {results.map((book, idx) => (
                    <div key={idx} className="glass-card import-item-card hover-lift">
                        <img
                            src={book.cover_url || 'https://placehold.co/60x90/1e2634/94a3b8?text=Book'}
                            alt={book.title}
                            className="import-item-img"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/60x90/1e2634/94a3b8?text=Book";
                            }}
                        />
                        <div className="import-item-details">
                            <h4 className="import-item-title">{book.title}</h4>
                            <p className="import-item-meta">
                                {book.author || 'Author Unspecified'} &bull; ISBN: <span style={{ fontFamily: 'monospace' }}>{book.isbn || 'N/A'}</span>
                            </p>
                        </div>

                        <div className="import-item-action">
                            {book.in_library ? (
                                <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 600 }}>
                                    <CheckCircle size={15} /> In Library
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleImport(book)}
                                    className="btn-primary import-btn"
                                    disabled={importing === book.isbn}
                                >
                                    {importing === book.isbn ? 'Importing...' : <><Plus size={15} /> Add to Library</>}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .import-search-form {
                    display: flex;
                    gap: 0.65rem;
                    margin-bottom: 1.75rem;
                    flex-wrap: wrap;
                }

                .import-results-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .import-item-card {
                    padding: 1rem 1.25rem;
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                }

                .import-item-img {
                    width: 48px;
                    height: 70px;
                    object-fit: cover;
                    border-radius: 4px;
                    flex-shrink: 0;
                }

                .import-item-details {
                    flex: 1;
                    min-width: 180px;
                }

                .import-item-title {
                    font-size: 0.94rem;
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                    line-height: 1.3;
                }

                .import-item-meta {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                }

                .import-item-action {
                    flex-shrink: 0;
                }

                .import-btn {
                    padding: 8px 16px;
                    font-size: 0.82rem;
                }

                @media (max-width: 640px) {
                    .import-search-form {
                        flex-direction: column;
                    }

                    .search-import-btn {
                        width: 100%;
                    }

                    .import-item-card {
                        flex-direction: column;
                        align-items: flex-start;
                        padding: 0.9rem;
                        gap: 0.75rem;
                    }

                    .import-item-img {
                        width: 50px;
                        height: 72px;
                    }

                    .import-item-details {
                        width: 100%;
                    }

                    .import-item-action {
                        width: 100%;
                    }

                    .import-btn {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    );
};

export default AdminImport;
