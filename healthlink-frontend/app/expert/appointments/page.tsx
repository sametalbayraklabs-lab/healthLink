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
    TextField,
    MenuItem,
    InputAdornment,
    Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import api from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { useChat } from '@/contexts/ChatContext';
import MessageIcon from '@mui/icons-material/Message';
import VideocamIcon from '@mui/icons-material/Videocam';

interface Appointment {
    id: number;
    clientId: number;
    expertId: number;
    clientName?: string;
    serviceType: string;
    status: string;
    startDateTime: string;
    endDateTime: string;
}

const PAST_STATUS_OPTIONS = [
    { value: 'All', label: 'Tümü' },
    { value: 'Completed', label: 'Tamamlandı' },
    { value: 'Cancelled', label: 'İptal Edildi' },
    { value: 'Incomplete', label: 'Tamamlanmadı' },
];

export default function ExpertAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [nameSearch, setNameSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const { openChatWithClient } = useChat();

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await api.get('/api/appointments/expert');
            setAppointments(response.data || []);
        } catch (error) {
            console.error('Failed to fetch appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    // Üst bölüm: Aktif + Planlandı (InProgress en üstte)
    const upcomingAppointments = appointments
        .filter(a => a.status === 'InProgress' || a.status === 'Scheduled')
        .sort((a, b) => {
            if (a.status === 'InProgress' && b.status !== 'InProgress') return -1;
            if (a.status !== 'InProgress' && b.status === 'InProgress') return 1;
            return new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();
        });

    // Alt bölüm: Geçmiş randevular (filtreli)
    const pastAppointments = appointments
        .filter(a => a.status !== 'Scheduled' && a.status !== 'InProgress')
        .filter(a => {
            const nameMatch = (a.clientName || '').toLowerCase().includes(nameSearch.toLowerCase());
            const statusMatch = statusFilter === 'All' ||
                (statusFilter === 'Completed' && a.status === 'Completed') ||
                (statusFilter === 'Cancelled' && (a.status === 'Cancelled' || a.status === 'CancelledByClient' || a.status === 'CancelledByExpert')) ||
                (statusFilter === 'Incomplete' && a.status === 'Incomplete');
            return nameMatch && statusMatch;
        });

    const handleComplete = async (id: number) => {
        try {
            await api.post(`/api/appointments/${id}/complete`);
            fetchAppointments();
        } catch (error) {
            console.error('Failed to complete appointment:', error);
        }
    };

    const handleCancel = async (id: number) => {
        if (!confirm('Randevuyu iptal etmek istediğinizden emin misiniz?')) return;
        try {
            await api.post(`/api/appointments/${id}/cancel`);
            fetchAppointments();
        } catch (error) {
            console.error('Failed to cancel appointment:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Scheduled': return 'primary';
            case 'InProgress': return 'success';
            case 'Completed': return 'success';
            case 'Cancelled':
            case 'CancelledByClient':
            case 'CancelledByExpert': return 'error';
            case 'Incomplete': return 'warning';
            default: return 'default';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'Scheduled': return 'Planlandı';
            case 'InProgress': return 'Aktif Görüşme';
            case 'Completed': return 'Tamamlandı';
            case 'Cancelled': return 'İptal Edildi';
            case 'CancelledByClient': return 'Danışan İptal';
            case 'CancelledByExpert': return 'Uzman İptal';
            case 'Incomplete': return 'Tamamlanmadı';
            default: return status;
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

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    // Appointment card renderer
    const renderAppointmentCard = (appointment: Appointment, section: 'upcoming' | 'past') => (
        <Card
            key={appointment.id}
            sx={{
                borderLeft: section === 'upcoming' ? '4px solid' : undefined,
                borderColor: section === 'upcoming'
                    ? (appointment.status === 'InProgress' ? 'success.main' : 'primary.main')
                    : undefined,
            }}
        >
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start">
                    <Box>
                        <Typography variant="h6" fontWeight={600}>
                            {appointment.clientName || 'Danışan'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            <strong>Tarih:</strong> {formatDateTime(appointment.startDateTime)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            <strong>Hizmet Tipi:</strong> {getServiceTypeLabel(appointment.serviceType)}
                        </Typography>

                        {/* Video butonu — upcoming bölümünde */}
                        {section === 'upcoming' && (
                            <Button
                                size="small"
                                variant="contained"
                                color={appointment.status === 'InProgress' ? 'success' : 'primary'}
                                href={`/expert/appointments/${appointment.id}/meeting`}
                                startIcon={<VideocamIcon />}
                                sx={{ mt: 2 }}
                            >
                                {appointment.status === 'InProgress' ? 'Görüşmeye Katıl' : 'Görüşmeyi Başlat'}
                            </Button>
                        )}
                    </Box>
                    <Box display="flex" flexDirection="column" alignItems="end" gap={1}>
                        <Chip
                            label={getStatusLabel(appointment.status)}
                            color={getStatusColor(appointment.status)}
                            size="small"
                        />
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<MessageIcon />}
                            onClick={() => openChatWithClient(appointment.clientId)}
                        >
                            Mesaj
                        </Button>

                        {/* Tamamla / İptal — sadece Scheduled */}
                        {appointment.status === 'Scheduled' && (
                            <Box display="flex" gap={1}>
                                <Button size="small" color="success" variant="outlined" onClick={() => handleComplete(appointment.id)}>
                                    Tamamla
                                </Button>
                                <Button size="small" color="error" onClick={() => handleCancel(appointment.id)}>
                                    İptal Et
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight={600}>
                Randevularım
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Danışanlarınızla olan randevularınız
            </Typography>

            {/* ── Üst Bölüm: Aktif & Planlandı ── */}
            <Box mb={6}>
                <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                    Aktif & Yaklaşan ({upcomingAppointments.length})
                </Typography>

                {upcomingAppointments.length === 0 ? (
                    <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                        <Typography color="text.secondary">
                            Aktif veya planlanmış randevunuz bulunmamaktadır.
                        </Typography>
                    </Paper>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {upcomingAppointments.map(apt => renderAppointmentCard(apt, 'upcoming'))}
                    </Box>
                )}
            </Box>

            {/* ── Alt Bölüm: Geçmiş Randevular ── */}
            <Box>
                <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'text.secondary' }} />
                    Geçmiş Randevular ({pastAppointments.length})
                </Typography>

                {/* Geçmiş filtreler */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <TextField
                        size="small"
                        placeholder="Danışan Ara..."
                        value={nameSearch}
                        onChange={(e) => setNameSearch(e.target.value)}
                        sx={{ minWidth: 250 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        select
                        size="small"
                        label="Durum"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        sx={{ minWidth: 180 }}
                    >
                        {PAST_STATUS_OPTIONS.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>

                {pastAppointments.length === 0 ? (
                    <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                        <Typography color="text.secondary">
                            Geçmiş randevu bulunamadı.
                        </Typography>
                    </Paper>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {pastAppointments.map(apt => renderAppointmentCard(apt, 'past'))}
                    </Box>
                )}
            </Box>
        </Container>
    );
}

