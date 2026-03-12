import { useState, useEffect } from 'react';
import PlayerCard from '../components/PlayerCard';
import { playersAPI, teamsAPI } from '../services/api';
import { FiSearch } from 'react-icons/fi';

const roles = ['All', 'Batsman', 'Bowler', 'All Rounder', 'Wicketkeeper'];
const statuses = ['All', 'sold', 'unsold'];

const Players = () => {
    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [teamFilter, setTeamFilter] = useState('All');

    useEffect(() => {
        Promise.all([
            playersAPI.getAll({ approvalStatus: 'approved' }),
            teamsAPI.getAll(),
        ]).then(([p, t]) => {
            setPlayers(p.data.players || []);
            setTeams(t.data.teams || []);
        }).finally(() => setLoading(false));
    }, []);

    const filtered = players.filter(p => {
        const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === 'All' || p.role === roleFilter;
        const matchStatus = statusFilter === 'All' || p.auctionStatus === statusFilter;
        const matchTeam = teamFilter === 'All' || p.team?._id === teamFilter || (!p.team && teamFilter === 'none');
        return matchSearch && matchRole && matchStatus && matchTeam;
    });

    return (
        <div style={{ paddingTop: 'var(--nav-height)' }}>
            <div className="page-hero">
                <div className="section-tag">Players</div>
                <h1>The Players</h1>
                <p>All registered cricketers for RPL</p>
            </div>

            <section className="section" style={{ paddingTop: 0 }}>
                <div className="container">
                    {/* Search + Filters */}
                    <div style={{ marginBottom: 32, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: '1 1 280px' }}>
                            <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search player..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ paddingLeft: 40 }}
                                id="player-search"
                            />
                        </div>

                        <select className="form-control" style={{ flex: '0 1 160px' }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)} id="role-filter">
                            {roles.map(r => <option key={r} value={r}>{r === 'All' ? 'All Roles' : r}</option>)}
                        </select>

                        <select className="form-control" style={{ flex: '0 1 160px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)} id="status-filter">
                            {statuses.map(s => <option key={s} value={s}>{s === 'All' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>

                        <select className="form-control" style={{ flex: '0 1 200px' }} value={teamFilter} onChange={e => setTeamFilter(e.target.value)} id="team-filter">
                            <option value="All">All Teams</option>
                            <option value="none">Unsold (No Team)</option>
                            {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                        </select>
                    </div>

                    {/* Count */}
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 24 }}>
                        Showing {filtered.length} of {players.length} players
                    </div>

                    {loading ? (
                        <div className="loading-screen"><div className="spinner" /></div>
                    ) : filtered.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🏏</div>
                            <h3>No Players Found</h3>
                            <p>Try adjusting your filters</p>
                        </div>
                    ) : (
                        <div className="grid-4">
                            {filtered.map(p => <PlayerCard key={p._id} player={p} />)}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Players;
