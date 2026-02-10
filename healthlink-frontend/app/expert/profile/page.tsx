'use client';

import { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    TextField,
    Button,
    Avatar,
    Stack,
    Chip,
    MenuItem,
    CircularProgress,
    Alert,
    Divider,
    IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import StarIcon from '@mui/icons-material/Star';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107';

interface ExpertProfile {
    id: number;
    userId: number;
    expertType: string;
    displayName: string | null;
    bio: string | null;
    city: string | null;
    workType: string | null;
    experienceStartDate: string | null;
    status: string;
    averageRating: number | null;
    totalReviewCount: number;
    createdAt: string;
    updatedAt: string | null;
}

const workTypeOptions = [
    { value: 'Online', label: 'Online' },
    { value: 'InPerson', label: 'Yüz Yüze' },
    { value: 'Hybrid', label: 'Hibrit (Online + Yüz Yüze)' }
];

const expertTypeLabels: Record<string, string> = {
    'Dietitian': 'Diyetisyen',
    'Psychologist': 'Psikolog',
    'Physiotherapist': 'Fizyoterapist'
};

export default function ExpertProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<ExpertProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        displayName: '',
        bio: '',
        city: '',
        workType: '',
        experienceStartDate: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/expert/profile`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

            if (!response.ok) throw new Error('Profil yüklenemedi');

            const data = await response.json();
            setProfile(data);
            setFormData({
                displayName: data.displayName || '',
                bio: data.bio || '',
                city: data.city || '',
                workType: data.workType || '',
                experienceStartDate: data.experienceStartDate || ''
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setEditMode(true);
        setError(null);
        setSuccess(null);
    };

    const handleCancel = () => {
        setEditMode(false);
        if (profile) {
            setFormData({
                displayName: profile.displayName || '',
                bio: profile.bio || '',
                city: profile.city || '',
                workType: profile.workType || '',
                experienceStartDate: profile.experienceStartDate || ''
            });
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            const response = await fetch(`${API_URL}/api/expert/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Profil güncellenemedi');

            const updatedProfile = await response.json();
            setProfile(updatedProfile);
            setEditMode(false);
            setSuccess('Profil başarıyla güncellendi!');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    const getExperienceYears = () => {
        if (!profile?.experienceStartDate) return null;
        const startDate = new Date(profile.experienceStartDate);
        const years = new Date().getFullYear() - startDate.getFullYear();
        return years;
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (!profile) {
        return (
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Alert severity="error">Profil bulunamadı</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight={600}>
                    Profilim
                </Typography>
                {!editMode && (
                    <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={handleEdit}
                    >
                        Düzenle
                    </Button>
                )}
            </Stack>

            {/* Alerts */}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {/* Profile Content */}
            <Paper sx={{ p: 3 }}>
                {/* Avatar and Basic Info */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center" mb={3}>
                    <Avatar
                        sx={{
                            width: 120,
                            height: 120,
                            bgcolor: 'primary.main',
                            fontSize: '3rem'
                        }}
                    >
                        {(profile.displayName || 'U')[0].toUpperCase()}
                    </Avatar>
                    <Box flex={1}>
                        {editMode ? (
                            <TextField
                                fullWidth
                                label="Görünen Ad"
                                value={formData.displayName}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                required
                            />
                        ) : (
                            <>
                                <Typography variant="h5" fontWeight={600} gutterBottom>
                                    {profile.displayName || 'İsim Belirtilmemiş'}
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                    <Chip
                                        label={expertTypeLabels[profile.expertType] || profile.expertType}
                                        color="primary"
                                        size="small"
                                    />
                                    <Chip
                                        label={profile.status === 'Active' ? 'Aktif' : 'Pasif'}
                                        color={profile.status === 'Active' ? 'success' : 'default'}
                                        size="small"
                                    />
                                </Stack>
                                {profile.averageRating && (
                                    <Stack direction="row" spacing={0.5} alignItems="center" mt={1}>
                                        <StarIcon sx={{ color: 'warning.main', fontSize: '1.2rem' }} />
                                        <Typography variant="body2">
                                            {profile.averageRating.toFixed(1)} ({profile.totalReviewCount} değerlendirme)
                                        </Typography>
                                    </Stack>
                                )}
                            </>
                        )}
                    </Box>
                </Stack>

                <Divider sx={{ my: 3 }} />

                {/* Profile Details */}
                <Grid container spacing={3}>
                    {/* Bio */}
                    <Grid item xs={12}>
                        {editMode ? (
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Hakkımda"
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                placeholder="Kendiniz hakkında bilgi verin..."
                            />
                        ) : (
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Hakkımda
                                </Typography>
                                <Typography variant="body1">
                                    {profile.bio || 'Henüz bilgi eklenmemiş'}
                                </Typography>
                            </Box>
                        )}
                    </Grid>

                    {/* City */}
                    <Grid item xs={12} sm={6}>
                        {editMode ? (
                            <TextField
                                fullWidth
                                label="Şehir"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            />
                        ) : (
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Şehir
                                </Typography>
                                <Typography variant="body1">
                                    {profile.city || 'Belirtilmemiş'}
                                </Typography>
                            </Box>
                        )}
                    </Grid>

                    {/* Work Type */}
                    <Grid item xs={12} sm={6}>
                        {editMode ? (
                            <TextField
                                fullWidth
                                select
                                label="Çalışma Şekli"
                                value={formData.workType}
                                onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
                            >
                                {workTypeOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        ) : (
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Çalışma Şekli
                                </Typography>
                                <Typography variant="body1">
                                    {workTypeOptions.find(o => o.value === profile.workType)?.label || 'Belirtilmemiş'}
                                </Typography>
                            </Box>
                        )}
                    </Grid>

                    {/* Experience */}
                    <Grid item xs={12} sm={6}>
                        {editMode ? (
                            <TextField
                                fullWidth
                                type="date"
                                label="Deneyim Başlangıç Tarihi"
                                value={formData.experienceStartDate}
                                onChange={(e) => setFormData({ ...formData, experienceStartDate: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />
                        ) : (
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Deneyim
                                </Typography>
                                <Typography variant="body1">
                                    {getExperienceYears() ? `${getExperienceYears()} yıl` : 'Belirtilmemiş'}
                                </Typography>
                            </Box>
                        )}
                    </Grid>

                    {/* Expert Type (Read-only) */}
                    <Grid item xs={12} sm={6}>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Uzmanlık Alanı
                            </Typography>
                            <Typography variant="body1">
                                {expertTypeLabels[profile.expertType] || profile.expertType}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {/* Edit Mode Actions */}
                {editMode && (
                    <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
                        <Button
                            variant="outlined"
                            startIcon={<CancelIcon />}
                            onClick={handleCancel}
                            disabled={saving}
                        >
                            İptal
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={handleSave}
                            disabled={saving || !formData.displayName}
                        >
                            {saving ? 'Kaydediliyor...' : 'Kaydet'}
                        </Button>
                    </Stack>
                )}
            </Paper>
        </Container>
    );
}
