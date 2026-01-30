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
} from '@mui/material';
import api from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import type { Appointment } from '@/types/appointment';

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await api.get('/api/client/dashboard');
            setAppointments(response.data.recentAppointments || []);
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Scheduled': return 'primary';
            case 'Completed': return 'success';
            case 'Cancelled': return 'error';
            case 'Incomplete': return 'warning';
            default: return 'default';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'Scheduled': return 'Planlandı';
            case 'Completed': return 'Tamamlandı';
            case 'Cancelled': return 'İptal Edildi';
            case 'Incomplete': return 'Tamamlanmadı';
            default: return status;
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                    <Typography variant="h4" gutterBottom fontWeight={600}>
                        Randevularım
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Geçmiş ve gelecek randevularınız
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    size="large"
                    href="/client/appointments/new"
                >
                    Yeni Randevu Oluştur
                </Button>
            </Box>

            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {appointments.map((appointment) => (
                    <Card key={appointment.id}>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="start">
                                <Box>
                                    <Typography variant="h6" fontWeight={600}>
                                        {appointment.expert?.firstName} {appointment.expert?.lastName}
                                    </Typography>
                                    {appointment.expert?.title && (
                                        <Typography variant="body2" color="text.secondary">
                                            {appointment.expert.title}
                                        </Typography>
                                    )}
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        <strong>Tarih:</strong> {formatDateTime(appointment.startDateTime)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Hizmet Tipi:</strong> {appointment.serviceType}
                                    </Typography>
                                    {appointment.zoomLink && (
                                        <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                                            <a href={appointment.zoomLink} target="_blank" rel="noopener noreferrer">
                                                Zoom Linki
                                            </a>
                                        </Typography>
                                    )}
                                </Box>
                                <Box display="flex" flexDirection="column" alignItems="end" gap={1}>
                                    <Chip
                                        label={getStatusLabel(appointment.status)}
                                        color={getStatusColor(appointment.status)}
                                        size="small"
                                    />
                                    {appointment.status === 'Scheduled' && (
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() => handleCancel(appointment.id)}
                                        >
                                            İptal Et
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {appointments.length === 0 && (
                <Box textAlign="center" py={8}>
                    <Typography variant="h6" color="text.secondary">
                        Henüz randevunuz bulunmamaktadır
                    </Typography>
                </Box>
            )}
        </Container>
    );
}
