import { useState, useEffect } from 'react';

const CountdownTimer = ({ targetDate, label = 'Time Remaining' }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

    useEffect(() => {
        if (!targetDate) return;
        const calc = () => {
            const diff = new Date(targetDate) - new Date();
            if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                secs: Math.floor((diff % (1000 * 60)) / 1000),
            });
        };
        calc();
        const interval = setInterval(calc, 1000);
        return () => clearInterval(interval);
    }, [targetDate]);

    return (
        <div>
            {label && <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 12, textAlign: 'center' }}>{label}</p>}
            <div className="countdown">
                {[['days', timeLeft.days], ['hours', timeLeft.hours], ['mins', timeLeft.mins], ['secs', timeLeft.secs]].map(([u, v]) => (
                    <div key={u} className="countdown-unit">
                        <span className="value">{String(v).padStart(2, '0')}</span>
                        <span className="label">{u}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CountdownTimer;
