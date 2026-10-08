import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { KeyRound, Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/forgot-password', { email });
            setMessage(res.data.message || 'Password reset instructions dispatched to your email.');
        } catch (err) {
            console.error('Password reset request failed', err);
            setMessage('Unable to process reset request. Please check email address and retry.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-container animate-fade">
            <div className="glass-card auth-card">
                <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                    <div className="auth-icon-wrap">
                        <KeyRound size={28} />
                    </div>
                    <h1 style={{ fontSize: '1.65rem', marginBottom: '0.25rem' }}>Password Recovery</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Enter registered email to reset access</p>
                </div>

                {message ? (
                    <div style={{ textAlign: 'center', padding: '1.25rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                        <CheckCircle size={28} color="var(--success)" style={{ margin: '0 auto 0.5rem' }} />
                        <p style={{ color: 'var(--text-main)', fontSize: '0.88rem', marginBottom: '1rem' }}>{message}</p>
                        <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', width: '100%' }}>
                            Return to Sign In
                        </Link>
                    </div>
                ) : (
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

                        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.25rem', width: '100%', padding: '11px' }}>
                            {loading ? <Loader2 size={16} className="spin" /> : 'Send Recovery Link'}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                            <Link to="/login" style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                <ArrowLeft size={13} /> Back to Sign In
                            </Link>
                        </div>
                    </form>
                )}
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
                    border-radius: 12px;
                    margin-bottom: 0.75rem;
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

export default ForgotPassword;
