import { useState, useEffect } from 'react';

export function useOTPTimer(storageKey: string) {
    const [timeLeft, setTimeLeft] = useState<number>(0);

    // Initial check on mount
    useEffect(() => {
        const storedUnlockTime = localStorage.getItem(storageKey);
        if (storedUnlockTime) {
            const parsed = parseInt(storedUnlockTime, 10);
            const remaining = Math.ceil((parsed - Date.now()) / 1000);
            if (remaining > 0) {
                setTimeLeft(remaining);
            } else {
                localStorage.removeItem(storageKey);
            }
        }
    }, [storageKey]);

    // Timer interval logic
    useEffect(() => {
        if (timeLeft <= 0) return;
        
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    localStorage.removeItem(storageKey);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        
        return () => clearInterval(interval);
    }, [timeLeft, storageKey]);

    /**
     * Start or update the timer
     * @param seconds Sisa detik yang ditunggu
     */
    const startTimer = (seconds: number) => {
        const unlockTime = Date.now() + (seconds * 1000);
        localStorage.setItem(storageKey, unlockTime.toString());
        setTimeLeft(seconds);
    };

    const formatTime = () => {
        const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const s = (timeLeft % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return { 
        timeLeft, 
        startTimer, 
        formatTime, 
        isTimerActive: timeLeft > 0 
    };
}
