import { useState, useEffect } from "react";

const formatCountdown = (totalSeconds: number): string => {
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
};

export const useCountdown = (deadline: string | null | undefined): string | null => {
    const [remaining, setRemaining] = useState<number | null>(() => {
        if (!deadline) return null;
        const diff = Math.floor((new Date(deadline).getTime() - Date.now()) / 1000);
        return diff > 0 ? diff : null;
    });

    useEffect(() => {
        if (!deadline) {
            setRemaining(null);
            return;
        }

        const update = () => {
            const diff = Math.floor((new Date(deadline).getTime() - Date.now()) / 1000);
            setRemaining(diff > 0 ? diff : null);
        };

        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, [deadline]);

    return remaining !== null ? formatCountdown(remaining) : null;
};
