'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
import { Box, Typography, CircularProgress, Button, Paper, Container } from '@mui/material';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface VideoRoomProps {
    meetingUrl: string;
    token: string;
    appointmentId: number;
    role: 'expert' | 'client';
    onLeave?: () => void;
}

export default function VideoRoom({ meetingUrl, token, appointmentId, role, onLeave }: VideoRoomProps) {
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const frameRef = useRef<DailyCall | null>(null);

    const [status, setStatus] = useState<'checking' | 'denied' | 'joining' | 'joined' | 'error'>('checking');
    const [errorMsg, setErrorMsg] = useState('');

    // ── 1. Kamera / Mikrofon izin kontrolü ──
    const checkPermissions = useCallback(async () => {
        setStatus('checking');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            stream.getTracks().forEach(t => t.stop());   // izni aldık, track'leri kapa
            setStatus('joining');
        } catch {
            setStatus('denied');
        }
    }, []);

    useEffect(() => { checkPermissions(); }, [checkPermissions]);

    // ── 2. Daily Prebuilt iframe'ini oluştur ve odaya katıl ──
    const cleanupRef = useRef(false);

    useEffect(() => {
        if (status !== 'joining' || !containerRef.current || frameRef.current) return;
        cleanupRef.current = false;

        const init = async () => {
            try {
                const frame = DailyIframe.createFrame(containerRef.current!, {
                    iframeStyle: {
                        width: '100%',
                        height: '100%',
                        border: '0',
                    },
                    showLeaveButton: true,
                    showFullscreenButton: true,
                    theme: {
                        colors: {
                            accent: '#1976d2',
                            accentText: '#FFFFFF',
                            background: '#FFFFFF',
                        },
                    },
                });

                if (cleanupRef.current) {
                    frame.destroy();
                    return;
                }

                frameRef.current = frame;

                // ── Kullanıcı Daily built-in "Leave" butonuna bastığında ──
                frame.on('left-meeting', async () => {
                    // React cleanup tetiklediyse hiçbir şey yapma
                    if (cleanupRef.current) return;

                    // Daily built-in leave butonu sadece ayrılma yapar, seansı bitirmez
                    frame.destroy();
                    frameRef.current = null;

                    if (onLeave) {
                        onLeave();
                    } else {
                        router.back();
                    }
                });

                frame.on('error', (e) => {
                    console.error('Daily error:', e);
                    setErrorMsg('Video görüşmesinde bir hata oluştu.');
                    setStatus('error');
                });

                await frame.join({ url: meetingUrl, token });

                if (!cleanupRef.current) {
                    setStatus('joined');
                }
            } catch (err) {
                if (!cleanupRef.current) {
                    console.error('join failed:', err);
                    setErrorMsg('Görüşmeye katılınamadı. Lütfen tekrar deneyin.');
                    setStatus('error');
                }
            }
        };

        init();

        return () => {
            // Cleanup'ta frame destroy ETMİYORUZ.
            // StrictMode remount'ta status='joined' kalır ama frame yok → beyaz sayfa olur.
            // Frame sadece kullanıcı "Leave" butonuna basınca destroy edilir (left-meeting handler).
            // Sayfa navigasyonunda iframe DOM'dan otomatik kaldırılır.
            cleanupRef.current = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    // ── 3. Render ──

    // İzin kontrol
    if (status === 'checking') {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
                <CircularProgress size={56} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Kamera ve mikrofon kontrol ediliyor…
                </Typography>
            </Box>
        );
    }

    // İzin reddedildi
    if (status === 'denied') {
        return (
            <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
                <Paper sx={{ p: 4, bgcolor: '#fff3f3', border: '1px solid #ffcdd2', borderRadius: 3 }}>
                    <VideocamOffIcon sx={{ fontSize: 56, color: 'error.main', mb: 1 }} />
                    <Typography variant="h5" color="error" gutterBottom>
                        İzin Gerekli
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                        Görüşmeye katılabilmek için kamera ve mikrofon erişimine izin vermeniz gerekmektedir.
                        Tarayıcı adres çubuğundaki kamera simgesine tıklayarak izinleri açabilirsiniz.
                    </Typography>
                    <Button variant="contained" onClick={checkPermissions} sx={{ mr: 1 }}>
                        Tekrar Dene
                    </Button>
                    <Button variant="outlined" onClick={() => router.back()}>
                        Geri Dön
                    </Button>
                </Paper>
            </Container>
        );
    }

    // Hata ekranı
    if (status === 'error') {
        return (
            <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
                <Paper sx={{ p: 4, bgcolor: '#fff3f3', borderRadius: 3 }}>
                    <Typography variant="h6" color="error" gutterBottom>
                        {errorMsg || 'Bilinmeyen bir hata oluştu.'}
                    </Typography>
                    <Button variant="outlined" sx={{ mt: 2 }} onClick={() => router.back()}>
                        Geri Dön
                    </Button>
                </Paper>
            </Container>
        );
    }

    // Sadece ayrıl — complete-session çağırmadan
    const handleLeaveClick = () => {
        if (frameRef.current) {
            frameRef.current.destroy();
            frameRef.current = null;
        }

        if (onLeave) {
            onLeave();
        } else {
            router.back();
        }
    };

    // Görüşmeyi bitir — complete-session çağır
    const handleEndMeeting = async () => {
        if (!confirm('Görüşmeyi bitirmek istediğinizden emin misiniz?')) return;

        try {
            await api.post(`/api/appointments/${appointmentId}/complete-session`);
        } catch (err) {
            console.error('complete-session failed:', err);
        }

        if (frameRef.current) {
            frameRef.current.destroy();
            frameRef.current = null;
        }

        if (onLeave) {
            onLeave();
        } else {
            router.back();
        }
    };

    // Katılma aşaması + aktif görüşme
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* Üst bar */}
            {status === 'joined' && (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 2,
                        py: 1,
                        bgcolor: '#1a1a2e',
                        color: '#fff',
                        flexShrink: 0,
                    }}
                >
                    <Typography variant="subtitle1" fontWeight={600}>
                        🎥 HealthLink Görüşme
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            size="small"
                            sx={{ color: '#fff', borderColor: '#fff' }}
                            onClick={handleLeaveClick}
                        >
                            Görüşmeden Ayrıl
                        </Button>
                        {role === 'expert' && (
                            <Button
                                variant="contained"
                                color="error"
                                size="small"
                                onClick={handleEndMeeting}
                            >
                                Görüşmeyi Bitir
                            </Button>
                        )}
                    </Box>
                </Box>
            )}

            {/* Daily.co iframe container */}
            <Box
                ref={containerRef}
                sx={{
                    flex: 1,
                    bgcolor: status === 'joining' ? '#f5f5f5' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                }}
            >
                {status === 'joining' && (
                    <Box textAlign="center">
                        <CircularProgress size={48} />
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            Görüşmeye bağlanılıyor…
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
