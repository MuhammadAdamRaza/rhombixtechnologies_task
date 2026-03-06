import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Clock, User } from 'lucide-react';
import api from '../services/api';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await api.get('/posts');
                setPosts(response.data.posts);
            } catch (error) {
                console.error("Failed to fetch posts:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPosts();
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-10 flex flex-col items-center justify-center text-center py-12 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600 mb-4 tracking-tight">
                    Welcome to NexusBlog
                </h1>
                <p className="text-lg text-gray-500 max-w-2xl">
                    Discover insights, thoughts, and technical tutorials crafted by our editors.
                </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full inline-block"></span>
                Latest Posts
            </h2>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map(post => (
                        <Link
                            to={`/post/${post.slug}`}
                            key={post.id}
                            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group"
                        >
                            {post.image_url ? (
                                <div className="h-48 overflow-hidden">
                                    <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                            ) : (
                                <div className="h-48 bg-linear-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                                    <span className="text-indigo-300 font-bold text-xl">NexusBlog</span>
                                </div>
                            )}
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                    {post.title}
                                </h3>
                                <div className="text-gray-500 text-sm mb-4 line-clamp-3 flex-1" dangerouslySetInnerHTML={{ __html: post.excerpt }} />

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                                            <User size={14} className="text-gray-400" />
                                        </div>
                                        <span className="text-xs font-medium text-gray-700">{post.author.username}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                        <Clock size={12} />
                                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <p className="text-gray-500">No posts have been published yet. Be the first!</p>
                </div>
            )}
        </div>
    );
};

export default Home;
