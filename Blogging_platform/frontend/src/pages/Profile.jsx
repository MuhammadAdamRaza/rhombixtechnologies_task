import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar, Edit3 } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();

    if (!user) return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-700">Loading profile...</h2>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto px-4 py-12">
            <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100 border border-gray-100 overflow-hidden transform transition-all hover:shadow-2xl">
                <div className="bg-linear-to-r from-indigo-600 to-purple-600 h-32 relative">
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 p-1 bg-white rounded-full shadow-lg">
                        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                            <User className="w-12 h-12" />
                        </div>
                    </div>
                </div>

                <div className="pt-16 pb-12 px-8 text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2 uppercase tracking-tight">{user.username}</h1>
                    <div className="inline-flex items-center px-4 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-8 border border-indigo-100">
                        <Shield className="w-3 h-3 mr-1.5" />
                        {user.role.toUpperCase()}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                            <div className="flex items-center text-gray-500 text-sm mb-1">
                                <Mail className="w-4 h-4 mr-2" />
                                Email Address
                            </div>
                            <p className="text-gray-900 font-medium">user@example.com</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                            <div className="flex items-center text-gray-500 text-sm mb-1">
                                <Calendar className="w-4 h-4 mr-2" />
                                Joined Since
                            </div>
                            <p className="text-gray-900 font-medium">{new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="mt-8 text-left">
                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                            <div className="flex items-center text-gray-500 text-sm mb-2">
                                <Edit3 className="w-4 h-4 mr-2" />
                                Bio
                            </div>
                            <p className="text-gray-600 italic">No bio provided yet.</p>
                        </div>
                    </div>

                    <button className="mt-10 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                        Edit Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
