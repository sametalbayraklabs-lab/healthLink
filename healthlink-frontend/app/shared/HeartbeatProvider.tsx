'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107';

export default function HeartbeatProvider() {
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) return;

        const sendHeartbeat = () => {
            const currentToken = localStorage.getItem('accessToken');
            if (!currentToken) return;
            fetch(`${API_URL}/api/auth/heartbeat`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${currentToken}` },
            }).catch(() => { });
        };

        sendHeartbeat(); // Send immediately when authenticated
        const interval = setInterval(sendHeartbeat, 60000); // Every 60s
        return () => clearInterval(interval);
    }, [isAuthenticated]); // Re-run when auth state changes

    return null;
}
