'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography, Container, Button } from '@mui/material';
import api from '@/lib/api';
import VideoRoom from '@/components/video/VideoRoom';

export default function ClientMeetingPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [meetingData, setMeetingData] = useState<{ meetingUrl: string; token: string } | null>(null);
    const joinedRef = useRef(false);

    useEffect(() => {
        if (!id || joinedRef.current) return;

        const joinSession = async () => {
            try {
                // Call GET /api/appointments/{id}/join
                const response = await api.get(`/api/appointments/${id}/join`);
                setMeetingData(response.data);
                joinedRef.current = true;
            } catch (err: any) {
                console.error('Join session error:', err);
                const msg = err.response?.data?.error || 'Görüşmeye katılınamadı. Lütfen tekrar deneyiniz.';
                setError(msg);
            } finally {
                setLoading(false);
            }
        };

        joinSession();
    }, [id]);

    const handleLeave = () => {
        router.push('/client/appointments');
    };

    if (loading) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 2 }}>Görüşmeye Bağlanılıyor...</Typography>
                <Typography variant="body2" color="text.secondary">Lütfen bekleyiniz, oda bilgileri alınıyor.</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
                <Box p={4} bgcolor="#fff3f3" borderRadius={2} border="1px solid #ffcdd2">
                    <Typography variant="h5" color="error" gutterBottom>Bağlantı Hatası</Typography>
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
            role="client"
            onLeave={handleLeave}
        />
    );
}
