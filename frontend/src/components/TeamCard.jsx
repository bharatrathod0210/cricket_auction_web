import { Link } from 'react-router-dom';
import { FiUsers } from 'react-icons/fi';
import { getImageUrl } from '../utils/imageUrl';

const TeamCard = ({ team }) => {
    const logoSrc = getImageUrl(team.logo);

    return (
        <Link to={`/teams/${team._id}`} className="team-card" style={{ display: 'block' }}>
            <div className="team-banner" style={{ background: `linear-gradient(135deg, ${team.color}22, ${team.color}44)`, padding: '70px 0' }}>
                {logoSrc ? (
                    <img src={logoSrc} alt={team.name} className="team-logo" style={{ width: 240, height: 140, objectFit: 'contain' }} />
                ) : (
                    <div style={{
                        width: 120, height: 120, background: 'var(--bg-elevated)',
                        borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2.5rem', fontFamily: 'var(--font-display)', color: '#fff',
                        border: '2px solid var(--border)'
                    }}>
                        {team.shortName?.charAt(0) || team.name?.charAt(0)}
                    </div>
                )}
            </div>
            <div className="team-body">
                <div className="team-name">{team.name}</div>
                <div className="team-meta" style={{ marginTop: 6 }}>
                    {team.captainName && <div>👑 {team.captainName}</div>}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 }}>
                        <FiUsers size={12} />
                        <span>{team.players?.length || 0} Players</span>
                    </div>
                </div>
                <div style={{
                    marginTop: 12, padding: '8px 12px',
                    background: 'var(--bg-glass)', borderRadius: 8,
                    fontSize: '0.75rem', color: 'var(--text-muted)'
                }}>
                    <span>Purse: </span>
                    <span style={{ color: 'var(--gold)', fontWeight: 600 }}>
                        ₹{((team.purse - team.purseSpent) / 100000).toFixed(1)}L remaining
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default TeamCard;
