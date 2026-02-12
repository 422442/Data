import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Lock, Sun, Moon, AlertTriangle } from 'lucide-react';
import { useRateLimit } from '../hooks/useRateLimit';

const LoginPage = ({ theme, toggleTheme }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Rate Limiting: 5 attempts allowed, starting with 30s lockout
    const {
        isLocked,
        timeLeft,
        registerFailure,
        reset,
        remainingAttempts
    } = useRateLimit('login_attempts', 5, 30);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (isLocked) {
            setError(`Account locked due to too many failed attempts. Please try again in ${timeLeft}s.`);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Assuming a single admin account for site-wide access
            const { data, error } = await supabase.auth.signInWithPassword({
                email: 'admin@ltsu.edu',
                password: password,
            });

            if (error) throw error;

            // On success, clear any previous rate limit tracking
            reset();

        } catch (err) {
            console.error(err);

            // Register the failure and check if we are now locked
            const result = registerFailure();
            const attemptsLeft = remainingAttempts - 1; // registerFailure updates state asynchronously, so calculate here for immediate feedback

            if (result && result.locked) {
                setError(`Too many failed attempts. You are locked out for ${Math.ceil(result.duration)} seconds.`);
            } else {
                setError(err.message || 'Access Denied. Check console.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            position: 'relative',
        }}>
            <button
                onClick={toggleTheme}
                className="btn btn-secondary"
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', padding: '8px', borderRadius: '8px' }}
                title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '3rem' }}>
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ padding: '1rem', background: isLocked ? '#ff444420' : 'var(--bg-secondary)', borderRadius: '50%', transition: 'background 0.3s' }}>
                        {isLocked ? <AlertTriangle size={32} color="#ff4444" /> : <Lock size={32} />}
                    </div>
                </div>

                <h2 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>
                    {isLocked ? 'Access Locked' : 'Secure Access'}
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                    {isLocked
                        ? `Too many failed attempts. Please wait ${timeLeft} seconds.`
                        : 'Please enter the master password to view the database.'}
                </p>

                <form onSubmit={handleLogin}>
                    <input
                        type="password"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-field"
                        style={{
                            marginBottom: '1rem',
                            textAlign: 'center',
                            letterSpacing: '0.2em',
                            borderColor: error ? '#ff4444' : undefined
                        }}
                        autoFocus
                        disabled={isLocked || loading}
                    />

                    {error && (
                        <div style={{ color: '#ff4444', fontSize: '0.85rem', marginBottom: '1rem' }}>
                            {error}
                        </div>
                    )}

                    {!isLocked && remainingAttempts < 5 && remainingAttempts > 0 && (
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '1rem' }}>
                            {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn"
                        style={{
                            width: '100%',
                            opacity: (isLocked || loading) ? 0.7 : 1,
                            cursor: (isLocked || loading) ? 'not-allowed' : 'pointer'
                        }}
                        disabled={loading || isLocked}
                    >
                        {loading ? 'Verifying...' : isLocked ? `Locked (${timeLeft}s)` : 'Unlock Database'}
                    </button>
                </form>
            </div>

            <div style={{ marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                LTSU Data Viewer • v1.0 • Secure Environment
            </div>
        </div>
    );
};

export default LoginPage;
