import { useState, useEffect } from 'react';
import { matchesAPI, teamsAPI } from '../../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiPlay } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const statuses = ['upcoming', 'live', 'completed', 'cancelled'];
const emptyForm = { team1: '', team2: '', team1Name: '', team2Name: '', venue: 'Rajivnagar Ground', date: '', time: '', matchNumber: 1, status: 'upcoming', team1Score: '', team2Score: '', result: '' };

const AdminMatches = () => {
    const [matches, setMatches] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);

    const fetch = () => {
        setLoading(true);
        Promise.all([matchesAPI.getAll(), teamsAPI.getAll()])
            .then(([m, t]) => { setMatches(m.data.matches || []); setTeams(t.data.teams || []); })
            .finally(() => setLoading(false));
    };
    useEffect(fetch, []);

    const openModal = (match = null) => {
        setEditing(match?._id || null);
        setForm(match ? {
            team1: match.team1?._id || match.team1, team2: match.team2?._id || match.team2,
            team1Name: match.team1Name || '', team2Name: match.team2Name || '',
            venue: match.venue || 'Rajivnagar Ground', date: match.date?.slice(0, 10) || '',
            time: match.time || '', matchNumber: match.matchNumber || 1,
            status: match.status || 'upcoming', team1Score: match.team1Score || '',
            team2Score: match.team2Score || '', result: match.result || ''
        } : emptyForm);
        setModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editing) { await matchesAPI.update(editing, form); toast.success('Match updated!'); }
            else { await matchesAPI.create(form); toast.success('Match added!'); }
            setModal(false);
            fetch();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this match?')) return;
        try {
            await matchesAPI.delete(id);
            toast.success('Match deleted');
            fetch();
        } catch { toast.error('Failed'); }
    };

    const statusColor = { live: '#ef4444', upcoming: '#a0a0a0', completed: '#22c55e', cancelled: '#666' };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Matches</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{matches.length} matches scheduled</p>
                </div>
                <button className="btn btn-primary" onClick={() => openModal()} id="add-match-btn">
                    <FiPlus /> Add Match
                </button>
            </div>

            {loading ? <div className="loading-screen"><div className="spinner" /></div> : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Teams</th>
                                <th>Date</th>
                                <th>Venue</th>
                                <th>Score</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matches.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No matches yet</td></tr>
                            ) : matches.map(m => (
                                <tr key={m._id}>
                                    <td style={{ color: 'var(--text-muted)' }}>#{m.matchNumber}</td>
                                    <td>
                                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.875rem' }}>
                                            {m.team1?.name || m.team1Name} <span style={{ color: 'var(--text-muted)' }}>vs</span> {m.team2?.name || m.team2Name}
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                        {m.date ? new Date(m.date).toLocaleDateString('en-IN') : '—'}
                                        {m.time && ` • ${m.time}`}
                                    </td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{m.venue}</td>
                                    <td style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', color: '#fff' }}>
                                        {m.team1Score && m.team2Score ? `${m.team1Score} | ${m.team2Score}` : '—'}
                                    </td>
                                    <td>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: statusColor[m.status] }}>
                                            {m.status === 'live' && <span style={{ display: 'inline-block', width: 6, height: 6, background: 'var(--red)', borderRadius: '50%', marginRight: 4 }} />}
                                            {m.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <Link 
                                                to={`/admin/matches/${m._id}/live-scoring`}
                                                className="btn btn-success btn-sm"
                                                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                                            >
                                                <FiPlay size={12} />
                                            </Link>
                                            <button className="btn btn-outline btn-sm" onClick={() => openModal(m)}><FiEdit2 /></button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m._id)}><FiTrash2 /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {modal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
                    <div className="modal" style={{ maxWidth: 640 }}>
                        <div className="modal-header">
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: 2 }}>
                                {editing ? 'Edit Match' : 'Add Match'}
                            </h3>
                            <button className="modal-close" onClick={() => setModal(false)}><FiX /></button>
                        </div>
                        <form onSubmit={handleSave} id="match-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Team 1 *</label>
                                    <select className="form-control" required value={form.team1} onChange={e => { const t = teams.find(t => t._id === e.target.value); setForm(f => ({ ...f, team1: e.target.value, team1Name: t?.name || '' })); }}>
                                        <option value="">Select Team 1</option>
                                        {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Team 2 *</label>
                                    <select className="form-control" required value={form.team2} onChange={e => { const t = teams.find(t => t._id === e.target.value); setForm(f => ({ ...f, team2: e.target.value, team2Name: t?.name || '' })); }}>
                                        <option value="">Select Team 2</option>
                                        {teams.filter(t => t._id !== form.team1).map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Date *</label>
                                    <input className="form-control" type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Time</label>
                                    <input className="form-control" type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Venue</label>
                                    <input className="form-control" value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Match #</label>
                                    <input className="form-control" type="number" value={form.matchNumber} onChange={e => setForm(f => ({ ...f, matchNumber: Number(e.target.value) }))} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select className="form-control" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            {form.status !== 'upcoming' && (
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Team 1 Score</label>
                                        <input className="form-control" placeholder="e.g. 145/6 (20)" value={form.team1Score} onChange={e => setForm(f => ({ ...f, team1Score: e.target.value }))} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Team 2 Score</label>
                                        <input className="form-control" placeholder="e.g. 143/8 (20)" value={form.team2Score} onChange={e => setForm(f => ({ ...f, team2Score: e.target.value }))} />
                                    </div>
                                </div>
                            )}
                            {form.status === 'completed' && (
                                <div className="form-group">
                                    <label className="form-label">Result</label>
                                    <input className="form-control" placeholder="e.g. Team A won by 2 runs" value={form.result} onChange={e => setForm(f => ({ ...f, result: e.target.value }))} />
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                                    {saving ? 'Saving...' : <><FiCheck /> Save Match</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMatches;
