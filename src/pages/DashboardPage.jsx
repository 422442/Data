
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, LogOut, ChevronRight, Sun, Moon } from 'lucide-react';

const DashboardPage = ({ theme, toggleTheme }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const searchTimeout = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const input = document.getElementById('search-input');
        if (input) input.focus();

        if (!query.trim()) {
            setResults([]);
            return;
        }

        if (query.trim().length < 2) {
            setResults([]);
            return;
        }

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        searchTimeout.current = setTimeout(async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('students')
                    .select('id, name, roll_no')
                    .or(`name.ilike.%${query}%,roll_no.ilike.%${query}%`)
                    .limit(20);

                if (error) throw error;
                setResults(data || []);
            } catch (err) {
                console.error('Search error:', err);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(searchTimeout.current);
    }, [query]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const getStudentSnippet = (student) => {
        return {
            name: student.name || 'Unknown',
            rollNo: student.roll_no || 'N/A',
        };
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>

            {/* Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', marginBottom: '2rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    LTSU Data Viewer
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button onClick={toggleTheme} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 10px' }} title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}>
                        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                    <button onClick={handleLogout} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px', gap: '6px' }}>
                        <LogOut size={14} /> Sign Out
                    </button>
                </div>
            </div>

            {/* Hero / Search Area */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                    Student Directory
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                    Search by Name or Roll Number
                </p>

                <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
                    <Search
                        style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}
                        size={18}
                    />
                    <input
                        id="search-input"
                        type="text"
                        className="input-field"
                        placeholder="Type a name or roll number..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        style={{
                            paddingLeft: '2.75rem',
                            fontSize: '1rem',
                            paddingTop: '0.9rem',
                            paddingBottom: '0.9rem',
                            borderRadius: '10px',
                        }}
                    />
                    {loading && (
                        <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Searching...
                        </div>
                    )}
                </div>
            </div>

            {/* Results — Clean List Style */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {results.map((student) => {
                    const s = getStudentSnippet(student);
                    return (
                        <Link
                            key={student.id}
                            to={`/student/${student.id}`}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem 1.25rem',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '10px',
                                transition: 'all 0.15s ease',
                                cursor: 'pointer',
                            }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                            >
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: 'var(--bg-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--text-secondary)',
                                    flexShrink: 0,
                                }}>
                                    <User size={20} />
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '2px' }}>
                                        {s.name}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                                        <span style={{ fontFamily: 'monospace' }}>{s.rollNo}</span>
                                    </div>
                                </div>

                                <ChevronRight size={16} color="var(--text-secondary)" />
                            </div>
                        </Link>
                    );
                })}

                {query && results.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        No students found matching "<strong>{query}</strong>"
                    </div>
                )}
            </div>

        </div>
    );
};

export default DashboardPage;
