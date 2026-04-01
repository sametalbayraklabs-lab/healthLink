'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box, Typography, TextField, Button, Alert, Paper, CircularProgress,
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import api from '@/lib/api';

const ACCENT = '#1E8F8A';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            setError('Lütfen e-posta adresinizi girin.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await api.post('/api/auth/forgot-password', { email });
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Bir hata oluştu.');
        } finally {
            setLoading(false);
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
                <LockResetIcon sx={{ fontSize: 56, color: ACCENT, mb: 2 }} />

                <Typography variant="h5" fontWeight={700} gutterBottom>
                    Parolamı Unuttum
                </Typography>

                {!success ? (
                    <>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>
                            Kayıtlı e-posta adresinizi girin, size parola sıfırlama linki gönderelim.
                        </Typography>

                        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="E-posta"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                sx={{
                                    mb: 2,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '&.Mui-focused fieldset': { borderColor: ACCENT },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': { color: ACCENT },
                                }}
                            />
                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                disabled={loading}
                                sx={{
                                    bgcolor: ACCENT,
                                    '&:hover': { bgcolor: '#0F766E' },
                                    py: 1.3,
                                    borderRadius: 2,
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    mb: 1,
                                }}
                            >
                                {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Sıfırlama Linki Gönder'}
                            </Button>
                        </form>
                    </>
                ) : (
                    <>
                        <Alert severity="success" sx={{ mb: 2, borderRadius: 2, textAlign: 'left' }}>
                            Sıfırlama linki <strong>{email}</strong> adresine gönderildi. Lütfen e-postanızı kontrol edin.
                        </Alert>
                        <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
                            E-postayı göremiyorsanız spam/gereksiz klasörünü kontrol edin.
                        </Typography>
                    </>
                )}

                <Button
                    fullWidth
                    variant="text"
                    onClick={() => router.push('/login')}
                    sx={{ color: ACCENT, textTransform: 'none', fontWeight: 600, mt: 1 }}
                >
                    Giriş Sayfasına Dön
                </Button>
            </Paper>
        </Box>
    );
}
