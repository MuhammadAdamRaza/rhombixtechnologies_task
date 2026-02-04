import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import History from './pages/History';
import AdminImport from './pages/AdminImport';
import AdminBooks from './pages/AdminBooks';
import AdminGoogleBooks from './pages/AdminGoogleBooks';
import api from './services/api';

const NavigateWithQuery = ({ to }) => {
  const { search } = useLocation();
  return <Navigate to={to + search} replace />;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error("Auth failed", err);
          localStorage.clear();
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <Router>
      <div className="app-container">
        {user && <Navbar user={user} setUser={setUser} />}
        <main className="content">
          <Routes>
            <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to={user.is_admin ? "/admin/dashboard" : "/dashboard"} />} />
            <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
            <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/" />} />

            <Route path="/" element={user ? <Navigate to={user.is_admin ? "/admin/dashboard" : "/dashboard"} /> : <Navigate to="/login" />} />

            {/* Employee Dashboard */}
            <Route path="/dashboard" element={user && !user.is_admin ? <Dashboard user={user} /> : <Navigate to="/" />} />

            <Route path="/admin/dashboard" element={user?.is_admin ? <Dashboard user={user} /> : <Navigate to="/" />} />
            <Route path="/library/search" element={user ? <Search /> : <Navigate to="/login" />} />
            <Route path="/search" element={<NavigateWithQuery to="/library/search" />} />

            <Route path="/history" element={user ? <History /> : <Navigate to="/login" />} />

            {/* Admin Routes */}
            <Route path="/admin/books" element={user?.is_admin ? <AdminBooks /> : <Navigate to="/" />} />
            <Route path="/admin/google-books" element={user?.is_admin ? <AdminGoogleBooks /> : <Navigate to="/" />} />
            <Route path="/admin/import" element={user?.is_admin ? <AdminImport /> : <Navigate to="/" />} />
          </Routes>
        </main>

        {/* Footer */}
        {user && (
          <footer style={{
            padding: '2rem',
            textAlign: 'center',
            borderTop: '1px solid var(--glass-border)',
            background: 'var(--glass)',
            marginTop: 'auto'
          }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.2rem' }}>📚 BookHive</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              © {new Date().getFullYear()} BookHive. All Rights Reserved.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
              Smart Library Management System
            </p>
          </footer>
        )}
      </div>
    </Router>
  );
}

export default App;
