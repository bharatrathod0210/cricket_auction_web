import { FiCalendar, FiMapPin, FiClock } from 'react-icons/fi';

const API_BASE = import.meta.env.PROD ? 'https://rpl-backend.vercel.app' : 'http://localhost:5000';

const statusColors = { live: '#ef4444', upcoming: 'var(--text-muted)', completed: '#22c55e', cancelled: '#666' };

const MatchCard = ({ match }) => {
    const t1Logo = match.team1?.logo ? `${API_BASE}${match.team1.logo}` : null;
    const t2Logo = match.team2?.logo ? `${API_BASE}${match.team2.logo}` : null;
    const matchDate = match.date ? new Date(match.date) : null;

    return (
        <div className="match-card">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Match #{match.matchNumber}
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: statusColors[match.status] || 'var(--text-muted)' }}>
                    {match.status === 'live' && <span className="live-dot" style={{ marginRight: 4, display: 'inline-block' }} />}
                    {match.status}
                </span>
            </div>

            {/* Teams */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                {/* Team 1 */}
                <div style={{ textAlign: 'center', flex: 1 }}>
                    {t1Logo ? (
                        <img src={t1Logo} alt={match.team1?.name} style={{ width: 48, height: 48, objectFit: 'contain', margin: '0 auto 8px' }} />
                    ) : (
                        <div style={{ width: 48, height: 48, background: 'var(--bg-elevated)', borderRadius: 8, margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                            {match.team1?.shortName || '?'}
                        </div>
                    )}
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', fontWeight: 700 }}>{match.team1?.name || match.team1Name}</div>
                    {match.team1Score && <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: '#fff', marginTop: 4 }}>{match.team1Score}</div>}
                </div>

                {/* VS */}
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', letterSpacing: 2 }}>VS</div>
                </div>

                {/* Team 2 */}
                <div style={{ textAlign: 'center', flex: 1 }}>
                    {t2Logo ? (
                        <img src={t2Logo} alt={match.team2?.name} style={{ width: 48, height: 48, objectFit: 'contain', margin: '0 auto 8px' }} />
                    ) : (
                        <div style={{ width: 48, height: 48, background: 'var(--bg-elevated)', borderRadius: 8, margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                            {match.team2?.shortName || '?'}
                        </div>
                    )}
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', fontWeight: 700 }}>{match.team2?.name || match.team2Name}</div>
                    {match.team2Score && <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: '#fff', marginTop: 4 }}>{match.team2Score}</div>}
                </div>
            </div>

            {/* Result */}
            {match.result && (
                <div style={{ textAlign: 'center', marginTop: 12, padding: '8px', background: 'var(--bg-glass)', borderRadius: 8, fontSize: '0.8rem', color: 'var(--green)' }}>
                    🏆 {match.result}
                </div>
            )}

            {/* Footer */}
            <div style={{ display: 'flex', gap: 16, marginTop: 14, color: 'var(--text-muted)', fontSize: '0.75rem', flexWrap: 'wrap' }}>
                {matchDate && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FiCalendar size={12} />
                        {matchDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                )}
                {match.time && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FiClock size={12} />
                        {match.time}
                    </span>
                )}
                {match.venue && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FiMapPin size={12} />
                        {match.venue}
                    </span>
                )}
            </div>
        </div>
    );
};

export default MatchCard;
