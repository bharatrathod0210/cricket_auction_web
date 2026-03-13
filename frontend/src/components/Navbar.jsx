import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import logo from '../assets/logo.png';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => setIsOpen(false), [location]);

    const navLinks = [
        { to: '/', label: 'Home' },
        { to: '/teams', label: 'Teams' },
        { to: '/players', label: 'Players' },
        { to: '/matches', label: 'Matches' },
        { to: '/auction', label: 'Auction' },
        { to: '/tournament-stats', label: 'Stats' },
        { to: '/register', label: 'Register', highlight: true },
    ];

    return (
        <>
            <nav style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 999,
                height: 'var(--nav-height)',
                display: 'flex',
                alignItems: 'center',
                background: scrolled ? 'rgba(10,10,10,0.95)' : 'transparent',
                backdropFilter: scrolled ? 'blur(20px)' : 'none',
                borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
                transition: 'all 0.3s ease',
                padding: '0 24px',
            }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 1280, margin: '0 auto', padding: 0 }}>
                    {/* Logo */}
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img 
                            src={logo} 
                            alt="RPL Logo" 
                            style={{
                                width: 52,
                                height: 52,
                                objectFit: 'contain',
                                borderRadius: 12,
                            }} 
                        />
                        <div>
                            <div style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '1.5rem',
                                letterSpacing: '3px',
                                lineHeight: 1,
                                color: '#fff'
                            }}>RPL</div>
                            <div style={{ fontSize: '0.6rem', letterSpacing: '2px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                Rajivnagar Premier League
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hide-mobile">
                        {navLinks.map(link => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                style={({ isActive }) => ({
                                    padding: '8px 14px',
                                    borderRadius: 8,
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    color: link.highlight ? '#000' : isActive ? '#fff' : 'var(--text-secondary)',
                                    background: link.highlight ? '#fff' : isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                                    transition: 'all 0.2s',
                                    border: link.highlight ? '1px solid #fff' : '1px solid transparent',
                                })}
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', display: 'none' }}
                        className="mobile-menu-btn"
                        id="mobile-menu-toggle"
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 'var(--nav-height)',
                    left: 0,
                    right: 0,
                    background: 'var(--bg-secondary)',
                    borderBottom: '1px solid var(--border)',
                    zIndex: 998,
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    animation: 'fadeIn 0.2s ease',
                }}>
                    {navLinks.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            style={({ isActive }) => ({
                                padding: '12px 16px',
                                borderRadius: 10,
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                color: link.highlight ? '#000' : isActive ? '#fff' : 'var(--text-secondary)',
                                background: link.highlight ? '#fff' : isActive ? 'rgba(255,255,255,0.08)' : 'var(--bg-card)',
                                border: '1px solid var(--border)',
                            })}
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </div>
            )}

            <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
        </>
    );
};

export default Navbar;
