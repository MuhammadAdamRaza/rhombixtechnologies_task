import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookMarked, LayoutDashboard, Search, History, LogOut, PlusCircle, Book, Menu, X, Shield } from 'lucide-react';
import api from '../services/api';

const Navbar = ({ user, setUser }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

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

    const isActive = (path) => {
        if (path === '/' && (location.pathname === '/' || location.pathname === '/dashboard' || location.pathname === '/admin/dashboard')) {
            return true;
        }
        return location.pathname === path;
    };

    const closeMobile = () => setMobileOpen(false);

    return (
        <nav className="glass-card main-navbar">
            <div className="navbar-container">
                {/* Brand Logo */}
                <Link to="/" className="navbar-brand" onClick={closeMobile}>
                    <div className="brand-icon-wrapper">
                        <BookMarked size={22} className="brand-icon" />
                    </div>
                    <div className="brand-text">
                        <span className="brand-title">BookHive</span>
                        {user.is_admin && (
                            <span className="admin-badge">
                                <Shield size={10} /> Admin
                            </span>
                        )}
                    </div>
                </Link>

                {/* Mobile Menu Toggle Button */}
                <button
                    className="mobile-toggle-btn"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle navigation menu"
                >
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>

                {/* Desktop & Mobile Navigation Links */}
                <div className={`nav-menu-wrapper ${mobileOpen ? 'open' : ''}`}>
                    <div className="nav-links">
                        <Link
                            to="/"
                            className={`nav-item ${isActive('/') ? 'active' : ''}`}
                            onClick={closeMobile}
                        >
                            <LayoutDashboard size={18} />
                            <span>Dashboard</span>
                        </Link>

                        {!user.is_admin && (
                            <Link
                                to="/library/search"
                                className={`nav-item ${isActive('/library/search') ? 'active' : ''}`}
                                onClick={closeMobile}
                            >
                                <Search size={18} />
                                <span>Catalog</span>
                            </Link>
                        )}

                        <Link
                            to="/history"
                            className={`nav-item ${isActive('/history') ? 'active' : ''}`}
                            onClick={closeMobile}
                        >
                            <History size={18} />
                            <span>{user.is_admin ? 'Loan Records' : 'My Bookshelf'}</span>
                        </Link>

                        {user.is_admin && (
                            <>
                                <Link
                                    to="/admin/books"
                                    className={`nav-item ${isActive('/admin/books') ? 'active' : ''}`}
                                    onClick={closeMobile}
                                >
                                    <Book size={18} />
                                    <span>Inventory</span>
                                </Link>
                                <Link
                                    to="/admin/google-books"
                                    className={`nav-item ${isActive('/admin/google-books') ? 'active' : ''}`}
                                    onClick={closeMobile}
                                >
                                    <Search size={18} />
                                    <span>Google Books</span>
                                </Link>
                                <Link
                                    to="/admin/import"
                                    className={`nav-item ${isActive('/admin/import') ? 'active' : ''}`}
                                    onClick={closeMobile}
                                >
                                    <PlusCircle size={18} />
                                    <span>Quick Import</span>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* User profile & Logout */}
                    <div className="nav-user-section">
                        <div className="user-details">
                            <span className="user-name">{user?.email?.split('@')[0] || 'User'}</span>
                            <span className="user-role">{user?.is_admin ? 'Administrator' : (user?.role || 'Member')}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="btn-logout"
                            title="Sign out"
                            aria-label="Sign out"
                        >
                            <LogOut size={18} />
                            <span className="logout-text">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .main-navbar {
                    position: sticky;
                    top: 1rem;
                    z-index: 1000;
                    margin: 1rem 1.5rem 0.5rem 1.5rem;
                    padding: 0.65rem 1.25rem;
                    border: 1px solid var(--glass-border);
                    background: rgba(255, 255, 255, 0.96);
                }

                .navbar-container {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    gap: 1.5rem;
                }

                .navbar-brand {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    text-decoration: none;
                    color: var(--text-main);
                }

                .brand-icon-wrapper {
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    background: var(--primary-glow);
                    border: 1px solid var(--primary-border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .brand-icon {
                    color: var(--primary);
                }

                .brand-text {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .brand-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    color: var(--text-main);
                }

                .admin-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 3px;
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    padding: 2px 7px;
                    border-radius: 4px;
                    background: var(--primary-glow);
                    color: var(--primary);
                    border: 1px solid var(--primary-border);
                }

                .mobile-toggle-btn {
                    display: none;
                    background: transparent;
                    color: var(--text-main);
                    padding: 8px;
                    border-radius: 8px;
                    border: 1px solid var(--glass-border);
                }

                .nav-menu-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex: 1;
                    gap: 1.5rem;
                }

                .nav-links {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    padding: 0.5rem 0.85rem;
                    border-radius: 8px;
                    color: var(--text-muted);
                    text-decoration: none;
                    font-size: 0.88rem;
                    font-weight: 500;
                    transition: all 0.2s ease;
                }

                .nav-item:hover {
                    color: var(--text-main);
                    background: #f3f7fa;
                }

                .nav-item.active {
                    color: var(--primary);
                    background: var(--primary-glow);
                    font-weight: 600;
                }

                .nav-user-section {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding-left: 1rem;
                    border-left: 1px solid var(--glass-border);
                }

                .user-details {
                    text-align: right;
                    display: flex;
                    flex-direction: column;
                }

                .user-name {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-main);
                    text-transform: capitalize;
                }

                .user-role {
                    font-size: 0.72rem;
                    color: var(--text-muted);
                }

                .btn-logout {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    background: #f8fafc;
                    border: 1px solid var(--glass-border);
                    color: var(--text-muted);
                    padding: 0.45rem 0.65rem;
                    border-radius: 8px;
                    font-size: 0.82rem;
                }

                .btn-logout:hover {
                    background: rgba(239, 68, 68, 0.12);
                    border-color: rgba(239, 68, 68, 0.3);
                    color: var(--danger);
                }

                .logout-text {
                    display: none;
                }

                @media (max-width: 900px) {
                    .main-navbar {
                        margin: 0.75rem 0.75rem 0.25rem 0.75rem;
                        padding: 0.65rem 1rem;
                    }

                    .mobile-toggle-btn {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .nav-menu-wrapper {
                        position: absolute;
                        top: calc(100% + 0.5rem);
                        left: 0;
                        right: 0;
                        background: #ffffff;
                        backdrop-filter: blur(20px);
                        -webkit-backdrop-filter: blur(20px);
                        border: 1px solid var(--border-light);
                        border-radius: 14px;
                        padding: 1.25rem;
                        flex-direction: column;
                        align-items: stretch;
                        gap: 1.25rem;
                        box-shadow: var(--shadow-lg);
                        display: none;
                    }

                    .nav-menu-wrapper.open {
                        display: flex;
                        animation: fadeIn 0.25s ease-out;
                    }

                    .nav-links {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 0.35rem;
                    }

                    .nav-item {
                        padding: 0.75rem 1rem;
                        font-size: 0.95rem;
                    }

                    .nav-user-section {
                        border-left: none;
                        border-top: 1px solid var(--glass-border);
                        padding-left: 0;
                        padding-top: 1rem;
                        justify-content: space-between;
                    }

                    .user-details {
                        text-align: left;
                    }

                    .logout-text {
                        display: inline;
                    }

                    .btn-logout {
                        padding: 0.5rem 1rem;
                    }
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
