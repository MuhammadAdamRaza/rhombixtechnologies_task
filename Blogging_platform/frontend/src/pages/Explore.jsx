import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Clock, User } from 'lucide-react';
import api from '../services/api';

const Explore = () => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

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

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-10 flex flex-col items-center justify-center text-center py-12 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                    Explore NexusBlog
                </h1>
                <p className="text-lg text-gray-500 max-w-2xl mb-8">
                    Browse through our collection of technical articles and insights.
                </p>

                <div className="relative w-full max-w-xl px-4">
                    <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search articles, keywords..."
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-64 shrink-0">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-8">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Filter size={16} className="text-indigo-500" />
                            Categories
                        </h3>
                        <div className="space-y-2">
                            {['All', 'Technical', 'Thoughts', 'Tutorials'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat
                                            ? 'bg-indigo-50 text-indigo-700 font-bold'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : filteredPosts.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {filteredPosts.map(post => (
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
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                            {post.title}
                                        </h3>
                                        <div className="text-gray-500 text-sm mb-4 line-clamp-3" dangerouslySetInnerHTML={{ __html: post.excerpt }} />
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-gray-400" />
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
                            <p className="text-gray-500">No matching posts found. Try a different search term.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Explore;
