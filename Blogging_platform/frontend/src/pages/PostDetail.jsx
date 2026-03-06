import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, User, MessageSquare, ThumbsUp, Send, Flag, ArrowLeft } from 'lucide-react';

const PostDetail = () => {
    const { slug } = useParams();
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchPostData = async () => {
            try {
                const response = await api.get(`/posts/${slug}`);
                setPost(response.data.post);
                // Fetch comments after post is loaded
                const commResponse = await api.get(`/comments/post/${response.data.post.id}`);
                setComments(commResponse.data.comments);
            } catch (error) {
                console.error("Error fetching post data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPostData();
    }, [slug]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;

        setIsSubmitting(true);
        try {
            const resp = await api.post('/comments/', {
                post_id: post.id,
                content: newComment
            });
            setComments([resp.data.comment, ...comments]);
            setNewComment('');
        } catch (err) {
            console.error("Failed to post comment:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!post) return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-700">Post not found</h2>
            <Link to="/" className="text-indigo-600 mt-4 inline-block hover:underline">Back to Home</Link>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Link to="/" className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors mb-8 group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Feed
            </Link>

            <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-12">
                {post.image_url && (
                    <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-96 object-cover"
                    />
                )}

                <div className="p-8">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex items-center space-x-6 mb-8 text-sm text-gray-500 pb-8 border-b border-gray-100">
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                                <User className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{post.author.username}</p>
                                <p className="text-xs">{post.author.role}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(post.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center space-x-4 ml-auto">
                            <button className="flex items-center space-x-1 hover:text-indigo-600 transition-colors">
                                <ThumbsUp className="w-5 h-5" />
                                <span>Like</span>
                            </button>
                        </div>
                    </div>

                    <div
                        className="prose prose-indigo max-w-none text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </div>
            </article>

            {/* Comments Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                    <MessageSquare className="w-6 h-6 mr-3 text-indigo-600" />
                    Comments ({comments.length})
                </h3>

                {user ? (
                    <form onSubmit={handleCommentSubmit} className="mb-10">
                        <div className="relative">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Share your thoughts..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 pr-12 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none h-32"
                                required
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting || !newComment.trim()}
                                className="absolute bottom-4 right-4 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-10 text-center">
                        <p className="text-indigo-700">Please <Link to="/login" className="font-bold underline">login</Link> to leave a comment.</p>
                    </div>
                )}

                <div className="space-y-8">
                    {comments.length > 0 ? comments.map((comment) => (
                        <div key={comment.id} className="group pb-8 border-b border-gray-50 last:border-0">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                        <User className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{comment.author.username}</h4>
                                        <p className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                                {(user?.role === 'admin' || user?.role === 'editor') && (
                                    <button className="text-gray-400 hover:text-red-500 transition-colors tooltip" title="Flag comment">
                                        <Flag className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <p className="text-gray-700 pl-11 leading-relaxed">
                                {comment.content}
                            </p>
                        </div>
                    )) : (
                        <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default PostDetail;
