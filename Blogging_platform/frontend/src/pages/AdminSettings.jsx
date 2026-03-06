import React, { useState, useEffect } from 'react';
import { Save, Shield, Globe, Bell, Mail, Loader2, Info } from 'lucide-react';

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        siteName: 'NexusBlog',
        siteDescription: 'The premium platform for creators.',
        maintenanceMode: false,
        allowRegistration: true,
        requireEmailVerification: false,
        maxPostLength: 50000,
        defaultUserRole: 'reader',
        adminEmail: 'admin@nexusblog.co'
    });

    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });
    const [activeTab, setActiveTab] = useState('general');

    // Simulate loading settings from a backend or local storage
    useEffect(() => {
        const savedSettings = localStorage.getItem('nexus_admin_settings');
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveMessage({ type: '', text: '' });

        // Simulate network request
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            localStorage.setItem('nexus_admin_settings', JSON.stringify(settings));
            setSaveMessage({ type: 'success', text: 'Settings successfully saved and applied.' });
        } catch (err) {
            setSaveMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveMessage({ type: '', text: '' }), 4000);
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: <Globe size={18} /> },
        { id: 'security', label: 'Security & Access', icon: <Shield size={18} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    ];

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-[calc(100vh-4rem)] animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-xl">
                            <Save className="text-indigo-600 w-6 h-6" />
                        </div>
                        Platform Settings
                    </h1>
                    <p className="text-gray-500 text-sm font-medium">Configure global site parameters and access controls</p>
                </div>

                <div className="flex items-center gap-4">
                    {saveMessage.text && (
                        <div className={`px-4 py-2 rounded-lg text-sm font-semibold animate-in slide-in-from-right-4 duration-300 ${saveMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                            {saveMessage.text}
                        </div>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 shadow-lg shadow-indigo-600/20 font-bold text-sm tracking-wide disabled:opacity-70"
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                {/* Tabs / Sidebar Nav */}
                <div className="md:col-span-3 space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === tab.id
                                    ? 'bg-white text-indigo-600 shadow-sm border border-gray-100'
                                    : 'text-gray-500 hover:bg-gray-100/50 hover:text-gray-700'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}

                    <div className="mt-8 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50 hidden md:block">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-indigo-900/70 font-medium leading-relaxed">
                                Settings changes are applied globally and may take a few moments to propagate across all edge servers.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Settings Panels */}
                <div className="md:col-span-9 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">

                    {/* General Settings */}
                    {activeTab === 'general' && (
                        <div className="p-8 space-y-8 animate-in fade-in duration-300">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-1">General Intelligence</h2>
                                <p className="text-sm text-gray-500 mb-6">Basic configuration for the Nexus platform.</p>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 block">Site Name</label>
                                            <input
                                                type="text"
                                                name="siteName"
                                                value={settings.siteName}
                                                onChange={handleInputChange}
                                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 block">Administrator Contact</label>
                                            <input
                                                type="email"
                                                name="adminEmail"
                                                value={settings.adminEmail}
                                                onChange={handleInputChange}
                                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 block">Site Meta Description</label>
                                        <textarea
                                            name="siteDescription"
                                            value={settings.siteDescription}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium resize-none"
                                        />
                                        <p className="text-xs text-gray-400">This description appears in search engine results and social media cards.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Settings */}
                    {activeTab === 'security' && (
                        <div className="p-8 space-y-8 animate-in fade-in duration-300">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-1">Access & Security</h2>
                                <p className="text-sm text-gray-500 mb-6">Control who can access and join the platform.</p>

                                <div className="space-y-6">
                                    {/* Toggle: Maintenance Mode */}
                                    <div className="flex items-center justify-between p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 mb-1">Maintenance Mode</p>
                                            <p className="text-xs text-gray-500">Temporarily disable public access. Only administrators can log in.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleInputChange} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>

                                    {/* Toggle: Allow Registrations */}
                                    <div className="flex items-center justify-between p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 mb-1">Allow Open Registration</p>
                                            <p className="text-xs text-gray-500">Let anyone create a new account on the platform.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" name="allowRegistration" checked={settings.allowRegistration} onChange={handleInputChange} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>

                                    {/* Select Default Role */}
                                    <div className="space-y-2 pt-4">
                                        <label className="text-sm font-bold text-gray-700 block">Default User Role (upon registration)</label>
                                        <select
                                            name="defaultUserRole"
                                            value={settings.defaultUserRole}
                                            onChange={handleInputChange}
                                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium cursor-pointer"
                                        >
                                            <option value="reader">Reader</option>
                                            <option value="editor">Editor (Creator)</option>
                                            <option value="admin">Administrator</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications Settings */}
                    {activeTab === 'notifications' && (
                        <div className="p-8 space-y-8 animate-in fade-in duration-300">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-1">System Notifications</h2>
                                <p className="text-sm text-gray-500 mb-6">Manage automated emails and alerts.</p>

                                <div className="space-y-6">
                                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
                                        <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                                            <Mail className="w-8 h-8 text-indigo-400" />
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-900 mb-2">Mail Server Not Configured</h3>
                                        <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6 leading-relaxed">
                                            SMTP settings are currently managed via the backend environment variables (.env). This panel is available in the Enterprise tier.
                                        </p>
                                        <button className="px-5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-colors border border-indigo-200/50">
                                            Upgrade to Enterprise
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
