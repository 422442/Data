
import { useState, useEffect } from 'react';

/**
 * Custom hook to manage rate limiting for sensitive actions like login.
 * Persists state to localStorage to survive page refreshes.
 *
 * @param {string} key - Unique key for localStorage (e.g. 'login_attempts')
 * @param {number} maxAttempts - Number of allowed attempts before lockout (default: 5)
 * @param {number} initialLockoutTime - Initial lockout duration in seconds (default: 60)
 */
export const useRateLimit = (key = 'rate_limit', maxAttempts = 5, initialLockoutTime = 60) => {
    const [attempts, setAttempts] = useState(() => {
        const saved = localStorage.getItem(`${key}_attempts`);
        return saved ? parseInt(saved, 10) : 0;
    });

    const [lockedUntil, setLockedUntil] = useState(() => {
        const saved = localStorage.getItem(`${key}_locked_until`);
        return saved ? parseInt(saved, 10) : null;
    });

    const [timeLeft, setTimeLeft] = useState(0);

    // Sync state to localStorage
    useEffect(() => {
        localStorage.setItem(`${key}_attempts`, attempts.toString());
        if (lockedUntil) {
            localStorage.setItem(`${key}_locked_until`, lockedUntil.toString());
        } else {
            localStorage.removeItem(`${key}_locked_until`);
        }
    }, [attempts, lockedUntil, key]);

    // Timer countdown effect
    useEffect(() => {
        if (!lockedUntil) {
            setTimeLeft(0);
            return;
        }

        const checkTime = () => {
            const now = Date.now();
            if (now >= lockedUntil) {
                setLockedUntil(null);
                setAttempts(0); // Reset attempts after lockout expires
                setTimeLeft(0);
            } else {
                setTimeLeft(Math.ceil((lockedUntil - now) / 1000));
            }
        };

        checkTime(); // Initial check
        const interval = setInterval(checkTime, 1000);

        return () => clearInterval(interval);
    }, [lockedUntil]);

    const registerFailure = () => {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= maxAttempts) {
            // Exponential backoff: 1 min, 2 min, 4 min, etc.
            // But capped at say 15 minutes to avoid permanent lockout
            const multiplier = Math.pow(2, newAttempts - maxAttempts);
            const duration = Math.min(initialLockoutTime * multiplier, 15 * 60);

            const lockTime = Date.now() + (duration * 1000);
            setLockedUntil(lockTime);
            return { locked: true, duration };
        }
        return { locked: false, attempts: newAttempts };
    };

    const reset = () => {
        setAttempts(0);
        setLockedUntil(null);
        setTimeLeft(0);
        localStorage.removeItem(`${key}_attempts`);
        localStorage.removeItem(`${key}_locked_until`);
    };

    return {
        attempts,
        isLocked: !!lockedUntil,
        timeLeft,
        registerFailure,
        reset,
        remainingAttempts: Math.max(0, maxAttempts - attempts)
    };
};
