'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Box, Typography, TextField, Button, Alert, Paper, CircularProgress,
} from '@mui/material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import api from '@/lib/api';

const ACCENT = '#1E8F8A';

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress sx={{ color: ACCENT }} /></Box>}>
            <VerifyEmailContent />
        </Suspense>
    );
}

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get('email') || '';

    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [cooldown, setCooldown] = useState(0);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newCode = [...code];
        newCode[index] = value.slice(-1);
        setCode(newCode);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newCode = [...code];
        for (let i = 0; i < paste.length; i++) {
            newCode[i] = paste[i];
        }
        setCode(newCode);
        if (paste.length > 0) {
            inputRefs.current[Math.min(paste.length, 5)]?.focus();
        }
    };

    const handleVerify = async () => {
        const fullCode = code.join('');
        if (fullCode.length !== 6) {
            setError('Lütfen 6 haneli doğrulama kodunu girin.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await api.post('/api/auth/verify-email', { email, code: fullCode });
            setSuccess(true);
            setTimeout(() => router.push('/login'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Doğrulama başarısız.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError('');
        try {
            await api.post('/api/auth/resend-verification', { email });
            setCooldown(60);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Kod gönderilemedi.');
        } finally {
            setResending(false);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2f1 50%, #f8fafc 100%)',
            p: 2,
        }}>
            <Paper sx={{
                maxWidth: 440,
                width: '100%',
                p: 4,
                borderRadius: 3,
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            }}>
                <MarkEmailReadIcon sx={{ fontSize: 56, color: ACCENT, mb: 2 }} />

                <Typography variant="h5" fontWeight={700} gutterBottom>
                    E-posta Doğrulama
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                    <strong>{email}</strong> adresine gönderilen 6 haneli kodu girin.
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
                {success && (
                    <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                        E-posta doğrulandı! Giriş sayfasına yönlendiriliyorsunuz...
                    </Alert>
                )}

                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 3 }} onPaste={handlePaste}>
                    {code.map((digit, i) => (
                        <TextField
                            key={i}
                            inputRef={el => { inputRefs.current[i] = el; }}
                            value={digit}
                            onChange={e => handleChange(i, e.target.value)}
                            onKeyDown={e => handleKeyDown(i, e)}
                            inputProps={{
                                maxLength: 1,
                                style: {
                                    textAlign: 'center',
                                    fontSize: '1.5rem',
                                    fontWeight: 700,
                                    width: 40,
                                    padding: '12px 0',
                                },
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    '&.Mui-focused fieldset': { borderColor: ACCENT },
                                },
                            }}
                            disabled={success}
                        />
                    ))}
                </Box>

                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleVerify}
                    disabled={loading || success}
                    sx={{
                        bgcolor: ACCENT,
                        '&:hover': { bgcolor: '#0F766E' },
                        py: 1.3,
                        borderRadius: 2,
                        fontWeight: 700,
                        textTransform: 'none',
                        fontSize: '1rem',
                        mb: 2,
                    }}
                >
                    {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Doğrula'}
                </Button>

                <Button
                    fullWidth
                    variant="text"
                    onClick={handleResend}
                    disabled={resending || cooldown > 0 || success}
                    sx={{
                        color: ACCENT,
                        textTransform: 'none',
                        fontWeight: 600,
                    }}
                >
                    {cooldown > 0
                        ? `Kodu Tekrar Gönder (${cooldown}s)`
                        : resending
                            ? 'Gönderiliyor...'
                            : 'Kodu Tekrar Gönder'}
                </Button>
            </Paper>
        </Box>
    );
}
