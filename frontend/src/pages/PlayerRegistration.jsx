import { useState, useRef } from 'react';
import { FiUpload, FiCheck, FiAlertCircle, FiUser, FiPhone } from 'react-icons/fi';
import { playersAPI } from '../services/api';
import toast from 'react-hot-toast';
import qrImage from '../assets/qr_image.jpeg';

const roles = ['Batsman', 'Bowler', 'All Rounder', 'Wicketkeeper'];

const FileUpload = ({ id, label, onChange, accept, preview, helperText }) => {
    const ref = useRef();
    const [file, setFile] = useState(null);
    const handleChange = (e) => {
        const f = e.target.files[0];
        if (f) { setFile(f); onChange(f); }
    };
    return (
        <div>
            <label className="form-label" htmlFor={id}>{label}</label>
            <div
                className={`file-upload-area ${file ? 'has-file' : ''}`}
                onClick={() => ref.current?.click()}
                style={{ cursor: 'pointer' }}
            >
                {file ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        {preview && <img src={URL.createObjectURL(file)} alt="preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />}
                        <FiCheck size={20} />
                        <span style={{ fontSize: '0.85rem' }}>{file.name}</span>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <FiUpload size={24} />
                        <span style={{ fontSize: '0.875rem' }}>Click to upload {label}</span>
                        {helperText && <span style={{ fontSize: '0.75rem' }}>{helperText}</span>}
                    </div>
                )}
                <input ref={ref} id={id} type="file" accept={accept} onChange={handleChange} style={{ display: 'none' }} />
            </div>
        </div>
    );
};

const PlayerRegistration = () => {
    const [form, setForm] = useState({
        fullName: '', mobile: '', role: '',
    });
    const [playerPhoto, setPlayerPhoto] = useState(null);
    const [paymentScreenshot, setPaymentScreenshot] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const REGISTRATION_FEE = 100;

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!paymentScreenshot) { toast.error('Please upload payment screenshot'); return; }
        if (!form.role) { toast.error('Please select your role'); return; }

        const data = new FormData();
        Object.keys(form).forEach(k => data.append(k, form[k]));
        if (playerPhoto) data.append('playerPhoto', playerPhoto);
        data.append('paymentScreenshot', paymentScreenshot);

        setLoading(true);
        try {
            await playersAPI.register(data);
            setSuccess(true);
            toast.success('Registration submitted successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{ paddingTop: 'var(--nav-height)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', maxWidth: 480, padding: 32 }} className="animate-fadeUp">
                    <div style={{ fontSize: '4rem', marginBottom: 20 }}>🏏</div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: 12 }}>Registration Submitted!</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
                        Your registration has been submitted. Our team will review your details and payment screenshot. You'll be notified once approved.
                    </p>
                    <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: 16, color: 'var(--green)', fontSize: '0.875rem' }}>
                        ✅ Check back for auction updates once your registration is approved.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ paddingTop: 'var(--nav-height)' }}>
            <div className="page-hero" style={{ padding: '80px 0 48px' }}>
                <div className="section-tag">Join RPL</div>
                <h1>Player Registration</h1>
                <p>Register for RPL — Pay the fee, submit your details, and get ready for the auction!</p>
            </div>

            <section className="section" style={{ paddingTop: 0 }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 40, alignItems: 'start' }}>

                        {/* FORM */}
                        <div>
                            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 32 }}>
                                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: 28, textTransform: 'uppercase', letterSpacing: 2 }}>
                                    Your Details
                                </h2>
                                <form onSubmit={handleSubmit} id="registration-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="reg-name">Full Name *</label>
                                            <div style={{ position: 'relative' }}>
                                                <FiUser style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                                <input id="reg-name" className="form-control" style={{ paddingLeft: 40 }}
                                                    type="text" name="fullName" placeholder="Your full name" required value={form.fullName} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="reg-mobile">Mobile Number *</label>
                                            <div style={{ position: 'relative' }}>
                                                <FiPhone style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                                <input id="reg-mobile" className="form-control" style={{ paddingLeft: 40 }}
                                                    type="tel" name="mobile" placeholder="+91 XXXXX XXXXX" required value={form.mobile} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="reg-role">Playing Role *</label>
                                        <select id="reg-role" className="form-control" name="role" required value={form.role} onChange={handleChange}>
                                            <option value="">Select Role</option>
                                            {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <FileUpload id="player-photo" label="Player Photo" onChange={setPlayerPhoto} accept="image/*" preview helperText="JPG, PNG up to 5MB" />
                                    </div>

                                    <div className="form-group">
                                        <FileUpload id="payment-screenshot" label="Payment Screenshot *" onChange={setPaymentScreenshot} accept="image/*" preview helperText="Upload after completing payment" />
                                    </div>

                                    <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center', marginTop: 8 }} disabled={loading} id="submit-registration">
                                        {loading ? 'Submitting...' : 'Submit Registration'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* PAYMENT INFO */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 32 }}>
                                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 2 }}>
                                    💳 Payment Instructions
                                </h3>

                                <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, padding: 20, marginBottom: 20, textAlign: 'center' }}>
                                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', color: 'var(--gold)', marginBottom: 4 }}>₹{REGISTRATION_FEE}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1 }}>Registration Fee</div>
                                </div>

                                {/* QR Code Display - Static Image */}
                                <div style={{
                                    background: '#fff',
                                    borderRadius: 12,
                                    padding: 16,
                                    marginBottom: 20,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    maxWidth: 300,
                                    margin: '0 auto 20px',
                                }}>
                                    <img src={qrImage} alt="UPI Payment QR Code" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 8 }} />
                                </div>

                                <ul style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {[
                                        '1. Scan the QR code with any UPI app',
                                        '2. Pay ₹100 registration fee',
                                        '3. Complete the payment',
                                        '4. Take screenshot of payment confirmation',
                                        '5. Upload screenshot in the form and submit',
                                    ].map((s, i) => (
                                        <li key={i} style={{ display: 'flex', gap: 8 }}>
                                            <span style={{ color: 'var(--green)' }}>✓</span>
                                            <span>{s}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 12, padding: 16 }}>
                                <div style={{ display: 'flex', gap: 10, color: 'var(--red)', fontSize: '0.85rem' }}>
                                    <FiAlertCircle style={{ flexShrink: 0, marginTop: 2 }} />
                                    <span>Payment screenshot is mandatory. Registration without payment proof will be rejected.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PlayerRegistration;
