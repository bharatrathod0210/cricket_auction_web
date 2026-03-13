import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { FiInstagram, FiTwitter, FiFacebook, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer style={{
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border)',
            padding: '60px 0 32px',
        }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40, marginBottom: 48 }}>
                    {/* Brand */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <img 
                                src={logo} 
                                alt="RPL Logo" 
                                style={{
                                    width: 48,
                                    height: 48,
                                    objectFit: 'contain',
                                    borderRadius: 12,
                                }} 
                            />
                            <div>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', letterSpacing: '3px' }}>RPL</div>
                                <div style={{ fontSize: '0.6rem', letterSpacing: '2px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                    Rajivnagar Premier League
                                </div>
                            </div>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: 20 }}>
                            The premier cricket league of Rajivnagar, bringing community together through the spirit of cricket.
                        </p>
                        <div style={{ display: 'flex', gap: 10 }}>
                            {[FiInstagram, FiTwitter, FiFacebook, FiYoutube].map((Icon, i) => (
                                <a key={i} href="#" style={{
                                    width: 36,
                                    height: 36,
                                    background: 'var(--bg-glass)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 8,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--text-secondary)',
                                    transition: 'all 0.2s',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-glass)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                >
                                    <Icon />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 style={{ fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: 2, fontSize: '0.85rem', marginBottom: 20, color: 'var(--text-secondary)' }}>Quick Links</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[['/', 'Home'], ['/teams', 'Teams'], ['/players', 'Players'], ['/matches', 'Matches'], ['/auction', 'Auction'], ['/leaderboard', 'Leaderboard']].map(([to, label]) => (
                                <li key={to}>
                                    <Link to={to} style={{ color: 'var(--text-muted)', fontSize: '0.875rem', transition: 'color 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                                    >{label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* League Info */}
                    <div>
                        <h4 style={{ fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: 2, fontSize: '0.85rem', marginBottom: 20, color: 'var(--text-secondary)' }}>League Info</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[['/', 'About RPL'], ['/register', 'Player Registration'], ['/auction', 'Live Auction'], ['/leaderboard', 'Points Table']].map(([to, label]) => (
                                <li key={to}>
                                    <Link to={to} style={{ color: 'var(--text-muted)', fontSize: '0.875rem', transition: 'color 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                                    >{label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 style={{ fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: 2, fontSize: '0.85rem', marginBottom: 20, color: 'var(--text-secondary)' }}>Contact</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                <FiMapPin style={{ marginTop: 2, flexShrink: 0 }} />
                                <span>Rajivnagar, India</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                <FiPhone />
                                <a href="tel:+919016413790" style={{ color: 'inherit' }}>+91 9016413790</a>
                            </li>

                        </ul>
                    </div>
                </div>

                {/* Developer Credit Section */}
                <div style={{
                    borderTop: '1px solid var(--border)',
                    paddingTop: 24,
                    marginTop: 32,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 16,
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                        textAlign: 'center',
                    }}>
                        <div style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                        }}>
                            <span>Developed & Designed by</span>
                            <span style={{
                                color: 'var(--primary)',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                            }}>
                                Bharat Rathod
                            </span>
                        </div>
                        <a 
                            href="tel:+919898515206" 
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                color: 'var(--text-secondary)',
                                fontSize: '0.875rem',
                                textDecoration: 'none',
                                padding: '6px 12px',
                                background: 'var(--bg-glass)',
                                border: '1px solid var(--border)',
                                borderRadius: 20,
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.color = '#fff';
                                e.currentTarget.style.borderColor = 'var(--primary)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'var(--bg-glass)';
                                e.currentTarget.style.color = 'var(--text-secondary)';
                                e.currentTarget.style.borderColor = 'var(--border)';
                            }}
                        >
                            <FiPhone size={14} />
                            <span>+91 9898515206</span>
                        </a>
                    </div>
                    
                    <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        textAlign: 'center',
                    }}>
                        © {currentYear} Rajivnagar Premier League. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
