import { useState, useEffect } from 'react';
import { playersAPI, teamsAPI } from '../services/api';
import { GiTrophy } from 'react-icons/gi';

const API_BASE = import.meta.env.PROD ? 'https://rpl-sihor-backend.vercel.app' : 'http://localhost:5000';

const Leaderboard = () => {
    const [topScorers, setTopScorers] = useState([]);
    const [topWickets, setTopWickets] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('batting');

    useEffect(() => {
        Promise.all([
            playersAPI.getLeaderboard(),
            teamsAPI.getAll(),
        ]).then(([lb, t]) => {
            setTopScorers(lb.data.topScorers || []);
            setTopWickets(lb.data.topWicketTakers || []);
            setTeams(t.data.teams || []);
        }).finally(() => setLoading(false));
    }, []);

    const teamPoints = [...teams].sort((a, b) => b.points - a.points || b.wins - a.wins);

    const RankRow = ({ player, rank, stat, statLabel }) => {
        const imgSrc = player.image ? `${API_BASE}${player.image}` : null;
        const teamLogo = player.team?.logo ? `${API_BASE}${player.team.logo}` : null;
        const isTop3 = rank <= 3;

        return (
            <div className="leaderboard-item" style={{ borderColor: rank === 1 ? 'rgba(212,175,55,0.3)' : undefined }}>
                <div className={`rank ${isTop3 ? 'top3' : ''}`} style={{ color: rank === 1 ? 'var(--gold)' : rank === 2 ? '#aaa' : rank === 3 ? '#cd7f32' : undefined }}>
                    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                </div>
                {imgSrc ? (
                    <img src={imgSrc} alt={player.name} className="avatar" />
                ) : (
                    <div className="avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', background: 'var(--bg-elevated)' }}>
                        {player.name?.charAt(0)}
                    </div>
                )}
                <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, textTransform: 'uppercase' }}>{player.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        {teamLogo && <img src={teamLogo} style={{ width: 14, height: 14, objectFit: 'contain' }} alt="" />}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{player.team?.name || 'Unsold'}</span>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: rank === 1 ? 'var(--gold)' : '#fff' }}>
                        {stat}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{statLabel}</div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ paddingTop: 'var(--nav-height)' }}>
            <div className="page-hero">
                <div className="section-tag">Statistics</div>
                <h1>Leaderboard</h1>
                <p>Season standings, top scorers and wicket takers</p>
            </div>

            <section className="section" style={{ paddingTop: 0 }}>
                <div className="container">
                    {/* Tabs */}
                    <div className="filter-bar" style={{ justifyContent: 'center', marginBottom: 40 }}>
                        {[['batting', '🏏 Orange Cap'], ['bowling', '⚡ Purple Cap'], ['points', '🏆 Points Table']].map(([t, l]) => (
                            <button key={t} className={`filter-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} id={`tab-${t}`}>{l}</button>
                        ))}
                    </div>

                    {loading ? <div className="loading-screen"><div className="spinner" /></div> : (
                        <>
                            {tab === 'batting' && (
                                <div>
                                    {/* Orange Cap Banner */}
                                    {topScorers[0] && (
                                        <div style={{
                                            background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.03))',
                                            border: '1px solid rgba(212,175,55,0.2)',
                                            borderRadius: 'var(--radius-xl)',
                                            padding: '32px',
                                            marginBottom: 32,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 24,
                                            flexWrap: 'wrap',
                                        }}>
                                            <div style={{ fontSize: '3rem' }}>🧡</div>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Orange Cap Holder</div>
                                                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', letterSpacing: 4 }}>{topScorers[0]?.name}</div>
                                                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--gold)' }}>{topScorers[0]?.stats?.runs} RUNS</div>
                                            </div>
                                        </div>
                                    )}
                                    {topScorers.length === 0 ? (
                                        <div className="empty-state"><div className="empty-icon">🏏</div><h3>No Stats Yet</h3><p>Stats will appear after matches begin</p></div>
                                    ) : (
                                        topScorers.map((p, i) => <RankRow key={p._id} player={p} rank={i + 1} stat={p.stats?.runs || 0} statLabel="Runs" />)
                                    )}
                                </div>
                            )}

                            {tab === 'bowling' && (
                                <div>
                                    {topWickets[0] && (
                                        <div style={{
                                            background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(139,92,246,0.03))',
                                            border: '1px solid rgba(139,92,246,0.2)',
                                            borderRadius: 'var(--radius-xl)',
                                            padding: '32px',
                                            marginBottom: 32,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 24,
                                            flexWrap: 'wrap',
                                        }}>
                                            <div style={{ fontSize: '3rem' }}>💜</div>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Purple Cap Holder</div>
                                                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', letterSpacing: 4 }}>{topWickets[0]?.name}</div>
                                                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: '#a78bfa' }}>{topWickets[0]?.stats?.wickets} WICKETS</div>
                                            </div>
                                        </div>
                                    )}
                                    {topWickets.length === 0 ? (
                                        <div className="empty-state"><div className="empty-icon">⚡</div><h3>No Stats Yet</h3><p>Stats will appear after matches begin</p></div>
                                    ) : (
                                        topWickets.map((p, i) => <RankRow key={p._id} player={p} rank={i + 1} stat={p.stats?.wickets || 0} statLabel="Wickets" />)
                                    )}
                                </div>
                            )}

                            {tab === 'points' && (
                                <div>
                                    {teams.length === 0 ? (
                                        <div className="empty-state"><div className="empty-icon">🏆</div><h3>No Teams Yet</h3><p>Points table appears after teams are added</p></div>
                                    ) : (
                                        <div className="table-container">
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Team</th>
                                                        <th>M</th>
                                                        <th>W</th>
                                                        <th>L</th>
                                                        <th>Pts</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {teamPoints.map((t, i) => {
                                                        const logo = t.logo ? `${API_BASE}${t.logo}` : null;
                                                        return (
                                                            <tr key={t._id}>
                                                                <td style={{ color: i < 3 ? 'var(--gold)' : 'var(--text-muted)', fontWeight: 700 }}>
                                                                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                                                                </td>
                                                                <td>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                                        {logo && <img src={logo} style={{ width: 28, height: 28, objectFit: 'contain' }} alt="" />}
                                                                        <span style={{ fontWeight: 600, color: '#fff' }}>{t.name}</span>
                                                                    </div>
                                                                </td>
                                                                <td>{t.wins + t.losses}</td>
                                                                <td style={{ color: 'var(--green)' }}>{t.wins}</td>
                                                                <td style={{ color: 'var(--red)' }}>{t.losses}</td>
                                                                <td style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{t.points}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Leaderboard;
