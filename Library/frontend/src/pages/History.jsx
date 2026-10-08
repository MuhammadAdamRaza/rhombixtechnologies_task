import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, CheckCircle2, AlertCircle, Users, Clock, History as HistoryIcon, ArrowRight } from 'lucide-react';
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
                const userRes = await api.get('/auth/me');
                setUser(userRes.data);

                const res = await api.get('/books/history');
                setHistory(res.data);
            } catch (err) {
                console.error("Failed to fetch borrow records", err);
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
            alert("Failed to process book return");
        }
    };

    if (loading) return <div className="loading">Retrieving borrowing records...</div>;

    const isAdmin = user?.is_admin;
    const totalPages = Math.max(1, Math.ceil(history.length / itemsPerPage));
    const paginatedHistory = history.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="animate-fade history-page" style={{ paddingBottom: '3rem' }}>
            <header style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
                    {isAdmin ? <Users size={26} color="var(--primary)" /> : <HistoryIcon size={26} color="var(--primary)" />}
                    <h1>{isAdmin ? 'Employee Loan Records' : 'My Borrowing History'}</h1>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {isAdmin ? 'Audit log of employee book loans across organization' : 'Track and manage your current and previous book loans'}
                </p>
            </header>

            <div className="glass-card" style={{ overflow: 'hidden' }}>
                {history.length > 0 && (
                    <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-dim)', fontSize: '0.82rem' }}>
                        Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, history.length)} of {history.length} records
                    </div>
                )}

                {/* Desktop Table View */}
                <div className="table-container desktop-table-view">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                                {isAdmin && <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member</th>}
                                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Book Title</th>
                                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Borrowed</th>
                                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Due Date</th>
                                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedHistory.map((record) => {
                                const overdue = !record.return_date && new Date(record.due_date) < new Date();
                                return (
                                    <tr key={record.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                        {isAdmin && (
                                            <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                                                {record.user_email || 'N/A'}
                                            </td>
                                        )}
                                        <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                            {record.book_title}
                                        </td>
                                        <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                            {new Date(record.borrow_date).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '0.85rem 1.25rem', color: overdue ? 'var(--danger)' : 'var(--text-muted)', fontSize: '0.82rem', fontWeight: overdue ? 600 : 400 }}>
                                            {new Date(record.due_date).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '0.85rem 1.25rem' }}>
                                            {record.return_date ? (
                                                <span style={{ color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', fontWeight: 600, background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                                                    <CheckCircle2 size={12} /> Returned
                                                </span>
                                            ) : (
                                                <span style={{ color: overdue ? 'var(--danger)' : 'var(--warning)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', fontWeight: 600, background: overdue ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '4px', border: `1px solid ${overdue ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)'}` }}>
                                                    {overdue ? <AlertCircle size={12} /> : <Clock size={12} />}
                                                    {overdue ? 'Overdue' : 'Active'}
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                                            {!record.return_date && (
                                                <button onClick={() => handleReturn(record.id)} className="btn-primary" style={{ padding: '4px 12px', fontSize: '0.78rem' }}>
                                                    Return
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards View */}
                <div className="mobile-cards-view">
                    {paginatedHistory.map((record) => {
                        const overdue = !record.return_date && new Date(record.due_date) < new Date();
                        return (
                            <div key={record.id} className="mobile-history-card">
                                <div className="card-top-row">
                                    <h4 className="record-book-title">{record.book_title}</h4>
                                    {record.return_date ? (
                                        <span className="mini-status returned">
                                            <CheckCircle2 size={11} /> Returned
                                        </span>
                                    ) : (
                                        <span className={`mini-status ${overdue ? 'overdue' : 'active'}`}>
                                            {overdue ? <AlertCircle size={11} /> : <Clock size={11} />}
                                            {overdue ? 'Overdue' : 'Active'}
                                        </span>
                                    )}
                                </div>

                                {isAdmin && (
                                    <p className="record-user-email">
                                        Member: <strong>{record.user_email || 'N/A'}</strong>
                                    </p>
                                )}

                                <div className="card-dates-row">
                                    <span>Borrowed: {new Date(record.borrow_date).toLocaleDateString()}</span>
                                    <span className={overdue ? 'text-danger' : ''}>
                                        Due: {new Date(record.due_date).toLocaleDateString()}
                                    </span>
                                </div>

                                {!record.return_date && (
                                    <div style={{ marginTop: '0.75rem' }}>
                                        <button onClick={() => handleReturn(record.id)} className="btn-primary" style={{ width: '100%', padding: '8px', fontSize: '0.82rem' }}>
                                            Return Book
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {history.length === 0 && (
                    <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No loan records available at this time.
                    </div>
                )}

                {history.length > 0 && (
                    <div style={{ padding: '1rem 1.25rem' }}>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>

            <style>{`
                .desktop-table-view {
                    display: block;
                }

                .mobile-cards-view {
                    display: none;
                }

                @media (max-width: 700px) {
                    .desktop-table-view {
                        display: none;
                    }

                    .mobile-cards-view {
                        display: flex;
                        flex-direction: column;
                        gap: 0.75rem;
                        padding: 0.85rem;
                    }

                    .mobile-history-card {
                        background: rgba(255, 255, 255, 0.02);
                        border: 1px solid var(--glass-border);
                        border-radius: var(--radius-sm);
                        padding: 0.9rem;
                    }

                    .card-top-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        gap: 0.5rem;
                        margin-bottom: 0.4rem;
                    }

                    .record-book-title {
                        font-size: 0.92rem;
                        font-weight: 600;
                        line-height: 1.3;
                    }

                    .record-user-email {
                        font-size: 0.78rem;
                        color: var(--text-muted);
                        margin-bottom: 0.4rem;
                    }

                    .card-dates-row {
                        display: flex;
                        justify-content: space-between;
                        font-size: 0.76rem;
                        color: var(--text-dim);
                        padding-top: 0.35rem;
                        border-top: 1px solid rgba(255, 255, 255, 0.04);
                    }

                    .text-danger {
                        color: var(--danger);
                        font-weight: 600;
                    }

                    .mini-status {
                        display: inline-flex;
                        align-items: center;
                        gap: 3px;
                        font-size: 0.7rem;
                        font-weight: 600;
                        padding: 2px 6px;
                        border-radius: 4px;
                        white-space: nowrap;
                    }

                    .mini-status.returned {
                        background: rgba(16, 185, 129, 0.1);
                        color: var(--success);
                        border: 1px solid rgba(16, 185, 129, 0.25);
                    }

                    .mini-status.active {
                        background: rgba(245, 158, 11, 0.1);
                        color: var(--warning);
                        border: 1px solid rgba(245, 158, 11, 0.25);
                    }

                    .mini-status.overdue {
                        background: rgba(239, 68, 68, 0.1);
                        color: var(--danger);
                        border: 1px solid rgba(239, 68, 68, 0.25);
                    }
                }
            `}</style>
        </div>
    );
};

export default History;
