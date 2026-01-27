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

export default function RegisterExpertPage() {
    const { registerExpert } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        expertType: '',
        title: '',
        bio: '',
        city: '',
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

        if (!formData.expertType) {
            setError('Lütfen uzmanlık alanınızı seçin');
            return;
        }

        setLoading(true);

        try {
            await registerExpert({
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone || undefined,
                expertType: formData.expertType,
                title: formData.title || undefined,
                bio: formData.bio || undefined,
                city: formData.city || undefined,
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
                background: 'linear-gradient(135deg, #00897b 0%, #4db6ac 100%)',
            }}
        >
            <Container maxWidth="md">
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight={600}>
                        Uzman Kaydı
                    </Typography>
                    <Typography variant="body1" color="text.secondary" align="center" mb={4}>
                        Diyetisyen olarak platforma katılın (Yakında psikolog ve spor koçu seçenekleri eklenecek)
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
                                select
                                label="Uzmanlık Alanı"
                                name="expertType"
                                value={formData.expertType}
                                onChange={handleChange}
                                required
                            >
                                <MenuItem value="Dietitian">Diyetisyen</MenuItem>
                                <MenuItem value="Psychologist">Psikolog (Yakında)</MenuItem>
                                <MenuItem value="SportsCoach">Spor Koçu (Yakında)</MenuItem>
                            </TextField>
                            <TextField
                                fullWidth
                                label="Unvan"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Örn: Klinik Diyetisyen, Beslenme Uzmanı"
                            />
                            <TextField
                                fullWidth
                                label="Şehir"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                            />
                            <TextField
                                fullWidth
                                label="Biyografi"
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                multiline
                                rows={3}
                                sx={{ gridColumn: { xs: '1', sm: 'span 2' } }}
                                placeholder="Kendiniz hakkında kısa bilgi..."
                            />
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
