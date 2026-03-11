import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { FiUsers, FiUserCheck, FiDollarSign, FiZap, FiCalendar, FiBell, FiEdit2, FiCheck } from 'react-icons/fi';
import { GiCricketBat, GiTrophy } from 'react-icons/gi';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [upiId, setUpiId] = useState('');
    const [editingUpi, setEditingUpi] = useState(false);
    const [savingUpi, setSavingUpi] = useState(false);

    useEffect(() => {
        adminAPI.getDashboard().then(r => setStats(r.data.stats)).finally(() => setLoading(false));
        fetchUpiId();
    }, []);

    const fetchUpiId = async () => {
        try {
            const response = await adminAPI.getUpiId();
            if (response.data.success) {
                setUpiId(response.data.upiId || '');
            }
        } catch (error) {
            console.error('Error fetching UPI ID:', error);
        }
    };

    const handleSaveUpi = async () => {
        if (!upiId.trim()) {
            toast.error('Please enter a valid UPI ID');
            return;
        }
        setSavingUpi(true);
        try {
            await adminAPI.updateUpiId({ upiId });
            toast.success('UPI ID updated successfully');
            setEditingUpi(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update UPI ID');
        } finally {
            setSavingUpi(false);
        }
    };

    const cards = stats ? [
        { label: 'Total Teams', value: stats.totalTeams, icon: FiUsers, color: '#3b82f6', link: '/admin/teams' },
        { label: 'Total Players', value: stats.totalPlayers, icon: GiCricketBat, color: '#d4af37', link: '/admin/players' },
        { label: 'Pending Registrations', value: stats.pendingRegistrations, icon: FiUserCheck, color: '#f97316', link: '/admin/players' },
        { label: 'Sold Players', value: stats.soldPlayers, icon: GiTrophy, color: '#22c55e', link: '/admin/auction' },
        { label: 'Unsold Players', value: stats.unsoldPlayers, icon: GiCricketBat, color: '#ef4444', link: '/admin/auction' },
        { label: 'Revenue', value: `₹${stats.revenue || 0}`, icon: FiDollarSign, color: '#a78bfa', link: '/admin/payments' },
        { label: 'Upcoming Matches', value: stats.upcomingMatches, icon: FiCalendar, color: '#06b6d4', link: '/admin/matches' },
        { label: 'Pending Payments', value: stats.pendingPayments, icon: FiDollarSign, color: '#f59e0b', link: '/admin/payments' },
    ] : [];

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>
                    Dashboard
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    RPL Admin Overview — Statistics
                </p>
            </div>

            {loading ? (
                <div className="loading-screen"><div className="spinner" /></div>
            ) : (
                <>
                    {/* Auction Status */}
                    <div style={{
                        background: stats.auctionStatus === 'live'
                            ? 'rgba(239,68,68,0.08)'
                            : stats.auctionStatus === 'completed'
                                ? 'rgba(34,197,94,0.08)'
                                : 'var(--bg-card)',
                        border: `1px solid ${stats.auctionStatus === 'live' ? 'rgba(239,68,68,0.2)' : stats.auctionStatus === 'completed' ? 'rgba(34,197,94,0.2)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-lg)',
                        padding: '20px 24px',
                        marginBottom: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 12,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <FiZap style={{ fontSize: '1.5rem', color: stats.auctionStatus === 'live' ? 'var(--red)' : 'var(--text-muted)' }} />
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Auction Status</div>
                                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', textTransform: 'uppercase' }}>
                                    {stats.auctionStatus === 'none' ? 'Not Created' : stats.auctionStatus}
                                    {stats.auctionStatus === 'live' && <span className="live-dot" style={{ marginLeft: 8, display: 'inline-block' }} />}
                                </div>
                            </div>
                        </div>
                        <Link to="/admin/auction" className="btn btn-outline btn-sm">Manage Auction</Link>
                    </div>

                    {/* Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                        {cards.map((c, i) => {
                            const Icon = c.icon;
                            return (
                                <Link key={i} to={c.link} style={{ textDecoration: 'none' }}>
                                    <div className="stat-card" style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                                    >
                                        <div style={{
                                            width: 44, height: 44, borderRadius: 10,
                                            background: `${c.color}15`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            marginBottom: 4,
                                        }}>
                                            <Icon style={{ fontSize: '1.3rem', color: c.color }} />
                                        </div>
                                        <div className="stat-value">{c.value}</div>
                                        <div className="stat-label">{c.label}</div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Quick Actions */}
                    <div style={{ marginTop: 32, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20 }}>
                            Quick Actions
                        </h3>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <Link to="/admin/teams" className="btn btn-outline btn-sm"><FiUsers /> Add Team</Link>
                            <Link to="/admin/players" className="btn btn-outline btn-sm"><FiUserCheck /> Review Registrations</Link>
                            <Link to="/admin/auction" className="btn btn-outline btn-sm"><FiZap /> Manage Auction</Link>
                            <Link to="/admin/payments" className="btn btn-outline btn-sm"><FiDollarSign /> View Payments</Link>
                            <Link to="/admin/matches" className="btn btn-outline btn-sm"><FiCalendar /> Add Match</Link>
                            <Link to="/admin/announcements" className="btn btn-outline btn-sm"><FiBell /> Post Announcement</Link>
                        </div>
                    </div>

                    {/* UPI Settings */}
                    <div style={{ marginTop: 24, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20 }}>
                            Payment Settings
                        </h3>
                        <div style={{ maxWidth: 500 }}>
                            <label className="form-label" style={{ marginBottom: 8 }}>UPI ID for Player Registration</label>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="yourname@paytm"
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    disabled={!editingUpi}
                                    style={{ flex: 1 }}
                                />
                                {editingUpi ? (
                                    <>
                                        <button 
                                            className="btn btn-primary btn-sm" 
                                            onClick={handleSaveUpi}
                                            disabled={savingUpi}
                                        >
                                            <FiCheck /> {savingUpi ? 'Saving...' : 'Save'}
                                        </button>
                                        <button 
                                            className="btn btn-outline btn-sm" 
                                            onClick={() => {
                                                setEditingUpi(false);
                                                fetchUpiId();
                                            }}
                                            disabled={savingUpi}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        className="btn btn-outline btn-sm" 
                                        onClick={() => setEditingUpi(true)}
                                    >
                                        <FiEdit2 /> Edit
                                    </button>
                                )}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
                                This UPI ID will be used to generate QR code on the player registration page
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
