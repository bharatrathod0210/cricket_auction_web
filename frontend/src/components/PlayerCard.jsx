import { FiUser, FiX } from 'react-icons/fi';
import { useState } from 'react';

const API_BASE = import.meta.env.PROD ? 'https://rpl-sihor-backend.vercel.app' : 'http://localhost:5000';

const roleColors = {
    'Batsman': '#3b82f6',
    'Bowler': '#ef4444',
    'All Rounder': '#d4af37',
    'Wicketkeeper': '#22c55e',
};

const PlayerCard = ({ player }) => {
    const [showImageModal, setShowImageModal] = useState(false);
    
    const imgSrc = player.image
        ? (player.image.startsWith('http') ? player.image : `${API_BASE}${player.image}`)
        : null;

    const teamLogoSrc = player.team?.logo
        ? (player.team.logo.startsWith('http') ? player.team.logo : `${API_BASE}${player.team.logo}`)
        : null;

    return (
        <>
            <div className="player-card" style={{ display: 'block' }}>
            {/* Status Badge */}
            <div className="player-status">
                <span className={`badge ${player.auctionStatus === 'sold' ? 'badge-green' : player.auctionStatus === 'unsold' ? 'badge-red' : 'badge-muted'}`}>
                    {player.auctionStatus}
                </span>
            </div>

            {/* Image */}
            <div style={{ height: 200, overflow: 'hidden', background: 'var(--bg-elevated)', position: 'relative' }}>
                {imgSrc ? (
                    <img 
                        src={imgSrc} 
                        alt={player.name} 
                        className="card-image" 
                        style={{ width: '100%', height: '300px', objectFit: 'cover', cursor: 'pointer' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowImageModal(true);
                        }}
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiUser size={48} color="var(--text-muted)" />
                    </div>
                )}
                {/* Role overlay */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    padding: '20px 12px 8px',
                }}>
                    <span style={{
                        fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
                        color: roleColors[player.role] || '#fff',
                    }}>
                        {player.role}
                    </span>
                </div>
            </div>

            <div className="card-body">
                <div className="player-name">
                    {player.name}
                </div>
                {player.isIconPlayer && (
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 4, 
                        marginTop: 4,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: 'var(--gold)',
                        textTransform: 'uppercase',
                        letterSpacing: 1
                    }}>
                        <span>⭐</span>
                        <span>ICON PLAYER</span>
                    </div>
                )}

                {/* Team */}
                {player.team && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, marginBottom: 4 }}>
                        {teamLogoSrc && <img src={teamLogoSrc} style={{ width: 16, height: 16, objectFit: 'contain' }} alt="" />}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{player.team.name}</span>
                    </div>
                )}

                {/* Price */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                    <div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
                            {player.auctionStatus === 'sold' ? 'Sold at' : 'Base price'}
                        </div>
                        <div className="player-price">
                            ₹{((player.auctionStatus === 'sold' ? player.soldPrice : player.basePrice) / 1000).toFixed(0)}K
                        </div>
                    </div>
                    {player.stats?.runs > 0 && (
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Runs</div>
                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem' }}>{player.stats.runs}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Image Modal */}
        {showImageModal && imgSrc && (
            <div className="modal-overlay" onClick={() => setShowImageModal(false)} style={{ zIndex: 9999 }}>
                <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <button
                        onClick={() => setShowImageModal(false)}
                        style={{ 
                            position: 'absolute', 
                            top: -40, 
                            right: -40, 
                            background: '#000', 
                            border: '1px solid var(--border)', 
                            borderRadius: '50%', 
                            width: 40, 
                            height: 40, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: '#fff', 
                            cursor: 'pointer',
                            fontSize: '1.2rem'
                        }}
                    >
                        <FiX />
                    </button>
                    <img 
                        src={imgSrc} 
                        alt={player.name} 
                        style={{ 
                            maxWidth: '100%', 
                            maxHeight: '90vh', 
                            borderRadius: 16, 
                            border: '2px solid var(--border)',
                            objectFit: 'contain'
                        }} 
                    />
                </div>
            </div>
        )}
        </>
    );
};

export default PlayerCard;
