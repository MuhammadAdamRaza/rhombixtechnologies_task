import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Book, LayoutDashboard, Search, History, LogOut, PlusCircle } from 'lucide-react';
import api from '../services/api';

const Navbar = ({ user, setUser }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.delete('/auth/logout');
        } catch (err) {
            console.error("Logout error", err);
        }
        localStorage.clear();
        setUser(null);
        navigate('/login');
    };

    return (
        <nav className="glass-card" style={{
            margin: '1rem',
            padding: '0.75rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: '1rem',
            zIndex: 100
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Book size={28} color="var(--primary)" />
                <h1 style={{ fontSize: '1.5rem', background: 'linear-gradient(to right, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    BookHive {user.is_admin ? '(Admin)' : ''}
                </h1>
            </div>

            <div className="nav-menu" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <Link to="/" className="nav-link"><LayoutDashboard size={20} /> Dashboard</Link>
                {!user.is_admin && (
                    <Link to="/search" className="nav-link"><Search size={20} /> Search</Link>
                )}
                <Link to="/history" className="nav-link"><History size={20} /> {user.is_admin ? 'Borrow Records' : 'My Bookshelf'}</Link>
                {user.is_admin && (
                    <>
                        <Link to="/admin/books" className="nav-link"><Book size={20} /> Books</Link>
                        <Link to="/admin/google-books" className="nav-link"><Search size={20} /> Browse Google</Link>
                        <Link to="/admin/import" className="nav-link"><PlusCircle size={20} /> Quick Import</Link>
                    </>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600 }}>{user?.email?.split('@')[0] || 'User'}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{user?.role || 'Member'}</p>
                </div>
                <button onClick={handleLogout} className="btn-logout" title="Logout">
                    <LogOut size={20} />
                </button>
            </div>

            <style>{`
        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s;
        }
        .nav-link:hover {
          color: var(--text-main);
        }
        .btn-logout {
          background: none;
          color: var(--text-muted);
          padding: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .btn-logout:hover {
          background: rgba(239, 68, 68, 0.1);
          color: var(--danger);
        }
      `}</style>
        </nav>
    );
};

export default Navbar;
