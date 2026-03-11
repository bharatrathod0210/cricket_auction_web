import { createContext, useContext, useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('rpl_token');
        const storedAdmin = localStorage.getItem('rpl_admin');
        if (token && storedAdmin) {
            setAdmin(JSON.parse(storedAdmin));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const res = await adminAPI.login({ email, password });
        const { token, admin } = res.data;
        localStorage.setItem('rpl_token', token);
        localStorage.setItem('rpl_admin', JSON.stringify(admin));
        setAdmin(admin);
        return admin;
    };

    const logout = () => {
        localStorage.removeItem('rpl_token');
        localStorage.removeItem('rpl_admin');
        setAdmin(null);
    };

    return (
        <AuthContext.Provider value={{ admin, login, logout, loading, isAuthenticated: !!admin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export default AuthContext;
