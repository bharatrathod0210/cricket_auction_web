import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';
import {
    FiGrid, FiUsers, FiUserCheck, FiZap, FiDollarSign,
    FiImage, FiCalendar, FiLogOut, FiMenu, FiX, FiBell
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: FiGrid },
    { to: '/admin/teams', label: 'Teams', icon: FiUsers },
    { to: '/admin/players', label: 'Players', icon: FiUserCheck },
    { to: '/admin/auction', label: 'Auction Control', icon: FiZap },
    { to: '/admin/payments', label: 'Payments', icon: FiDollarSign },
    { to: '/admin/matches', label: 'Matches', icon: FiCalendar },
    { to: '/admin/announcements', label: 'Announcements', icon: FiBell },
];

export const AdminLayout = ({ children }) => {
    const { admin, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        toast.success('Logged out');
        navigate('/admin/login');
    };

    const Sidebar = () => (
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
            {/* Logo */}
            <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img 
                        src={logo} 
                        alt="RPL Logo" 
                        style={{ 
                            width: 90, 
                            height: 70, 
                            objectFit: 'contain',
                            borderRadius: 10 
                        }} 
                    />
                    <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', letterSpacing: 3 }}>RPL</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: 1 }}>ADMIN PANEL</div>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ padding: '16px 12px', flex: 1 }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase', padding: '8px 8px', marginBottom: 8 }}>
                    Navigation
                </div>
                {navItems.map(item => {
                    const isActive = location.pathname === item.to;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setSidebarOpen(false)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '10px 12px',
                                borderRadius: 'var(--radius-sm)',
                                marginBottom: 2,
                                fontSize: '0.875rem',
                                fontWeight: isActive ? 600 : 400,
                                color: isActive ? '#fff' : 'var(--text-secondary)',
                                background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                                transition: 'all 0.15s',
                                textDecoration: 'none',
                            }}
                        >
                            <Icon size={16} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* User / Logout */}
            <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
                <div style={{ padding: '10px 12px', marginBottom: 4, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    👤 {admin?.name}
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--red)',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                    }}
                    id="admin-logout-btn"
                >
                    <FiLogOut size={16} /> Logout
                </button>
            </div>
        </aside>
    );

    return (
        <div className="admin-layout">
            <Sidebar />

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99 }}
                />
            )}

            <div className="admin-main">
                {/* Header */}
                <div style={{
                    height: 60,
                    background: 'var(--bg-secondary)',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 24px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                }}>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', display: 'none', cursor: 'pointer' }}
                        className="admin-menu-btn"
                    >
                        {sidebarOpen ? <FiX /> : <FiMenu />}
                    </button>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        {navItems.find(n => n.to === location.pathname)?.label || 'Admin'}
                    </div>
                    <Link to="/" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
                        ← View Site
                    </Link>
                </div>

                <div className="admin-content">
                    {children}
                </div>
            </div>

            <style>{`
        @media (max-width: 1024px) {
          .admin-menu-btn { display: flex !important; }
        }
      `}</style>
        </div>
    );
};

// Route guard
export const AdminRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
    if (!isAuthenticated) {
        navigate('/admin/login');
        return null;
    }
    return children;
};
