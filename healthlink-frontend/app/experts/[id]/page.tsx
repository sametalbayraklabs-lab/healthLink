'use client';

import { use, useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    Avatar,
    Chip,
    Button,
    Rating,
    Divider,
    CircularProgress,
    Paper,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import StarIcon from '@mui/icons-material/Star';

interface ExpertProfile {
    id: number;
    displayName: string;
    email: string;
    phone: string;
    expertType: string;
    title: string;
    bio: string;
    city: string;
    workType: string;
    averageRating: number;
    totalReviews: number;
    experienceStartDate: string;
    specializations: Array<{
        id: number;
        name: string;
        category: string;
    }>;
}

export default function ExpertProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [expert, setExpert] = useState<ExpertProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExpert();
    }, [resolvedParams.id]);

    const fetchExpert = async () => {
        try {
            const response = await api.get(`/api/experts/${resolvedParams.id}`);
            setExpert(response.data);
        } catch (error) {
            console.error('Failed to fetch expert:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBookAppointment = () => {
        router.push(`/client/appointments/new?expertId=${resolvedParams.id}`);
    };

    const handleViewPackages = () => {
        router.push(`/client/packages?expertId=${resolvedParams.id}`);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (!expert) {
        return (
            <Container maxWidth="lg">
                <Typography variant="h5" sx={{ mt: 4 }}>
                    Uzman bulunamadı
                </Typography>
            </Container>
        );
    }

    const experienceYears = expert.experienceStartDate
        ? new Date().getFullYear() - new Date(expert.experienceStartDate).getFullYear()
        : 0;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header Section */}
            <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Box display="flex" alignItems="center" gap={3}>
                            <Avatar
                                sx={{
                                    width: 100,
                                    height: 100,
                                    bgcolor: 'primary.main',
                                    fontSize: '2rem',
                                }}
                            >
                                {expert.displayName.charAt(0)}
                            </Avatar>
                            <Box>
                                <Typography variant="h4" fontWeight={600} gutterBottom>
                                    {expert.displayName}
                                </Typography>
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    {expert.title}
                                </Typography>
                                <Box display="flex" alignItems="center" gap={1} mt={1}>
                                    <Rating value={expert.averageRating || 0} readOnly precision={0.5} />
                                    <Typography variant="body2" color="text.secondary">
                                        {expert.averageRating ? expert.averageRating.toFixed(1) : '0.0'} ({expert.totalReviews} değerlendirme)
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Box display="flex" flexDirection="column" gap={2} height="100%" justifyContent="center">
                            <Button
                                variant="contained"
                                size="large"
                                fullWidth
                                startIcon={<CalendarMonthIcon />}
                                onClick={handleBookAppointment}
                            >
                                Randevu Al
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                fullWidth
                                onClick={handleViewPackages}
                            >
                                Paketleri Görüntüle
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            <Grid container spacing={3}>
                {/* Left Column - Details */}
                <Grid item xs={12} md={8}>
                    {/* About Section */}
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                Hakkında
                            </Typography>
                            <Typography variant="body1" color="text.secondary" paragraph>
                                {expert.bio}
                            </Typography>
                        </CardContent>
                    </Card>

                    {/* Specializations */}
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                Uzmanlık Alanları
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
                                {expert.specializations.map((spec) => (
                                    <Chip
                                        key={spec.id}
                                        label={spec.name}
                                        color="primary"
                                        variant="outlined"
                                    />
                                ))}
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Reviews Section - Placeholder */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                Değerlendirmeler
                            </Typography>
                            <Box display="flex" alignItems="center" gap={2} my={2}>
                                <Box textAlign="center">
                                    <Typography variant="h3" fontWeight={600}>
                                        {expert.averageRating ? expert.averageRating.toFixed(1) : '0.0'}
                                    </Typography>
                                    <Rating value={expert.averageRating || 0} readOnly precision={0.5} />
                                    <Typography variant="body2" color="text.secondary">
                                        {expert.totalReviews} değerlendirme
                                    </Typography>
                                </Box>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="body2" color="text.secondary">
                                Değerlendirmeler yakında eklenecek
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Column - Info Cards */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ mb: 2 }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <WorkIcon color="primary" />
                                <Typography variant="h6" fontWeight={600}>
                                    Çalışma Bilgileri
                                </Typography>
                            </Box>
                            <Box display="flex" flexDirection="column" gap={1.5}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Uzmanlık
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {expert.expertType}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Çalışma Şekli
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {expert.workType}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Deneyim
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {experienceYears} yıl
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <LocationOnIcon color="primary" />
                                <Typography variant="h6" fontWeight={600}>
                                    İletişim
                                </Typography>
                            </Box>
                            <Box display="flex" flexDirection="column" gap={1.5}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Şehir
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {expert.city}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        E-posta
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {expert.email}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Telefon
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {expert.phone}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}
