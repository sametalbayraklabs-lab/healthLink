'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography, Container, Button } from '@mui/material';
import api from '@/lib/api';
import VideoRoom from '@/components/video/VideoRoom';

export default function ExpertMeetingPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [meetingData, setMeetingData] = useState<{ meetingUrl: string; token: string } | null>(null);
    const joinedRef = useRef(false);

    useEffect(() => {
        if (!id || joinedRef.current) return;

        const controller = new AbortController();

        const initSession = async () => {
            try {
                // start-session now handles both Scheduled and InProgress:
                // - If Scheduled → creates room, sets InProgress
                // - If InProgress → reuses existing room, returns token
                const res = await api.post(`/api/appointments/${id}/start-session`, null, {
                    signal: controller.signal
                });
                if (!controller.signal.aborted) {
                    setMeetingData(res.data);
                    joinedRef.current = true;
                }
            } catch (err: any) {
                if (controller.signal.aborted) return;
                console.error('Session init error:', err);
                const msg = err.response?.data?.error || err.response?.data?.fallbackMessage || 'Görüşme başlatılamadı.';
                setError(msg);
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        initSession();

        return () => controller.abort();
    }, [id]);

    const handleLeave = () => {
        router.push('/expert/appointments');
    };

    if (loading) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 2 }}>Görüşme Hazırlanıyor...</Typography>
                <Typography variant="body2" color="text.secondary">Oda oluşturuluyor, lütfen bekleyiniz.</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
                <Box p={4} bgcolor="#fff3f3" borderRadius={2} border="1px solid #ffcdd2">
                    <Typography variant="h5" color="error" gutterBottom>Başlatma Hatası</Typography>
                    <Typography variant="body1" paragraph>{error}</Typography>
                    <Button variant="contained" onClick={() => router.back()} sx={{ mr: 2 }}>
                        Geri Dön
                    </Button>
                    <Button variant="outlined" onClick={() => window.location.reload()}>
                        Tekrar Dene
                    </Button>
                </Box>
            </Container>
        );
    }

    if (!meetingData) return null;

    return (
        <VideoRoom
            appointmentId={parseInt(id)}
            meetingUrl={meetingData.meetingUrl}
            token={meetingData.token}
            role="expert"
            onLeave={handleLeave}
        />
    );
}
