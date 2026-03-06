import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in (e.g., from local storage token)
        const token = localStorage.getItem('token');
        const userDataStr = localStorage.getItem('user');

        if (token && userDataStr) {
            try {
                const userData = JSON.parse(userDataStr);
                setUser(userData);
            } catch (e) {
                console.error("Failed to parse user data from storage", e);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = async () => {
        try {
            if (localStorage.getItem('token')) {
                await api.post('/auth/logout');
            }
        } catch (e) {
            console.error("Failed to call logout endpoint", e);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
