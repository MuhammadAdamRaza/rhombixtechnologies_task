import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { BookMarked, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

const Login = ({ setUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('access_token', res.data.access_token);
            localStorage.setItem('refresh_token', res.data.refresh_token);
            setUser(res.data.user);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-container animate-fade">
            <div className="glass-card auth-card">
                <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                    <div className="auth-icon-wrap">
                        <BookMarked size={28} />
                    </div>
                    <h1 style={{ fontSize: '1.65rem', marginBottom: '0.25rem' }}>Account Sign In</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Access BookHive Library Management</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                            Email Address
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                            <input
                                type="email"
                                className="input-field"
                                style={{ paddingLeft: '40px' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                Password
                            </label>
                            <Link to="/forgot-password" style={{ color: 'var(--primary)', fontSize: '0.78rem', textDecoration: 'none', fontWeight: 500 }}>
                                Forgot password?
                            </Link>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                            <input
                                type="password"
                                className="input-field"
                                style={{ paddingLeft: '40px' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{ padding: '0.7rem', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--danger)', fontSize: '0.82rem' }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.25rem', width: '100%', padding: '11px' }}>
                        {loading ? <Loader2 size={16} className="spin" /> : <><span>Sign In</span> <ArrowRight size={15} /></>}
                    </button>
                </form>

                <div style={{ marginTop: '1.75rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.15rem' }}>
                    <p>New to BookHive? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Create an account</Link></p>
                </div>
            </div>

            <style>{`
                .auth-page-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: calc(100vh - 120px);
                    padding: 2rem 1rem;
                }

                .auth-card {
                    padding: 2.5rem;
                    width: 100%;
                    max-width: 420px;
                    border: 1px solid var(--border-light);
                }

                .auth-icon-wrap {
                    display: inline-flex;
                    padding: 10px;
                    background: rgba(16, 185, 129, 0.1);
                    border: 1px solid rgba(16, 185, 129, 0.25);
                    borderRadius: 12px;
                    marginBottom: 0.75rem;
                    color: var(--primary);
                }

                @media (max-width: 480px) {
                    .auth-page-container {
                        padding: 1rem 0.5rem;
                    }

                    .auth-card {
                        padding: 1.5rem 1.15rem;
                        border-radius: 12px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Login;
