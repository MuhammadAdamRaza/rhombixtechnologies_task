import React, { useEffect, useState } from 'react';
import api from '../services/api';

const AdminAudit = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchLogs = async () => {
        try {
            const res = await api.get('/admin/audit');
            setLogs(res.data);
        } catch (err) {
            setError('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    if (loading) return <div className="p-4">Loading audit logs...</div>;
    if (error) return <div className="p-4 text-rose-600">{error}</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Audit Logs</h1>
            <table className="w-full table-auto bg-white rounded-xl shadow-md overflow-hidden">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 text-left">ID</th>
                        <th className="px-4 py-2 text-left">User</th>
                        <th className="px-4 py-2 text-left">Action</th>
                        <th className="px-4 py-2 text-left">Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map(log => (
                        <tr key={log.id} className="border-t">
                            <td className="px-4 py-2">{log.id}</td>
                            <td className="px-4 py-2">{log.username || log.user_id}</td>
                            <td className="px-4 py-2">{log.action}</td>
                            <td className="px-4 py-2">{new Date(log.timestamp).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminAudit;
