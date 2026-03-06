import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useAuth } from '../context/AuthContext';
import { PenTool, Image as ImageIcon, Save, Send, ChevronDown, Rocket, Loader2 } from 'lucide-react';

const NewPost = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const quillRef = useRef(null);

    const [isMounted, setIsMounted] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        published: false,
        image: null,
        category_id: ''
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setIsMounted(true);
        const fetchCategories = async () => {
            try {
                const response = await api.get('/posts/categories');
                setCategories(response.data.categories);
            } catch (err) {
                console.error("Failed to fetch categories", err);
            }
        };
        fetchCategories();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const imageHandler = useCallback(() => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (file) {
                const submitData = new FormData();
                submitData.append('image', file);

                try {
                    setIsUploading(true);
                    const response = await api.post('/posts/upload', submitData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });

                    const quill = quillRef.current.getEditor();
                    const range = quill.getSelection();
                    quill.insertEmbed(range.index, 'image', response.data.url);
                } catch (err) {
                    setError('Failed to upload editor image');
                } finally {
                    setIsUploading(false);
                }
            }
        };
    }, []);

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link', 'image', 'blockquote', 'code-block'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        },
    }), [imageHandler]);

    const handleSubmit = async (e, isPublished) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.content.trim()) {
            setError('Title and content are required.');
            return;
        }

        setError('');
        setIsSubmitting(true);

        const submitData = new FormData();
        submitData.append('title', formData.title);
        submitData.append('content', formData.content);
        submitData.append('published', isPublished);
        if (formData.category_id) {
            submitData.append('category_id', formData.category_id);
        }
        if (formData.image) {
            submitData.append('image', formData.image);
        }

        try {
            await api.post('/posts', submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create post');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen bg-gray-50/30 flex flex-col animate-in fade-in duration-500">
            {/* Header section with refined aesthetics */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <PenTool className="text-emerald-600 w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Draft an Article</h1>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Compose something incredible for the Nexus community</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={(e) => handleSubmit(e, false)}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-gray-700 bg-white border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all duration-200 font-semibold shadow-sm text-sm"
                    >
                        <Save size={18} className="text-gray-400" />
                        Save Draft
                    </button>
                    <button
                        onClick={(e) => handleSubmit(e, true)}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 shadow-xl shadow-indigo-600/20 font-bold text-sm tracking-wide group"
                    >
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Rocket size={18} className="group-hover:-translate-y-0.5 transition-transform" />}
                        {isSubmitting ? 'Publishing...' : 'Publish to Feed'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 text-rose-700 p-4 rounded-xl border border-rose-100 mb-8 flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
                {/* Editor Surface */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Enter a compelling title..."
                            className="w-full text-2xl md:text-5xl font-black bg-transparent border-none outline-none placeholder-gray-200 text-gray-900 focus:ring-0 px-0 transition-all hover:placeholder-gray-300"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                        <div className="w-24 h-1.5 bg-indigo-600 rounded-full" />
                    </div>

                    <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-2xl shadow-indigo-500/5 overflow-hidden flex flex-col min-h-[500px] relative group border-t-4 border-t-indigo-500">
                        {isUploading && (
                            <div className="absolute inset-x-0 top-0 h-1 bg-indigo-100 overflow-hidden z-20">
                                <div className="h-full bg-indigo-600 w-1/3 animate-progress" />
                            </div>
                        )}
                        {isMounted ? (
                            <ReactQuill
                                value={formData.content}
                                onChange={(value) => setFormData({ ...formData, content: value })}
                                modules={modules}
                                placeholder="Start writing your masterpiece..."
                                className="flex-1 p-6 text-lg text-gray-800 bg-transparent border-none outline-none resize-none min-h-[400px]"
                            />

                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-400 font-medium">
                                <Loader2 className="animate-spin mr-3 text-indigo-500" />
                                Initializing workspace...
                            </div>
                        )}
                    </div>
                </div>

                {/* Properties Sidebar */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* Category Selection */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> Topic
                        </h3>
                        <div className="relative group">
                            <select
                                value={formData.category_id}
                                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                className="w-full appearance-none bg-gray-50 border border-gray-100 text-gray-700 text-sm font-bold rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer group-hover:border-indigo-200"
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-indigo-500 transition-colors w-4 h-4" />
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Cover Visual
                        </h3>

                        {imagePreview ? (
                            <div className="relative rounded-2xl overflow-hidden aspect-4/3 border border-gray-100 group shadow-inner">
                                <img src={imagePreview} alt="Cover preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gray-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                                    <label className="cursor-pointer text-white flex flex-col items-center gap-2 scale-90 group-hover:scale-100 transition-transform">
                                        <div className="p-3 bg-white/10 rounded-full border border-white/20">
                                            <ImageIcon size={24} />
                                        </div>
                                        <span className="text-sm font-bold">Replace Visual</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl aspect-4/3 cursor-pointer hover:bg-indigo-50/10 hover:border-indigo-500 transition-all group p-6 text-center animate-pulse">
                                <div className="p-4 bg-gray-50 rounded-full group-hover:bg-indigo-50 transition-colors mb-3">
                                    <ImageIcon size={32} className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
                                </div>
                                <span className="text-sm font-bold text-gray-600 group-hover:text-indigo-600 transition-colors">Add Header Image</span>
                                <p className="text-[10px] text-gray-400 mt-2 font-medium">JPG, PNG or WEBP (Direct from Cloudinary)</p>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                        )}
                        <p className="mt-4 text-[11px] text-gray-400 leading-relaxed font-medium">
                            Premium posts with high-quality headers receive <span className="text-indigo-500 font-bold">3.4x more engagement</span> in the feed.
                        </p>
                    </div>

                    {/* Status Info */}
                    <div className="bg-indigo-900 text-indigo-100 p-6 rounded-3xl shadow-xl shadow-indigo-900/10 hidden lg:block">
                        <h4 className="font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-tighter">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            Live Workspace
                        </h4>
                        <p className="text-xs text-indigo-200 leading-relaxed font-medium opacity-80">
                            Your content is automatically synced with the Nexus platform engines. Ensure you have the rights to use the uploaded media according to our Terms of Service.
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                .ql-container {
                    border-bottom-left-radius: 1.5rem;
                    border-bottom-right-radius: 1.5rem;
                    font-family: 'Inter', sans-serif !important;
                    font-size: 1.1rem !important;
                    color: #1a1a1a !important;
                }
                .ql-toolbar {
                    border-top-left-radius: 1.5rem;
                    border-top-right-radius: 1.5rem;
                    border-top: none !important;
                    border-left: none !important;
                    border-right: none !important;
                    background: #fdfdfd;
                    padding: 1rem !important;
                }
                .ql-editor {
                    padding: 2.5rem !important;
                    min-height: 400px;
                }
                .ql-editor.ql-blank::before {
                    left: 2.5rem !important;
                    font-style: normal;
                    font-weight: 500;
                    color: #d1d5db;
                }
                @keyframes progress {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(300%); }
                }
                .animate-progress {
                    animation: progress 1.5s infinite linear;
                }
            `}</style>
        </div>
    );
};

export default NewPost;
