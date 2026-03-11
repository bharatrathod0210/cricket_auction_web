import { useState, useEffect } from 'react';
import { announcementsAPI } from '../../services/api';
import { FiPlus, FiTrash2, FiX, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

const types = ['info', 'warning', 'success', 'auction', 'match'];
const typeColors = { info: '#3b82f6', warning: '#f59e0b', success: '#22c55e', auction: '#d4af37', match: '#a78bfa' };
const emptyForm = { title: '', content: '', type: 'info', isPinned: false };

const AdminAnnouncements = () => {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const fetch = () => {
        setLoading(true);
        announcementsAPI.getAll().then(r => setList(r.data.announcements || [])).finally(() => setLoading(false));
    };
    useEffect(fetch, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await announcementsAPI.create(form);
            toast.success('Announcement posted!');
            setModal(false);
            setForm(emptyForm);
            fetch();
        } catch (err) {
            toast.error('Error posting');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await announcementsAPI.delete(id);
            toast.success('Deleted');
            fetch();
        } catch { toast.error('Error'); }
    };

    const handleToggle = async (id, isActive) => {
        try {
            await announcementsAPI.update(id, { isActive: !isActive });
            fetch();
        } catch { toast.error('Error'); }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Announcements</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Manage news feed and notifications</p>
                </div>
                <button className="btn btn-primary" onClick={() => setModal(true)} id="add-announcement-btn">
                    <FiPlus /> New Announcement
                </button>
            </div>

            {loading ? <div className="loading-screen"><div className="spinner" /></div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {list.length === 0 ? (
                        <div className="empty-state"><div className="empty-icon">📢</div><h3>No Announcements</h3><p>Post your first announcement!</p></div>
                    ) : list.map(a => (
                        <div key={a._id} style={{
                            background: 'var(--bg-card)',
                            border: `1px solid ${a.isPinned ? 'rgba(212,175,55,0.3)' : 'var(--border)'}`,
                            borderRadius: 'var(--radius-md)',
                            padding: '16px 20px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 16,
                            opacity: a.isActive ? 1 : 0.5,
                        }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: `${typeColors[a.type] || '#fff'}15`,
                                color: typeColors[a.type] || '#fff',
                                fontSize: '1rem',
                            }}>
                                {a.type === 'info' ? 'ℹ️' : a.type === 'warning' ? '⚠️' : a.type === 'success' ? '✅' : a.type === 'auction' ? '🏏' : '📅'}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                                    {a.isPinned && <span className="badge badge-gold">📌 Pinned</span>}
                                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{a.title}</span>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>{a.content}</p>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
                                    {new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                <button
                                    className={`btn btn-sm ${a.isActive ? 'btn-outline' : 'btn-success'}`}
                                    onClick={() => handleToggle(a._id, a.isActive)}
                                >
                                    {a.isActive ? 'Hide' : 'Show'}
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a._id)}><FiTrash2 /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
                    <div className="modal">
                        <div className="modal-header">
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: 2 }}>New Announcement</h3>
                            <button className="modal-close" onClick={() => setModal(false)}><FiX /></button>
                        </div>
                        <form onSubmit={handleSave} id="announcement-form">
                            <div className="form-group">
                                <label className="form-label">Title *</label>
                                <input className="form-control" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Announcement title" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Content *</label>
                                <textarea className="form-control" rows={4} required value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Announcement details..." />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Type</label>
                                    <select className="form-control" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                                        {types.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Pin to Top?</label>
                                    <select className="form-control" value={form.isPinned} onChange={e => setForm(f => ({ ...f, isPinned: e.target.value === 'true' }))}>
                                        <option value="false">No</option>
                                        <option value="true">Yes</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                                    {saving ? 'Posting...' : <><FiCheck /> Post</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAnnouncements;
