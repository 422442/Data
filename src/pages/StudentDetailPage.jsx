
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { ArrowLeft, User, Download, Eye, EyeOff, CreditCard, GraduationCap, BookOpen, Key, RefreshCw, Sun, Moon } from 'lucide-react';

const SENSITIVE_KEYS = ['password', 'aadhar', 'aadhar_number', 'dob', 'pin', 'secret', 'razorpay_signature', 'razorpay_payment_id'];

const HIDDEN_KEYS = ['id', 'created_at', 'createdAt', 'updatedAt', 'student_id', 'college_id', 'department_id', 'session_id', 'semester_id', 'student_semester_id', 'student_session_id', 'admission_class_id', 'admission_section_id', 'admission_semester_id', 'admission_enquiry_id', 'student_fee_details_id', 'concession_id', 'section_id', 'program_id'];

const StudentDetailPage = ({ theme, toggleTheme }) => {
    const { id } = useParams();
    const [student, setStudent] = useState(null);
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSensitive, setShowSensitive] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const [livePassword, setLivePassword] = useState(null);
    const [fetchingPassword, setFetchingPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const { data, error } = await supabase
                    .from('students')
                    .select('*')
                    .eq('id', id)
                    .single();
                if (error) throw error;
                setStudent(data);
                setStudentData(data.data || data);
            } catch (err) {
                console.error("Error fetching student details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStudent();
    }, [id]);

    // --- Helpers ---
    const isSensitive = (key) => SENSITIVE_KEYS.some(s => key.toLowerCase().includes(s));
    const isHiddenKey = (key) => HIDDEN_KEYS.includes(key);

    const isEmpty = (val) => {
        if (val === null || val === undefined || val === '' || val === 'null') return true;
        if (Array.isArray(val) && val.length === 0) return true;
        if (typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length === 0) return true;
        return false;
    };

    const formatKey = (key) => key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/\b\w/g, l => l.toUpperCase()).trim();

    const formatValue = (key, value) => {
        if (isEmpty(value)) return null;
        if (isSensitive(key) && !showSensitive) return '••••••••';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (typeof value === 'number') return value.toLocaleString();
        return String(value);
    };

    const tryParseJSON = (val) => {
        if (typeof val !== 'string') return val;
        const t = val.trim();
        if ((t.startsWith('[') && t.endsWith(']')) || (t.startsWith('{') && t.endsWith('}'))) {
            try { return JSON.parse(t); } catch { return val; }
        }
        return val;
    };

    // --- Renderers ---
    const renderKeyValue = (key, val) => {
        if (isEmpty(val) || isHiddenKey(key)) return null;
        if (typeof val === 'object') return null;
        if (typeof val === 'string') {
            const t = val.trim();
            if ((t.startsWith('[') && t.endsWith(']')) || (t.startsWith('{') && t.endsWith('}'))) return null;
        }
        const formatted = formatValue(key, val);
        if (!formatted) return null;
        return (
            <div key={key} style={styles.kvRow}>
                <span style={styles.kvLabel}>{formatKey(key)}</span>
                <span style={{ ...styles.kvValue, fontFamily: isSensitive(key) ? 'monospace' : 'inherit' }}>{formatted}</span>
            </div>
        );
    };

    const renderDataBlock = (dataObject) => {
        if (!dataObject || typeof dataObject !== 'object') return null;
        const processed = {};
        for (const [k, v] of Object.entries(dataObject)) processed[k] = tryParseJSON(v);

        const flatEntries = Object.entries(processed).filter(([k, v]) => !isEmpty(v) && !isHiddenKey(k) && typeof v !== 'object');
        const nestedEntries = Object.entries(processed).filter(([k, v]) => !isEmpty(v) && typeof v === 'object' && !Array.isArray(v));
        const arrayEntries = Object.entries(processed).filter(([k, v]) => !isEmpty(v) && Array.isArray(v) && v.length > 0);

        if (flatEntries.length === 0 && nestedEntries.length === 0 && arrayEntries.length === 0) return null;

        return (
            <>
                {flatEntries.map(([key, val]) => renderKeyValue(key, val))}

                {nestedEntries.map(([key, val]) => (
                    <div key={key} style={{ marginTop: '1.25rem' }}>
                        <div style={styles.subHeader}>{formatKey(key)}</div>
                        {Object.entries(val).filter(([k, v]) => !isEmpty(v) && !isHiddenKey(k) && typeof v !== 'object').map(([k, v]) => renderKeyValue(k, v))}
                    </div>
                ))}

                {arrayEntries.map(([key, arr]) => (
                    <div key={`arr-${key}`} style={{ marginTop: '1.25rem' }}>
                        <div style={{ ...styles.subHeader, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {formatKey(key)}
                            <span style={styles.badge}>{arr.length}</span>
                        </div>
                        {arr.map((item, idx) => {
                            if (typeof item !== 'object' || item === null) {
                                return <div key={idx} style={{ padding: '6px 0', fontSize: '0.9rem', borderBottom: '1px solid var(--border-subtle)' }}>{String(item)}</div>;
                            }
                            const itemEntries = Object.entries(item).filter(([k, v]) => !isEmpty(v) && !isHiddenKey(k) && typeof v !== 'object');
                            if (itemEntries.length === 0) return null;
                            return (
                                <div key={idx} style={styles.arrayCard}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>#{idx + 1}</div>
                                    {itemEntries.map(([k, v]) => renderKeyValue(k, v))}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </>
        );
    };

    const renderArrayBlock = (arr) => {
        if (!arr || arr.length === 0) return null;
        return arr.map((item, idx) => {
            if (typeof item !== 'object') return <div key={idx} style={{ padding: '8px 0' }}>{String(item)}</div>;
            const flatEntries = Object.entries(item).filter(([k, v]) => !isEmpty(v) && !isHiddenKey(k) && typeof v !== 'object');
            if (flatEntries.length === 0) return null;
            return (
                <div key={idx} style={{ ...styles.arrayCard, marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>#{idx + 1}</div>
                    {flatEntries.map(([key, val]) => renderKeyValue(key, val))}
                </div>
            );
        });
    };

    // --- Export ---
    const handleExport = () => {
        const d = studentData;
        let lines = [];
        lines.push('═══════════════════════════════════════════');
        lines.push('           LTSU STUDENT RECORD');
        lines.push('═══════════════════════════════════════════');
        lines.push(`Generated: ${new Date().toLocaleString()}`);
        lines.push(`Student ID: ${student.roll_no || student.id}`);
        lines.push(`Name: ${student.name || 'N/A'}`);
        lines.push(`Password: ${livePassword || studentData?.password || 'Not available'}`);
        lines.push('');
        const dumpFlat = (obj, indent = '') => {
            if (!obj || typeof obj !== 'object') return;
            Object.entries(obj).forEach(([k, v]) => {
                if (isEmpty(v)) return;
                if (typeof v === 'object' && !Array.isArray(v)) {
                    lines.push(''); lines.push(`${indent}[${formatKey(k)}]`); lines.push(`${indent}${'─'.repeat(30)}`);
                    dumpFlat(v, indent + '  ');
                } else if (Array.isArray(v)) {
                    lines.push(''); lines.push(`${indent}[${formatKey(k)} — ${v.length} items]`); lines.push(`${indent}${'─'.repeat(30)}`);
                    v.forEach((item, idx) => { lines.push(`${indent}  --- #${idx + 1} ---`); if (typeof item === 'object') dumpFlat(item, indent + '    '); else lines.push(`${indent}    ${item}`); });
                } else {
                    lines.push(`${indent}${formatKey(k).padEnd(30)}: ${v}`);
                }
            });
        };
        dumpFlat(d);
        lines.push(''); lines.push('═══════════════════════════════════════════'); lines.push('          END OF STUDENT RECORD'); lines.push('═══════════════════════════════════════════');
        const content = lines.join('\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `Student_${student.roll_no || student.id}.txt`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    };

    // --- Stats ---
    const calculateStats = () => {
        let totalPaid = 0, paymentCount = 0;
        const fees = studentData?.fees;
        if (fees) {
            const hist = fees.paymentHistory || [];
            if (Array.isArray(hist)) hist.forEach(p => { const amt = parseFloat(p.totalAmount || p.amount || 0); if (!isNaN(amt) && amt > 0) { totalPaid += amt; paymentCount++; } });
        }
        const sessionCount = Array.isArray(studentData?.sessions) ? studentData.sessions.length : 0;
        return { totalPaid, paymentCount, sessionCount };
    };

    // --- Build Tabs ---
    const buildTabs = useMemo(() => {
        if (!studentData) return [];
        const tabs = [];
        const base = studentData.base || {};
        const sessions = studentData.sessions || [];
        const fees = studentData.fees || {};
        const feeDetails = fees.feeDetails || [];
        const paymentHistory = fees.paymentHistory || [];

        // 1. Personal
        if (Object.keys(base).length > 0) {
            tabs.push({ id: 'personal', label: 'Personal', icon: <User size={15} />, render: () => renderDataBlock(base) });
        }

        // 2. Each Session as a tab
        sessions.forEach((session, idx) => {
            tabs.push({ id: `session-${idx}`, label: `Session ${idx + 1}`, icon: <GraduationCap size={15} />, render: () => renderDataBlock(session) });
        });

        // 3. Fee Details
        if (feeDetails.length > 0) {
            tabs.push({ id: 'feeDetails', label: 'Fee Breakdown', icon: <CreditCard size={15} />, render: () => renderArrayBlock(feeDetails) });
        }

        // 4. Payment History
        if (paymentHistory.length > 0) {
            tabs.push({ id: 'paymentHistory', label: 'Payments', icon: <CreditCard size={15} />, render: () => renderArrayBlock(paymentHistory) });
        }

        // 5. Catch-all
        Object.entries(studentData).forEach(([key, val]) => {
            if (['user_id', 'base', 'sessions', 'fees'].includes(key)) return;
            if (isEmpty(val)) return;
            if (Array.isArray(val) && val.length > 0) {
                tabs.push({ id: `extra-${key}`, label: formatKey(key), icon: <BookOpen size={15} />, render: () => renderArrayBlock(val) });
            } else if (typeof val === 'object' && val !== null) {
                tabs.push({ id: `extra-${key}`, label: formatKey(key), icon: <BookOpen size={15} />, render: () => renderDataBlock(val) });
            }
        });

        return tabs;
    }, [studentData, showSensitive]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'var(--text-secondary)' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: 32, height: 32, border: '3px solid var(--border-subtle)', borderTop: '3px solid var(--text-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                Loading student details...
            </div>
        </div>
    );
    if (!student) return <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-secondary)' }}>Student not found.</div>;

    const { totalPaid, paymentCount, sessionCount } = calculateStats();
    const base = studentData?.base || {};
    const currentTab = buildTabs.find(t => t.id === activeTab) || buildTabs[0];

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1rem 4rem' }}>

            {/* Back */}
            <div style={{ marginBottom: '1.25rem' }}>
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', gap: '0.5rem' }}>
                    <ArrowLeft size={16} /> Back to Search
                </Link>
            </div>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.2rem', letterSpacing: '-0.02em' }}>
                        {student.name || base.name || 'Student Detail'}
                    </h1>
                    <div style={{ display: 'flex', gap: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                        {student.roll_no && <span>{student.roll_no}</span>}
                        {student.roll_no && base.email && <span>•</span>}
                        {base.email && <span>{base.email}</span>}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button onClick={toggleTheme} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 10px' }} title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}>
                        {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowSensitive(!showSensitive)} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                        {showSensitive ? <EyeOff size={14} style={{ marginRight: '4px' }} /> : <Eye size={14} style={{ marginRight: '4px' }} />}
                        {showSensitive ? 'Hide' : 'Reveal'}
                    </button>
                    <button className="btn" onClick={handleExport} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                        <Download size={14} style={{ marginRight: '4px' }} />
                        Export
                    </button>
                </div>
            </div>

            {/* Password Card */}
            <div className="password-card" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                padding: '1rem 1.25rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                marginBottom: '1.5rem',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '8px',
                        background: 'var(--bg-secondary)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                        <Key size={16} color="var(--text-secondary)" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                            {livePassword ? 'Live Password' : 'Stored Password'}
                        </div>
                        <div
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                fontSize: '1.1rem', fontWeight: 600, fontFamily: 'monospace',
                                cursor: 'pointer', letterSpacing: '0.05em',
                                color: 'var(--text-primary)',
                            }}
                            title="Click to toggle visibility"
                        >
                            {showPassword
                                ? (livePassword || studentData?.password || 'Not available')
                                : (livePassword || studentData?.password ? '••••••••••••' : 'Not available')
                            }
                        </div>
                    </div>
                </div>
                <button
                    className="btn btn-secondary fetch-pwd-btn"
                    disabled={fetchingPassword}
                    onClick={async () => {
                        setFetchingPassword(true);
                        try {
                            const rollNo = student.roll_no || student.id;
                            const res = await fetch(`https://server.ltsu.in/api/student/password/${rollNo}`);
                            const data = await res.json();
                            if (data.password) {
                                setLivePassword(data.password);
                                setShowPassword(true);
                            }
                        } catch {
                        } finally {
                            setFetchingPassword(false);
                        }
                    }}
                    style={{
                        fontSize: '0.8rem', padding: '8px 14px',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        opacity: fetchingPassword ? 0.6 : 1,
                        whiteSpace: 'nowrap', flexShrink: 0,
                    }}
                >
                    <RefreshCw size={14} style={{
                        animation: fetchingPassword ? 'spin 1s linear infinite' : 'none',
                    }} />
                    {fetchingPassword ? 'Fetching...' : 'Fetch Latest'}
                </button>
            </div>

            {/* Stats Row */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Paid', value: `₹${totalPaid.toLocaleString()}` },
                    { label: 'Payments', value: paymentCount },
                    { label: 'Sessions', value: sessionCount },
                    { label: 'Status', value: 'Active', color: '#16a34a' },
                ].map(s => (
                    <div key={s.label} style={styles.statCard}>
                        <div style={styles.statLabel}>{s.label}</div>
                        <div style={{ ...styles.statValue, color: s.color || 'var(--text-primary)' }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Tab Bar */}
            <div style={styles.tabBar}>
                <div className="tab-scroll" style={styles.tabScroll}>
                    {buildTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                ...styles.tabBtn,
                                ...(activeTab === tab.id ? styles.tabActive : {}),
                            }}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div style={styles.tabContent}>
                {currentTab ? currentTab.render() : <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No data available.</div>}
            </div>

            <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .tab-scroll { justify-content: flex-start !important; }
        }
        @media (max-width: 640px) {
          .password-card {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .fetch-pwd-btn {
            width: 100% !important;
          }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
        .tab-scroll::-webkit-scrollbar { display: none; }
      `}</style>
        </div>
    );
};

// --- Styles ---
const styles = {
    kvRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '9px 0',
        borderBottom: '1px solid var(--border-subtle)',
        gap: '1rem',
    },
    kvLabel: {
        fontSize: '0.83rem',
        color: 'var(--text-secondary)',
        minWidth: '130px',
        flexShrink: 0,
    },
    kvValue: {
        fontSize: '0.88rem',
        color: 'var(--text-primary)',
        fontWeight: 500,
        textAlign: 'right',
        wordBreak: 'break-word',
    },
    subHeader: {
        fontSize: '0.78rem',
        fontWeight: 700,
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '0.5rem',
        paddingTop: '0.5rem',
        borderTop: '2px solid var(--border-subtle)',
    },
    badge: {
        fontSize: '0.7rem',
        background: 'var(--bg-secondary)',
        padding: '1px 6px',
        borderRadius: '4px',
        color: 'var(--text-secondary)',
    },
    arrayCard: {
        padding: '0.75rem',
        marginBottom: '0.5rem',
        background: 'var(--bg-secondary)',
        borderRadius: '8px',
        border: '1px solid var(--border-subtle)',
    },
    statCard: {
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '1rem',
    },
    statLabel: {
        fontSize: '0.7rem',
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '0.15rem',
    },
    statValue: {
        fontSize: '1.25rem',
        fontWeight: 700,
    },
    tabBar: {
        marginBottom: '0',
        position: 'sticky',
        top: 0,
        background: 'var(--bg-primary)',
        zIndex: 10,
    },
    tabScroll: {
        display: 'flex',
        justifyContent: 'center',
        gap: '0',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
    },
    tabBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '10px 16px',
        fontSize: '0.82rem',
        fontWeight: 500,
        color: 'var(--text-secondary)',
        background: 'none',
        border: 'none',
        borderBottomWidth: '2px',
        borderBottomStyle: 'solid',
        borderBottomColor: 'transparent',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.15s ease',
    },
    tabActive: {
        color: 'var(--text-primary)',
        borderBottomColor: 'var(--text-primary)',
        fontWeight: 600,
    },
    tabContent: {
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        minHeight: '300px',
        marginTop: '0.75rem',
    },
};

export default StudentDetailPage;
