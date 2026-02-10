'use client';

import { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    CircularProgress,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    Pagination,
    Link,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EventIcon from '@mui/icons-material/Event';
import VideocamIcon from '@mui/icons-material/Videocam';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107';

interface LookupItem {
    value: string;
    label: string;
}

interface Appointment {
    id: number;
    clientId: number;
    clientName: string;
    expertId: number;
    expertName: string;
    expertType: string;
    serviceType: string;
    startDateTime: string;
    endDateTime: string;
    status: string;
    createdAt: string;
}

interface AppointmentDetail extends Appointment {
    clientEmail: string;
    expertEmail: string;
    clientPackageId: number | null;
    packageName: string | null;
    zoomLink: string | null;
    updatedAt: string | null;
}

export default function AdminAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [filterExpertType, setFilterExpertType] = useState<string>('');
    const [page, setPage] = useState(1);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [lookups, setLookups] = useState<{ appointmentStatuses: LookupItem[] }>({ appointmentStatuses: [] });

    useEffect(() => {
        fetchLookups();
    }, []);

    useEffect(() => {
        fetchAppointments();
    }, [filterStatus, filterExpertType, page]);

    const fetchLookups = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${API_URL}/api/admin/lookups`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setLookups({ appointmentStatuses: data.appointmentStatuses || [] });
            }
        } catch (err) {
            console.error('Lookups yüklenemedi:', err);
        }
    };

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            const params = new URLSearchParams();
            if (filterStatus) params.append('status', filterStatus);
            if (filterExpertType) params.append('expertType', filterExpertType);
            params.append('page', page.toString());
            params.append('pageSize', '20');

            const response = await fetch(`${API_URL}/api/admin/appointments?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch appointments');

            const data = await response.json();
            setAppointments(data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAppointmentDetails = async (id: number) => {
        try {
            setDetailLoading(true);
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/api/admin/appointments/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch appointment details');

            const data = await response.json();
            setSelectedAppointment(data);
            setDetailDialogOpen(true);
        } catch (error) {
            console.error('Error fetching appointment details:', error);
        } finally {
            setDetailLoading(false);
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'Scheduled': return 'Planlandı';
            case 'Completed': return 'Tamamlandı';
            case 'CancelledByClient': return 'Danışan İptal';
            case 'CancelledByExpert': return 'Uzman İptal';
            case 'NoShow': return 'Katılmadı';
            case 'Incomplete': return 'Tamamlanmadı';
            default: return status;
        }
    };

    const getStatusColor = (status: string): "default" | "success" | "error" | "warning" | "info" => {
        switch (status) {
            case 'Scheduled': return 'info';
            case 'Completed': return 'success';
            case 'CancelledByClient':
            case 'CancelledByExpert': return 'error';
            case 'NoShow': return 'warning';
            case 'Incomplete': return 'default';
            default: return 'default';
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

    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('tr-TR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading && appointments.length === 0) {
        return (
            <Container maxWidth="xl">
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl">
            <Typography variant="h4" gutterBottom fontWeight={600}>
                Randevu Yönetimi
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Tüm randevuları görüntüleyin ve yönetin
            </Typography>

            <Box display="flex" gap={2} mb={3}>
                <FormControl sx={{ minWidth: 180 }}>
                    <InputLabel>Durum</InputLabel>
                    <Select
                        value={filterStatus}
                        label="Durum"
                        onChange={(e) => {
                            setFilterStatus(e.target.value);
                            setPage(1);
                        }}
                    >
                        <MenuItem value="">Tümü</MenuItem>
                        {lookups.appointmentStatuses.map((item) => (
                            <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Uzman Tipi</InputLabel>
                    <Select
                        value={filterExpertType}
                        label="Uzman Tipi"
                        onChange={(e) => {
                            setFilterExpertType(e.target.value);
                            setPage(1);
                        }}
                    >
                        <MenuItem value="">Tümü</MenuItem>
                        <MenuItem value="Dietitian">Diyetisyen</MenuItem>
                        <MenuItem value="Psychologist">Psikolog</MenuItem>
                        <MenuItem value="SportsCoach">Spor Koçu</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Danışan</TableCell>
                            <TableCell>Uzman</TableCell>
                            <TableCell>Uzman Tipi</TableCell>
                            <TableCell>Seans Tipi</TableCell>
                            <TableCell>Tarih/Saat</TableCell>
                            <TableCell>Durum</TableCell>
                            <TableCell align="right">İşlemler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {appointments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Typography color="text.secondary">Randevu bulunamadı</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            appointments.map((appointment) => (
                                <TableRow key={appointment.id}>
                                    <TableCell>
                                        <Typography fontWeight="medium">{appointment.clientName}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography fontWeight="medium">{appointment.expertName}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getExpertTypeLabel(appointment.expertType)}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>{getServiceTypeLabel(appointment.serviceType)}</TableCell>
                                    <TableCell>
                                        <Box>
                                            <Typography variant="body2" fontWeight="medium">
                                                {formatDateTime(appointment.startDateTime)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                → {new Date(appointment.endDateTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getStatusLabel(appointment.status)}
                                            color={getStatusColor(appointment.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={() => fetchAppointmentDetails(appointment.id)}
                                        >
                                            <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {appointments.length >= 20 && (
                <Box display="flex" justifyContent="center" mt={3}>
                    <Pagination
                        count={appointments.length < 20 ? page : page + 1}
                        page={page}
                        onChange={(e, value) => setPage(value)}
                        color="primary"
                    />
                </Box>
            )}

            {/* Appointment Detail Dialog */}
            <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <EventIcon />
                        Randevu Detayları
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {detailLoading ? (
                        <Box display="flex" justifyContent="center" py={4}>
                            <CircularProgress />
                        </Box>
                    ) : selectedAppointment && (
                        <Box mt={2}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Danışan</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {selectedAppointment.clientName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {selectedAppointment.clientEmail}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Uzman</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {selectedAppointment.expertName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {selectedAppointment.expertEmail}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Uzman Tipi</Typography>
                                    <Typography variant="body1">{getExpertTypeLabel(selectedAppointment.expertType)}</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Seans Tipi</Typography>
                                    <Typography variant="body1">{getServiceTypeLabel(selectedAppointment.serviceType)}</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Başlangıç</Typography>
                                    <Typography variant="body1">{formatDateTime(selectedAppointment.startDateTime)}</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Bitiş</Typography>
                                    <Typography variant="body1">{formatDateTime(selectedAppointment.endDateTime)}</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Durum</Typography>
                                    <Chip
                                        label={getStatusLabel(selectedAppointment.status)}
                                        color={getStatusColor(selectedAppointment.status)}
                                        size="small"
                                    />
                                </Grid>
                                {selectedAppointment.packageName && (
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" color="text.secondary">Paket</Typography>
                                        <Typography variant="body1">{selectedAppointment.packageName}</Typography>
                                    </Grid>
                                )}
                                {selectedAppointment.zoomLink && (
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">Zoom Linki</Typography>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <VideocamIcon color="primary" />
                                            <Link href={selectedAppointment.zoomLink} target="_blank" rel="noopener">
                                                {selectedAppointment.zoomLink}
                                            </Link>
                                        </Box>
                                    </Grid>
                                )}
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Oluşturulma Tarihi</Typography>
                                    <Typography variant="body1">
                                        {new Date(selectedAppointment.createdAt).toLocaleString('tr-TR')}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailDialogOpen(false)}>Kapat</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
