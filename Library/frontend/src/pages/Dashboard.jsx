import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    Users, BookOpen, Clock, AlertCircle, TrendingUp, Search as SearchIcon,
    ArrowRight, Book as BookIcon, PlusCircle
} from 'lucide-react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import Pagination from '../components/Pagination'; // <--- IMPORTED PAGINATION

// --- ADMIN COMPONENT (Unchanged) ---
const AdminDashboard = ({ stats }) => {
    const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

    return (
        <div className="animate-fade">
            {/* KPI Cards */}
            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <KpiCard icon={<BookOpen />} label="Total Books" value={stats.total_books} color="#6366f1" />
                <KpiCard icon={<Clock />} label="Active Loans" value={stats.borrowed_books} color="#f59e0b" />
                <KpiCard icon={<AlertCircle />} label="Overdue" value={stats.overdue_count} color="#ef4444" />
                <KpiCard icon={<Users />} label="Total Users" value={stats.total_users} color="#10b981" />
            </div>

            {/* Charts */}
            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={20} color="var(--primary)" /> Inventory Status
                    </h3>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={stats.inventory_status} color="#8884d8" dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {stats.inventory_status?.map((entry, index) => <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#f59e0b'} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '8px' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Books by Category</h3>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.category_data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                                <YAxis stroke="var(--text-muted)" fontSize={12} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '8px' }} />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {stats.category_data?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- EMPLOYEE COMPONENT (Simplified) ---
const EmployeeDashboard = ({ user, bookshelf }) => {
    const navigate = useNavigate();
    const itemsPerPage = 20;
    const [currentPage, setCurrentPage] = useState(1);

    // Only show borrowed books here
    const books = bookshelf || [];

    const totalPages = Math.ceil(books.length / itemsPerPage);
    const currentBooks = books.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="animate-fade">
            {/* Welcome Header */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                        Welcome back, {user?.email?.split('@')[0] || 'Reader'}! 👋
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Here is your personal library activity.</p>
                </div>
                <Link to="/library/search" className="btn-primary" style={{ textDecoration: 'none' }}>
                    <SearchIcon size={18} /> Browse Full Library
                </Link>
            </div>

            {/* Smart View: Quote, Reading Goal, and Quick Categories */}
            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>

                {/* 1. Gamified Reading Goal */}
                <div className="glass-card element-visible" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(to bottom, var(--primary), var(--secondary))' }} />
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <TrendingUp size={20} color="var(--primary)" /> Books Read
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'end', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{bookshelf?.length || 0}</span>
                        <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '6px' }}>books</span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '8px', background: 'var(--glass-border)', borderRadius: '4px', marginBottom: '1rem', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, ((bookshelf?.length || 0) / 12) * 100)}%`, height: '100%', background: 'linear-gradient(to right, var(--primary), var(--secondary))', borderRadius: '4px', transition: 'width 1s ease-out' }} />
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {(bookshelf?.length || 0) >= 12 ? '🎉 Goal Achieved! You are a Super Reader!' : 'Keep going! You are building a great habit.'}
                    </p>
                </div>

                {/* 2. Literary Quote & Discovery */}
                <div className="glass-card element-visible" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary)', marginBottom: '0.5rem' }}>Quote of the Day</h4>
                        <p style={{ fontStyle: 'italic', color: 'var(--text-main)', fontSize: '1.05rem', lineHeight: 1.5 }}>
                            "A reader lives a thousand lives before he dies. The man who never reads lives only one."
                        </p>
                        <p style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>— George R.R. Martin</p>
                    </div>

                    {/* Quick Categories */}
                    <div style={{ marginTop: 'auto' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Jump to a genre:</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {['Fiction', 'Technology', 'Science', 'History', 'Business'].map(cat => (
                                <Link key={cat} to={`/library/search?q=${cat}`} style={{ textDecoration: 'none', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', transition: 'all 0.2s' }} className="hover-lift">
                                    {cat}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* My Bookshelf Section */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <BookIcon size={24} color="var(--primary)" /> My Bookshelf
                </h2>

                {books.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--glass)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>You haven't borrowed any books yet.</p>
                        <Link to="/library/search" className="btn-primary" style={{ textDecoration: 'none' }}>
                            Start Reading
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                            {currentBooks.map((book, idx) => {
                                const due = new Date(book.due_date);
                                const isOverdue = due < new Date();
                                const displayTitle = book.title || book.book_title;
                                const displayCover = book.cover_url || book.book_cover;
                                const displayAuthor = book.author || 'Unknown Author';

                                return (
                                    <div key={idx} className="glass-card hover-lift" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                        {isOverdue && (
                                            <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'var(--danger)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
                                                OVERDUE
                                            </div>
                                        )}
                                        <div style={{ height: '200px', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                                            <img
                                                src={displayCover || 'https://via.placeholder.com/150x220?text=No+Cover'}
                                                onError={(e) => { e.target.src = "https://via.placeholder.com/150x220?text=No+Cover"; }}
                                                alt={displayTitle}
                                                style={{ maxHeight: '100%', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
                                            />
                                        </div>
                                        <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', minHeight: '2.4em', lineHeight: 1.2 }}>
                                            {displayTitle}
                                        </h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                            {displayAuthor}
                                        </p>
                                        <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                                            <p style={{ fontSize: '0.75rem', color: isOverdue ? 'var(--danger)' : 'var(--warning)', fontWeight: 600 }}>
                                                {isOverdue ? '⚠️ Overdue' : `Due: ${due.toLocaleDateString()}`}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {/* Pagination for Bookshelf */}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

const KpiCard = ({ icon, label, value, color }) => (
    <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ padding: '0.75rem', background: `${color}20`, borderRadius: '12px', color: color }}>
            {icon && React.isValidElement(icon) ? React.cloneElement(icon, { size: 24 }) : null}
        </div>
        <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>{label}</p>
            <h2 style={{ fontSize: '1.75rem', lineHeight: 1 }}>{value ?? 0}</h2>
        </div>
    </div>
);

const Dashboard = ({ user }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (user.is_admin) {
                    const res = await api.get('/admin/stats');
                    setData(res.data);
                } else {
                    const [recent, history] = await Promise.all([
                        api.get('/books/recent'),
                        api.get('/books/history')
                    ]);
                    setData({
                        recentBooks: recent.data,
                        bookshelf: (history.data || []).filter(h => h && !h.return_date)
                    });
                }
            } catch (err) {
                console.error("Dashboard data fetch failed", err);
                setErrorMsg(err.response?.data?.message || err.message || "Unknown error occurred");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    if (loading) return <div className="loading">Initializing Dashboard...</div>;

    if (!data && !loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(239, 68, 68, 0.2)', maxWidth: '500px' }}>
                    <AlertCircle size={48} color="var(--danger)" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ marginBottom: '0.5rem' }}>Dashboard Sync Failed</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        {errorMsg || "We encountered an unexpected error while fetching your dashboard data."}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button onClick={() => window.location.reload()} className="btn-primary">Retry Sync</button>
                        <Link to="/library/search" className="nav-link" style={{ border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '8px 16px' }}>Go to Search</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem' }}>
            {user.is_admin ? (
                <AdminDashboard stats={data} />
            ) : (
                <EmployeeDashboard user={user} recentBooks={data?.recentBooks || []} bookshelf={data?.bookshelf || []} />
            )}

            <style>{`
                @keyframes flash {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
                .flash {
                    animation: flash 1s infinite;
                }
            `}</style>
        </div>
    );
};

export default Dashboard;