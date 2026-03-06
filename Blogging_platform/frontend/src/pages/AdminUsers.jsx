import React, { useEffect, useState } from 'react';
import api from '../services/api';
// import { Select } from '../components/Select'; // assume a generic select component exists or use native select

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await api.get('/auth/users');
            setUsers(res.data);
        } catch (err) {
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const changeRole = async (userId, newRole) => {
        try {
            await api.put(`/auth/roles/${userId}`, { role: newRole });
            // refresh list
            fetchUsers();
        } catch (err) {
            setError('Failed to update role');
        }
    };

    if (loading) return <div className="p-4">Loading users...</div>;
    if (error) return <div className="p-4 text-rose-600">{error}</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Users &amp; Roles</h1>
            <table className="w-full table-auto bg-white rounded-xl shadow-md overflow-hidden">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 text-left">Username</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Role</th>
                        <th className="px-4 py-2 text-left">Created</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id} className="border-t">
                            <td className="px-4 py-2">{u.username}</td>
                            <td className="px-4 py-2">{u.email}</td>
                            <td className="px-4 py-2">
                                <select
                                    value={u.role}
                                    onChange={e => changeRole(u.id, e.target.value)}
                                    className="border rounded px-2 py-1"
                                >
                                    <option value="admin">admin</option>
                                    <option value="editor">editor</option>
                                    <option value="reader">reader</option>
                                </select>
                            </td>
                            <td className="px-4 py-2">{new Date(u.created_at).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminUsers;
