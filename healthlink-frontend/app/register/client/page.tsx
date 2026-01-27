'use client';

import { useState } from 'react';
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
    MenuItem,
} from '@mui/material';
import Link from 'next/link';

export default function RegisterClientPage() {
    const { registerClient } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        birthDate: '',
        gender: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Şifreler eşleşmiyor');
            return;
        }

        if (formData.password.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır');
            return;
        }

        setLoading(true);

        try {
            await registerClient({
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone || undefined,
                birthDate: formData.birthDate || undefined,
                gender: formData.gender || undefined,
            });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.');
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
                py: 4,
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            }}
        >
            <Container maxWidth="md">
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight={600}>
                        Danışan Kaydı
                    </Typography>
                    <Typography variant="body1" color="text.secondary" align="center" mb={4}>
                        Diyetisyen danışmanlığı almak için kayıt olun
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                            <TextField
                                fullWidth
                                label="Ad"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                            <TextField
                                fullWidth
                                label="Soyad"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                            <TextField
                                fullWidth
                                label="E-posta"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                sx={{ gridColumn: { xs: '1', sm: 'span 2' } }}
                            />
                            <TextField
                                fullWidth
                                label="Telefon"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                            <TextField
                                fullWidth
                                label="Doğum Tarihi"
                                name="birthDate"
                                type="date"
                                value={formData.birthDate}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                fullWidth
                                select
                                label="Cinsiyet"
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <MenuItem value="Male">Erkek</MenuItem>
                                <MenuItem value="Female">Kadın</MenuItem>
                                <MenuItem value="Other">Diğer</MenuItem>
                                <MenuItem value="PreferNotToSay">Belirtmek İstemiyorum</MenuItem>
                            </TextField>
                            <TextField
                                fullWidth
                                label="Şifre"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <TextField
                                fullWidth
                                label="Şifre Tekrar"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
                        </Button>
                    </form>

                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Zaten hesabınız var mı?{' '}
                            <MuiLink component={Link} href="/login">
                                Giriş yapın
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
