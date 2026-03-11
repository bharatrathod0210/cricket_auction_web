import { useState, useEffect } from 'react';
import MatchCard from '../components/MatchCard';
import { matchesAPI } from '../services/api';

const statuses = ['All', 'upcoming', 'live', 'completed'];

const Matches = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        matchesAPI.getAll().then(r => setMatches(r.data.matches || [])).finally(() => setLoading(false));
    }, []);

    const filtered = matches.filter(m => statusFilter === 'All' || m.status === statusFilter);

    return (
        <div style={{ paddingTop: 'var(--nav-height)' }}>
            <div className="page-hero">
                <div className="section-tag">Schedule</div>
                <h1>Match Schedule</h1>
                <p>Full schedule of all RPL matches</p>
            </div>

            <section className="section" style={{ paddingTop: 0 }}>
                <div className="container">
                    <div className="filter-bar" style={{ justifyContent: 'center', marginBottom: 40 }}>
                        {statuses.map(s => (
                            <button key={s} className={`filter-btn ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)} id={`filter-${s}`}>
                                {s === 'All' ? 'All Matches' : s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="loading-screen"><div className="spinner" /></div>
                    ) : filtered.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📅</div>
                            <h3>No Matches Found</h3>
                            <p>Match schedule will be published soon</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
                            {filtered.map(m => <MatchCard key={m._id} match={m} />)}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Matches;
