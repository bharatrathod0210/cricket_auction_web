import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import logo from '../../assets/logo.png';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminSetup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [upiId, setUpiId] = useState('');
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await adminAPI.setup({ name, email, password, upiId });
            toast.success('Admin account created! Please login.');
            navigate('/admin/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Setup failed');
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
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', letterSpacing: 4 }}>ADMIN SETUP</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>Create the first Super Admin</div>
                </div>

                <form onSubmit={handleSubmit} id="admin-setup-form">
                    <div className="form-group">
                        <label className="form-label" htmlFor="setup-name">Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <FiUser style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                id="setup-name"
                                type="text"
                                className="form-control"
                                style={{ paddingLeft: 40 }}
                                placeholder="Admin Name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="setup-email">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <FiMail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                id="setup-email"
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
                        <label className="form-label" htmlFor="setup-password">Password</label>
                        <div style={{ position: 'relative' }}>
                            <FiLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                id="setup-password"
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

                    <div className="form-group">
                        <label className="form-label" htmlFor="setup-upi">UPI ID (for Player Registration Payments)</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="setup-upi"
                                type="text"
                                className="form-control"
                                placeholder="yourname@paytm"
                                value={upiId}
                                onChange={e => setUpiId(e.target.value)}
                            />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
                            Players will scan QR code to pay registration fee to this UPI ID
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center', marginTop: 8 }} disabled={loading}>
                        {loading ? 'Creating...' : 'Create Admin Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Already have an account?{' '}
                    <a href="/admin/login" style={{ color: '#fff' }}>Sign in here</a>
                </p>
            </div>
        </div>
    );
};

export default AdminSetup;
