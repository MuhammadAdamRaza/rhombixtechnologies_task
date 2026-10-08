import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BookOpen, Edit2, Trash2, Search, X, Check, CheckCircle, AlertCircle, BookCheck } from 'lucide-react';
import Pagination from '../components/Pagination';

const AdminBooks = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingBook, setEditingBook] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const res = await api.get('/admin/all-books');
            setBooks(res.data);
        } catch (err) {
            setMessage({ text: 'Failed to retrieve book inventory', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (bookId, bookTitle) => {
        if (!window.confirm(`Permanently remove "${bookTitle}" from inventory?`)) return;

        try {
            await api.delete(`/admin/books/${bookId}`);
            setMessage({ text: `"${bookTitle}" removed from inventory`, type: 'success' });
            fetchBooks();
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Unable to delete title', type: 'error' });
        }
    };

    const handleEdit = (book) => {
        setEditingBook({ ...book });
    };

    const handleUpdate = async () => {
        try {
            await api.put(`/admin/books/${editingBook.id}`, {
                title: editingBook.title,
                author: editingBook.author,
                description: editingBook.description,
                category: editingBook.category
            });
            setMessage({ text: 'Book metadata updated successfully', type: 'success' });
            setEditingBook(null);
            fetchBooks();
        } catch (err) {
            setMessage({ text: 'Failed to update record', type: 'error' });
        }
    };

    const filteredBooks = books.filter(book =>
        (book.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.author || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.isbn || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.max(1, Math.ceil(filteredBooks.length / itemsPerPage));
    const paginatedBooks = filteredBooks.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className="animate-fade admin-books-page" style={{ paddingBottom: '3rem' }}>
            <header style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
                    <BookOpen size={26} color="var(--primary)" />
                    <h1>Library Inventory Management</h1>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Monitor, update metadata, and maintain physical repository stock
                </p>
            </header>

            {message.text && (
                <div style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '1.25rem',
                    background: message.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.88rem'
                }}>
                    {message.type === 'success' ? <CheckCircle size={16} color="var(--success)" /> : <AlertCircle size={16} color="var(--danger)" />}
                    {message.text}
                </div>
            )}

            {/* Inventory KPI Summary */}
            <div className="admin-kpi-row">
                <div className="glass-card kpi-tile" style={{ borderLeft: '3px solid var(--primary)' }}>
                    <span className="kpi-tile-label">Total Titles</span>
                    <h3 className="kpi-tile-val">{books.length}</h3>
                </div>
                <div className="glass-card kpi-tile" style={{ borderLeft: '3px solid var(--success)' }}>
                    <span className="kpi-tile-label">On Shelf</span>
                    <h3 className="kpi-tile-val text-success">{books.filter(b => b.available).length}</h3>
                </div>
                <div className="glass-card kpi-tile" style={{ borderLeft: '3px solid var(--warning)' }}>
                    <span className="kpi-tile-label">On Loan</span>
                    <h3 className="kpi-tile-val text-warning">{books.filter(b => !b.available).length}</h3>
                </div>
            </div>

            {/* Search Filter Bar */}
            <div className="glass-card" style={{ padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                    <input
                        type="text"
                        placeholder="Filter by title, author, or ISBN..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field"
                        style={{ paddingLeft: '40px' }}
                    />
                </div>
            </div>

            {/* Inventory Container */}
            <div className="glass-card" style={{ overflow: 'hidden' }}>
                {/* Desktop Data Table */}
                <div className="table-container desktop-books-table">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cover</th>
                                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</th>
                                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Author</th>
                                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ISBN</th>
                                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedBooks.map(book => (
                                <tr key={book.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '0.75rem 1.25rem' }}>
                                        <img
                                            src={book.cover_url || 'https://placehold.co/60x90/1e2634/94a3b8?text=Book'}
                                            alt={book.title}
                                            style={{ width: '44px', height: '62px', objectFit: 'cover', borderRadius: '4px' }}
                                            onError={(e) => { e.target.src = "https://placehold.co/60x90/1e2634/94a3b8?text=Book"; }}
                                        />
                                    </td>
                                    <td style={{ padding: '0.75rem 1.25rem', maxWidth: '240px' }}>
                                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'block', lineHeight: 1.3 }}>{book.title}</strong>
                                    </td>
                                    <td style={{ padding: '0.75rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                                        {book.author}
                                    </td>
                                    <td style={{ padding: '0.75rem 1.25rem', fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                                        {book.isbn}
                                    </td>
                                    <td style={{ padding: '0.75rem 1.25rem' }}>
                                        <span style={{
                                            padding: '2px 7px',
                                            borderRadius: '4px',
                                            background: 'rgba(20, 184, 166, 0.1)',
                                            border: '1px solid rgba(20, 184, 166, 0.25)',
                                            fontSize: '0.74rem',
                                            color: 'var(--secondary)'
                                        }}>
                                            {book.category || 'General'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.75rem 1.25rem' }}>
                                        <span style={{
                                            padding: '2px 7px',
                                            borderRadius: '4px',
                                            background: book.available ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                                            border: `1px solid ${book.available ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                                            color: book.available ? 'var(--success)' : 'var(--warning)',
                                            fontSize: '0.74rem',
                                            fontWeight: 600
                                        }}>
                                            {book.available ? 'Available' : 'Borrowed'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>
                                        <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => handleEdit(book)}
                                                className="btn-secondary"
                                                style={{ padding: '4px 9px', fontSize: '0.76rem', minHeight: '32px' }}
                                                title="Edit title details"
                                            >
                                                <Edit2 size={12} /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(book.id, book.title)}
                                                disabled={!book.available}
                                                style={{
                                                    padding: '4px 9px',
                                                    background: book.available ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                                                    border: `1px solid ${book.available ? 'rgba(239, 68, 68, 0.3)' : 'var(--glass-border)'}`,
                                                    borderRadius: 'var(--radius-sm)',
                                                    color: book.available ? 'var(--danger)' : 'var(--text-dim)',
                                                    cursor: book.available ? 'pointer' : 'not-allowed',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '3px',
                                                    fontSize: '0.76rem',
                                                    minHeight: '32px'
                                                }}
                                                title={book.available ? 'Delete book' : 'Cannot delete borrowed book'}
                                            >
                                                <Trash2 size={12} /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards View */}
                <div className="mobile-books-list">
                    {paginatedBooks.map(book => (
                        <div key={book.id} className="mobile-book-row">
                            <img
                                src={book.cover_url || 'https://placehold.co/60x90/1e2634/94a3b8?text=Book'}
                                alt={book.title}
                                className="mobile-row-img"
                                onError={(e) => { e.target.src = "https://placehold.co/60x90/1e2634/94a3b8?text=Book"; }}
                            />
                            <div className="mobile-row-content">
                                <h4 className="mobile-row-title">{book.title}</h4>
                                <p className="mobile-row-author">{book.author}</p>
                                <div className="mobile-row-tags">
                                    <span className="mini-cat-tag">{book.category || 'General'}</span>
                                    <span className={`mini-status-tag ${book.available ? 'available' : 'borrowed'}`}>
                                        {book.available ? 'Available' : 'Borrowed'}
                                    </span>
                                </div>
                                <div className="mobile-row-actions">
                                    <button onClick={() => handleEdit(book)} className="btn-secondary mobile-action-btn">
                                        <Edit2 size={12} /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(book.id, book.title)}
                                        disabled={!book.available}
                                        className="mobile-action-btn delete-btn"
                                    >
                                        <Trash2 size={12} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredBooks.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                        <BookOpen size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
                        <p>No matching inventory records found.</p>
                    </div>
                )}

                <div style={{ padding: '0.85rem 1.25rem' }}>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>

            {/* Edit Modal (Mobile Responsive) */}
            {editingBook && (
                <div className="modal-backdrop">
                    <div className="glass-card modal-dialog">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h2 style={{ fontSize: '1.25rem' }}>Edit Book Record</h2>
                            <button onClick={() => setEditingBook(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>Book Title</label>
                                <input
                                    type="text"
                                    value={editingBook.title}
                                    onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>Author</label>
                                <input
                                    type="text"
                                    value={editingBook.author}
                                    onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>Category</label>
                                <input
                                    type="text"
                                    value={editingBook.category}
                                    onChange={(e) => setEditingBook({ ...editingBook, category: e.target.value })}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>Description</label>
                                <textarea
                                    value={editingBook.description}
                                    onChange={(e) => setEditingBook({ ...editingBook, description: e.target.value })}
                                    className="input-field"
                                    rows={4}
                                    style={{ resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.5rem' }}>
                                <button onClick={handleUpdate} className="btn-primary" style={{ flex: 1 }}>
                                    <Check size={15} /> Save Changes
                                </button>
                                <button onClick={() => setEditingBook(null)} className="btn-secondary" style={{ flex: 1 }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .admin-kpi-row {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .kpi-tile {
                    padding: 1rem 1.25rem;
                }

                .kpi-tile-label {
                    font-size: 0.72rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    font-weight: 600;
                }

                .kpi-tile-val {
                    font-size: 1.6rem;
                    color: var(--text-main);
                    margin-top: 0.2rem;
                }

                .text-success { color: var(--success); }
                .text-warning { color: var(--warning); }

                .desktop-books-table { display: block; }
                .mobile-books-list { display: none; }

                .modal-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.75);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    padding: 1rem;
                }

                .modal-dialog {
                    padding: 1.75rem;
                    max-width: 520px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                }

                @media (max-width: 768px) {
                    .admin-kpi-row {
                        grid-template-columns: repeat(3, 1fr);
                        gap: 0.5rem;
                    }

                    .kpi-tile {
                        padding: 0.75rem 0.65rem;
                    }

                    .kpi-tile-val {
                        font-size: 1.25rem;
                    }

                    .kpi-tile-label {
                        font-size: 0.65rem;
                    }

                    .desktop-books-table { display: none; }

                    .mobile-books-list {
                        display: flex;
                        flex-direction: column;
                        gap: 0.65rem;
                        padding: 0.75rem;
                    }

                    .mobile-book-row {
                        display: flex;
                        gap: 0.75rem;
                        background: rgba(255, 255, 255, 0.02);
                        border: 1px solid var(--glass-border);
                        border-radius: var(--radius-sm);
                        padding: 0.75rem;
                    }

                    .mobile-row-img {
                        width: 54px;
                        height: 78px;
                        object-fit: cover;
                        border-radius: 4px;
                        flex-shrink: 0;
                    }

                    .mobile-row-content {
                        flex: 1;
                        min-width: 0;
                        display: flex;
                        flex-direction: column;
                    }

                    .mobile-row-title {
                        font-size: 0.88rem;
                        font-weight: 600;
                        line-height: 1.3;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }

                    .mobile-row-author {
                        font-size: 0.76rem;
                        color: var(--text-muted);
                        margin-bottom: 0.35rem;
                    }

                    .mobile-row-tags {
                        display: flex;
                        gap: 0.35rem;
                        margin-bottom: 0.5rem;
                        flex-wrap: wrap;
                    }

                    .mini-cat-tag {
                        font-size: 0.68rem;
                        padding: 1px 6px;
                        border-radius: 3px;
                        background: rgba(20, 184, 166, 0.1);
                        color: var(--secondary);
                        border: 1px solid rgba(20, 184, 166, 0.25);
                    }

                    .mini-status-tag {
                        font-size: 0.68rem;
                        padding: 1px 6px;
                        border-radius: 3px;
                        font-weight: 600;
                    }

                    .mini-status-tag.available {
                        background: rgba(16, 185, 129, 0.12);
                        color: var(--success);
                    }

                    .mini-status-tag.borrowed {
                        background: rgba(245, 158, 11, 0.12);
                        color: var(--warning);
                    }

                    .mobile-row-actions {
                        margin-top: auto;
                        display: flex;
                        gap: 0.4rem;
                    }

                    .mobile-action-btn {
                        padding: 4px 8px;
                        font-size: 0.74rem;
                        border-radius: 4px;
                        min-height: 30px;
                    }

                    .delete-btn {
                        background: rgba(239, 68, 68, 0.1);
                        border: 1px solid rgba(239, 68, 68, 0.3);
                        color: var(--danger);
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        gap: 3px;
                    }

                    .delete-btn:disabled {
                        opacity: 0.4;
                        cursor: not-allowed;
                    }

                    .modal-dialog {
                        padding: 1.25rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default AdminBooks;
