import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    Users, BookOpen, Clock, AlertCircle, TrendingUp, Search as SearchIcon,
    ArrowRight, Book as BookIcon, CheckCircle2, Award, Calendar, BookCheck
} from 'lucide-react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import Pagination from '../components/Pagination';

// Professional Executive Palette (No Purple or Blue)
const PALETTE = ['#10b981', '#14b8a6', '#f59e0b', '#0d9488', '#ef4444', '#84cc16'];

const KpiCard = ({ icon, label, value, color }) => (
    <div className="glass-card kpi-card" style={{ borderLeft: `3px solid ${color}` }}>
        <div className="kpi-icon-wrap" style={{ background: `${color}18`, color: color }}>
            {icon}
        </div>
        <div className="kpi-data">
            <span className="kpi-label">{label}</span>
            <span className="kpi-value">{value ?? 0}</span>
        </div>
    </div>
);

// --- ADMIN COMPONENT ---
const AdminDashboard = ({ stats }) => {
    return (
        <div className="animate-fade">
            {/* KPI Cards */}
            <div className="dashboard-kpi-grid">
                <KpiCard icon={<BookOpen size={20} />} label="Total Books" value={stats.total_books} color="#10b981" />
                <KpiCard icon={<Clock size={20} />} label="Active Loans" value={stats.borrowed_books} color="#f59e0b" />
                <KpiCard icon={<AlertCircle size={20} />} label="Overdue" value={stats.overdue_count} color="#ef4444" />
                <KpiCard icon={<Users size={20} />} label="Total Users" value={stats.total_users} color="#14b8a6" />
            </div>

            {/* Charts Grid */}
            <div className="dashboard-charts-grid">
                <div className="glass-card chart-card">
                    <div className="card-header">
                        <TrendingUp size={18} color="var(--primary)" />
                        <h3>Inventory Allocation</h3>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.inventory_status}
                                    color="#10b981"
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={75}
                                    label
                                >
                                    {stats.inventory_status?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#f59e0b'} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: 'rgba(15, 22, 33, 0.95)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '8px',
                                        color: '#f8fafc',
                                        fontSize: '0.85rem'
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card chart-card">
                    <div className="card-header">
                        <BookCheck size={18} color="var(--secondary)" />
                        <h3>Catalog by Category</h3>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.category_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                                <XAxis dataKey="name" stroke="var(--text-dim)" fontSize={11} tickLine={false} />
                                <YAxis stroke="var(--text-dim)" fontSize={11} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                    contentStyle={{
                                        background: 'rgba(15, 22, 33, 0.95)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '8px',
                                        color: '#f8fafc',
                                        fontSize: '0.85rem'
                                    }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {stats.category_data?.map((entry, index) => (
                                        <Cell key={`bar-${index}`} fill={PALETTE[index % PALETTE.length]} />
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

// --- EMPLOYEE / MEMBER COMPONENT ---
const EmployeeDashboard = ({ user, bookshelf }) => {
    const itemsPerPage = 12;
    const [currentPage, setCurrentPage] = useState(1);

    const books = bookshelf || [];
    const totalPages = Math.ceil(books.length / itemsPerPage);
    const currentBooks = books.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const readingGoal = 12;
    const progressPercent = Math.min(100, Math.round(((books.length || 0) / readingGoal) * 100));

    return (
        <div className="animate-fade">
            {/* Welcome Banner */}
            <div className="welcome-banner glass-card">
                <div className="welcome-info">
                    <h1>Welcome, {user?.email?.split('@')[0] || 'Reader'}</h1>
                    <p>Overview of your borrowed titles and reading progress</p>
                </div>
                <Link to="/library/search" className="btn-primary browse-btn" style={{ textDecoration: 'none' }}>
                    <SearchIcon size={16} />
                    <span>Explore Library</span>
                </Link>
            </div>

            {/* Smart Goals & Insights Grid */}
            <div className="insights-grid">
                {/* Reading Target Card */}
                <div className="glass-card reading-goal-card">
                    <div className="card-header">
                        <Award size={18} color="var(--primary)" />
                        <h3>Annual Reading Target</h3>
                    </div>
                    <div className="goal-counter">
                        <span className="goal-number">{books.length || 0}</span>
                        <span className="goal-total">/ {readingGoal} books read</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="progress-bar-bg">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <p className="goal-status-text">
                        {books.length >= readingGoal
                            ? 'Milestone achieved for the current period.'
                            : `${readingGoal - books.length} books remaining to reach your target.`}
                    </p>
                </div>

                {/* Literary Quote Card */}
                <div className="glass-card quote-card">
                    <div className="card-header">
                        <BookOpen size={18} color="var(--secondary)" />
                        <h3>Literary Highlight</h3>
                    </div>
                    <blockquote className="quote-text">
                        "A reader lives a thousand lives before he dies. The man who never reads lives only one."
                    </blockquote>
                    <cite className="quote-author">— George R.R. Martin</cite>

                    {/* Quick Category Chips */}
                    <div className="category-chips">
                        <span className="chips-label">Browse by genre:</span>
                        <div className="chips-list">
                            {['Fiction', 'Technology', 'Science', 'History', 'Business'].map(cat => (
                                <Link key={cat} to={`/library/search?q=${cat}`} className="category-chip">
                                    {cat}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bookshelf Section */}
            <div className="bookshelf-section">
                <div className="section-title-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BookIcon size={20} color="var(--primary)" />
                        <h2>My Bookshelf</h2>
                    </div>
                    <span className="books-count-badge">
                        {books.length} {books.length === 1 ? 'Book' : 'Books'}
                    </span>
                </div>

                {books.length === 0 ? (
                    <div className="glass-card empty-state">
                        <BookOpen size={40} color="var(--text-dim)" style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
                        <h3>No Borrowed Books</h3>
                        <p>You do not currently have any active loans.</p>
                        <Link to="/library/search" className="btn-primary" style={{ marginTop: '1rem' }}>
                            Browse Catalog
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="bookshelf-grid">
                            {currentBooks.map((book, idx) => {
                                const due = new Date(book.due_date);
                                const isOverdue = due < new Date();
                                const displayTitle = book.title || book.book_title;
                                const displayCover = book.cover_url || book.book_cover;
                                const displayAuthor = book.author || 'Unknown Author';

                                return (
                                    <div key={idx} className="glass-card book-card hover-lift">
                                        {isOverdue && (
                                            <div className="status-badge overdue">
                                                <AlertCircle size={10} /> Overdue
                                            </div>
                                        )}
                                        <div className="book-cover-wrap">
                                            <img
                                                src={displayCover || 'https://placehold.co/150x220/1e2634/94a3b8?text=No+Cover'}
                                                onError={(e) => { e.target.src = "https://placehold.co/150x220/1e2634/94a3b8?text=No+Cover"; }}
                                                alt={displayTitle}
                                                className="book-cover-img"
                                                loading="lazy"
                                            />
                                        </div>
                                        <div className="book-info">
                                            <h4 className="book-title" title={displayTitle}>
                                                {displayTitle}
                                            </h4>
                                            <p className="book-author">
                                                {displayAuthor}
                                            </p>
                                            <div className="book-footer">
                                                <span className={`due-tag ${isOverdue ? 'overdue' : 'active'}`}>
                                                    <Calendar size={11} />
                                                    {isOverdue ? `Due ${due.toLocaleDateString()}` : `Due: ${due.toLocaleDateString()}`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

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

// Main Dashboard Wrapper
const Dashboard = ({ user }) => {
    const [stats, setStats] = useState(null);
    const [bookshelf, setBookshelf] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                if (user?.is_admin) {
                    const res = await api.get('/admin/stats');
                    setStats(res.data);
                } else {
                    const res = await api.get('/books/bookshelf');
                    setBookshelf(res.data);
                }
            } catch (err) {
                console.error("Dashboard data load error", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    if (loading) {
        return <div className="loading">Loading dashboard...</div>;
    }

    return (
        <div className="dashboard-page">
            {user?.is_admin ? (
                <AdminDashboard stats={stats || {}} />
            ) : (
                <EmployeeDashboard user={user} bookshelf={bookshelf} />
            )}

            <style>{`
                .dashboard-page {
                    padding-bottom: 2rem;
                }

                .dashboard-kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .kpi-card {
                    padding: 1.15rem 1.25rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .kpi-icon-wrap {
                    width: 44px;
                    height: 44px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .kpi-data {
                    display: flex;
                    flex-direction: column;
                }

                .kpi-label {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                }

                .kpi-value {
                    font-size: 1.6rem;
                    font-weight: 800;
                    color: var(--text-main);
                    line-height: 1.2;
                }

                .dashboard-charts-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
                    gap: 1.25rem;
                    margin-bottom: 2rem;
                }

                .chart-card {
                    padding: 1.25rem;
                }

                .chart-wrapper {
                    height: 260px;
                    width: 100%;
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                }

                .card-header h3 {
                    font-size: 1.05rem;
                    font-weight: 600;
                }

                .welcome-banner {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.75rem 2rem;
                    margin-bottom: 1.5rem;
                    gap: 1.25rem;
                }

                .welcome-info h1 {
                    font-size: 1.85rem;
                    margin-bottom: 0.25rem;
                }

                .welcome-info p {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }

                .insights-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1.25rem;
                    margin-bottom: 2rem;
                }

                .reading-goal-card, .quote-card {
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                }

                .goal-counter {
                    display: flex;
                    align-items: baseline;
                    gap: 0.4rem;
                    margin-bottom: 0.75rem;
                }

                .goal-number {
                    font-size: 2.4rem;
                    font-weight: 800;
                    color: var(--primary);
                    line-height: 1;
                }

                .goal-total {
                    font-size: 0.9rem;
                    color: var(--text-muted);
                    font-weight: 500;
                }

                .progress-bar-bg {
                    width: 100%;
                    height: 7px;
                    background: rgba(255, 255, 255, 0.06);
                    border-radius: var(--radius-full);
                    margin-bottom: 0.75rem;
                    overflow: hidden;
                }

                .progress-bar-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #10b981 0%, #14b8a6 100%);
                    border-radius: var(--radius-full);
                    transition: width 0.8s ease-out;
                }

                .goal-status-text {
                    font-size: 0.82rem;
                    color: var(--text-muted);
                    margin-top: auto;
                }

                .quote-text {
                    font-style: italic;
                    color: var(--text-main);
                    font-size: 0.98rem;
                    line-height: 1.45;
                    margin-bottom: 0.35rem;
                }

                .quote-author {
                    font-size: 0.82rem;
                    color: var(--text-muted);
                    margin-bottom: 1.25rem;
                    display: block;
                }

                .category-chips {
                    margin-top: auto;
                }

                .chips-label {
                    display: block;
                    font-size: 0.78rem;
                    color: var(--text-dim);
                    margin-bottom: 0.45rem;
                }

                .chips-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.35rem;
                }

                .category-chip {
                    text-decoration: none;
                    padding: 4px 10px;
                    border-radius: var(--radius-full);
                    font-size: 0.76rem;
                    font-weight: 500;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid var(--glass-border);
                    color: var(--text-main);
                    transition: all 0.2s ease;
                }

                .category-chip:hover {
                    background: rgba(16, 185, 129, 0.15);
                    border-color: rgba(16, 185, 129, 0.3);
                    color: var(--primary);
                }

                .bookshelf-section {
                    margin-top: 0.5rem;
                }

                .section-title-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.25rem;
                }

                .books-count-badge {
                    font-size: 0.75rem;
                    font-weight: 600;
                    padding: 3px 9px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-full);
                    color: var(--text-muted);
                }

                .empty-state {
                    text-align: center;
                    padding: 3.5rem 1.5rem;
                }

                .empty-state h3 {
                    font-size: 1.2rem;
                    margin-bottom: 0.4rem;
                }

                .empty-state p {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }

                .bookshelf-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 1.25rem;
                    margin-bottom: 1.5rem;
                }

                .book-card {
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                }

                .status-badge.overdue {
                    position: absolute;
                    top: 0.65rem;
                    right: 0.65rem;
                    background: rgba(239, 68, 68, 0.95);
                    color: #ffffff;
                    padding: 2px 7px;
                    border-radius: 4px;
                    font-size: 0.68rem;
                    font-weight: 700;
                    display: inline-flex;
                    align-items: center;
                    gap: 3px;
                    z-index: 2;
                }

                .book-cover-wrap {
                    height: 200px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-bottom: 0.75rem;
                    background: rgba(0, 0, 0, 0.25);
                    border-radius: 6px;
                    padding: 6px;
                }

                .book-cover-img {
                    max-height: 100%;
                    max-width: 100%;
                    object-fit: contain;
                    border-radius: 4px;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                }

                .book-title {
                    font-size: 0.9rem;
                    font-weight: 600;
                    line-height: 1.3;
                    margin-bottom: 0.25rem;
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    min-height: 2.6em;
                }

                .book-author {
                    font-size: 0.78rem;
                    color: var(--text-muted);
                    margin-bottom: 0.5rem;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .book-footer {
                    margin-top: auto;
                    padding-top: 0.6rem;
                    border-top: 1px solid var(--glass-border);
                }

                .due-tag {
                    font-size: 0.74rem;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                }

                .due-tag.active {
                    color: var(--warning);
                }

                .due-tag.overdue {
                    color: var(--danger);
                }

                /* Mobile Optimizations */
                @media (max-width: 768px) {
                    .dashboard-kpi-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 0.75rem;
                    }

                    .kpi-card {
                        padding: 0.85rem 1rem;
                        gap: 0.75rem;
                    }

                    .kpi-icon-wrap {
                        width: 36px;
                        height: 36px;
                        border-radius: 8px;
                    }

                    .kpi-value {
                        font-size: 1.35rem;
                    }

                    .dashboard-charts-grid {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }

                    .chart-wrapper {
                        height: 220px;
                    }

                    .welcome-banner {
                        flex-direction: column;
                        align-items: flex-start;
                        padding: 1.25rem;
                        gap: 1rem;
                    }

                    .welcome-info h1 {
                        font-size: 1.45rem;
                    }

                    .browse-btn {
                        width: 100%;
                    }

                    .insights-grid {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }

                    .bookshelf-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 0.75rem;
                    }

                    .book-card {
                        padding: 0.75rem;
                    }

                    .book-cover-wrap {
                        height: 155px;
                        margin-bottom: 0.5rem;
                    }

                    .book-title {
                        font-size: 0.82rem;
                    }

                    .book-author {
                        font-size: 0.74rem;
                    }
                }

                @media (max-width: 380px) {
                    .dashboard-kpi-grid {
                        grid-template-columns: 1fr;
                    }

                    .bookshelf-grid {
                        grid-template-columns: 1fr;
                    }

                    .book-cover-wrap {
                        height: 180px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;