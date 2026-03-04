'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    TextField,
    Button,
    Avatar,
    Stack,
    Chip,
    MenuItem,
    CircularProgress,
    Alert,
    Divider,
    Rating,
    Checkbox,
    FormControlLabel,
    FormGroup,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import CategoryIcon from '@mui/icons-material/Category';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import StarIcon from '@mui/icons-material/Star';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import VerifiedIcon from '@mui/icons-material/Verified';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import PersonIcon from '@mui/icons-material/Person';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107';

interface ExpertProfile {
    id: number;
    userId: number;
    expertType: string;
    displayName: string | null;
    bio: string | null;
    profileDescription: string | null;
    profilePhotoUrl: string | null;
    city: string | null;
    workType: string | null;
    experienceStartDate: string | null;
    status: string;
    averageRating: number | null;
    totalReviewCount: number;
    createdAt: string;
    updatedAt: string | null;
    specializationIds: number[];
    education: string | null;
    certificates: string | null;
    introVideoUrl: string | null;
}

interface SpecializationOption {
    id: number;
    name: string;
    expertType: string;
    category: string;
}

interface ReviewData {
    id: number;
    clientName: string | null;
    rating: number;
    comment: string | null;
    createdAt: string;
}

const workTypeOptions = [
    { value: 'Online', label: 'Online' },
    { value: 'InPerson', label: 'Yüz Yüze' },
    { value: 'Hybrid', label: 'Hibrit (Online + Yüz Yüze)' }
];

const expertTypeLabels: Record<string, string> = {
    'Dietitian': 'Diyetisyen',
    'Psychologist': 'Psikolog',
    'Physiotherapist': 'Fizyoterapist',
    'SportsCoach': 'Spor Koçu',
};

