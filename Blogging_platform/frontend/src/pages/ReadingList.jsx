import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Clock, User, Trash2, BookOpen } from 'lucide-react';
import api from '../services/api';

const ReadingList = () => {
    const [savedPosts, setSavedPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReadingList = async () => {
            try {
                // Assuming we have an endpoint for reading list, or we fetch from localStorage
                // For this demo, we'll fetch from a hypothetical endpoint or just mock it
                // Actually, let's look if the backend has a Like/Bookmark model.
                // It has a 'Like' model. Let's use that as the reading list for now.
                const response = await api.get('/posts/liked');
                setSavedPosts(response.data.posts || []);
            } catch (error) {
                console.error("Failed to fetch reading list:", error);
                // Fallback to empty if endpoint doesn't exist yet
                setSavedPosts([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReadingList();
    }, []);

    const handleRemove = async (postId) => {
        try {
            await api.post(`/posts/${postId}/like`); // Toggle like/bookmark
            setSavedPosts(savedPosts.filter(p => p.id !== postId));
        } catch (err) {
            console.error("Failed to remove from reading list", err);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Bookmark className="text-indigo-500" fill="currentColor" />
                    My Reading List
                </h1>
                <p className="text-gray-500 mt-2">All the articles you've saved to read later.</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                </div>
            ) : savedPosts.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {savedPosts.map(post => (
                        <div key={post.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-6 hover:shadow-md transition-shadow group">
                            <div className="w-32 h-32 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                                {post.image_url ? (
                                    <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-indigo-200">
                                        <BookOpen size={32} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{post.category || 'General'}</span>
                                        <button
                                            onClick={() => handleRemove(post.id)}
                                            className="text-gray-300 hover:text-red-500 transition-colors"
                                            title="Remove from list"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <Link to={`/post/${post.slug}`} className="text-xl font-bold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2">
                                        {post.title}
                                    </Link>
                                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">{post.excerpt}</p>
                                </div>
                                <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <User size={14} />
                                        <span>{post.author.username}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock size={14} />
                                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bookmark size={32} className="text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Your list is empty</h3>
                    <p className="text-gray-500 max-w-xs mx-auto mb-8">
                        Explore articles and click the bookmark icon to save them here for later.
                    </p>
                    <Link to="/explore" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
                        Explore Articles
                    </Link>
                </div>
            )}
        </div>
    );
};

export default ReadingList;
