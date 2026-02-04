import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, CheckCircle2, AlertTriangle, Users } from 'lucide-react';
import Pagination from '../components/Pagination';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get current user info
                const userRes = await api.get('/auth/me');
                setUser(userRes.data);

                // Fetch history
                const res = await api.get('/books/history');
                setHistory(res.data);
            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleReturn = async (id) => {
        try {
            await api.post('/books/return', { history_id: id });
            setHistory(history.map(h => h.id === id ? { ...h, return_date: new Date().toISOString() } : h));
        } catch (err) {
            alert("Failed to return book");
        }
    };

    if (loading) return <div className="loading">Retrieving records...</div>;

    const isAdmin = user?.is_admin;

    return (
        <div className="animate-fade" style={{ padding: '2rem' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {isAdmin ? <Users size={32} color="var(--primary)" /> : <Calendar size={32} color="var(--primary)" />}
                    {isAdmin ? 'Employee Borrow Records' : 'My Reading Journey'}
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>
                    {isAdmin ? 'Monitor all employee book borrowing activity' : 'Track your past and current book loans'}
                </p>
            </header>

            <div className="glass-card" style={{ overflow: 'hidden' }}>
                {/* Pagination calculations */}
                {(() => {
                    const totalPages = Math.max(1, Math.ceil(history.length / itemsPerPage));
                    const paginatedHistory = history.slice(
                        (currentPage - 1) * itemsPerPage,
                        currentPage * itemsPerPage
                    );

                    return (
                        <>
                            {/* Page Info */}
                            {history.length > 0 && (
                                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)' }}>
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, history.length)} of {history.length} records
                                </div>
                            )}

                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: 'var(--glass)', borderBottom: '1px solid var(--glass-border)' }}>
                                        {isAdmin && <th style={{ padding: '1.25rem' }}>Employee</th>}
                                        <th style={{ padding: '1.25rem' }}>Book Title</th>
                                        <th style={{ padding: '1.25rem' }}>Borrowed Date</th>
                                        <th style={{ padding: '1.25rem' }}>Due Date</th>
                                        <th style={{ padding: '1.25rem' }}>Status</th>
                                        <th style={{ padding: '1.25rem' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedHistory.map((record) => {
                                        const overdue = !record.return_date && new Date(record.due_date) < new Date();
                                        return (
                                            <tr key={record.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                                {isAdmin && (
                                                    <td style={{ padding: '1.25rem', fontWeight: 500, color: 'var(--primary)' }}>
                                                        {record.user_email || 'N/A'}
                                                    </td>
                                                )}
                                                <td style={{ padding: '1.25rem', fontWeight: 500 }}>{record.book_title}</td>
                                                <td style={{ padding: '1.25rem', color: 'var(--text-muted)' }}>
                                                    {new Date(record.borrow_date).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '1.25rem', color: overdue ? 'var(--danger)' : 'var(--text-muted)' }}>
                                                    {new Date(record.due_date).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '1.25rem' }}>
                                                    {record.return_date ? (
                                                        <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
                                                            <CheckCircle2 size={16} /> Returned
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: overdue ? 'var(--danger)' : 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
                                                            {overdue ? <AlertTriangle size={16} /> : <Calendar size={16} />}
                                                            {overdue ? 'Overdue' : 'Active'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '1.25rem' }}>
                                                    {!record.return_date && (
                                                        <button onClick={() => handleReturn(record.id)} className="btn-primary" style={{ padding: '6px 16px', fontSize: '0.85rem' }}>
                                                            Return
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {history.length === 0 && (
                                        <tr>
                                            <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                You haven't borrowed any books yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Pagination Controls */}
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </>
                    );
                })()}
            </div>
        </div>
    );
};

export default History;