export default function ExpertProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<ExpertProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [reviews, setReviews] = useState<ReviewData[]>([]);
    const [availableSpecializations, setAvailableSpecializations] = useState<SpecializationOption[]>([]);
    const [selectedSpecIds, setSelectedSpecIds] = useState<number[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        displayName: '',
        bio: '',
        profileDescription: '',
        city: '',
        workType: '',
        experienceStartDate: '',
        education: '',
        certificates: '',
        introVideoUrl: '',
    });

    useEffect(() => {
        fetchProfile();
        fetchReviews();
    }, []);

    // Fetch available specializations once we know the expert type
    const fetchSpecializations = async (expertType: string) => {
        try {
            const response = await fetch(`${API_URL}/api/specializations?expertType=${expertType}`);
            if (response.ok) {
                const data = await response.json();
                setAvailableSpecializations(data);
            }
        } catch {
            // silently ignore
        }
    };

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
                profileDescription: data.profileDescription || '',
                city: data.city || '',
                workType: data.workType || '',
                experienceStartDate: data.experienceStartDate || '',
                education: data.education || '',
                certificates: data.certificates || '',
                introVideoUrl: data.introVideoUrl || '',
            });
            setSelectedSpecIds(data.specializationIds || []);
            // Fetch specializations for this expert type
            if (data.expertType) {
                fetchSpecializations(data.expertType);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await api.get('/api/reviews/my-expert');
            setReviews(response.data?.slice(0, 3) || []);
        } catch {
            // silently ignore
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
                profileDescription: profile.profileDescription || '',
                city: profile.city || '',
                workType: profile.workType || '',
                experienceStartDate: profile.experienceStartDate || '',
                education: profile.education || '',
                certificates: profile.certificates || '',
                introVideoUrl: profile.introVideoUrl || '',
            });
            setSelectedSpecIds(profile.specializationIds || []);
            setPhotoPreview(null);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => setPhotoPreview(reader.result as string);
        reader.readAsDataURL(file);

        // Upload
        try {
            const fd = new FormData();
            fd.append('file', file);
            const res = await fetch(`${API_URL}/api/experts/me/photo`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
                body: fd,
            });
            if (!res.ok) throw new Error('Fotoğraf yüklenemedi');
            const data = await res.json();
            setProfile(prev => prev ? { ...prev, profilePhotoUrl: data.profilePhotoUrl } : prev);
            setSuccess('Profil fotoğrafı güncellendi!');
        } catch {
            setError('Fotoğraf yüklenirken hata oluştu');
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            // Save profile data
            const response = await fetch(`${API_URL}/api/expert/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Profil güncellenemedi');

            // Save specializations
            const specResponse = await fetch(`${API_URL}/api/experts/me/specializations`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({ specializationIds: selectedSpecIds })
            });

            if (!specResponse.ok) throw new Error('Uzmanlık alanları güncellenemedi');

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

    const handleSpecToggle = (specId: number) => {
        setSelectedSpecIds(prev =>
            prev.includes(specId)
                ? prev.filter(id => id !== specId)
                : [...prev, specId]
        );
    };

    const getExperienceYears = () => {
        if (!profile?.experienceStartDate) return null;
        const startDate = new Date(profile.experienceStartDate);
        const years = new Date().getFullYear() - startDate.getFullYear();
        return years;
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!profile) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">Profil bulunamadı</Alert>
            </Container>
        );
    }

    const experienceYears = getExperienceYears();

    return (
        <Box sx={{ bgcolor: '#F8FAFC', minHeight: 'calc(100vh - 64px)' }}>
            {/* Alerts */}
            <Container maxWidth="lg" sx={{ pt: 2 }}>
                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}
            </Container>

            {/* ═══════════════════ HERO SECTION ═══════════════════ */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #F0F9F8 0%, #F8FAFC 50%, #EEF2FF 100%)',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    py: { xs: 4, md: 5 },
                }}
            >
                <Container maxWidth="lg">
                    {editMode ? (
                        /* ═══════════ EDIT MODE ═══════════ */
                        <>
                            {/* ── Hero Edit Section ── */}
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} alignItems={{ xs: 'center', sm: 'flex-start' }}>
                                {/* Avatar (placeholder click area) */}
                                <Box sx={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
                                    <Avatar
                                        src={photoPreview || (profile?.profilePhotoUrl ? `${API_URL}${profile.profilePhotoUrl}` : undefined)}
                                        sx={{
                                            width: 140, height: 140,
                                            bgcolor: 'primary.main',
                                            fontSize: '3.5rem', fontWeight: 600,
                                            boxShadow: '0 8px 32px rgba(14, 165, 164, 0.2)',
                                            border: '4px solid white',
                                        }}
                                    >
                                        {(formData.displayName || 'U')[0].toUpperCase()}
                                    </Avatar>
                                    <input
                                        type="file" ref={fileInputRef} hidden
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handlePhotoUpload}
                                    />
                                    <Box sx={{
                                        position: 'absolute', bottom: 4, right: 4,
                                        width: 36, height: 36, borderRadius: '50%',
                                        bgcolor: 'primary.main', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        border: '3px solid white',
                                    }}>
                                        <CameraAltIcon sx={{ color: 'white', fontSize: 18 }} />
                                    </Box>
                                </Box>

                                {/* Hero Fields Grid */}
                                <Box flex={1} sx={{ width: '100%' }}>
                                    <TextField
                                        fullWidth label="Görünen Ad" value={formData.displayName}
                                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                        required variant="outlined"
                                        sx={{
                                            mb: 2.5,
                                            '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'white' },
                                        }}
                                    />
                                    <Box sx={{
                                        display: 'grid',
                                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
                                        gap: 2,
                                    }}>
                                        <TextField
                                            fullWidth label="Şehir" value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            variant="outlined"
                                            InputProps={{ startAdornment: <LocationOnIcon sx={{ color: '#94A3B8', mr: 1, fontSize: 20 }} /> }}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'white' } }}
                                        />
                                        <TextField
                                            fullWidth select label="Çalışma Şekli" value={formData.workType}
                                            onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
                                            variant="outlined"
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'white' } }}
                                        >
                                            {workTypeOptions.map((o) => (
                                                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                                            ))}
                                        </TextField>
                                        <TextField
                                            fullWidth type="date" label="Deneyim Başlangıç"
                                            value={formData.experienceStartDate}
                                            onChange={(e) => setFormData({ ...formData, experienceStartDate: e.target.value })}
                                            InputLabelProps={{ shrink: true }}
                                            variant="outlined"
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'white' } }}
                                        />
                                    </Box>

                                    {/* Type badge (read-only) */}
                                    <Stack direction="row" spacing={1} mt={2} alignItems="center" justifyContent="space-between">
                                        <Chip
                                            icon={<VerifiedIcon sx={{ fontSize: 16 }} />}
                                            label={expertTypeLabels[profile.expertType] || profile.expertType}
                                            color="primary" size="small"
                                            sx={{ fontWeight: 600, borderRadius: '8px' }}
                                        />
                                        <Stack direction="row" spacing={1}>
                                            <Button
                                                size="small" variant="outlined" onClick={handleCancel}
                                                disabled={saving}
                                                sx={{
                                                    borderRadius: '10px', textTransform: 'none', fontWeight: 600,
                                                    fontSize: '0.8rem', px: 2, py: 0.5,
                                                    borderColor: '#CBD5E1', color: '#475569',
                                                    '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' },
                                                }}
                                            >
                                                İptal
                                            </Button>
                                            <Button
                                                size="small" variant="contained" onClick={handleSave}
                                                disabled={saving || !formData.displayName}
                                                sx={{
                                                    borderRadius: '10px', textTransform: 'none', fontWeight: 600,
                                                    fontSize: '0.8rem', px: 2, py: 0.5,
                                                    boxShadow: '0 2px 8px rgba(14,165,164,0.2)',
                                                }}
                                            >
                                                {saving ? 'Kaydediliyor...' : 'Kaydet'}
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </Box>
                            </Stack>
                        </>
                    ) : (
                        /* ── View Mode Hero ── */
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} alignItems={{ xs: 'center', sm: 'flex-start' }}>
                            <Avatar
                                src={profile.profilePhotoUrl ? `${API_URL}${profile.profilePhotoUrl}` : undefined}
                                sx={{
                                    width: 140, height: 140,
                                    bgcolor: 'primary.main',
                                    fontSize: '3.5rem', fontWeight: 600,
                                    boxShadow: '0 8px 32px rgba(14, 165, 164, 0.2)',
                                    border: '4px solid white',
                                }}
                            >
                                {(profile.displayName || 'U')[0].toUpperCase()}
                            </Avatar>
                            <Box flex={1} sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                                <Stack direction="row" spacing={1.5} alignItems="center"
                                    justifyContent={{ xs: 'center', sm: 'flex-start' }} flexWrap="wrap" mb={1}>
                                    <Typography variant="h4" fontWeight={700} sx={{ color: '#0F172A' }}>
                                        {profile.displayName || 'İsim Belirtilmemiş'}
                                    </Typography>
                                    <Chip
                                        icon={<VerifiedIcon sx={{ fontSize: 16 }} />}
                                        label={expertTypeLabels[profile.expertType] || profile.expertType}
                                        color="primary" size="small"
                                        sx={{ fontWeight: 600, borderRadius: '8px' }}
                                    />

                                </Stack>

                                <Stack direction="row" spacing={3} flexWrap="wrap"
                                    justifyContent={{ xs: 'center', sm: 'flex-start' }} mb={2}
                                    sx={{ color: '#64748B' }}>
                                    {profile.city && (
                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                            <LocationOnIcon sx={{ fontSize: 18 }} />
                                            <Typography variant="body2">{profile.city}</Typography>
                                        </Stack>
                                    )}
                                    {profile.workType && (
                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                            <WorkIcon sx={{ fontSize: 18 }} />
                                            <Typography variant="body2">
                                                {workTypeOptions.find(o => o.value === profile.workType)?.label || profile.workType}
                                            </Typography>
                                        </Stack>
                                    )}
                                    {experienceYears !== null && experienceYears > 0 && (
                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                            <CalendarMonthIcon sx={{ fontSize: 18 }} />
                                            <Typography variant="body2">{experienceYears} yıl deneyim</Typography>
                                        </Stack>
                                    )}
                                </Stack>

                                {profile.averageRating && profile.averageRating > 0 && (
                                    <Stack direction="row" spacing={1} alignItems="center"
                                        justifyContent={{ xs: 'center', sm: 'flex-start' }} mb={2}>
                                        <Rating value={profile.averageRating} precision={0.1} readOnly size="small"
                                            icon={<StarIcon sx={{ color: '#faaf00' }} />}
                                            emptyIcon={<StarIcon sx={{ color: '#E2E8F0' }} />}
                                        />
                                        <Typography variant="body2" fontWeight={600} sx={{ color: '#475569' }}>
                                            {profile.averageRating.toFixed(1)}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                                            ({profile.totalReviewCount} değerlendirme)
                                        </Typography>
                                    </Stack>
                                )}

                                <Button
                                    variant="contained" startIcon={<EditIcon />} onClick={handleEdit}
                                    sx={{
                                        borderRadius: '12px', textTransform: 'none', fontWeight: 600,
                                        px: 3, py: 1,
                                        boxShadow: '0 2px 8px rgba(14,165,164,0.2)',
                                        '&:hover': { boxShadow: '0 4px 16px rgba(14,165,164,0.3)' },
                                    }}
                                >
                                    Profili Düzenle
                                </Button>
                            </Box>
                        </Stack>
                    )}
                </Container>
            </Box>

            {/* ═══════════════════ CONTENT AREA ═══════════════════ */}
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {editMode ? (
                    /* ═══════════ EDIT MODE — 2 Column Form ═══════════ */
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                        gap: 3,
                    }}>
                        {/* ── LEFT COLUMN: Text areas ── */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Hakkımda */}
                            <Paper sx={{
                                p: 3, borderRadius: '16px',
                                boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
                                border: '1px solid', borderColor: 'divider',
                            }}>
                                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                    <PersonIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                                    <Typography variant="subtitle1" fontWeight={700}>Hakkımda</Typography>
                                </Stack>
                                <TextField
                                    fullWidth multiline rows={5} value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Kendiniz hakkında detaylı bilgi verin..."
                                    variant="outlined"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                />
                            </Paper>

                            {/* Profil Özet Tanımı */}
                            <Paper sx={{
                                p: 3, borderRadius: '16px',
                                boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
                                border: '1px solid', borderColor: 'divider',
                            }}>
                                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                    <DescriptionIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                                    <Typography variant="subtitle1" fontWeight={700}>Profil Özet Tanımı</Typography>
                                </Stack>
                                <TextField
                                    fullWidth multiline rows={3} value={formData.profileDescription}
                                    onChange={(e) => setFormData({ ...formData, profileDescription: e.target.value })}
                                    placeholder="Profil kartlarında görünecek kısa tanımınızı yazın..."
                                    variant="outlined"
                                    inputProps={{ maxLength: 300 }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                />
                                <Typography variant="caption" sx={{ color: '#94A3B8', mt: 1, display: 'block' }}>
                                    Profil kartlarında görünecek kısa tanım (max 300 karakter)
                                </Typography>
                            </Paper>

                            {/* Eğitim */}
                            <Paper sx={{
                                p: 3, borderRadius: '16px',
                                boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
                                border: '1px solid', borderColor: 'divider',
                            }}>
                                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                    <SchoolIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                                    <Typography variant="subtitle1" fontWeight={700}>Eğitim</Typography>
                                </Stack>
                                <TextField
                                    fullWidth multiline rows={3}
                                    value={formData.education}
                                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                                    placeholder="Üniversite, bölüm, yıl vb. bilgilerinizi ekleyin..."
                                    variant="outlined"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                />
                            </Paper>

                            {/* Sertifikalar */}
                            <Paper sx={{
                                p: 3, borderRadius: '16px',
                                boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
                                border: '1px solid', borderColor: 'divider',
                            }}>
                                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                    <WorkspacePremiumIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                                    <Typography variant="subtitle1" fontWeight={700}>Sertifikalar</Typography>
                                </Stack>
                                <TextField
                                    fullWidth multiline rows={3}
                                    value={formData.certificates}
                                    onChange={(e) => setFormData({ ...formData, certificates: e.target.value })}
                                    placeholder="Sahip olduğunuz sertifikaları ekleyin..."
                                    variant="outlined"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                />
                            </Paper>
                        </Box>

                        {/* ── RIGHT COLUMN: Specializations + Video note ── */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Uzmanlık Alanları (dynamic multi-select) */}
                            <Paper sx={{
                                p: 3, borderRadius: '16px',
                                boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
                                border: '1px solid', borderColor: 'divider',
                            }}>
                                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                    <CategoryIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                                    <Typography variant="subtitle1" fontWeight={700}>Uzmanlık Alanları</Typography>
                                </Stack>
                                <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
                                    {expertTypeLabels[profile.expertType] || profile.expertType} türüne ait uzmanlık alanlarından seçim yapabilirsiniz.
                                </Typography>
                                {availableSpecializations.length === 0 ? (
                                    <Typography variant="body2" sx={{ color: '#94A3B8', fontStyle: 'italic' }}>
                                        Yükleniyor veya henüz uzmanlık alanı tanımlanmamış...
                                    </Typography>
                                ) : (
                                    <FormGroup>
                                        {availableSpecializations.map((spec) => (
                                            <FormControlLabel
                                                key={spec.id}
                                                control={
                                                    <Checkbox
                                                        checked={selectedSpecIds.includes(spec.id)}
                                                        onChange={() => handleSpecToggle(spec.id)}
                                                        size="small"
                                                        sx={{ '&.Mui-checked': { color: 'primary.main' } }}
                                                    />
                                                }
                                                label={
                                                    <Typography variant="body2" fontWeight={selectedSpecIds.includes(spec.id) ? 600 : 400}>
                                                        {spec.name}
                                                    </Typography>
                                                }
                                            />
                                        ))}
                                    </FormGroup>
                                )}
                                {selectedSpecIds.length > 0 && (
                                    <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5} sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                                        <Typography variant="caption" sx={{ color: '#64748B', mr: 0.5, lineHeight: '24px' }}>Seçili:</Typography>
                                        {selectedSpecIds.map(id => {
                                            const spec = availableSpecializations.find(s => s.id === id);
                                            return spec ? (
                                                <Chip
                                                    key={id}
                                                    label={spec.name}
                                                    size="small"
                                                    onDelete={() => handleSpecToggle(id)}
                                                    sx={{
                                                        fontWeight: 600, borderRadius: '10px',
                                                        bgcolor: '#F0F9F8', color: 'primary.main',
                                                        border: '1px solid', borderColor: 'primary.light',
                                                    }}
                                                />
                                            ) : null;
                                        })}
                                    </Stack>
                                )}
                            </Paper>

                            {/* Tanıtım Videosu (YouTube URL) */}
                            <Paper sx={{
                                p: 3, borderRadius: '16px',
                                boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
                                border: '1px solid', borderColor: 'divider',
                            }}>
                                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                    <VideocamOffIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                                    <Typography variant="subtitle1" fontWeight={700}>Tanıtım Videosu</Typography>
                                </Stack>
                                <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
                                    YouTube video linkinizi ekleyerek kendinizi tanıtın. Profilinizde görüntülenecektir.
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    value={formData.introVideoUrl}
                                    onChange={(e) => setFormData(prev => ({ ...prev, introVideoUrl: e.target.value }))}
                                    helperText="YouTube video URL'si yapıştırın (ör: https://www.youtube.com/watch?v=xxxxx)"
                                    sx={{
                                        '& .MuiOutlinedInput-root': { borderRadius: '10px' },
                                    }}
                                />
                                {formData.introVideoUrl && (() => {
                                    const match = formData.introVideoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
                                    const videoId = match?.[1];
                                    return videoId ? (
                                        <Box sx={{ mt: 2, borderRadius: '12px', overflow: 'hidden', position: 'relative', paddingTop: '56.25%' }}>
                                            <iframe
                                                src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
                                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        </Box>
                                    ) : (
                                        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                                            Geçerli bir YouTube linki girin.
                                        </Typography>
                                    );
                                })()}
                            </Paper>
                        </Box>

                        {/* ── Save / Cancel Bar (spans both columns) ── */}
                        <Box sx={{
                            gridColumn: { md: '1 / -1' },
                            display: 'flex', justifyContent: 'flex-end', gap: 2,
                            pt: 1,
                        }}>
                            <Button
                                variant="outlined" startIcon={<CancelIcon />} onClick={handleCancel}
                                disabled={saving}
                                sx={{
                                    borderRadius: '12px', textTransform: 'none', fontWeight: 600,
                                    px: 3, py: 1, borderColor: '#CBD5E1', color: '#475569',
                                    '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' },
                                }}
                            >
                                İptal
                            </Button>
                            <Button
                                variant="contained" startIcon={<SaveIcon />} onClick={handleSave}
                                disabled={saving || !formData.displayName}
                                sx={{
                                    borderRadius: '12px', textTransform: 'none', fontWeight: 600,
                                    px: 4, py: 1,
                                    boxShadow: '0 2px 8px rgba(14,165,164,0.2)',
                                    '&:hover': { boxShadow: '0 4px 16px rgba(14,165,164,0.3)' },
                                }}
                            >
                                {saving ? 'Kaydediliyor...' : 'Kaydet'}
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    /* ═══════════ DISPLAY MODE — 3 Column Grid ═══════════ */
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                        gap: 3,
                    }}>
                        {/* ── SOL KOLON ── */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Hakkımda */}
                            <Paper sx={{
                                p: 3, borderRadius: '16px',
                                boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
                                border: '1px solid', borderColor: 'divider',
                            }}>
                                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                    <PersonIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                                    <Typography variant="subtitle1" fontWeight={700}>Hakkımda</Typography>
                                </Stack>
                                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                                    {profile.bio || 'Henüz bilgi eklenmemiş. Profilinizi düzenleyerek kendiniz hakkında bilgi ekleyebilirsiniz.'}
                                </Typography>
                            </Paper>

                            {/* Profil Özet Tanımı */}
                            {profile.profileDescription && (
                                <Paper sx={{
                                    p: 3, borderRadius: '16px',
                                    boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
                                    border: '1px solid', borderColor: 'divider',
                                }}>
                                    <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                        <DescriptionIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                                        <Typography variant="subtitle1" fontWeight={700}>Profil Özeti</Typography>
                                    </Stack>
                                    <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7 }}>
                                        {profile.profileDescription}
                                    </Typography>
                                </Paper>
                            )}

                            {/* Eğitim */}
                            <Paper sx={{
                                p: 3, borderRadius: '16px',
                                boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
                                border: '1px solid', borderColor: 'divider',
                            }}>
                                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                    <SchoolIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                                    <Typography variant="subtitle1" fontWeight={700}>Eğitim</Typography>
                                </Stack>
                                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                                    {profile.education || 'Henüz eğitim bilgisi eklenmemiş.'}
                                </Typography>
                            </Paper>

                            {/* Sertifikalar */}
                            <Paper sx={{
                                p: 3, borderRadius: '16px',
                                boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
                                border: '1px solid', borderColor: 'divider',
                            }}>
                                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                    <WorkspacePremiumIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                                    <Typography variant="subtitle1" fontWeight={700}>Sertifikalar</Typography>
                                </Stack>
                                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                                    {profile.certificates || 'Henüz sertifika bilgisi eklenmemiş.'}
                                </Typography>
                            </Paper>
                        </Box>

                        {/* ── ORTA KOLON ── */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Deneyim */}
                            <Paper sx={{
                                p: 3, borderRadius: '16px',
                                boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
                                border: '1px solid', borderColor: 'divider',
                            }}>
                                <Typography variant="subtitle1" fontWeight={700} mb={2}>Deneyim</Typography>
                                <Box sx={{
                                    display: 'flex', alignItems: 'center', gap: 2,
                                    p: 2, borderRadius: '12px', bgcolor: '#F0F9F8',
                                }}>
                                    <Box sx={{
                                        width: 48, height: 48, borderRadius: '12px',
                                        bgcolor: 'primary.main', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', color: 'white',
                                    }}>
                                        <CalendarMonthIcon />
                                    </Box>
                                    <Box>
                                        <Typography variant="h5" fontWeight={700} sx={{ color: 'primary.main' }}>
                                            {experienceYears !== null && experienceYears > 0 ? `${experienceYears} Yıl` : '—'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Profesyonel Deneyim
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>

                            {/* Uzmanlık Alanları */}
                            <Paper sx={{
                                p: 3, borderRadius: '16px',
                                boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
                                border: '1px solid', borderColor: 'divider',
                            }}>
                                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                    <CategoryIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                                    <Typography variant="subtitle1" fontWeight={700}>Uzmanlık Alanları</Typography>
                                </Stack>
                                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                    <Chip
                                        label={expertTypeLabels[profile.expertType] || profile.expertType}
                                        sx={{
                                            fontWeight: 600, borderRadius: '10px',
                                            bgcolor: '#EEF2FF', color: '#6366F1',
                                            border: '1px solid', borderColor: '#C7D2FE',
                                        }}
                                    />
                                    {selectedSpecIds.length > 0 && availableSpecializations.length > 0 ? (
                                        selectedSpecIds.map(id => {
                                            const spec = availableSpecializations.find(s => s.id === id);
                                            return spec ? (
                                                <Chip
                                                    key={id}
                                                    label={spec.name}
                                                    sx={{
                                                        fontWeight: 600, borderRadius: '10px',
                                                        bgcolor: '#F0F9F8', color: 'primary.main',
                                                        border: '1px solid', borderColor: 'primary.light',
                                                        transition: 'all 0.2s',
                                                        '&:hover': { boxShadow: '0 2px 8px rgba(14,165,164,0.15)' },
                                                    }}
                                                />
                                            ) : null;
                                        })
                                    ) : (
                                        <Typography variant="caption" sx={{ color: '#94A3B8', fontStyle: 'italic', mt: 0.5 }}>
                                            Henüz uzmanlık alanı seçilmemiş.
                                        </Typography>
                                    )}
                                </Stack>
                            </Paper>

                            {/* Çalışma Şekli */}
                            <Paper sx={{
                                p: 3, borderRadius: '16px',
                                boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
                                border: '1px solid', borderColor: 'divider',
                            }}>
                                <Typography variant="subtitle1" fontWeight={700} mb={2}>Çalışma Şekli</Typography>
                                <Box sx={{
                                    display: 'flex', alignItems: 'center', gap: 2,
                                    p: 2, borderRadius: '12px', bgcolor: '#F8FAFC',
                                }}>
                                    <Box sx={{
                                        width: 48, height: 48, borderRadius: '12px',
                                        bgcolor: '#6366F1', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', color: 'white',
                                    }}>
                                        <WorkIcon />
                                    </Box>
                                    <Box>
                                        <Typography variant="body1" fontWeight={600}>
                                            {workTypeOptions.find(o => o.value === profile.workType)?.label || 'Belirtilmemiş'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Hizmet Modeli
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Box>

                        {/* ── SAĞ KOLON ── */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Tanıtım Videosu */}
                            <Paper sx={{
                                borderRadius: '16px',
                                boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
                                border: '1px solid', borderColor: 'divider',
                                overflow: 'hidden',
                            }}>
                                {(() => {
                                    const url = profile.introVideoUrl;
                                    if (url) {
                                        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
                                        const videoId = match?.[1];
                                        if (videoId) {
                                            return (
                                                <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                                                    <iframe
                                                        src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
                                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    />
                                                </Box>
                                            );
                                        }
                                    }
                                    return (
                                        <Box sx={{
                                            aspectRatio: '16/9', bgcolor: '#0F172A',
                                            display: 'flex', flexDirection: 'column',
                                            alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <PlayCircleOutlineIcon sx={{ fontSize: 56, color: 'rgba(255,255,255,0.7)' }} />
                                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 1 }}>
                                                Henüz tanıtım videosu eklenmemiş
                                            </Typography>
                                        </Box>
                                    );
                                })()}
                            </Paper>

                            {/* Ortalama Puan Kartı */}
                            <Paper sx={{
                                p: 3, borderRadius: '16px',
                                boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
                                border: '1px solid', borderColor: 'divider',
                                textAlign: 'center',
                            }}>
                                <Typography variant="h3" fontWeight={800} sx={{ color: 'primary.main', mb: 0.5 }}>
                                    {profile.averageRating ? profile.averageRating.toFixed(1) : '—'}
                                </Typography>
                                <Rating
                                    value={profile.averageRating || 0} precision={0.1} readOnly size="medium"
                                    icon={<StarIcon sx={{ color: '#faaf00' }} />}
                                    emptyIcon={<StarIcon sx={{ color: '#E2E8F0' }} />}
                                />
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    {profile.totalReviewCount} değerlendirme
                                </Typography>
                            </Paper>

                            {/* Son Yorumlar */}
                            <Paper sx={{
                                p: 3, borderRadius: '16px',
                                boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
                                border: '1px solid', borderColor: 'divider',
                            }}>
                                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                    <FormatQuoteIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                                    <Typography variant="subtitle1" fontWeight={700}>Son Değerlendirmeler</Typography>
                                </Stack>
                                {reviews.length === 0 ? (
                                    <Typography variant="body2" sx={{ color: '#94A3B8', fontStyle: 'italic' }}>
                                        Henüz değerlendirme bulunmuyor.
                                    </Typography>
                                ) : (
                                    <Stack spacing={2}>
                                        {reviews.map((review) => (
                                            <Box key={review.id}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                                                    <Typography variant="body2" fontWeight={600} sx={{ color: '#334155' }}>
                                                        {review.clientName || 'Anonim'}
                                                    </Typography>
                                                    <Stack direction="row" spacing={0.3} alignItems="center">
                                                        <StarIcon sx={{ color: '#faaf00', fontSize: 16 }} />
                                                        <Typography variant="caption" fontWeight={600}>{review.rating}</Typography>
                                                    </Stack>
                                                </Stack>
                                                {review.comment && (
                                                    <Typography variant="body2" sx={{
                                                        color: '#64748B', fontSize: '0.8rem', lineHeight: 1.5,
                                                        display: '-webkit-box', WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                                    }}>
                                                        &ldquo;{review.comment}&rdquo;
                                                    </Typography>
                                                )}
                                                <Typography variant="caption" sx={{ color: '#CBD5E1' }}>
                                                    {new Date(review.createdAt).toLocaleDateString('tr-TR', {
                                                        day: 'numeric', month: 'short', year: 'numeric',
                                                    })}
                                                </Typography>
                                                <Divider sx={{ mt: 1.5 }} />
                                            </Box>
                                        ))}
                                    </Stack>
                                )}
                                {reviews.length > 0 && (
                                    <Button
                                        size="small"
                                        href="/expert/reviews"
                                        sx={{
                                            mt: 2, textTransform: 'none', fontWeight: 600,
                                            borderRadius: '10px', color: 'primary.main',
                                            '&:hover': { bgcolor: '#F0F9F8' },
                                        }}
                                    >
                                        Tüm Yorumları İncele →
                                    </Button>
                                )}
                            </Paper>
                        </Box>
                    </Box>
                )}
            </Container>
        </Box>
    );
}
