import { useState, useEffect } from 'react';
import { playersAPI } from '../../services/api';
import { FiCheck, FiX, FiTrash2, FiEye, FiPlus, FiStar, FiEdit2, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../utils/imageUrl';

const roles = ['Batsman', 'Bowler', 'All Rounder', 'Wicketkeeper'];
const tabs = ['Registrations', 'All Players', 'Add Player'];

const AdminPlayers = () => {
    const [tab, setTab] = useState('Registrations');
    const [registrations, setRegistrations] = useState([]);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewImg, setViewImg] = useState(null);
    const [addForm, setAddForm] = useState({ name: '', mobile: '', email: '', role: '', basePrice: 50000 });
    const [addImage, setAddImage] = useState(null);
    const [saving, setSaving] = useState(false);
    const [editingPlayer, setEditingPlayer] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', mobile: '', email: '', role: '', basePrice: 50000 });
    const [editImage, setEditImage] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [reg, pl] = await Promise.all([
                playersAPI.getRegistrations(),
                playersAPI.getAll({}),
            ]);
            setRegistrations(reg.data.registrations || []);
            setPlayers(pl.data.players || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleApprove = async (id) => {
        try {
            await playersAPI.approve(id);
            toast.success('Player approved and added!');
            fetchData();
        } catch { toast.error('Failed to approve'); }
    };

    const handleReject = async (id) => {
        try {
            await playersAPI.reject(id);
            toast.success('Registration rejected');
            fetchData();
        } catch { toast.error('Failed to reject'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this player?')) return;
        try {
            await playersAPI.delete(id);
            toast.success('Player deleted');
            fetchData();
        } catch { toast.error('Failed to delete'); }
    };

    const handleToggleIcon = async (id) => {
        try {
            const res = await playersAPI.toggleIconPlayer(id);
            toast.success(res.data.message);
            fetchData();
        } catch { toast.error('Failed to toggle icon player'); }
    };

    const handleEditPlayer = (player) => {
        setEditingPlayer(player._id);
        setEditForm({
            name: player.name,
            mobile: player.mobile || '',
            email: player.email || '',
            role: player.role,
            basePrice: player.basePrice
        });
        setEditImage(null);
    };

    const handleUpdatePlayer = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const data = new FormData();
            Object.keys(editForm).forEach(k => data.append(k, editForm[k]));
            if (editImage) data.append('image', editImage);
            await playersAPI.update(editingPlayer, data);
            toast.success('Player updated!');
            setEditingPlayer(null);
            setEditImage(null);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error updating player');
        } finally {
            setSaving(false);
        }
    };

    const handleResetPlayer = async (id, playerName) => {
        if (!window.confirm(`Reset ${playerName}? This will remove team assignment and refund the sold price.`)) return;
        try {
            const res = await playersAPI.resetSinglePlayer(id);
            toast.success(res.data.message);
            fetchData();
        } catch (err) {
            toast.error('Failed to reset player');
        }
    };

    const handleAddPlayer = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const data = new FormData();
            Object.keys(addForm).forEach(k => data.append(k, addForm[k]));
            if (addImage) data.append('image', addImage);
            await playersAPI.addManual(data);
            toast.success('Player added!');
            setAddForm({ name: '', mobile: '', email: '', role: '', basePrice: 50000 });
            setAddImage(null);
            fetchData();
            setTab('All Players');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error adding player');
        } finally {
            setSaving(false);
        }
    };

    const statusBadge = (status) => (
        <span className={`badge ${status === 'approved' ? 'badge-green' : status === 'rejected' ? 'badge-red' : 'badge-gold'}`}>
            {status}
        </span>
    );

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Players</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Manage registrations and player roster</p>
            </div>

            {/* Tabs */}
            <div className="filter-bar" style={{ marginBottom: 24 }}>
                {tabs.map(t => (
                    <button key={t} className={`filter-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} id={`players-tab-${t.toLowerCase().replace(' ', '-')}`}>
                        {t === 'Registrations' ? `📋 ${t} (${registrations.filter(r => r.registrationStatus === 'pending').length})` : t === 'Add Player' ? `➕ ${t}` : `🏏 ${t} (${players.length})`}
                    </button>
                ))}
            </div>

            {loading ? <div className="loading-screen"><div className="spinner" /></div> : (
                <>
                    {/* REGISTRATIONS TAB */}
                    {tab === 'Registrations' && (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Player</th>
                                        <th>Role</th>
                                        <th>Base Price</th>
                                        <th>Mobile</th>
                                        <th>Payment</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registrations.length === 0 ? (
                                        <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No registrations yet</td></tr>
                                    ) : registrations.map(r => (
                                        <tr key={r._id}>
                                            <td>
                                                <div style={{ fontWeight: 600, color: '#fff' }}>{r.fullName}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.email}</div>
                                            </td>
                                            <td><span className="badge badge-white">{r.role}</span></td>
                                            <td style={{ color: 'var(--gold)' }}>₹{(r.basePrice / 1000).toFixed(0)}K</td>
                                            <td>{r.mobile}</td>
                                            <td>
                                                {r.paymentScreenshot ? (
                                                    <button
                                                        className="btn btn-outline btn-sm"
                                                        onClick={() => setViewImg(getImageUrl(r.paymentScreenshot))}
                                                    >
                                                        <FiEye /> View
                                                    </button>
                                                ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>}
                                            </td>
                                            <td>{statusBadge(r.registrationStatus)}</td>
                                            <td>
                                                {r.registrationStatus === 'pending' ? (
                                                    <div style={{ display: 'flex', gap: 6 }}>
                                                        <button className="btn btn-success btn-sm" onClick={() => handleApprove(r._id)} id={`approve-${r._id}`}><FiCheck /></button>
                                                        <button className="btn btn-danger btn-sm" onClick={() => handleReject(r._id)} id={`reject-${r._id}`}><FiX /></button>
                                                    </div>
                                                ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ALL PLAYERS TAB */}
                    {tab === 'All Players' && (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Player</th>
                                        <th>Role</th>
                                        <th>Base Price</th>
                                        <th>Team</th>
                                        <th>Status</th>
                                        <th>Icon</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {players.length === 0 ? (
                                        <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No players yet</td></tr>
                                    ) : players.map(p => {
                                        const img = getImageUrl(p.image);
                                        return (
                                            <tr key={p._id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        {img ? <img src={img} className="avatar" style={{ width: 32, height: 32 }} alt="" /> :
                                                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', border: '1px solid var(--border)' }}>{p.name?.charAt(0)}</div>}
                                                        <span style={{ fontWeight: 600, color: '#fff' }}>{p.name}</span>
                                                    </div>
                                                </td>
                                                <td><span className="badge badge-white">{p.role}</span></td>
                                                <td style={{ color: 'var(--gold)' }}>₹{(p.basePrice / 1000).toFixed(0)}K</td>
                                                <td style={{ color: 'var(--text-secondary)' }}>{p.team?.name || '—'}</td>
                                                <td><span className={`badge ${p.auctionStatus === 'sold' ? 'badge-green' : p.auctionStatus === 'unsold' ? 'badge-red' : 'badge-muted'}`}>{p.auctionStatus}</span></td>
                                                <td>
                                                    <button 
                                                        className={`btn btn-sm ${p.isIconPlayer ? 'btn-primary' : 'btn-outline'}`}
                                                        onClick={() => handleToggleIcon(p._id)}
                                                        id={`icon-player-${p._id}`}
                                                        title={p.isIconPlayer ? 'Remove Icon Player' : 'Mark as Icon Player'}
                                                    >
                                                        <FiStar />
                                                    </button>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: 6 }}>
                                                        {(p.auctionStatus === 'sold' || p.auctionStatus === 'unsold') && (
                                                            <button 
                                                                className="btn btn-outline btn-sm" 
                                                                onClick={() => handleResetPlayer(p._id, p.name)}
                                                                id={`reset-player-${p._id}`}
                                                                title="Reset Player"
                                                            >
                                                                <FiRefreshCw />
                                                            </button>
                                                        )}
                                                        <button 
                                                            className="btn btn-outline btn-sm" 
                                                            onClick={() => handleEditPlayer(p)}
                                                            id={`edit-player-${p._id}`}
                                                            title="Edit Player"
                                                        >
                                                            <FiEdit2 />
                                                        </button>
                                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)} id={`del-player-${p._id}`}><FiTrash2 /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ADD PLAYER TAB */}
                    {tab === 'Add Player' && (
                        <div style={{ maxWidth: 600 }}>
                            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 32 }}>
                                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 24 }}>
                                    Add Player Manually
                                </h3>
                                <form onSubmit={handleAddPlayer} id="add-player-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Player Name *</label>
                                            <input className="form-control" required value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Mobile</label>
                                            <input className="form-control" value={addForm.mobile} onChange={e => setAddForm(f => ({ ...f, mobile: e.target.value }))} placeholder="+91..." />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email</label>
                                        <input className="form-control" type="email" value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} placeholder="player@email.com" />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Role *</label>
                                            <select className="form-control" required value={addForm.role} onChange={e => setAddForm(f => ({ ...f, role: e.target.value }))}>
                                                <option value="">Select Role</option>
                                                {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Base Price (₹) *</label>
                                            <input className="form-control" type="number" required value={addForm.basePrice} onChange={e => setAddForm(f => ({ ...f, basePrice: Number(e.target.value) }))} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Player Photo</label>
                                        <input type="file" accept="image/*" className="form-control" onChange={e => setAddImage(e.target.files[0])} style={{ padding: 8 }} />
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={saving} id="add-player-submit">
                                        {saving ? 'Adding...' : <><FiPlus /> Add Player</>}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Image Preview Modal */}
            {viewImg && (
                <div className="modal-overlay" onClick={() => setViewImg(null)}>
                    <div style={{ position: 'relative', maxWidth: 480, width: '100%' }}>
                        <button
                            onClick={() => setViewImg(null)}
                            style={{ position: 'absolute', top: -16, right: -16, background: '#000', border: '1px solid var(--border)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}
                        >
                            <FiX />
                        </button>
                        <img src={viewImg} alt="Payment Screenshot" style={{ width: '100%', borderRadius: 16, border: '1px solid var(--border)' }} />
                    </div>
                </div>
            )}

            {/* Edit Player Modal */}
            {editingPlayer && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditingPlayer(null)}>
                    <div className="modal">
                        <div className="modal-header">
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: 2 }}>
                                Edit Player
                            </h3>
                            <button className="modal-close" onClick={() => setEditingPlayer(null)}><FiX /></button>
                        </div>
                        <form onSubmit={handleUpdatePlayer} id="edit-player-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Player Name *</label>
                                    <input className="form-control" required value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Mobile</label>
                                    <input className="form-control" value={editForm.mobile} onChange={e => setEditForm(f => ({ ...f, mobile: e.target.value }))} placeholder="+91..." />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input className="form-control" type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} placeholder="player@email.com" />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Role *</label>
                                    <select className="form-control" required value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}>
                                        <option value="">Select Role</option>
                                        {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Base Price (₹) *</label>
                                    <input className="form-control" type="number" required value={editForm.basePrice} onChange={e => setEditForm(f => ({ ...f, basePrice: Number(e.target.value) }))} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Player Photo</label>
                                <input type="file" accept="image/*" className="form-control" onChange={e => setEditImage(e.target.files[0])} style={{ padding: 8 }} />
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditingPlayer(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving} id="update-player-btn">
                                    {saving ? 'Updating...' : <><FiCheck /> Update</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPlayers;
