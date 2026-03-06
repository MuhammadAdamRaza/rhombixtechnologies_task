import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ user, isOpen, onClose }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    // `user` prop should contain the decoded JWT payload or AuthContext user object
    const role = user?.role || 'guest';

    const handleLogout = () => {
        logout();
        navigate('/login');
        if (onClose) onClose();
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 text-gray-100 flex flex-col p-5 shadow-2xl transition-transform duration-300 ease-in-out
                lg:relative lg:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold">N</div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-purple-400">
                        NexusBlog
                    </h2>
                </div>

                <nav className="flex flex-col gap-1.5 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                    <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-2 ml-2">Discover</span>

                    {/* Visible to everyone */}
                    <Link to="/" className="flex items-center gap-3 px-3 py-2 text-sm font-medium hover:bg-gray-800 hover:text-indigo-300 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        Home
                    </Link>
                    <Link to="/explore" className="flex items-center gap-3 px-3 py-2 text-sm font-medium hover:bg-gray-800 hover:text-indigo-300 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        Explore
                    </Link>

                    {/* Reader & above authenticated */}
                    {role !== 'guest' && (
                        <div className="mt-4 pt-4 border-t border-gray-800 flex flex-col gap-1.5">
                            <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-2 ml-2">Personal</span>
                            <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-sm font-medium hover:bg-gray-800 hover:text-indigo-300 rounded-lg transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                My Profile
                            </Link>
                            <Link to="/reading-list" className="flex items-center gap-3 px-3 py-2 text-sm font-medium hover:bg-gray-800 hover:text-indigo-300 rounded-lg transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                Reading List
                            </Link>
                        </div>
                    )}

                    {/* Editor & Admin only */}
                    {(role === 'editor' || role === 'admin') && (
                        <div className="mt-4 pt-4 border-t border-gray-800 flex flex-col gap-1.5 shadow-sm">
                            <span className="text-xs text-emerald-500/80 uppercase font-semibold tracking-wider mb-2 ml-2">Creator Hub</span>
                            <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium hover:bg-emerald-900/30 text-emerald-100 hover:text-emerald-300 rounded-lg transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                My Posts
                            </Link>
                            <Link to="/new-post" className="flex items-center gap-3 px-3 py-2 text-sm font-medium hover:bg-emerald-900/30 text-emerald-100 hover:text-emerald-300 rounded-lg transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Create Post
                            </Link>
                            <Link to="/moderate-comments" className="flex items-center gap-3 px-3 py-2 text-sm font-medium hover:bg-emerald-900/30 text-emerald-100 hover:text-emerald-300 rounded-lg transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                Moderate Comments
                            </Link>
                        </div>
                    )}

                    {/* Admin only */}
                    {role === 'admin' && (
                        <div className="mt-4 pt-4 border-t border-gray-800 flex flex-col gap-1.5">
                            <span className="text-xs text-rose-500/80 uppercase font-semibold tracking-wider mb-2 ml-2">Administration</span>
                            <Link to="/admin/users" className="flex items-center gap-3 px-3 py-2 text-sm font-medium hover:bg-rose-900/30 text-rose-100 hover:text-rose-300 rounded-lg transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                Users & Roles
                            </Link>
                            <Link to="/admin/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium hover:bg-rose-900/30 text-rose-100 hover:text-rose-300 rounded-lg transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                Site Settings
                            </Link>
                            <Link to="/admin/audit" className="flex items-center gap-3 px-3 py-2 text-sm font-medium hover:bg-rose-900/30 text-rose-100 hover:text-rose-300 rounded-lg transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                                Audit Logs
                            </Link>
                        </div>
                    )}
                </nav>

                {/* Logout / Login button at the bottom */}
                <div className="mt-8 pt-4 border-t border-gray-800">
                    {role !== 'guest' ? (
                        <div className="flex items-center gap-3 px-2 py-2">
                            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white border border-indigo-400">
                                {user?.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <span className="text-sm font-medium text-white truncate">{user?.username || 'User'}</span>
                                <span className="text-xs text-gray-400 capitalize">{role}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-gray-400 hover:text-white hover:bg-red-500/20 px-3 py-2 rounded-lg transition-colors group"
                            >
                                <svg className="w-5 h-5 group-hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                <span className="text-xs font-bold uppercase tracking-wider group-hover:text-red-400">Sign Out</span>
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-lg transition-colors w-full shadow-lg shadow-indigo-500/20">
                            Sign In
                        </Link>
                    )}
                </div>
                <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #374151;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #4b5563;
                }
            `}</style>
            </aside>
        </>
    );
};

export default Sidebar;
