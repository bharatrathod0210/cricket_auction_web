import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { teamsAPI } from '../services/api';
import { FiArrowLeft, FiUsers, FiDollarSign } from 'react-icons/fi';
import { GiTrophy } from 'react-icons/gi';
import PlayerCard from '../components/PlayerCard';
import { getImageUrl } from '../utils/imageUrl';

const roleColors = { 'Batsman': '#3b82f6', 'Bowler': '#ef4444', 'All Rounder': '#d4af37', 'Wicketkeeper': '#22c55e' };

const TeamDetail = () => {
    const { id } = useParams();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        teamsAPI.getOne(id).then(r => setTeam(r.data.team)).finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="loading-screen" style={{ paddingTop: 'var(--nav-height)' }}><div className="spinner" /></div>;
    if (!team) return <div className="empty-state" style={{ paddingTop: 'var(--nav-height)' }}><p>Team not found</p></div>;

    const logoSrc = getImageUrl(team.logo);
    const purseRemaining = team.purse - team.purseSpent;

    const roleCounts = (team.players || []).reduce((acc, p) => {
        acc[p.role] = (acc[p.role] || 0) + 1;
        return acc;
    }, {});

    return (
        <div style={{ paddingTop: 'var(--nav-height)' }}>
            {/* Team Banner */}
            <div style={{
                background: `linear-gradient(135deg, ${team.color}15, var(--bg-secondary))`,
                borderBottom: '1px solid var(--border)',
                padding: '60px 0'
            }}>
                <div className="container">
                    <Link to="/teams" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 32 }}>
                        <FiArrowLeft /> Back to Teams
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
                        {logoSrc ? (
                            <img src={logoSrc} alt={team.name} style={{ width: 120, height: 120, objectFit: 'contain', borderRadius: 20, background: 'var(--bg-card)', padding: 12, border: '1px solid var(--border)' }} />
                        ) : (
                            <div style={{
                                width: 120, height: 120, background: 'var(--bg-card)',
                                borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: 'var(--font-display)', fontSize: '3rem', border: '1px solid var(--border)'
                            }}>
                                {team.shortName}
                            </div>
                        )}
                        <div>
                            <div className="section-tag">{team.shortName}</div>
                            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 6vw, 4rem)', letterSpacing: 4 }}>{team.name}</h1>
                            {team.captainName && (
                                <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
                                    👑 Captain: <strong>{team.captainName}</strong>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                <div className="container">
                    <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
                        {[
                            { label: 'Players', value: team.players?.length || 0, icon: FiUsers },
                            { label: 'Purse (Total)', value: `₹${(team.purse / 100000).toFixed(0)}L`, icon: FiDollarSign },
                            { label: 'Purse Spent', value: `₹${(team.purseSpent / 100000).toFixed(1)}L`, icon: FiDollarSign },
                            { label: 'Remaining', value: `₹${(purseRemaining / 100000).toFixed(1)}L`, icon: FiDollarSign },
                            { label: 'Wins', value: team.wins, icon: GiTrophy },
                        ].map((s, i) => (
                            <div key={i} style={{ flex: '1 0 140px', padding: '20px 24px', borderRight: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{s.label}</div>
                                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700 }}>{s.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Players */}
            <section className="section">
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: 2 }}>
                            Squad ({team.players?.length || 0})
                        </h2>
                        {/* Role breakdown */}
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {Object.entries(roleCounts).map(([role, count]) => (
                                <span key={role} style={{ padding: '4px 12px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 600, background: `${roleColors[role]}20`, color: roleColors[role] }}>
                                    {role}: {count}
                                </span>
                            ))}
                        </div>
                    </div>

                    {team.players?.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🏏</div>
                            <h3>No Players Yet</h3>
                            <p>Players will be added after the auction</p>
                        </div>
                    ) : (
                        <div className="grid-4">
                            {team.players?.map(p => <PlayerCard key={p._id} player={{ ...p, team }} />)}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default TeamDetail;
