'use client';

import { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Paper,
    TextField,
    Button,
    Box,
    Alert,
    MenuItem,
    CircularProgress,
    Stack,
    Divider,
    Grid,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import api from '@/lib/api';
import type { ClientProfile, UpdateClientRequest } from '@/types/client';

export default function ClientProfilePage() {
    const [profile, setProfile] = useState<ClientProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        gender: '',
        birthDate: '',
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get<ClientProfile>('/api/client/my');
            setProfile(response.data);
            setFormData({
                firstName: response.data.firstName,
                lastName: response.data.lastName,
                phone: response.data.phone || '',
                gender: response.data.gender || '',
                birthDate: response.data.birthDate?.split('T')[0] || '',
            });
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            setError('Profil yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleEdit = () => {
        setEditMode(true);
        setSuccess(false);
        setError('');
    };

    const handleCancel = () => {
        setEditMode(false);
        if (profile) {
            setFormData({
                firstName: profile.firstName,
                lastName: profile.lastName,
                phone: profile.phone || '',
                gender: profile.gender || '',
                birthDate: profile.birthDate?.split('T')[0] || '',
            });
        }
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setSaving(true);

        try {
            const updateData: UpdateClientRequest = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone || undefined,
                gender: formData.gender || undefined,
                birthDate: formData.birthDate || undefined,
            };

            await api.put('/api/client/my', updateData);
            setSuccess(true);
            setEditMode(false);
            fetchProfile();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Profil güncellenemedi');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    const genderLabels: Record<string, string> = {
        'Male': 'Erkek',
        'Female': 'Kadın',
        'Other': 'Diğer',
        'PreferNotToSay': 'Belirtmek İstemiyorum'
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight={600}>
                    Profilim
                </Typography>
                {!editMode && (
                    <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={handleEdit}
                    >
                        Düzenle
                    </Button>
                )}
            </Box>

            {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    Profil başarıyla güncellendi
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 3 }}>
                {!editMode ? (
                    // Readonly View
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Ad
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                                {profile?.firstName || '-'}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Soyad
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                                {profile?.lastName || '-'}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                E-posta
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                                {profile?.email || '-'}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Telefon
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                                {profile?.phone || '-'}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Doğum Tarihi
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                                {profile?.birthDate ? new Date(profile.birthDate).toLocaleDateString('tr-TR') : '-'}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Cinsiyet
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                                {profile?.gender ? genderLabels[profile.gender] || profile.gender : '-'}
                            </Typography>
                        </Grid>
                    </Grid>
                ) : (
                    // Edit Form
                    <form onSubmit={handleSubmit}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
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
                                value={profile?.email || ''}
                                disabled
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
                                sx={{ gridColumn: { xs: '1', sm: 'span 2' } }}
                            >
                                <MenuItem value="">Seçiniz</MenuItem>
                                <MenuItem value="Male">Erkek</MenuItem>
                                <MenuItem value="Female">Kadın</MenuItem>
                                <MenuItem value="Other">Diğer</MenuItem>
                                <MenuItem value="PreferNotToSay">Belirtmek İstemiyorum</MenuItem>
                            </TextField>
                        </Box>

                        <Divider sx={{ my: 3 }} />
                        <Stack direction="row" spacing={2}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={saving}
                                startIcon={<SaveIcon />}
                            >
                                {saving ? 'Kaydediliyor...' : 'Kaydet'}
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={handleCancel}
                                disabled={saving}
                                startIcon={<CancelIcon />}
                            >
                                İptal
                            </Button>
                        </Stack>
                    </form>
                )}
            </Paper>
        </Container>
    );
}
