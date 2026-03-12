import { FiUser, FiX } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';
import { getImageUrl } from '../utils/imageUrl';
import { createSmartImageLoader } from '../utils/imageUtils';

const roleColors = {
    'Batsman': '#3b82f6',
    'Bowler': '#ef4444',
    'All Rounder': '#d4af37',
    'Wicketkeeper': '#22c55e',
};

const PlayerCard = ({ player }) => {
    const [showImageModal, setShowImageModal] = useState(false);
    const imgRef = useRef(null);
    
    const imgSrc = getImageUrl(player.image);
    const teamLogoSrc = getImageUrl(player.team?.logo);

    useEffect(() => {
        if (imgRef.current && imgSrc) {
            createSmartImageLoader(imgRef.current);
        }
    }, [imgSrc]);

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
            <div style={{ 
                height: 280, 
                overflow: 'hidden', 
                background: 'var(--bg-elevated)', 
                position: 'relative',
                borderRadius: '12px 12px 0 0'
            }}>
                {imgSrc ? (
                    <img 
                        ref={imgRef}
                        src={imgSrc} 
                        alt={player.name} 
                        className="card-image" 
                        style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            objectPosition: 'center 20%', // Default, will be updated by smart loader
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowImageModal(true);
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.03)';
                            e.target.style.filter = 'brightness(1.1) contrast(1.15) saturate(1.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                            e.target.style.filter = 'brightness(1.05) contrast(1.1) saturate(1.05)';
                        }}
                    />
                ) : (
                    <div style={{ 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-card) 100%)',
                        gap: 12
                    }}>
                        <FiUser size={56} color="var(--text-muted)" />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No Photo</span>
                    </div>
                )}
                
                {/* Gradient overlay for better text visibility */}
                <div style={{
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    right: 0,
                    background: 'linear-gradient(transparent 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.9) 100%)',
                    padding: '32px 16px 12px',
                }}>
                    <span style={{
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        textTransform: 'uppercase', 
                        letterSpacing: 1.5,
                        color: roleColors[player.role] || '#fff',
                        textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                        background: `linear-gradient(135deg, ${roleColors[player.role] || '#fff'} 0%, rgba(255,255,255,0.8) 100%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        {player.role}
                    </span>
                </div>
                
                {/* Corner accent */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 40,
                    height: 40,
                    background: `linear-gradient(135deg, ${roleColors[player.role] || 'var(--gold)'} 0%, transparent 100%)`,
                    opacity: 0.3
                }} />
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
