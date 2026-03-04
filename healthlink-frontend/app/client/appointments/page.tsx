'use client';

import { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Card,
    CardContent,
    Chip,
    Box,
    CircularProgress,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Rating,
    Alert,
    InputAdornment,
    MenuItem,
    Stack,
    Divider,
    IconButton,
    Tooltip,
    Paper,
} from '@mui/material';
import api from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { useChat } from '@/contexts/ChatContext';
import MessageIcon from '@mui/icons-material/Message';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import type { Appointment } from '@/types/appointment';

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const { openChatWithExpert } = useChat();

    // Filters for Past Appointments
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Review dialog state
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [reviewAppointment, setReviewAppointment] = useState<Appointment | null>(null);
    const [reviewRating, setReviewRating] = useState<number | null>(0);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState('');
    const [reviewSuccess, setReviewSuccess] = useState(false);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await api.get('/api/appointments/my');
            setAppointments(response.data || []);
        } catch (error) {
            console.error('Failed to fetch appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id: number) => {
        if (!confirm('Randevuyu iptal etmek istediğinizden emin misiniz?')) return;

        try {
            await api.post(`/api/appointments/${id}/cancel`);
            fetchAppointments();
        } catch (error) {
            console.error('Failed to cancel appointment:', error);
            alert('Randevu iptal edilemedi');
        }
    };

    const openReviewDialog = (appointment: Appointment) => {
        setReviewAppointment(appointment);
        setReviewRating(0);
        setReviewComment('');
        setReviewError('');
        setReviewSuccess(false);
        setReviewDialogOpen(true);
    };

    const handleSubmitReview = async () => {
        if (!reviewAppointment || !reviewRating || reviewRating < 1) {
            setReviewError('Lütfen bir puan verin.');
            return;
        }

        setReviewSubmitting(true);
        setReviewError('');

        try {
            await api.post('/api/reviews', {
                appointmentId: reviewAppointment.id,
                rating: reviewRating,
                comment: reviewComment || null,
            });
            setReviewSuccess(true);
            // Update the appointment in state so button changes
            setAppointments(prev =>
                prev.map(a =>
                    a.id === reviewAppointment.id ? { ...a, hasReview: true } : a
                )
            );
            setTimeout(() => {
                setReviewDialogOpen(false);
            }, 1500);
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.response?.data || 'Değerlendirme gönderilemedi.';
            setReviewError(typeof msg === 'string' ? msg : 'Değerlendirme gönderilemedi.');
        } finally {
            setReviewSubmitting(false);
        }
    };

    const getStatusColor = (status: string): 'primary' | 'success' | 'error' | 'warning' | 'default' => {
        switch (status) {
            case 'Scheduled': return 'primary';
            case 'Completed': return 'success';
            case 'Cancelled':
            case 'CancelledByClient':
            case 'CancelledByExpert': return 'error';
            case 'Incomplete': return 'warning';
            default: return 'default';
        }
    };

    const getStatusBg = (status: string) => {
        switch (status) {
            case 'Scheduled': return 'rgba(30, 143, 138, 0.08)';
            case 'Completed': return 'rgba(22, 163, 74, 0.08)';
            case 'Cancelled':
            case 'CancelledByClient':
            case 'CancelledByExpert': return 'rgba(220, 38, 38, 0.08)';
            case 'Incomplete': return 'rgba(245, 158, 11, 0.08)';
            default: return 'rgba(100, 116, 139, 0.08)';
        }
    };

    const getStatusTextColor = (status: string) => {
        switch (status) {
            case 'Scheduled': return '#1E8F8A';
            case 'Completed': return '#16A34A';
            case 'Cancelled':
            case 'CancelledByClient':
            case 'CancelledByExpert': return '#DC2626';
            case 'Incomplete': return '#D97706';
            default: return '#64748B';
        }
    };

    const getExpertTypeLabel = (type: string) => {
        switch (type) {
            case 'Dietitian': return 'Diyetisyen';
            case 'Psychologist': return 'Psikolog';
            case 'SportsCoach': return 'Spor Koçu';
            default: return type;
        }
    };

    const getServiceTypeLabel = (type: string) => {
        switch (type) {
            case 'NutritionSession': return 'Beslenme Seansı';
            case 'TherapySession': return 'Terapi Seansı';
            case 'TrainingSession': return 'Antrenman Seansı';
            default: return type;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'Scheduled': return 'Planlandı';
            case 'Completed': return 'Tamamlandı';
            case 'Cancelled': return 'İptal Edildi';
            case 'CancelledByClient': return 'Danışan İptal';
            case 'CancelledByExpert': return 'Uzman İptal';
            case 'Incomplete': return 'Tamamlanmadı';
            default: return status;
        }
    };

    // Filter Logic
    const upcomingAppointments = appointments.filter(a => a.status === 'Scheduled' || a.status === 'InProgress');

    const pastAppointments = appointments
        .filter(a => a.status !== 'Scheduled' && a.status !== 'InProgress')
        .filter(a => {
            const nameMatch = (a.expertName || '').toLowerCase().includes(searchTerm.toLowerCase());
            const statusMatch = statusFilter === 'All' ||
                (statusFilter === 'Completed' && a.status === 'Completed') ||
                (statusFilter === 'Cancelled' && (a.status === 'Cancelled' || a.status === 'CancelledByClient' || a.status === 'CancelledByExpert')) ||
                (statusFilter === 'Incomplete' && a.status === 'Incomplete');
            return nameMatch && statusMatch;
        });

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight={700} gutterBottom sx={{ letterSpacing: '-0.01em' }}>
                        Randevularım
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Geçmiş ve gelecek randevularınızı yönetin
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<CalendarMonthIcon />}
                    href="/client/appointments/new"
                    sx={{ borderRadius: '14px', px: 3, fontWeight: 600 }}
                >
                    Yeni Randevu
                </Button>
            </Box>

            {/* Yaklaşan Randevular */}
            <Box mb={6}>
                <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                    Yaklaşan Randevular ({upcomingAppointments.length})
                </Typography>

                {upcomingAppointments.length === 0 ? (
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 4,
                            textAlign: 'center',
                            bgcolor: 'rgba(248, 250, 252, 0.8)',
                            borderRadius: 3,
                            borderColor: 'rgba(226, 232, 240, 0.7)',
                        }}
                    >
                        <Typography color="text.secondary">
                            Yaklaşan randevunuz bulunmamaktadır.
                        </Typography>
                    </Paper>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {upcomingAppointments.map((appointment) => (
                            <Card key={appointment.id} sx={{
                                borderLeft: '4px solid',
                                borderColor: appointment.status === 'InProgress' ? 'success.main' : 'primary.main',
                                border: '1px solid',
                                borderLeftWidth: '4px',
                                borderLeftColor: appointment.status === 'InProgress' ? 'success.main' : 'primary.main',
                                borderRightColor: 'rgba(226, 232, 240, 0.7)',
                                borderTopColor: 'rgba(226, 232, 240, 0.7)',
                                borderBottomColor: 'rgba(226, 232, 240, 0.7)',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
                                },
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="start">
                                        <Box>
                                            <Typography variant="h6" fontWeight={600}>
                                                {appointment.expertName || 'Uzman'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                {getExpertTypeLabel(appointment.expertTitle || '')}
                                            </Typography>

                                            <Box mt={2}>
                                                <Typography variant="body1" fontWeight={500}>
                                                    {formatDateTime(appointment.startDateTime)}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {getServiceTypeLabel(appointment.serviceType)}
                                                </Typography>
                                            </Box>

                                            {(appointment.status === 'Scheduled' || appointment.status === 'InProgress') && (
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    color={appointment.status === 'InProgress' ? 'success' : 'primary'}
                                                    sx={{ mt: 2, borderRadius: '10px', fontWeight: 600 }}
                                                    href={`/client/appointments/${appointment.id}/meeting`}
                                                >
                                                    {appointment.status === 'InProgress' ? 'Görüşmeye Katıl (Aktif)' : 'Görüşmeye Bağlan'}
                                                </Button>
                                            )}
                                        </Box>
                                        <Box display="flex" flexDirection="column" gap={1} alignItems="flex-end">
                                            <Chip
                                                label={appointment.status === 'InProgress' ? 'Aktif Görüşme' : 'Planlandı'}
                                                size="small"
                                                sx={{
                                                    bgcolor: appointment.status === 'InProgress' ? 'rgba(22, 163, 74, 0.1)' : 'rgba(30, 143, 138, 0.1)',
                                                    color: appointment.status === 'InProgress' ? '#16A34A' : '#1E8F8A',
                                                    fontWeight: 600,
                                                    borderRadius: '8px',
                                                }}
                                            />
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<MessageIcon />}
                                                onClick={() => openChatWithExpert(appointment.expertId)}
                                                sx={{ borderRadius: '10px', borderColor: '#E2E8F0', color: 'text.secondary', '&:hover': { borderColor: 'primary.main', color: 'primary.main' } }}
                                            >
                                                Mesaj
                                            </Button>
                                            <Button
                                                size="small"
                                                color="error"
                                                onClick={() => handleCancel(appointment.id)}
                                                sx={{ borderRadius: '10px', fontWeight: 500 }}
                                            >
                                                İptal Et
                                            </Button>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                )}
            </Box>

            <Divider sx={{ my: 4, borderColor: 'rgba(226, 232, 240, 0.5)' }} />

            {/* Geçmiş Randevular */}
            <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                    <Typography variant="h5" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'text.disabled' }} />
                        Geçmiş Randevular
                    </Typography>

                    <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', md: 'auto' } }}>
                        <TextField
                            placeholder="Uzman Ara..."
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ minWidth: 200 }}
                        />
                        <TextField
                            select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            size="small"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <FilterListIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ minWidth: 150 }}
                        >
                            <MenuItem value="All">Tümü</MenuItem>
                            <MenuItem value="Completed">Tamamlandı</MenuItem>
                            <MenuItem value="Cancelled">İptal Edildi</MenuItem>
                            <MenuItem value="Incomplete">Tamamlanmadı</MenuItem>
                        </TextField>
                    </Stack>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {pastAppointments.length === 0 ? (
                        <Typography color="text.secondary" textAlign="center" py={4}>
                            Kriterlere uygun geçmiş randevu bulunamadı.
                        </Typography>
                    ) : (
                        pastAppointments.map((appointment) => (
                            <Paper
                                key={appointment.id}
                                variant="outlined"
                                sx={{
                                    p: 2.5,
                                    borderRadius: 3,
                                    borderColor: 'rgba(226, 232, 240, 0.7)',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        bgcolor: 'rgba(248, 250, 252, 0.8)',
                                        borderColor: '#CBD5E1',
                                    },
                                }}
                            >
                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', sm: '2fr 2fr 1fr 1fr' },
                                    alignItems: 'center',
                                    gap: 2,
                                }}>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            {appointment.expertName}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatDateTime(appointment.startDateTime)}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: { sm: 'center' } }}>
                                        {getServiceTypeLabel(appointment.serviceType)}
                                    </Typography>
                                    <Box sx={{ textAlign: { sm: 'center' } }}>
                                        <Chip
                                            label={getStatusLabel(appointment.status)}
                                            size="small"
                                            sx={{
                                                bgcolor: getStatusBg(appointment.status),
                                                color: getStatusTextColor(appointment.status),
                                                fontWeight: 600,
                                                borderRadius: '8px',
                                                border: 'none',
                                            }}
                                        />
                                    </Box>
                                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                                        <Tooltip title="Mesaj Gönder">
                                            <IconButton
                                                size="small"
                                                onClick={() => openChatWithExpert(appointment.expertId)}
                                                sx={{ '&:hover': { color: 'primary.main' } }}
                                            >
                                                <MessageIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>

                                        {appointment.status === 'Completed' && (
                                            appointment.hasReview ? (
                                                <Tooltip title="Değerlendirildi">
                                                    <CheckCircleIcon color="success" fontSize="small" />
                                                </Tooltip>
                                            ) : (
                                                <Button
                                                    size="small"
                                                    variant="text"
                                                    startIcon={<StarIcon fontSize="small" />}
                                                    onClick={() => openReviewDialog(appointment)}
                                                    sx={{
                                                        color: '#F59E0B',
                                                        fontWeight: 500,
                                                        borderRadius: '10px',
                                                        '&:hover': { bgcolor: 'rgba(245, 158, 11, 0.08)' },
                                                    }}
                                                >
                                                    Puan Ver
                                                </Button>
                                            )
                                        )}
                                    </Stack>
                                </Box>
                            </Paper>
                        ))
                    )}
                </Box>
            </Box>

            {/* Review Dialog */}
            <Dialog
                open={reviewDialogOpen}
                onClose={() => !reviewSubmitting && setReviewDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ pb: 1, fontWeight: 600 }}>
                    Uzmanı Değerlendirin
                    {reviewAppointment && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 400 }}>
                            {reviewAppointment.expertName} • {formatDateTime(reviewAppointment.startDateTime)}
                        </Typography>
                    )}
                </DialogTitle>
                <DialogContent>
                    {reviewSuccess ? (
                        <Alert severity="success" sx={{ mt: 1, borderRadius: 2 }}>
                            Değerlendirmeniz başarıyla gönderildi!
                        </Alert>
                    ) : (
                        <Box sx={{ mt: 1 }}>
                            {reviewError && (
                                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                                    {reviewError}
                                </Alert>
                            )}

                            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                                <Typography variant="body1" fontWeight={500} mb={1}>
                                    Puanınız
                                </Typography>
                                <Rating
                                    value={reviewRating}
                                    onChange={(_, newValue) => setReviewRating(newValue)}
                                    size="large"
                                    sx={{ fontSize: '2.5rem' }}
                                />
                                <Typography variant="caption" color="text.secondary" mt={0.5}>
                                    {reviewRating === 1 ? 'Çok Kötü' :
                                        reviewRating === 2 ? 'Kötü' :
                                            reviewRating === 3 ? 'Orta' :
                                                reviewRating === 4 ? 'İyi' :
                                                    reviewRating === 5 ? 'Mükemmel' : 'Puan verin'}
                                </Typography>
                            </Box>

                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Yorumunuz (opsiyonel)"
                                placeholder="Deneyiminizi paylaşın..."
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                inputProps={{ maxLength: 1000 }}
                                helperText={`${reviewComment.length}/1000`}
                            />
                        </Box>
                    )}
                </DialogContent>
                {!reviewSuccess && (
                    <DialogActions sx={{ px: 3, pb: 2.5 }}>
                        <Button
                            onClick={() => setReviewDialogOpen(false)}
                            disabled={reviewSubmitting}
                            sx={{ borderRadius: '10px' }}
                        >
                            İptal
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmitReview}
                            disabled={reviewSubmitting || !reviewRating}
                            sx={{ borderRadius: '10px', px: 3 }}
                        >
                            {reviewSubmitting ? <CircularProgress size={20} /> : 'Gönder'}
                        </Button>
                    </DialogActions>
                )}
            </Dialog>
        </Container>
    );
}
