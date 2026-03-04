'use client';

import { useState, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    Link as MuiLink,
} from '@mui/material';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import BrandLogo from '@/components/BrandLogo';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo');
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login({ email, password }, returnTo || undefined);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            }}
        >
            <Container maxWidth="sm">
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                        <BrandLogo size="lg" noLink showIcon />
                    </Box>
                    <Typography variant="body1" color="text.secondary" align="center" mb={4}>
                        Sağlıklı yaşamın dijital platformuna giriş yapın
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="E-posta"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            margin="normal"
                            autoComplete="email"
                        />
                        <TextField
                            fullWidth
                            label="Şifre"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            margin="normal"
                            autoComplete="current-password"
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                        </Button>
                    </form>

                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Hesabınız yok mu?{' '}
                            <MuiLink component={Link} href="/register/client">
                                Danışan olarak kayıt olun
                            </MuiLink>
                            {' veya '}
                            <MuiLink component={Link} href="/register/expert">
                                Uzman olarak kayıt olun
                            </MuiLink>
                        </Typography>
                    </Box>

                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <MuiLink component={Link} href="/" variant="body2">
                            Ana sayfaya dön
                        </MuiLink>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Yükleniyor...</Box>}>
            <LoginForm />
        </Suspense>
    );
}
