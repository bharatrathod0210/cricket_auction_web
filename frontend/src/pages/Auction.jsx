import { useState, useEffect } from 'react';
import { auctionAPI, teamsAPI } from '../services/api';
import { FiZap, FiClock, FiUsers } from 'react-icons/fi';
import { GiCricketBat } from 'react-icons/gi';
import { getImageUrl } from '../utils/imageUrl';

const Auction = () => {
    const [auction, setAuction] = useState(null);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timer, setTimer] = useState(30);
    const [lastBid, setLastBid] = useState(null);
    const [showBidNotification, setShowBidNotification] = useState(false);
    const [soldNotification, setSoldNotification] = useState(null);
    const [showSoldNotification, setShowSoldNotification] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                const [a, t] = await Promise.all([auctionAPI.get(), teamsAPI.getAll()]);
                const newAuction = a.data.auction;
                
                // Check if bid changed - Reset timer when new bid is placed
                if (auction && newAuction && auction.currentBid !== newAuction.currentBid && newAuction.currentBidTeam) {
                    setLastBid({
                        team: newAuction.currentBidTeam,
                        amount: newAuction.currentBid
                    });
                    setShowBidNotification(true);
                    setTimeout(() => setShowBidNotification(false), 3000);
                    
                    // Reset timer to 30 seconds when new bid is placed
                    setTimer(30);
                }
                
                // Check if player was sold (new log entry with SOLD action)
                if (auction && newAuction && newAuction.logs && auction.logs) {
                    const newLog = newAuction.logs[newAuction.logs.length - 1];
                    const oldLog = auction.logs[auction.logs.length - 1];
                    
                    if (newLog && newLog.action === 'SOLD' && (!oldLog || newLog.timestamp !== oldLog.timestamp)) {
                        setSoldNotification({
                            playerName: newLog.playerName,
                            teamName: newLog.teamName,
                            amount: newLog.amount
                        });
                        setShowSoldNotification(true);
                        setTimeout(() => setShowSoldNotification(false), 5000);
                    }
                }
                
                setAuction(newAuction);
                setTeams(t.data.teams || []);
            } finally {
                setLoading(false);
            }
        };
        fetch();
        const interval = setInterval(fetch, 3000);
        return () => clearInterval(interval);
    }, [auction?.currentBid, auction?.logs?.length]);

    useEffect(() => {
        if (auction?.status !== 'live') return;
        
        // Reset timer when new player starts or when auction starts
        if (auction?.currentPlayer) {
            setTimer(30);
        }
        
        const t = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    // Timer reached 0 - this should trigger next player on backend
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        
        return () => clearInterval(t);
    }, [auction?.currentPlayer?._id, auction?.status]); // Use player ID to detect player changes

    if (loading) return <div className="loading-screen" style={{ paddingTop: 'var(--nav-height)', minHeight: '100vh' }}><div className="spinner" /></div>;

    const isLive = auction?.status === 'live';
    const player = auction?.currentPlayer;
    const playerImg = getImageUrl(player?.image);
    const bidTeamLogo = getImageUrl(auction?.currentBidTeam?.logo);

    return (
        <div style={{ paddingTop: 'var(--nav-height)' }}>
            {/* Bid Notification */}
            {showBidNotification && lastBid && (
                <div className="bid-notification" style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 9999,
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                    border: '4px solid var(--gold)',
                    borderRadius: 24,
                    padding: '50px 80px',
                    boxShadow: '0 30px 80px rgba(212,175,55,0.6), 0 0 100px rgba(212,175,55,0.3), inset 0 0 60px rgba(212,175,55,0.1)',
                    animation: 'bidExplosion 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    minWidth: 500,
                    textAlign: 'center',
                    backdropFilter: 'blur(10px)'
                }}>
                    {/* Glow Effect */}
                    <div style={{
                        position: 'absolute',
                        top: -4,
                        left: -4,
                        right: -4,
                        bottom: -4,
                        background: 'linear-gradient(45deg, var(--gold), #FFD700, var(--gold))',
                        borderRadius: 24,
                        opacity: 0.3,
                        filter: 'blur(20px)',
                        zIndex: -1,
                        animation: 'glowPulse 1.5s ease-in-out infinite'
                    }}></div>
                    
                    {/* Lightning Icon */}
                    <div style={{ 
                        fontSize: '4rem', 
                        marginBottom: 16,
                        animation: 'bounce 0.6s ease-out',
                        filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.8))'
                    }}>
                        ⚡
                    </div>
                    
                    <div style={{ 
                        fontSize: '1.2rem', 
                        color: 'var(--gold)', 
                        fontWeight: 800, 
                        marginBottom: 12, 
                        textTransform: 'uppercase', 
                        letterSpacing: 6,
                        textShadow: '0 0 20px rgba(212,175,55,0.5)'
                    }}>
                        NEW BID!
                    </div>
                    
                    <div className="bid-amount" style={{ 
                        fontSize: '4.5rem', 
                        fontFamily: 'var(--font-display)', 
                        fontWeight: 900, 
                        background: 'linear-gradient(135deg, #FFD700, #FFA500, #FFD700)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        marginBottom: 20,
                        letterSpacing: 4,
                        textShadow: '0 0 40px rgba(255,215,0,0.5)',
                        lineHeight: 1
                    }}>
                        ₹{(lastBid.amount / 1000).toFixed(0)}K
                    </div>
                    
                    <div className="team-name" style={{ 
                        fontSize: '2rem', 
                        fontFamily: 'var(--font-heading)',
                        color: '#fff', 
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: 3,
                        textShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 30px rgba(212,175,55,0.3)'
                    }}>
                        {lastBid.team.name}
                    </div>
                    
                    {/* Sparkles */}
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                top: `${20 + Math.random() * 60}%`,
                                left: `${10 + Math.random() * 80}%`,
                                fontSize: '1.5rem',
                                animation: `sparkle ${1 + Math.random()}s ease-in-out infinite`,
                                animationDelay: `${Math.random() * 0.5}s`
                            }}
                        >
                            ✨
                        </div>
                    ))}
                </div>
            )}

            {/* Sold Celebration */}
            {showSoldNotification && soldNotification && (
                <>
                    {/* Confetti Background */}
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 9998,
                        pointerEvents: 'none',
                        overflow: 'hidden'
                    }}>
                        {[...Array(50)].map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    position: 'absolute',
                                    top: '-10px',
                                    left: `${Math.random() * 100}%`,
                                    width: '10px',
                                    height: '10px',
                                    background: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'][Math.floor(Math.random() * 5)],
                                    animation: `confettiFall ${2 + Math.random() * 3}s linear infinite`,
                                    animationDelay: `${Math.random() * 2}s`,
                                    opacity: 0.8,
                                    borderRadius: '50%'
                                }}
                            />
                        ))}
                    </div>

                    {/* Sold Notification */}
                    <div className="sold-notification" style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 9999,
                        background: 'linear-gradient(135deg, rgba(34,197,94,0.98), rgba(16,185,129,0.98))',
                        border: '3px solid #22c55e',
                        borderRadius: 24,
                        padding: '40px 60px',
                        boxShadow: '0 20px 60px rgba(34,197,94,0.5)',
                        animation: 'soldCelebration 0.6s ease-out',
                        minWidth: 400,
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎉</div>
                        <div style={{ fontSize: '1rem', color: '#fff', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 3 }}>
                            SOLD!
                        </div>
                        <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff', marginBottom: 12, letterSpacing: 4 }}>
                            {soldNotification.playerName}
                        </div>
                        <div style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 600, marginBottom: 16 }}>
                            to
                        </div>
                        <div style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#FFD700', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 2 }}>
                            {soldNotification.teamName}
                        </div>
                        <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#fff', letterSpacing: 2 }}>
                            ₹{(soldNotification.amount / 1000).toFixed(0)}K
                        </div>
                    </div>
                </>
            )}

            <style>{`
                @keyframes bidExplosion {
                    0% {
                        transform: translate(-50%, -50%) scale(0.3) rotate(-15deg);
                        opacity: 0;
                    }
                    60% {
                        transform: translate(-50%, -50%) scale(1.15) rotate(5deg);
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(1) rotate(0deg);
                        opacity: 1;
                    }
                }
                
                @keyframes glowPulse {
                    0%, 100% {
                        opacity: 0.3;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.6;
                        transform: scale(1.05);
                    }
                }
                
                @keyframes bounce {
                    0%, 100% {
                        transform: translateY(0) scale(1);
                    }
                    25% {
                        transform: translateY(-20px) scale(1.1);
                    }
                    50% {
                        transform: translateY(0) scale(1);
                    }
                    75% {
                        transform: translateY(-10px) scale(1.05);
                    }
                }
                
                @keyframes sparkle {
                    0%, 100% {
                        opacity: 0;
                        transform: scale(0);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                @keyframes rotate360 {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
                
                @keyframes soldCelebration {
                    0% {
                        transform: translate(-50%, -50%) scale(0.5) rotate(-10deg);
                        opacity: 0;
                    }
                    50% {
                        transform: translate(-50%, -50%) scale(1.1) rotate(5deg);
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(1) rotate(0deg);
                        opacity: 1;
                    }
                }
                
                @keyframes confettiFall {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
                
                @keyframes timerPulse {
                    0%, 100% {
                        transform: scale(1);
                        text-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
                    }
                    50% {
                        transform: scale(1.05);
                        text-shadow: 0 0 30px rgba(239, 68, 68, 0.6);
                    }
                }
            `}</style>

            <div className="page-hero" style={{ padding: '0px 0 48px' }}>
                <div className="section-tag">
                    {isLive ? <><span className="live-dot" style={{ display: 'inline-block', marginRight: 6 }} />LIVE</> : 'Auction'}
                </div>
                <h1>RPL Auction 2026</h1>
                <p>{isLive ? 'Live auction in progress — players are being sold!' : 'Auction is not live yet. Check back soon!'}</p>
            </div>

            <section className="section" style={{ paddingTop: 0 }}>
                <div className="container">
                    {!auction || auction.status === 'scheduled' ? (
                        <div className="empty-state">
                            <div className="empty-icon" style={{ fontSize: '4rem' }}>🏏</div>
                            <h3>Auction Not Started Yet</h3>
                            <p>The auction will begin soon. Teams and players are being set up.</p>
                            <div style={{ marginTop: 16, padding: '12px 20px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 10, color: 'var(--gold)', fontSize: '0.875rem' }}>
                                📢 Admin will start the auction shortly
                            </div>
                        </div>
                    ) : auction.status === 'completed' ? (
                        <div className="empty-state">
                            <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎉</div>
                            <h3>Auction Completed!</h3>
                            <p>All players have been auctioned. Check the teams page to see squad compositions.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                            {/* Main Auction Panel */}
                            <div className="auction-main">
                                {/* Current Player */}
                                {player ? (
                                    <div className="auction-screen" style={{ marginBottom: 24 }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>
                                            On Auction
                                        </div>

                                        {/* Timer */}
                                        <div className="bid-timer" style={{ 
                                            marginBottom: 8,
                                            color: timer <= 10 ? '#ef4444' : 'var(--gold)',
                                            animation: timer <= 10 ? 'timerPulse 1s ease-in-out infinite' : 'none'
                                        }}>
                                            {String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}
                                        </div>
                                        <div style={{ 
                                            fontSize: '0.75rem', 
                                            color: timer <= 10 ? '#ef4444' : 'var(--text-muted)', 
                                            marginBottom: 24,
                                            fontWeight: timer <= 10 ? 600 : 400
                                        }}>
                                            {timer <= 10 ? 'GOING... GOING...' : 'Timer'}
                                        </div>

                                        {playerImg ? (
                                            <img src={playerImg} alt={player.name} className="auction-player-img" />
                                        ) : (
                                            <div style={{
                                                width: 160, height: 160, borderRadius: 'var(--radius-lg)',
                                                background: 'var(--bg-elevated)', border: '3px solid var(--border)',
                                                margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <GiCricketBat style={{ fontSize: '4rem', opacity: 0.3 }} />
                                            </div>
                                        )}

                                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', letterSpacing: 4, margin: '0 0 4px' }}>
                                            {player.name}
                                        </h2>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
                                            <span className="badge badge-white">{player.role}</span>
                                            <span className="badge badge-gold">Base: ₹{(player.basePrice / 1000).toFixed(0)}K</span>
                                            {player.isIconPlayer && (
                                                <span className="badge badge-gold" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    ⭐ ICON PLAYER
                                                </span>
                                            )}
                                        </div>

                                        {/* Current Bid */}
                                        <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: 20 }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Current Highest Bid</div>
                                            <div className="current-bid">₹{((auction.currentBid || player.basePrice) / 1000).toFixed(0)}K</div>
                                            {auction.currentBidTeam && (
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 12 }}>
                                                    {bidTeamLogo && <img src={bidTeamLogo} style={{ width: 28, height: 28, objectFit: 'contain' }} alt="" />}
                                                    <span style={{ 
                                                        color: '#fff', 
                                                        fontSize: '1.5rem',
                                                        fontFamily: 'var(--font-heading)',
                                                        fontWeight: 700,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: 2
                                                    }}>{auction.currentBidTeam.name}</span>
                                                </div>
                                            )}
                                        </div>

                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                            Bidding is managed by the auction admin
                                        </p>
                                    </div>
                                ) : (
                                    <div className="auction-screen" style={{ marginBottom: 24 }}>
                                        <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏳</div>
                                        <h3>Waiting for next player...</h3>
                                    </div>
                                )}

                                {/* Auction Logs */}
                                {auction.logs?.length > 0 && (
                                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
                                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>
                                            Auction History
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
                                            {[...auction.logs].reverse().map((log, i) => (
                                                <div key={i} style={{
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    padding: '10px 14px', background: 'var(--bg-glass)', borderRadius: 8,
                                                }}>
                                                    <div>
                                                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{log.playerName}</span>
                                                        {log.action === 'SOLD' && (
                                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}> → {log.teamName}</span>
                                                        )}
                                                    </div>
                                                    <span className={`badge ${log.action === 'SOLD' ? 'badge-green' : 'badge-red'}`}>
                                                        {log.action === 'SOLD' ? `₹${(log.amount / 1000).toFixed(0)}K` : 'UNSOLD'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Teams Section */}
                            <div style={{ 
                                background: 'var(--bg-card)', 
                                border: '1px solid var(--border)', 
                                borderRadius: 'var(--radius-lg)', 
                                padding: 24 
                            }}>
                                <h3 style={{ 
                                    fontFamily: 'var(--font-heading)', 
                                    fontSize: '1.1rem', 
                                    textTransform: 'uppercase', 
                                    letterSpacing: 2, 
                                    marginBottom: 20,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <FiUsers style={{ marginRight: 8 }} />Teams Purse
                                </h3>
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                    gap: 12 
                                }}>
                                    {teams.map(t => {
                                        const logo = getImageUrl(t.logo);
                                        const remaining = t.purse - t.purseSpent;
                                        return (
                                            <div key={t._id} style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: 12, 
                                                padding: '12px 16px', 
                                                borderRadius: 10, 
                                                background: 'var(--bg-glass)',
                                                border: '1px solid var(--border)',
                                                minWidth: 0
                                            }}>
                                                {logo ? <img src={logo} style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0 }} alt="" /> :
                                                    <div style={{ width: 32, height: 32, background: 'var(--bg-elevated)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0, fontWeight: 600 }}>{t.shortName}</div>}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.shortName}</div>
                                                </div>
                                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: remaining > 200000 ? 'var(--green)' : 'var(--red)' }}>
                                                        ₹{(remaining / 100000).toFixed(1)}L
                                                    </div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>remaining</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Player Queue */}
                            {auction.playerQueue?.length > 0 && (
                                <div style={{ 
                                    background: 'var(--bg-card)', 
                                    border: '1px solid var(--border)', 
                                    borderRadius: 'var(--radius-lg)', 
                                    padding: 24 
                                }}>
                                    <h3 style={{ 
                                        fontFamily: 'var(--font-heading)', 
                                        fontSize: '1.1rem', 
                                        textTransform: 'uppercase', 
                                        letterSpacing: 2, 
                                        marginBottom: 20,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <FiClock style={{ marginRight: 8 }} />Upcoming Players ({auction.playerQueue.length})
                                    </h3>
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                        gap: 10,
                                        maxHeight: 400, 
                                        overflowY: 'auto' 
                                    }}>
                                        {auction.playerQueue.slice(0, 20).map((p, i) => (
                                            <div key={p._id || i} style={{ 
                                                padding: '10px 14px', 
                                                borderRadius: 8, 
                                                background: i === 0 ? 'rgba(212,175,55,0.1)' : 'var(--bg-glass)', 
                                                border: i === 0 ? '1px solid rgba(212,175,55,0.3)' : '1px solid var(--border)',
                                                fontSize: '0.85rem', 
                                                display: 'flex', 
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <div>
                                                    <div style={{ fontWeight: 600, marginBottom: 2 }}>
                                                        {i === 0 ? '⏳ ' : `${i + 1}. `}{p.name}
                                                    </div>
                                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{p.role}</div>
                                                </div>
                                                <div style={{ color: 'var(--gold)', fontSize: '0.75rem', fontWeight: 600 }}>
                                                    ₹{(p.basePrice / 1000).toFixed(0)}K
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Auction;
