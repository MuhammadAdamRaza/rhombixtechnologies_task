import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BookOpen, Edit, Trash2, Plus, Search, X, Check } from 'lucide-react';
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
            setMessage({ text: 'Failed to load books', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (bookId, bookTitle) => {
        if (!window.confirm(`Delete "${bookTitle}"? This cannot be undone.`)) return;

        try {
            await api.delete(`/admin/books/${bookId}`);
            setMessage({ text: 'Book deleted successfully', type: 'success' });
            fetchBooks();
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Delete failed', type: 'error' });
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
            setMessage({ text: 'Book updated successfully', type: 'success' });
            setEditingBook(null);
            fetchBooks();
        } catch (err) {
            setMessage({ text: 'Update failed', type: 'error' });
        }
    };

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination calculations
    const totalPages = Math.max(1, Math.ceil(filteredBooks.length / itemsPerPage));
    const paginatedBooks = filteredBooks.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className="animate-fade" style={{ padding: '2rem' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <BookOpen size={32} color="var(--primary)" />
                        Library Inventory
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage your physical library collection</p>
                </div>
            </header>

            {message.text && (
                <div style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
                    color: message.type === 'success' ? 'var(--success)' : 'var(--danger)'
                }}>
                    {message.text}
                </div>
            )}

            {/* Search Bar */}
            <div className="glass-card" style={{ padding: '1rem', marginBottom: '2rem' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search by title, author, or ISBN..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field"
                        style={{ paddingLeft: '40px' }}
                    />
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '2rem', color: 'var(--primary)' }}>{books.length}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Books</p>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '2rem', color: 'var(--success)' }}>{books.filter(b => b.available).length}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Available</p>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '2rem', color: 'var(--warning)' }}>{books.filter(b => !b.available).length}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Borrowed</p>
                </div>
            </div>

            {/* Books Table */}
            <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--glass-border)' }}>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Cover</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Title</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Author</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>ISBN</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Category</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedBooks.map(book => (
                            <tr key={book.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <td style={{ padding: '1rem' }}>
                                    <img
                                        src={book.cover_url || 'https://placehold.co/60x90/334155/f8fafc?text=Book'}
                                        alt={book.title}
                                        style={{ width: '60px', height: '90px', objectFit: 'cover', borderRadius: '4px' }}
                                        onError={(e) => { e.target.src = "https://placehold.co/60x90/334155/f8fafc?text=Book"; }}
                                    />
                                </td>
                                <td style={{ padding: '1rem', maxWidth: '200px' }}>
                                    <strong>{book.title}</strong>
                                </td>
                                <td style={{ padding: '1rem' }}>{book.author}</td>
                                <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>{book.isbn}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        fontSize: '0.8rem',
                                        color: 'var(--primary)'
                                    }}>
                                        {book.category}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        background: book.available ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                        color: book.available ? 'var(--success)' : 'var(--warning)',
                                        fontSize: '0.8rem',
                                        fontWeight: 600
                                    }}>
                                        {book.available ? 'Available' : 'Borrowed'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleEdit(book)}
                                            style={{ padding: '6px 12px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid var(--primary)', borderRadius: '6px', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                        >
                                            <Edit size={14} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(book.id, book.title)}
                                            disabled={!book.available}
                                            style={{ padding: '6px 12px', background: book.available ? 'rgba(239, 68, 68, 0.1)' : 'rgba(100, 100, 100, 0.1)', border: `1px solid ${book.available ? 'var(--danger)' : '#666'}`, borderRadius: '6px', color: book.available ? 'var(--danger)' : '#666', cursor: book.available ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '4px' }}
                                        >
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredBooks.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <BookOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                        <p>No books found</p>
                    </div>
                )}

                {/* Pagination Controls */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />

                {/* Page Info */}
                {filteredBooks.length > 0 && (
                    <div style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredBooks.length)} of {filteredBooks.length} books
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingBook && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                    <div className="glass-card" style={{ padding: '2rem', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2>Edit Book</h2>
                            <button onClick={() => setEditingBook(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Title</label>
                                <input
                                    type="text"
                                    value={editingBook.title}
                                    onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Author</label>
                                <input
                                    type="text"
                                    value={editingBook.author}
                                    onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Category</label>
                                <input
                                    type="text"
                                    value={editingBook.category}
                                    onChange={(e) => setEditingBook({ ...editingBook, category: e.target.value })}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Description</label>
                                <textarea
                                    value={editingBook.description}
                                    onChange={(e) => setEditingBook({ ...editingBook, description: e.target.value })}
                                    className="input-field"
                                    rows={4}
                                    style={{ resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button onClick={handleUpdate} className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <Check size={18} /> Save Changes
                                </button>
                                <button onClick={() => setEditingBook(null)} style={{ flex: 1, padding: '10px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '8px', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBooks;
