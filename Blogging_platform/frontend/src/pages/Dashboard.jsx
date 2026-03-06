import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Edit, Trash2, Eye, FileText, PlusCircle } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMyPosts = async () => {
        try {
            // In a real app we might have a specific endpoint for user's posts, 
            // but here we filter from all posts or we can create an endpoint.
            // Currently our get posts only returns published ones. Let's assume we fetch all 
            // of this user's posts. I'll mock the filter or change backend.
            // Since our public get_posts only gets published, we should fetch via a hypothetical 
            // /api/posts/my_posts, OR we can fetch normally and filter for now (not ideal, assuming we add my-posts).
            // Oh wait, our backend GET /api/posts only returns published=True!
            // I will need to use a new backend endpoint or simply show published ones for now unless I update backend.

            const response = await api.get('/posts/my_posts');
            setPosts(response.data.posts);
        } catch (error) {
            console.error("Failed to fetch dashboard posts", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchMyPosts();
        }
    }, [user]);

    const handleDelete = async (postId) => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            try {
                await api.delete(`/posts/${postId}`);
                setPosts(posts.filter(p => p.id !== postId));
            } catch (err) {
                alert("Failed to delete post");
            }
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <FileText className="text-indigo-500" />
                        My Dashboard
                    </h1>
                    <p className="text-gray-500 mt-1">Manage all your articles, drafts, and performance stats here.</p>
                </div>

                <Link
                    to="/new-post"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors font-medium shadow-md shadow-indigo-500/20"
                >
                    <PlusCircle size={18} />
                    New Article
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : posts.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                                    <th className="p-4 font-semibold">Title</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold">Date</th>
                                    <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {posts.map(post => (
                                    <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                {post.image_url ? (
                                                    <img src={post.image_url} alt="" className="w-12 h-12 rounded bg-gray-100 object-cover" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded bg-indigo-50 text-indigo-300 flex items-center justify-center text-xs font-bold">NB</div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900 line-clamp-1">{post.title}</p>
                                                    <a href={`/post/${post.slug}`} className="text-xs text-gray-500 hover:text-indigo-600 transition-colors">/{post.slug}</a>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {post.published ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                    Published
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                                                    Draft
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">
                                            {new Date(post.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-3">
                                                <Link to={`/edit-post/${post.id}`} className="text-gray-400 hover:text-indigo-600 transition-colors p-1" title="Edit">
                                                    <Edit size={18} />
                                                </Link>
                                                <button onClick={() => handleDelete(post.id)} className="text-gray-400 hover:text-red-600 transition-colors p-1" title="Delete">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <FileText size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No articles yet</h3>
                        <p className="text-gray-500 text-sm mb-6 max-w-sm">Get started by crafting your first technical blog post to share with the Nexus community.</p>
                        <Link to="/new-post" className="text-indigo-600 font-medium hover:text-indigo-700">Write an article &rarr;</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
