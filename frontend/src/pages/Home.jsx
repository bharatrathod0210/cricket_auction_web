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
                        .hero-content > div > div:first-child {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                        }
                        .hero-content > div > div:first-child > div:last-child {
                            justify-content: center;
                        }
                        .hero-content > div > div:last-child {
                            display: none;
                        }
                    }
                    
                    @media (max-width: 768px) {
                        .hero h1 {
                            font-size: 2.5rem !important;
                            letter-spacing: 4px !important;
                        }
                        .hero .btn {
                            width: 100%;
                            justify-content: center;
                        }
                        .hero-content > div > div:first-child > div:nth-child(3) {
                            width: 100%;
                        }
                    }

                    /* --- NEW ATTRCTIVE STYLES --- */
                    .format-card {
                        background: var(--bg-glass);
                        border: 1px solid var(--border);
                        border-radius: var(--radius-lg);
                        padding: 40px 30px;
                        position: relative;
                        overflow: hidden;
                        transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                        z-index: 1;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                    }
                    .format-card::before {
                        content: '';
                        position: absolute;
                        inset: -2px;
                        background: linear-gradient(135deg, rgba(212,175,55,0.4), transparent, rgba(212,175,55,0.1));
                        z-index: -1;
                        border-radius: inherit;
                        opacity: 0;
                        transition: opacity 0.5s ease;
                    }
                    .format-card:hover {
                        transform: translateY(-12px) scale(1.02);
                        border-color: transparent;
                        box-shadow: 0 20px 40px rgba(0,0,0,0.6), 0 0 30px rgba(212,175,55,0.15);
                    }
                    .format-card:hover::before {
                        opacity: 1;
                    }
                    .format-icon-wrapper {
                        width: 80px;
                        height: 80px;
                        border-radius: 50%;
                        background: linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(255,215,0,0.05) 100%);
                        border: 1px solid rgba(212,175,55,0.3);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 2.2rem;
                        color: var(--gold);
                        margin-bottom: 24px;
                        transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                        box-shadow: inset 0 0 20px rgba(212,175,55,0.1);
                    }
                    .format-card:hover .format-icon-wrapper {
                        transform: rotateY(360deg) scale(1.1);
                        background: linear-gradient(135deg, var(--gold) 0%, #FFA500 100%);
                        color: #000;
                        box-shadow: 0 10px 20px rgba(212,175,55,0.4);
                        border-color: transparent;
                    }
                    .attractive-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                        gap: 30px;
                        position: relative;
                        z-index: 2;
                    }
                    .floating-element {
                        animation: floatElem 6s ease-in-out infinite;
                    }
                    .floating-element-delayed {
                        animation: floatElem 7s ease-in-out infinite 2s;
                    }
                    @keyframes floatElem {
                        0% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-20px) rotate(3deg); }
                        100% { transform: translateY(0px) rotate(0deg); }
                    }
                    
                    /* AI Driven Dynamic Glass Panel */
                    .ai-glass-panel {
                        background: rgba(20, 20, 20, 0.6);
                        backdrop-filter: blur(24px);
                        -webkit-backdrop-filter: blur(24px);
                        border: 1px solid rgba(255,255,255,0.05);
                        border-top: 1px solid rgba(255,255,255,0.1);
                        border-left: 1px solid rgba(255,255,255,0.1);
                        border-radius: var(--radius-xl);
                        padding: 60px 40px;
                        position: relative;
                        overflow: hidden;
                        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
                    }
                    .ai-glass-panel::after {
                        content: '';
                        position: absolute;
                        top: -50%;
                        left: -50%;
                        width: 200%;
                        height: 200%;
                        background: radial-gradient(circle at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 60%);
                        animation: rotate 20s linear infinite;
                        pointer-events: none;
                    }
                    
                    /* CSS 3D Pitch */
                    .cricket-scene-container {
                        perspective: 1000px;
                        width: 100%;
                        height: 350px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        position: relative;
                        margin-top: 20px;
                    }
                    .css-pitch {
                        width: 140px;
                        height: 300px;
                        background: linear-gradient(to bottom, rgba(212,175,55,0.1) 0%, rgba(139,115,36,0.3) 100%);
                        border: 2px solid rgba(212,175,55,0.3);
                        transform: rotateX(60deg) rotateZ(-15deg);
                        transform-style: preserve-3d;
                        position: relative;
                        box-shadow: 0 30px 40px rgba(0,0,0,0.6), inset 0 0 50px rgba(0,0,0,0.5);
                        transition: transform 0.5s ease;
                    }
                    .cricket-scene-container:hover .css-pitch {
                        transform: rotateX(50deg) rotateZ(0deg) scale(1.05);
                    }
                    .css-pitch-line {
                        position: absolute;
                        background: rgba(255,255,255,0.5);
                    }
                    .css-pitch-crease-top { top: 10%; left: 10%; width: 80%; height: 2px; }
                    .css-pitch-crease-bottom { bottom: 10%; left: 10%; width: 80%; height: 2px; }
                    .css-pitch-wide-left { top: 10%; left: 20%; width: 2px; height: 80%; }
                    .css-pitch-wide-right { top: 10%; right: 20%; width: 2px; height: 80%; }
                    
                    .css-stump-group {
                        position: absolute;
                        width: 20px;
                        height: 40px;
                        left: 50%;
                        transform: translateX(-50%) rotateX(-90deg);
                        transform-origin: bottom center;
                        display: flex;
                        justify-content: space-between;
                    }
                    .css-stump-top { top: 10%; }
                    .css-stump-bottom { bottom: 10%; }
                    .css-stump {
                        width: 3px;
                        height: 100%;
                        background: linear-gradient(to right, #ddd, #fff, #aaa);
                        border-radius: 2px;
                        box-shadow: 2px 2px 5px rgba(0,0,0,0.5);
                    }
                    .css-ball {
                        position: absolute;
                        width: 12px;
                        height: 12px;
                        background: radial-gradient(circle at 30% 30%, #ff4d4d, #b30000);
                        border-radius: 50%;
                        top: 80%;
                        left: 50%;
                        transform: translateX(-50%) translateZ(5px);
                        box-shadow: -5px 10px 10px rgba(0,0,0,0.6);
                        animation: bowlBall 2s infinite ease-out;
                    }
                    @keyframes bowlBall {
                        0% { top: 80%; left: 55%; transform: translateX(-50%) translateZ(5px); box-shadow: -5px 10px 10px rgba(0,0,0,0.6); }
                        50% { top: 40%; left: 45%; transform: translateX(-50%) translateZ(20px); box-shadow: -10px 20px 10px rgba(0,0,0,0.4); }
                        100% { top: 10%; left: 50%; transform: translateX(-50%) translateZ(5px); box-shadow: -2px 5px 5px rgba(0,0,0,0.6); }
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

            {/* ATTRCTIVE DESIGN: THE RPL FORMAT */}
            <section className="section" style={{ position: 'relative' }}>
                <div className="container">
                    <div className="section-header">
                        <div className="section-tag">Format</div>
                        <h2>The <span className="text-gradient">Battleground</span></h2>
                        <p>Experience cricket like never before. Designed for power, strategy, and pure entertainment.</p>
                    </div>

                    <div className="attractive-grid">
                        {/* Card 1 */}
                        <div className="format-card floating-element">
                            <div className="format-icon-wrapper">
                                <GiCricketBat />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: 12, fontFamily: 'var(--font-heading)' }}>T20 Format</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                High-octane action spanning 20 overs of pure power hitting, strategic fielding, and clinical bowling under the floodlights.
                            </p>
                        </div>
                        {/* Card 2 */}
                        <div className="format-card floating-element-delayed">
                            <div className="format-icon-wrapper">
                                <GiTrophy />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: 12, fontFamily: 'var(--font-heading)' }}>Grand Finale</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                The ultimate showdown where the top two teams lock horns to lift the stunning gold-plated RPL trophy.
                            </p>
                        </div>
                        {/* Card 3 */}
                        <div className="format-card floating-element">
                            <div className="format-icon-wrapper">
                                <FiUsers />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: 12, fontFamily: 'var(--font-heading)' }}>Elite Auctions</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                AI-driven, highly competitive player auctions where franchise owners battle for the most explosive talents in the game.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* AI DRIVEN STATIC CRICKET SCENE */}
            <section className="section" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="container">
                    <div className="ai-glass-panel">
                        <div className="section-tag" style={{ border: '1px solid var(--gold)', color: 'var(--gold)' }}>Stadium</div>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: 2, marginBottom: 20 }}>
                            IMMERSIVE <span style={{ color: 'var(--gold)' }}>CRICKET</span> STADIUM
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: 600, fontSize: '1.1rem', marginBottom: 40, position: 'relative', zIndex: 2 }}>
                            Step into the future of sports UI. The stadium is set, the pitch is ready, and the ball is moving. Feel the premium rush of the Rajivnagar Premier League.
                        </p>
                        
                        <div className="cricket-scene-container">
                            <div className="css-pitch">
                                <div className="css-pitch-line css-pitch-crease-top"></div>
                                <div className="css-pitch-line css-pitch-crease-bottom"></div>
                                <div className="css-pitch-line css-pitch-wide-left"></div>
                                <div className="css-pitch-line css-pitch-wide-right"></div>
                                
                                <div className="css-stump-group css-stump-top">
                                    <div className="css-stump"></div>
                                    <div className="css-stump"></div>
                                    <div className="css-stump"></div>
                                </div>
                                
                                <div className="css-stump-group css-stump-bottom">
                                    <div className="css-stump"></div>
                                    <div className="css-stump"></div>
                                    <div className="css-stump"></div>
                                </div>
                                <div className="css-ball"></div>
                            </div>
                        </div>
                        
                        <div style={{ position: 'absolute', top: -50, right: -50, opacity: 0.1, zIndex: 0, transform: 'rotate(15deg)' }}>
                            <GiCricketBat style={{ fontSize: '400px' }} />
                        </div>
                    </div>
                </div>
            </section>

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
