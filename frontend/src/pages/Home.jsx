import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GiCricketBat, GiTrophy } from 'react-icons/gi';
import { FiArrowRight, FiUsers, FiCalendar, FiZap } from 'react-icons/fi';
import CountdownTimer from '../components/CountdownTimer';
import TeamCard from '../components/TeamCard';
import PlayerCard from '../components/PlayerCard';
import MatchCard from '../components/MatchCard';
import { teamsAPI, playersAPI, matchesAPI, announcementsAPI } from '../services/api';
import logo from '../assets/logo.png';

const Home = () => {
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [matches, setMatches] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    // Upcoming auction date placeholder
    const auctionDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [t, p, m, a] = await Promise.allSettled([
                    teamsAPI.getAll(),
                    playersAPI.getAll({ auctionStatus: 'upcoming' }),
                    matchesAPI.getAll(),
                    announcementsAPI.getAll(),
                ]);
                if (t.status === 'fulfilled') setTeams(t.value.data.teams || []);
                if (p.status === 'fulfilled') setPlayers(p.value.data.players?.slice(0, 8) || []);
                if (m.status === 'fulfilled') setMatches(m.value.data.matches || []);
                if (a.status === 'fulfilled') setAnnouncements(a.value.data.announcements || []);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const upcomingMatches = matches.filter(m => m.status === 'upcoming' || m.status === 'live');
    const liveMatch = matches.find(m => m.status === 'live');

    const stats = [
        { label: 'Teams', value: teams.length, icon: FiUsers },
        { label: 'Players', value: players.length + ' +', icon: GiCricketBat },
        { label: 'Matches', value: matches.length, icon: FiCalendar },
        { label: 'Seasons', value: 1, icon: GiTrophy },
    ];

    return (
        <div>
            {/* Announcement Ticker */}
            {announcements.length > 0 && (
                <div className="announcement-ticker" style={{ marginTop: 'var(--nav-height)' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '0 20px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gold)', whiteSpace: 'nowrap' }}>
                            📢 Latest:
                        </span>
                        <div style={{ overflow: 'hidden', flex: 1 }}>
                            <div className="ticker-content" style={{ display: 'flex', gap: 60 }}>
                                {[...announcements, ...announcements].map((a, i) => (
                                    <span key={i} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                                        {a.title} — {a.content}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* HERO SECTION */}
            <section className="hero" style={{ minHeight: announcements.length ? 'calc(100vh - 40px)' : '100vh', marginTop: announcements.length ? 0 : 'var(--nav-height)', position: 'relative', overflow: 'hidden' }}>
                <div className="hero-bg" />
                <div className="hero-grid" />

                {/* Animated Background Elements */}
                <div style={{
                    position: 'absolute',
                    top: '20%',
                    right: '10%',
                    width: 400,
                    height: 400,
                    background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(60px)',
                    animation: 'pulse 4s ease-in-out infinite',
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '10%',
                    left: '5%',
                    width: 300,
                    height: 300,
                    background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(50px)',
                    animation: 'pulse 5s ease-in-out infinite reverse',
                }} />

                <div className="container hero-content" style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', alignItems: 'center', gap: 60 }}>
                        {/* Left - Text Content */}
                        <div style={{ maxWidth: 700 }}>
                            <div className="section-tag" style={{ marginBottom: 24, animation: 'fadeInUp 0.6s ease-out' }}>
                                🏏 RPL — 2026
                            </div>

                            <h1 style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: 'clamp(3rem, 8vw, 6rem)',
                                letterSpacing: '8px',
                                lineHeight: 1.1,
                                textTransform: 'uppercase',
                                marginBottom: 24,
                                animation: 'fadeInUp 0.8s ease-out 0.2s backwards',
                            }}>
                                RAJIVNAGAR<br />
                                <span style={{ color: 'var(--text-secondary)' }}>PREMIER</span><br />
                                LEAGUE
                            </h1>

                            <p style={{ 
                                color: 'var(--text-secondary)', 
                                fontSize: '1.1rem', 
                                marginBottom: 40, 
                                maxWidth: 500, 
                                lineHeight: 1.8,
                                animation: 'fadeInUp 1s ease-out 0.4s backwards',
                            }}>
                                The ultimate cricket experience for Rajivnagar. Watch live auctions, track your favorite teams, and follow the action.
                            </p>

                            <div style={{ 
                                display: 'flex', 
                                gap: 16, 
                                flexWrap: 'wrap',
                                animation: 'fadeInUp 1.2s ease-out 0.6s backwards',
                            }}>
                                <Link to="/teams" className="btn btn-primary btn-lg" style={{
                                    background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                                    border: 'none',
                                    color: '#000',
                                    fontWeight: 700,
                                    boxShadow: '0 8px 24px rgba(212,175,55,0.3)',
                                    transition: 'all 0.3s ease',
                                }}>
                                    Explore Teams <FiArrowRight />
                                </Link>
                                <Link to="/register" className="btn btn-outline btn-lg" style={{
                                    borderColor: 'var(--gold)',
                                    color: 'var(--gold)',
                                }}>
                                    Register as Player
                                </Link>
                            </div>

                            {/* Stats */}
                            <div style={{ 
                                display: 'flex', 
                                gap: 40, 
                                marginTop: 60, 
                                flexWrap: 'wrap',
                                animation: 'fadeInUp 1.4s ease-out 0.8s backwards',
                            }}>
                                {stats.map((s, i) => (
                                    <div key={i} style={{ position: 'relative' }}>
                                        <div style={{ 
                                            fontFamily: 'var(--font-heading)', 
                                            fontSize: '2.5rem', 
                                            fontWeight: 700, 
                                            lineHeight: 1,
                                            background: 'linear-gradient(135deg, #fff 0%, var(--gold) 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                        }}>
                                            {s.value}
                                        </div>
                                        <div style={{ 
                                            fontSize: '0.75rem', 
                                            color: 'var(--text-muted)', 
                                            textTransform: 'uppercase', 
                                            letterSpacing: 1.5, 
                                            marginTop: 6,
                                            fontWeight: 600,
                                        }}>
                                            {s.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right - Animated Logo */}
                        <div style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            animation: 'fadeInRight 1s ease-out 0.4s backwards',
                        }}>
                            <div style={{ 
                                position: 'relative',
                                width: 380,
                                height: 380,
                            }}>
                                {/* Outer Hexagon Ring */}
                                <div style={{
                                    position: 'absolute',
                                    inset: -40,
                                    borderRadius: '50%',
                                    border: '2px solid transparent',
                                    background: 'linear-gradient(var(--bg-primary), var(--bg-primary)) padding-box, linear-gradient(135deg, rgba(212,175,55,0.6) 0%, rgba(255,215,0,0.8) 50%, rgba(212,175,55,0.6) 100%) border-box',
                                    animation: 'rotate 20s linear infinite',
                                }} />
                                
                                {/* Middle Ring - Clean Circle */}
                                <div style={{
                                    position: 'absolute',
                                    inset: -25,
                                    borderRadius: '50%',
                                    border: '1px solid rgba(212,175,55,0.3)',
                                    boxShadow: '0 0 20px rgba(212,175,55,0.2)',
                                }} />
                                
                                {/* Rotating Arc Segments */}
                                <div style={{
                                    position: 'absolute',
                                    inset: -30,
                                    borderRadius: '50%',
                                    background: `
                                        conic-gradient(
                                            from 0deg,
                                            transparent 0deg,
                                            rgba(255,215,0,0.8) 30deg,
                                            transparent 40deg,
                                            transparent 120deg,
                                            rgba(212,175,55,0.8) 150deg,
                                            transparent 160deg,
                                            transparent 240deg,
                                            rgba(255,215,0,0.8) 270deg,
                                            transparent 280deg
                                        )
                                    `,
                                    WebkitMask: 'radial-gradient(circle, transparent 96%, black 96%)',
                                    mask: 'radial-gradient(circle, transparent 96%, black 96%)',
                                    animation: 'rotate 15s linear infinite',
                                }} />
                                
                                {/* Inner Glow Ring */}
                                <div style={{
                                    position: 'absolute',
                                    inset: -10,
                                    borderRadius: '50%',
                                    background: 'radial-gradient(circle, transparent 95%, rgba(255,215,0,0.4) 95%, rgba(212,175,55,0.6) 97%, transparent 97%)',
                                    animation: 'rotate 25s linear infinite reverse',
                                }} />
                                
                                {/* Ambient Glow */}
                                <div style={{
                                    position: 'absolute',
                                    inset: -30,
                                    background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 60%)',
                                    borderRadius: '50%',
                                    filter: 'blur(40px)',
                                    animation: 'pulse 4s ease-in-out infinite',
                                }} />
                                
                                {/* Orbiting Light Points */}
                                <div style={{
                                    position: 'absolute',
                                    inset: -35,
                                    animation: 'rotate 30s linear infinite',
                                }}>
                                    {[0, 180].map((angle, i) => (
                                        <div key={i} style={{
                                            position: 'absolute',
                                            width: 6,
                                            height: 6,
                                            background: 'rgba(255,215,0,0.9)',
                                            borderRadius: '50%',
                                            top: '50%',
                                            left: '50%',
                                            transform: `rotate(${angle}deg) translateX(195px) translateY(-50%)`,
                                            boxShadow: '0 0 20px rgba(255,215,0,0.8), 0 0 40px rgba(212,175,55,0.4)',
                                            animation: `orbitPulse ${3 + i}s ease-in-out infinite`,
                                        }} />
                                    ))}
                                </div>
                                
                                {/* Logo Container with 3D Effect */}
                                <div style={{
                                    position: 'relative',
                                    width: '100%',
                                    height: '100%',
                                    background: 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(255,215,0,0.08) 50%, rgba(212,175,55,0.15) 100%)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '4px solid rgba(212,175,55,0.4)',
                                    boxShadow: `
                                        0 0 60px rgba(212,175,55,0.3),
                                        0 0 100px rgba(255,215,0,0.2),
                                        inset 0 0 60px rgba(212,175,55,0.1),
                                        inset 0 0 20px rgba(255,215,0,0.2)
                                    `,
                                    animation: 'logoFloat 4s ease-in-out infinite',
                                }}>
                                    {/* Inner Glow */}
                                    <div style={{
                                        position: 'absolute',
                                        inset: 20,
                                        background: 'radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%)',
                                        borderRadius: '50%',
                                        animation: 'pulse 4s ease-in-out infinite',
                                    }} />
                                    
                                    {/* Logo Image */}
                                    <img 
                                        src={logo} 
                                        alt="RPL Logo" 
                                        style={{
                                            width: 480,
                                            height: 480,
                                            objectFit: 'contain',
                                            filter: 'drop-shadow(0 15px 40px rgba(212,175,55,0.5)) brightness(1.1)',
                                            position: 'relative',
                                            zIndex: 2,
                                        }} 
                                    />
                                </div>
                                
                                {/* Orbiting Particles */}
                                <div style={{
                                    position: 'absolute',
                                    inset: -40,
                                    animation: 'rotate 40s linear infinite',
                                }}>
                                    {[0, 120, 240].map((angle, i) => (
                                        <div key={i} style={{
                                            position: 'absolute',
                                            width: 8,
                                            height: 8,
                                            background: 'radial-gradient(circle, rgba(255,215,0,0.8), transparent)',
                                            borderRadius: '50%',
                                            top: '50%',
                                            left: '50%',
                                            transform: `rotate(${angle}deg) translateX(200px) translateY(-50%)`,
                                            boxShadow: '0 0 10px rgba(255,215,0,0.6)',
                                            animation: `particlePulse ${2 + i * 0.5}s ease-in-out infinite`,
                                        }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div style={{ 
                    position: 'absolute', 
                    bottom: 40, 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: 8, 
                    color: 'var(--text-muted)', 
                    fontSize: '0.7rem', 
                    letterSpacing: 2,
                    animation: 'bounce 2s ease-in-out infinite',
                }}>
                    <span>SCROLL</span>
                    <div style={{ 
                        width: 1, 
                        height: 40, 
                        background: 'linear-gradient(to bottom, var(--gold), transparent)',
                    }} />
                </div>

                {/* CSS Animations */}
                <style>{`
                    @keyframes fadeInUp {
                        from {
                            opacity: 0;
                            transform: translateY(30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    
                    @keyframes fadeInRight {
                        from {
                            opacity: 0;
                            transform: translateX(50px);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }
                    
                   
                    
                    @keyframes pulse {
                        0%, 100% { 
                            opacity: 0.4;
                        }
                        50% { 
                            opacity: 0.8;
                        }
                    }
                    
                    @keyframes rotate {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    
                    @keyframes particlePulse {
                        0%, 100% {
                            opacity: 0.3;
                            transform: scale(1);
                        }
                        50% {
                            opacity: 1;
                            transform: scale(1.5);
                        }
                    }
                    
                    @keyframes cornerPulse {
                        0%, 100% {
                            opacity: 0.6;
                            boxShadow: 0 0 15px rgba(255,215,0,0.8);
                        }
                        50% {
                            opacity: 1;
                            boxShadow: 0 0 25px rgba(255,215,0,1);
                        }
                    }
                    
                    @keyframes orbitPulse {
                        0%, 100% {
                            opacity: 0.5;
                            transform: scale(1);
                        }
                        50% {
                            opacity: 1;
                            transform: scale(1.8);
                        }
                    }
                    
                    @keyframes bounce {
                        0%, 100% { transform: translateX(-50%) translateY(0); }
                        50% { transform: translateX(-50%) translateY(-10px); }
                    }
                    
                    .btn-primary:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 12px 32px rgba(212,175,55,0.4) !important;
                    }
                    
                    @media (max-width: 1024px) {
                        .hero-content > div {
                            grid-template-columns: 1fr !important;
                            text-align: center;
                        }
                        .hero-content > div > div:last-child {
                            display: none;
                        }
                    }
                `}</style>
            </section>

            {/* LIVE MATCH BANNER */}
            {liveMatch && (
                <section style={{ background: 'rgba(239,68,68,0.05)', borderTop: '1px solid rgba(239,68,68,0.2)', borderBottom: '1px solid rgba(239,68,68,0.2)', padding: '20px 0' }}>
                    <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                        <span className="live-badge"><span className="live-dot" /> LIVE</span>
                        <MatchCard match={liveMatch} />
                    </div>
                </section>
            )}

            {/* UPCOMING MATCHES */}
            {upcomingMatches.length > 0 && (
                <section className="section">
                    <div className="container">
                        <div className="section-header">
                            <div className="section-tag">Schedule</div>
                            <h2>Upcoming <span className="text-gradient">Matches</span></h2>
                            <p>Don't miss the action — check out upcoming fixtures</p>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
                                {upcomingMatches.slice(0, 6).map(m => <MatchCard key={m._id} match={m} />)}
                            </div>
                            {upcomingMatches.length > 6 && (
                                <div style={{ textAlign: 'center', marginTop: 32 }}>
                                    <Link to="/matches" className="btn btn-outline">View All Matches <FiArrowRight /></Link>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* COUNTDOWN */}
            <section className="section" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <div className="section-tag">Auction</div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 4rem)', letterSpacing: 4, marginBottom: 12 }}>
                        RPL AUCTION 2026
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 40 }}>Live player auction — watch teams battle for the best talent</p>
                    <CountdownTimer targetDate={auctionDate} label="Auction Begins In" />
                    <div style={{ marginTop: 32 }}>
                        <Link to="/auction" className="btn btn-gold btn-lg">
                            <FiZap /> View Auction
                        </Link>
                    </div>
                </div>
            </section>

            {/* FEATURED TEAMS */}
            {teams.length > 0 && (
                <section className="section">
                    <div className="container">
                        <div className="section-header">
                            <div className="section-tag">Teams</div>
                            <h2>The <span className="text-gradient">Squads</span></h2>
                            <p>Meet the teams competing in RPL Season 1</p>
                        </div>
                        <div className="grid-4">
                            {teams.slice(0, 8).map(t => <TeamCard key={t._id} team={t} />)}
                        </div>
                        {teams.length > 8 && (
                            <div style={{ textAlign: 'center', marginTop: 32 }}>
                                <Link to="/teams" className="btn btn-outline">All Teams <FiArrowRight /></Link>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* FEATURED PLAYERS */}
            {players.length > 0 && (
                <section className="section" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
                    <div className="container">
                        <div className="section-header">
                            <div className="section-tag">Players</div>
                            <h2>Featured <span className="text-gradient">Players</span></h2>
                            <p>Cricketers ready for the auction</p>
                        </div>
                        <div className="grid-4">
                            {players.map(p => <PlayerCard key={p._id} player={p} />)}
                        </div>
                        <div style={{ textAlign: 'center', marginTop: 32 }}>
                            <Link to="/players" className="btn btn-outline">View All Players <FiArrowRight /></Link>
                        </div>
                    </div>
                </section>
            )}

            {/* REGISTER CTA */}
            <section className="section">
                <div className="container">
                    <div style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-xl)',
                        padding: 'clamp(40px, 6vw, 80px)',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.06) 0%, transparent 70%)',
                            pointerEvents: 'none',
                        }} />
                        <GiCricketBat style={{ fontSize: '3rem', margin: '0 auto 20px', display: 'block', opacity: 0.6 }} />
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 4rem)', letterSpacing: 4, marginBottom: 16 }}>
                            READY TO PLAY?
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
                            Register now as a player for RPL Season 1. Showcase your talent in the auction and get picked by a team.
                        </p>
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Register Now <FiArrowRight />
                        </Link>
                    </div>
                </div>
            </section>

            {/* SPONSORS */}
            <section className="section" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="container">
                    <p style={{ textAlign: 'center', fontSize: '0.75rem', letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 32 }}>
                        Our Partners & Sponsors
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 40, flexWrap: 'wrap', opacity: 0.4 }}>
                        {['SPONSOR 1', 'SPONSOR 2', 'SPONSOR 3', 'SPONSOR 4', 'SPONSOR 5'].map((s, i) => (
                            <div key={i} style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '1.2rem',
                                letterSpacing: 3,
                                color: 'var(--text-secondary)',
                                padding: '10px 20px',
                                border: '1px solid var(--border)',
                                borderRadius: 8,
                            }}>{s}</div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
