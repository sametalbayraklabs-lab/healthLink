'use client';

import { use, useEffect, useState, useCallback } from 'react';
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
    TextField,
    MenuItem,
    Stack,
} from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import StarIcon from '@mui/icons-material/Star';
import MessageIcon from '@mui/icons-material/Message';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/tr';
import TurkishDateCalendar from '@/app/shared/TurkishDateCalendar';

dayjs.locale('tr');

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107';

interface ReviewItem {
    id: number;
    rating: number;
    comment: string | null;
    createdAt: string;
    clientId: number;
}

function ExpertReviews({ expertId }: { expertId: number }) {
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = useCallback(async () => {
        try {
            const res = await api.get(`/api/reviews/expert/${expertId}`);
            setReviews(res.data || []);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    }, [expertId]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" py={2}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (reviews.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary">
                Henüz değerlendirme bulunmamaktadır.
            </Typography>
        );
    }

    return (
        <Stack spacing={2}>
            {reviews.map((review) => (
                <Paper key={review.id} variant="outlined" sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Rating value={review.rating} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary">
                            {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                        </Typography>
                    </Box>
                    {review.comment && (
                        <Typography variant="body2">
                            {review.comment}
                        </Typography>
                    )}
                </Paper>
            ))}
        </Stack>
    );
}

const getServiceType = (expertType: string) => {
    switch (expertType) {
        case 'Dietitian': return 'NutritionSession';
        case 'Psychologist': return 'TherapySession';
        case 'SportsCoach': return 'TrainingSession';
        default: return 'TherapySession';
    }
};

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

interface TimeSlot {
    startTime: string;
    endTime: string;
    durationMinutes: number;
}

interface Availability {
    expertId: number;
    date: string;
    availableSlots: TimeSlot[];
}

export default function ExpertProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [expert, setExpert] = useState<ExpertProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const searchParams = useSearchParams();

    // Appointment booking states
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [availability, setAvailability] = useState<Availability | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [myPackages, setMyPackages] = useState<any[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
    const [loadingAvailability, setLoadingAvailability] = useState(false);

    useEffect(() => {
        fetchExpert();
        fetchMyPackages();
    }, [resolvedParams.id]);

    // Restore date/slot from query params (after returning from package purchase)
    useEffect(() => {
        const dateParam = searchParams.get('date');
        const slotParam = searchParams.get('slot');
        if (dateParam) {
            const restoredDate = dayjs(dateParam);
            setSelectedDate(restoredDate);
            handleDateChange(restoredDate).then(() => {
                if (slotParam) {
                    // Will be set after availability loads
                    const checkSlot = setInterval(() => {
                        setAvailability(prev => {
                            if (prev && prev.availableSlots.length > 0) {
                                const matchingSlot = prev.availableSlots.find(s => s.startTime === slotParam);
                                if (matchingSlot) setSelectedSlot(matchingSlot);
                                clearInterval(checkSlot);
                            }
                            return prev;
                        });
                    }, 200);
                    setTimeout(() => clearInterval(checkSlot), 5000);
                }
            });
        }
    }, [searchParams]);

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

    const fetchMyPackages = async () => {
        try {
            const response = await fetch(`${API_URL}/api/client-packages/me`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                const activePackages = data.filter((pkg: any) => pkg.status === 'Active' && (pkg.totalSessions - pkg.usedSessions) > 0);
                setMyPackages(activePackages);
                // Auto-select if only 1 active package
                if (activePackages.length === 1) {
                    setSelectedPackage(activePackages[0].id);
                }
            }
        } catch (error) {
            console.error('Error fetching packages:', error);
        }
    };

    const handleDateChange = async (date: Dayjs | null) => {
        if (!date) return;

        setSelectedDate(date);
        setSelectedSlot(null);
        setLoadingAvailability(true);

        try {
            const dateStr = date.format('YYYY-MM-DD');
            const response = await fetch(
                `${API_URL}/api/experts/${resolvedParams.id}/availability?date=${dateStr}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setAvailability(data);
            }
        } catch (error) {
            console.error('Error fetching availability:', error);
        } finally {
            setLoadingAvailability(false);
        }
    };

    const handleCreateAppointment = async () => {
        if (!selectedDate || !selectedSlot || !selectedPackage) {
            alert('Lütfen tüm alanları doldurun');
            return;
        }

        try {
            const startDateTime = dayjs(`${selectedDate.format('YYYY-MM-DD')} ${selectedSlot.startTime}`).format('YYYY-MM-DDTHH:mm:ss');
            const endDateTime = dayjs(`${selectedDate.format('YYYY-MM-DD')} ${selectedSlot.endTime}`).format('YYYY-MM-DDTHH:mm:ss');

            const response = await fetch(`${API_URL}/api/appointments/${selectedPackage}/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({
                    expertId: resolvedParams.id,
                    clientPackageId: selectedPackage,
                    serviceType: expert ? getServiceType(expert.expertType) : 'TherapySession',
                    startDateTime,
                    endDateTime,
                }),
            });

            if (response.ok) {
                alert('Randevu başarıyla oluşturuldu!');
                router.push('/client/appointments');
            } else {
                const error = await response.json();
                alert(`Hata: ${error.message || 'Randevu oluşturulamadı'}`);
            }
        } catch (error) {
            console.error('Error creating appointment:', error);
            alert('Bir hata oluştu');
        }
    };

    const handleBookAppointment = () => {
        router.push(`/client/appointments/new?expertId=${resolvedParams.id}`);
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
                    <Grid size={{ xs: 12, md: 8 }}>
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
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box display="flex" flexDirection="column" gap={2} height="100%" justifyContent="center">
                            <Button
                                variant="contained"
                                size="large"
                                fullWidth
                                startIcon={<MessageIcon />}
                                onClick={() => router.push(`/client/messages?expertId=${expert.id}`)}
                            >
                                Mesaj Gönder
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            <Grid container spacing={3}>
                {/* Left Column - Details */}
                <Grid size={{ xs: 12, md: 8 }}>
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

                    {/* Reviews Section */}
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
                            <ExpertReviews expertId={expert.id} />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Column - Calendar & Appointment Booking */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                Randevu Yönetimi
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                Tarih ve saat seçerek randevu oluşturabilirsiniz
                            </Typography>

                            {/* Calendar */}
                            <TurkishDateCalendar
                                value={selectedDate}
                                onChange={handleDateChange}
                                minDate={dayjs()}
                                sx={{ width: '100%' }}
                            />

                            {/* Time Slots */}
                            {selectedDate && (
                                <Box mt={2}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Müsait Saatler ({selectedDate.format('DD MMMM YYYY')}):
                                    </Typography>

                                    {loadingAvailability ? (
                                        <Box display="flex" justifyContent="center" py={2}>
                                            <CircularProgress size={24} />
                                        </Box>
                                    ) : availability && availability.availableSlots.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary">
                                            Bu tarihte müsait saat bulunmamaktadır.
                                        </Typography>
                                    ) : availability ? (
                                        <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                                            {availability.availableSlots.map((slot, index) => (
                                                <Button
                                                    key={index}
                                                    size="small"
                                                    variant={selectedSlot === slot ? 'contained' : 'outlined'}
                                                    onClick={() => setSelectedSlot(slot)}
                                                >
                                                    {slot.startTime}
                                                </Button>
                                            ))}
                                        </Box>
                                    ) : null}
                                </Box>
                            )}

                            {/* Package Selection & Booking */}
                            {selectedSlot && (
                                <Box mt={2}>
                                    {myPackages.length > 0 ? (
                                        <>
                                            <TextField
                                                select
                                                fullWidth
                                                size="small"
                                                label="Paket Seçin"
                                                value={selectedPackage || ''}
                                                onChange={(e) => setSelectedPackage(Number(e.target.value))}
                                            >
                                                {myPackages.map((pkg: any) => (
                                                    <MenuItem key={pkg.id} value={pkg.id}>
                                                        {pkg.servicePackage.name} ({pkg.totalSessions - pkg.usedSessions} seans)
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                            {selectedPackage && (
                                                <Button
                                                    variant="contained"
                                                    fullWidth
                                                    sx={{ mt: 2 }}
                                                    onClick={handleCreateAppointment}
                                                >
                                                    Randevu Oluştur
                                                </Button>
                                            )}
                                        </>
                                    ) : (
                                        <Box textAlign="center" py={2}>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                Randevu almak için aktif bir paketiniz olmalıdır.
                                            </Typography>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => {
                                                    const params = new URLSearchParams();
                                                    params.set('returnTo', `/experts/${resolvedParams.id}`);
                                                    if (selectedDate) params.set('date', selectedDate.format('YYYY-MM-DD'));
                                                    if (selectedSlot) params.set('slot', selectedSlot.startTime);
                                                    router.push(`/client/packages?${params.toString()}`);
                                                }}
                                            >
                                                Paket Satın Al
                                            </Button>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}
