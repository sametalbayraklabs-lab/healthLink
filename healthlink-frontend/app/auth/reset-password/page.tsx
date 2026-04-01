'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Box, Typography, TextField, Button, Alert, Paper, CircularProgress,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import api from '@/lib/api';

const ACCENT = '#1E8F8A';

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token') || '';

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            setError('Parola en az 6 karakter olmalıdır.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Parolalar eşleşmiyor.');
            return;
        }
        if (!token) {
            setError('Geçersiz sıfırlama bağlantısı.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await api.post('/api/auth/reset-password', { token, newPassword });
            setSuccess(true);
            setTimeout(() => router.push('/login'), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Parola sıfırlanamadı.');
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
                <LockIcon sx={{ fontSize: 56, color: ACCENT, mb: 2 }} />

                <Typography variant="h5" fontWeight={700} gutterBottom>
                    Yeni Parola Belirle
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
                {success && (
                    <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                        Parolanız başarıyla değiştirildi! Giriş sayfasına yönlendiriliyorsunuz...
                    </Alert>
                )}

                {!success && (
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Yeni Parola"
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    '&.Mui-focused fieldset': { borderColor: ACCENT },
                                },
                                '& .MuiInputLabel-root.Mui-focused': { color: ACCENT },
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Parolayı Tekrarla"
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
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
                            }}
                        >
                            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Parolayı Değiştir'}
                        </Button>
                    </form>
                )}

                <Button
                    fullWidth
                    variant="text"
                    onClick={() => router.push('/login')}
                    sx={{ color: ACCENT, textTransform: 'none', fontWeight: 600, mt: 2 }}
                >
                    Giriş Sayfasına Dön
                </Button>
            </Paper>
        </Box>
    );
}
