'use client';

import { useEffect, useState, useRef } from 'react';
import {
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    MenuItem,
    CircularProgress,
    Stack,
    Divider,
    Grid,
    Card,
    CardContent,
    Avatar,
    Chip,
    IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import WcIcon from '@mui/icons-material/Wc';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { ClientProfile, UpdateClientRequest } from '@/types/client';

const ACCENT = '#1E8F8A';
const SOFT_SHADOW = '0 4px 20px rgba(15, 23, 42, 0.04)';

const textFieldSx = {
    '& .MuiOutlinedInput-root': {
        '&.Mui-focused fieldset': {
            borderColor: ACCENT,
        },
    },
    '& .MuiInputLabel-root.Mui-focused': {
        color: ACCENT,
    },
};

export default function ClientProfilePage() {
    const { user, updateProfilePhoto } = useAuth();
    const [profile, setProfile] = useState<ClientProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarKey, setAvatarKey] = useState(0); // For forcing avatar re-render if needed

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

            // Sync user context (photo + name) without re-login
            const profilePhotoUrl = response.data.profilePhotoUrl || null;
            updateProfilePhoto(profilePhotoUrl);

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
            // Force re-render of avatars that might rely on initials
            setAvatarKey(prev => prev + 1);
        } catch (err) {
            const axiosError = err as { response?: { data?: { message?: string } } };
            setError(axiosError.response?.data?.message || 'Profil güncellenemedi');
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const res = await api.post('/api/client/my/photo', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setSuccess(true);
            setError('');
            // Update Navbar avatar immediately
            updateProfilePhoto(res.data.profilePhotoUrl);
            // Re-fetch profile to get updated profilePhotoUrl
            fetchProfile();
            setAvatarKey(prev => prev + 1);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            const axiosError = err as { response?: { data?: string } };
            setError(typeof axiosError.response?.data === 'string' ? axiosError.response.data : 'Fotoğraf yüklenemedi');
        }
    };

    const handleDeletePhoto = async () => {
        try {
            await api.delete('/api/client/my/photo');
            updateProfilePhoto(null);
            fetchProfile();
            setAvatarKey(prev => prev + 1);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError('Fotoğraf silinemedi');
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress sx={{ color: ACCENT }} />
            </Box>
        );
    }

    const genderLabels: Record<string, string> = {
        'Male': 'Erkek',
        'Female': 'Kadın',
        'Other': 'Diğer',
        'PreferNotToSay': 'Belirtmek İstemiyorum'
    };

    const initial = profile?.firstName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U';

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107';
    const avatarSrc = profile?.profilePhotoUrl ? `${API_BASE}${profile.profilePhotoUrl}` : undefined;

    return (
        <Box sx={{ px: 3, py: 4, width: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight={700} color="text.primary">
                    Profilim
                </Typography>
                {!editMode && (
                    <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={handleEdit}
                        sx={{
                            bgcolor: ACCENT,
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: `0 4px 12px ${ACCENT}40`,
                            '&:hover': { bgcolor: '#196F6B' }
                        }}
                    >
                        Düzenle
                    </Button>
                )}
            </Box>

            {success && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
                    Profil başarıyla güncellendi
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={4}>
                {/* Sol Taraftaki Kimlik Kartı */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card
                        sx={{
                            borderRadius: '18px',
                            boxShadow: SOFT_SHADOW,
                            border: '1px solid',
                            borderColor: 'divider',
                            textAlign: 'center',
                            p: 3,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Box sx={{ position: 'relative', mb: 2 }}>
                            <Avatar
                                key={`avatar-${avatarKey}`}
                                src={avatarSrc}
                                sx={{
                                    width: 120,
                                    height: 120,
                                    bgcolor: ACCENT,
                                    fontSize: '3rem',
                                    fontWeight: 700,
                                    boxShadow: `0 4px 20px ${ACCENT}30`,
                                    border: '4px solid white'
                                }}
                            >
                                {initial}
                            </Avatar>
                            {editMode && (
                                <IconButton
                                    onClick={handlePhotoUploadClick}
                                    sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        bgcolor: 'white',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                        '&:hover': { bgcolor: '#f8fafc' },
                                        border: '1px solid #e2e8f0'
                                    }}
                                    size="small"
                                >
                                    <PhotoCameraIcon fontSize="small" sx={{ color: ACCENT }} />
                                </IconButton>
                            )}
                            <input
                                type="file"
                                hidden
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </Box>

                        {editMode && avatarSrc && (
                            <Button
                                size="small"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={handleDeletePhoto}
                                sx={{ mt: 1, textTransform: 'none', fontSize: '0.8rem' }}
                            >
                                Fotoğrafı Sil
                            </Button>
                        )}

                        <Typography variant="h5" fontWeight={700} gutterBottom>
                            {profile?.firstName} {profile?.lastName}
                        </Typography>
                        <Chip
                            label="Danışan"
                            size="small"
                            sx={{
                                bgcolor: `${ACCENT}18`,
                                color: ACCENT,
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                border: `1px solid ${ACCENT}40`,
                                borderRadius: '8px',
                                px: 1
                            }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 3, maxWidth: '80%' }}>
                            Sağlıklı yaşam yolculuğunuzda tüm bilgilerinizi buradan yönetebilirsiniz.
                        </Typography>
                    </Card>
                </Grid>

                {/* Sağ Taraftaki Bilgi Alanı */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Stack spacing={4}>
                        {/* Kişisel Bilgiler Kartı */}
                        <Card
                            sx={{
                                borderRadius: '18px',
                                boxShadow: SOFT_SHADOW,
                                border: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                                <Typography variant="h6" fontWeight={600} mb={3} display="flex" alignItems="center" gap={1}>
                                    Kişisel Bilgiler
                                </Typography>

                                {!editMode ? (
                                    <Grid container spacing={3}>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                                Ad
                                            </Typography>
                                            <Typography variant="body1" fontWeight={500}>
                                                {profile?.firstName || '-'}
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                                Soyad
                                            </Typography>
                                            <Typography variant="body1" fontWeight={500}>
                                                {profile?.lastName || '-'}
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5} mb={0.5}>
                                                <CalendarMonthIcon fontSize="inherit" /> Doğum Tarihi
                                            </Typography>
                                            <Typography variant="body1" fontWeight={500}>
                                                {profile?.birthDate ? new Date(profile.birthDate).toLocaleDateString('tr-TR') : '-'}
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5} mb={0.5}>
                                                <WcIcon fontSize="inherit" /> Cinsiyet
                                            </Typography>
                                            <Typography variant="body1" fontWeight={500}>
                                                {profile?.gender ? genderLabels[profile.gender] || profile.gender : '-'}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                ) : (
                                    <form id="profile-form" onSubmit={handleSubmit}>
                                        <Grid container spacing={3}>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Ad"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                    required
                                                    sx={textFieldSx}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Soyad"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                    required
                                                    sx={textFieldSx}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Doğum Tarihi"
                                                    name="birthDate"
                                                    type="date"
                                                    value={formData.birthDate}
                                                    onChange={handleChange}
                                                    InputLabelProps={{ shrink: true }}
                                                    sx={textFieldSx}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    select
                                                    label="Cinsiyet"
                                                    name="gender"
                                                    value={formData.gender}
                                                    onChange={handleChange}
                                                    sx={textFieldSx}
                                                >
                                                    <MenuItem value="">Seçiniz</MenuItem>
                                                    <MenuItem value="Male">Erkek</MenuItem>
                                                    <MenuItem value="Female">Kadın</MenuItem>
                                                    <MenuItem value="Other">Diğer</MenuItem>
                                                    <MenuItem value="PreferNotToSay">Belirtmek İstemiyorum</MenuItem>
                                                </TextField>
                                            </Grid>
                                        </Grid>
                                    </form>
                                )}
                            </CardContent>
                        </Card>

                        {/* İletişim Bilgileri Kartı */}
                        <Card
                            sx={{
                                borderRadius: '18px',
                                boxShadow: SOFT_SHADOW,
                                border: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                                <Typography variant="h6" fontWeight={600} mb={3}>
                                    İletişim & Hesap
                                </Typography>

                                {!editMode ? (
                                    <Grid container spacing={3}>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5} mb={0.5}>
                                                <EmailIcon fontSize="inherit" /> E-posta
                                            </Typography>
                                            <Typography variant="body1" fontWeight={500}>
                                                {profile?.email || '-'}
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5} mb={0.5}>
                                                <PhoneIcon fontSize="inherit" /> Telefon
                                            </Typography>
                                            <Typography variant="body1" fontWeight={500}>
                                                {profile?.phone || '-'}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                ) : (
                                    <Grid container spacing={3}>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="E-posta"
                                                value={profile?.email || ''}
                                                disabled
                                                helperText="E-posta adresi değiştirilemez"
                                                sx={textFieldSx}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="Telefon"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                sx={textFieldSx}
                                            />
                                        </Grid>
                                    </Grid>
                                )}
                            </CardContent>
                        </Card>

                        {/* Edit Mode Actions */}
                        {editMode && (
                            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    onClick={handleCancel}
                                    disabled={saving}
                                    startIcon={<CancelIcon />}
                                    sx={{
                                        borderColor: 'divider',
                                        color: 'text.secondary',
                                        borderRadius: '12px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        '&:hover': {
                                            borderColor: 'text.primary',
                                            bgcolor: 'transparent'
                                        }
                                    }}
                                >
                                    İptal
                                </Button>
                                <Button
                                    type="submit"
                                    form="profile-form"
                                    variant="contained"
                                    size="large"
                                    disabled={saving}
                                    startIcon={<SaveIcon />}
                                    sx={{
                                        bgcolor: ACCENT,
                                        borderRadius: '12px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        boxShadow: `0 4px 12px ${ACCENT}40`,
                                        '&:hover': { bgcolor: '#196F6B' }
                                    }}
                                >
                                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                                </Button>
                            </Box>
                        )}
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
}
