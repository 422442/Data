
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Lock, Sun, Moon } from 'lucide-react';

const LoginPage = ({ theme, toggleTheme }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Assuming a single admin account for site-wide access
            const { data, error } = await supabase.auth.signInWithPassword({
                email: 'admin@ltsu.edu',
                password: password,
            });

            if (error) throw error;

        } catch (err) {
            console.error(err);
            setError(err.message || 'Access Denied. Check console.');
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
                    <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '50%' }}>
                        <Lock size={32} />
                    </div>
                </div>

                <h2 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Secure Access</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                    Please enter the master password to view the database.
                </p>

                <form onSubmit={handleLogin}>
                    <input
                        type="password"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-field"
                        style={{ marginBottom: '1rem', textAlign: 'center', letterSpacing: '0.2em' }}
                        autoFocus
                    />

                    {error && (
                        <div style={{ color: '#ff4444', fontSize: '0.85rem', marginBottom: '1rem' }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? 'Verifying...' : 'Unlock Database'}
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
