import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import { Menu, X } from 'lucide-react';
import Login from './pages/Login';
import Register from './pages/Register';
import Explore from './pages/Explore';
import ReadingList from './pages/ReadingList';
import ModerateComments from './pages/ModerateComments';
import Dashboard from './pages/Dashboard';
import NewPost from './pages/NewPost';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import Home from './pages/Home';
import AdminUsers from './pages/AdminUsers';
import AdminSettings from './pages/AdminSettings';
import AdminAudit from './pages/AdminAudit';

// Route guards
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />; // Redirect if unauthorized
  }

  return children;
};

// Main layout wrapper
const AppLayout = ({ children }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-white font-sans text-gray-900 overflow-hidden relative">
      <Sidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50">
        {/* Mobile Header - Visible ONLY on small screens */}
        <header className="lg:hidden bg-gray-900 text-white px-4 py-3 flex items-center justify-between border-b border-gray-800 shrink-0 z-30 shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">N</div>
            <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400">NexusBlog</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-800 rounded-xl transition-all active:scale-95"
          >
            <Menu className="w-6 h-6 text-indigo-400" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* App Routes with Layout */}
        <Route path="/*" element={
          <AppLayout>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/post/:id" element={<PostDetail />} />

              {/* Authenticated routes */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/reading-list" element={
                <ProtectedRoute>
                  <ReadingList />
                </ProtectedRoute>
              } />

              {/* Editor/Admin routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['editor', 'admin']}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/new-post" element={
                <ProtectedRoute allowedRoles={['editor', 'admin']}>
                  <NewPost />
                </ProtectedRoute>
              } />
              <Route path="/moderate-comments" element={
                <ProtectedRoute allowedRoles={['editor', 'admin']}>
                  <ModerateComments />
                </ProtectedRoute>
              } />

              {/* Admin only routes */}
              <Route path="/admin/users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminSettings />
                </ProtectedRoute>
              } />
              <Route path="/admin/audit" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAudit />
                </ProtectedRoute>
              } />
            </Routes>
          </AppLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;