import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome back, Admin!');
            navigate('/admin/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            padding: 20,
        }}>
            <div style={{
                width: '100%',
                maxWidth: 400,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
                padding: 40,
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <img 
                        src={logo} 
                        alt="RPL Logo" 
                        style={{
                            width: 70,
                            height: 70,
                            objectFit: 'contain',
                            borderRadius: 16,
                            margin: '0 auto 16px',
                            display: 'block',
                        }} 
                    />
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', letterSpacing: 4 }}>RPL ADMIN</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>Super Admin Dashboard</div>
                </div>

                <form onSubmit={handleSubmit} id="admin-login-form">
                    <div className="form-group">
                        <label className="form-label" htmlFor="admin-email">Email</label>
                        <div style={{ position: 'relative' }}>
                            <FiMail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                id="admin-email"
                                type="email"
                                className="form-control"
                                style={{ paddingLeft: 40 }}
                                placeholder="admin@rpl.cricket"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="admin-password">Password</label>
                        <div style={{ position: 'relative' }}>
                            <FiLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                id="admin-password"
                                type={show ? 'text' : 'password'}
                                className="form-control"
                                style={{ paddingLeft: 40, paddingRight: 40 }}
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShow(!show)}
                                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                            >
                                {show ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center', marginTop: 8 }} id="admin-login-btn" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    First time?{' '}
                    <a href="/admin/register" style={{ color: '#fff' }}>Create admin account</a>
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
