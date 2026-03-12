import { useState, useEffect } from 'react';
import { teamsAPI } from '../../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../utils/imageUrl';

const emptyForm = { name: '', captainName: '', purse: 10000000, color: '#ffffff', description: '' };

const AdminTeams = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [logo, setLogo] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const fetch = () => {
        setLoading(true);
        teamsAPI.getAll().then(r => setTeams(r.data.teams || [])).finally(() => setLoading(false));
    };
    useEffect(fetch, []);

    const openModal = (team = null) => {
        setEditing(team?._id || null);
        setForm(team ? { name: team.name, captainName: team.captainName || '', purse: team.purse, color: team.color || '#ffffff', description: team.description || '' } : emptyForm);
        setLogo(null);
        setModal(true);
    };

    const closeModal = () => setModal(false);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const data = new FormData();
            Object.keys(form).forEach(k => data.append(k, form[k]));
            if (logo) data.append('logo', logo);
            if (editing) { await teamsAPI.update(editing, data); toast.success('Team updated!'); }
            else { await teamsAPI.create(data); toast.success('Team created!'); }
            closeModal();
            fetch();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error saving team');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await teamsAPI.delete(id);
            toast.success('Team deleted');
            setDeleteId(null);
            fetch();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Teams</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{teams.length} teams registered</p>
                </div>
                <button className="btn btn-primary" onClick={() => openModal()} id="add-team-btn">
                    <FiPlus /> Add Team
                </button>
            </div>

            {loading ? <div className="loading-screen"><div className="spinner" /></div> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                    {teams.map(team => {
                        const logo = getImageUrl(team.logo);
                        return (
                            <div key={team._id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                                <div style={{ height: 8, background: team.color || '#fff' }} />
                                <div style={{ padding: 20 }}>
                                    <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
                                        {logo ? (
                                            <img src={logo} style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 10, background: 'var(--bg-elevated)', padding: 4, border: '1px solid var(--border)' }} alt="" />
                                        ) : (
                                            <div style={{ width: 56, height: 56, background: 'var(--bg-elevated)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '1.4rem', border: '1px solid var(--border)' }}>
                                                {team.shortName?.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, textTransform: 'uppercase' }}>{team.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{team.shortName} • {team.players?.length || 0} players</div>
                                            {team.captainName && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>👑 {team.captainName}</div>}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                                        <span>Purse: ₹{(team.purse / 100000).toFixed(0)}L</span>
                                        <span style={{ color: 'var(--gold)' }}>Rem: ₹{((team.purse - team.purseSpent) / 100000).toFixed(1)}L</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => openModal(team)}>
                                            <FiEdit2 /> Edit
                                        </button>
                                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(team._id)} id={`delete-team-${team._id}`}>
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {teams.length === 0 && <div className="empty-state"><div className="empty-icon">🏏</div><h3>No Teams Yet</h3><p>Add the first team!</p></div>}
                </div>
            )}

            {/* Modal */}
            {modal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
                    <div className="modal">
                        <div className="modal-header">
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: 2 }}>
                                {editing ? 'Edit Team' : 'Add Team'}
                            </h3>
                            <button className="modal-close" onClick={closeModal}><FiX /></button>
                        </div>
                        <form onSubmit={handleSave} id="team-form">
                            <div className="form-group">
                                <label className="form-label" htmlFor="t-name">Team Name *</label>
                                <input id="t-name" className="form-control" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Rajivnagar Lions" />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="t-cap">Captain Name</label>
                                    <input id="t-cap" className="form-control" value={form.captainName} onChange={e => setForm(f => ({ ...f, captainName: e.target.value }))} placeholder="Captain name" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="t-purse">Purse (₹)</label>
                                    <input id="t-purse" className="form-control" type="number" value={form.purse} onChange={e => setForm(f => ({ ...f, purse: Number(e.target.value) }))} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="t-color">Team Color</label>
                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                        <input id="t-color" type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ width: 48, height: 40, border: '1px solid var(--border)', borderRadius: 8, background: 'none', padding: 4, cursor: 'pointer' }} />
                                        <input className="form-control" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ flex: 1 }} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="t-logo">Team Logo</label>
                                    <input id="t-logo" type="file" accept="image/*" className="form-control" onChange={e => setLogo(e.target.files[0])} style={{ padding: 8 }} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="t-desc">Description</label>
                                <textarea id="t-desc" className="form-control" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Team description..." />
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving} id="save-team-btn">
                                    {saving ? 'Saving...' : <><FiCheck /> Save</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {deleteId && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: 360, textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', marginBottom: 12 }}>⚠️</div>
                        <h3 style={{ marginBottom: 8 }}>Delete Team?</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 24 }}>This will unassign all players from this team. This action cannot be undone.</p>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setDeleteId(null)}>Cancel</button>
                            <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => handleDelete(deleteId)}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTeams;
