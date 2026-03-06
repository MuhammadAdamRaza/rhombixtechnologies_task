import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, XCircle, Trash2, Clock, User as UserIcon } from 'lucide-react';
import api from '../services/api';

const ModerateComments = () => {
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                // Assuming we have a moderation endpoint
                const response = await api.get('/comments/pending');
                setComments(response.data.comments || []);
            } catch (error) {
                console.error("Failed to fetch pending comments:", error);
                setComments([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchComments();
    }, []);

    const handleApprove = async (commentId) => {
        try {
            await api.put(`/comments/${commentId}/approve`);
            setComments(comments.filter(c => c.id !== commentId));
        } catch (err) {
            alert("Failed to approve comment");
        }
    };

    const handleDelete = async (commentId) => {
        if (window.confirm("Are you sure you want to delete this comment?")) {
            try {
                await api.delete(`/comments/${commentId}`);
                setComments(comments.filter(c => c.id !== commentId));
            } catch (err) {
                alert("Failed to delete comment");
            }
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto h-full flex flex-col">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <MessageSquare className="text-emerald-500" />
                    Comment Moderation
                </h1>
                <p className="text-gray-500 mt-2">Review and approve comments before they appear on the site.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                    </div>
                ) : comments.length > 0 ? (
                    <div className="divide-y divide-gray-100 overflow-y-auto">
                        {comments.map(comment => (
                            <div key={comment.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                                                {comment.author.username[0].toUpperCase()}
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">{comment.author.username}</span>
                                            <span className="text-xs text-gray-400">•</span>
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <Clock size={12} />
                                                {new Date(comment.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                                            "{comment.content}"
                                        </p>
                                        <div className="mt-3">
                                            <span className="text-[10px] text-gray-400 uppercase font-bold">On Article:</span>
                                            <p className="text-xs font-medium text-emerald-600">{comment.post_title}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => handleApprove(comment.id)}
                                            className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                            title="Approve"
                                        >
                                            <CheckCircle size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(comment.id)}
                                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle size={28} className="text-emerald-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Queue Clear!</h3>
                        <p className="text-gray-500 text-sm max-w-xs">There are no pending comments to moderate at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModerateComments;
