import { useState, useEffect } from 'react';
import TeamCard from '../components/TeamCard';
import { teamsAPI } from '../services/api';
import { FiSearch } from 'react-icons/fi';

const Teams = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        teamsAPI.getAll().then(r => setTeams(r.data.teams || [])).finally(() => setLoading(false));
    }, []);

    const filtered = teams.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={{ paddingTop: 'var(--nav-height)' }}>
            <div className="page-hero">
                <div className="section-tag">RPL 2026</div>
                <h1>The Teams</h1>
                <p>Meet all the squads competing in Rajivnagar Premier League</p>
            </div>

            <section className="section" style={{ paddingTop: 0 }}>
                <div className="container">
                    {/* Search */}
                    <div style={{ maxWidth: 400, margin: '0 auto 40px', position: 'relative' }}>
                        <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search teams..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ paddingLeft: 40 }}
                            id="team-search"
                        />
                    </div>

                    {loading ? (
                        <div className="loading-screen"><div className="spinner" /></div>
                    ) : filtered.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🏏</div>
                            <h3>No Teams Found</h3>
                            <p>Teams will be added before the auction</p>
                        </div>
                    ) : (
                        <div className="grid-4">
                            {filtered.map(t => <TeamCard key={t._id} team={t} />)}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Teams;
