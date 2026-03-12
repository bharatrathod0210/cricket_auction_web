import { useState, useEffect } from 'react';
import { paymentsAPI } from '../../services/api';
import { FiEye, FiCheck, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../utils/imageUrl';

const statusFilters = ['All', 'pending', 'approved', 'rejected'];

const AdminPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [viewImg, setViewImg] = useState(null);
    const [revenue, setRevenue] = useState(null);

    const fetch = () => {
        setLoading(true);
        Promise.all([paymentsAPI.getAll(), paymentsAPI.getRevenue()])
            .then(([p, r]) => {
                setPayments(p.data.payments || []);
                setRevenue(r.data);
            }).finally(() => setLoading(false));
    };
    useEffect(fetch, []);

    const handleUpdate = async (id, status) => {
        try {
            await paymentsAPI.update(id, { status });
            toast.success(`Payment ${status}`);
            fetch();
        } catch { toast.error('Failed to update'); }
    };

    const filtered = payments.filter(p => filter === 'All' || p.status === filter);

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Payments</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Registration fee payments and screenshots</p>
            </div>

            {/* Revenue Cards */}
            {revenue && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
                    {[
                        { label: 'Total Submissions', value: revenue.total, color: '#fff' },
                        { label: 'Approved', value: revenue.approved, color: '#22c55e' },
                        { label: 'Pending', value: revenue.pending, color: '#f59e0b' },
                        { label: 'Rejected', value: revenue.rejected, color: '#ef4444' },
                        { label: 'Revenue', value: `₹${revenue.revenue}`, color: '#d4af37' },
                    ].map((c, i) => (
                        <div key={i} className="stat-card">
                            <div className="stat-value" style={{ color: c.color }}>{c.value}</div>
                            <div className="stat-label">{c.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Filter */}
            <div className="filter-bar" style={{ marginBottom: 24 }}>
                {statusFilters.map(f => (
                    <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)} id={`pay-filter-${f}`}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? <div className="loading-screen"><div className="spinner" /></div> : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Player</th>
                                <th>Amount</th>
                                <th>Screenshot</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No payments found</td></tr>
                            ) : filtered.map(p => (
                                <tr key={p._id}>
                                    <td>
                                        <div style={{ fontWeight: 600, color: '#fff' }}>{p.playerName}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.registration?.mobile}</div>
                                    </td>
                                    <td style={{ color: 'var(--gold)', fontWeight: 600 }}>₹{p.amount}</td>
                                    <td>
                                        <button
                                            className="btn btn-outline btn-sm"
                                            onClick={() => setViewImg(getImageUrl(p.screenshot))}
                                        >
                                            <FiEye /> View
                                        </button>
                                    </td>
                                    <td>
                                        <span className={`badge ${p.status === 'approved' ? 'badge-green' : p.status === 'rejected' ? 'badge-red' : 'badge-gold'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                        {new Date(p.createdAt).toLocaleDateString('en-IN')}
                                    </td>
                                    <td>
                                        {p.status === 'pending' ? (
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button className="btn btn-success btn-sm" onClick={() => handleUpdate(p._id, 'approved')} id={`approve-pay-${p._id}`}><FiCheck /></button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleUpdate(p._id, 'rejected')} id={`reject-pay-${p._id}`}><FiX /></button>
                                            </div>
                                        ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {viewImg && (
                <div className="modal-overlay" onClick={() => setViewImg(null)}>
                    <div style={{ position: 'relative', maxWidth: 480, width: '100%' }}>
                        <button onClick={() => setViewImg(null)} style={{ position: 'absolute', top: -16, right: -16, background: '#000', border: '1px solid var(--border)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>✕</button>
                        <img src={viewImg} alt="Payment" style={{ width: '100%', borderRadius: 16 }} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPayments;
