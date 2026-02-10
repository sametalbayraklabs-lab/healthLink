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
    TextField,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107';

interface LookupItem {
    value: string;
    label: string;
}

interface Complaint {
    id: number;
    clientId: number | null;
    clientName: string | null;
    expertId: number | null;
    expertName: string | null;
    category: string;
    type: string;
    title: string;
    status: string;
    createdAt: string;
}

interface ComplaintDetail extends Complaint {
    clientEmail: string | null;
    expertEmail: string | null;
    appointmentId: number | null;
    appointmentDate: string | null;
    description: string | null;
    adminNote: string | null;
    updatedAt: string | null;
    closedAt: string | null;
}

export default function AdminComplaintsPage() {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [filterCategory, setFilterCategory] = useState<string>('');
    const [page, setPage] = useState(1);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState<ComplaintDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [adminNote, setAdminNote] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [lookups, setLookups] = useState<{ complaintStatuses: LookupItem[]; complaintCategories: LookupItem[] }>({ complaintStatuses: [], complaintCategories: [] });

    useEffect(() => {
        fetchLookups();
    }, []);

    useEffect(() => {
        fetchComplaints();
    }, [filterStatus, filterCategory, page]);

    const fetchLookups = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${API_URL}/api/admin/lookups`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setLookups({
                    complaintStatuses: data.complaintStatuses || [],
                    complaintCategories: data.complaintCategories || []
                });
            }
        } catch (err) {
            console.error('Lookups yüklenemedi:', err);
        }
    };

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            const params = new URLSearchParams();
            if (filterStatus) params.append('status', filterStatus);
            if (filterCategory) params.append('category', filterCategory);
            params.append('page', page.toString());
            params.append('pageSize', '20');

            const response = await fetch(`${API_URL}/api/admin/complaints?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch complaints');

            const data = await response.json();
            setComplaints(data);
        } catch (error) {
            console.error('Error fetching complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchComplaintDetails = async (id: number) => {
        try {
            setDetailLoading(true);
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/api/admin/complaints/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch complaint details');

            const data = await response.json();
            setSelectedComplaint(data);
            setAdminNote(data.adminNote || '');
            setDetailDialogOpen(true);
        } catch (error) {
            console.error('Error fetching complaint details:', error);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleAction = async (status: string) => {
        if (!selectedComplaint) return;

        try {
            setActionLoading(true);
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/api/admin/complaints/${selectedComplaint.id}/action`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ status, adminNote }),
            });

            if (!response.ok) throw new Error('Failed to update complaint');

            const updated = await response.json();
            setSelectedComplaint(updated);
            fetchComplaints();
        } catch (error) {
            console.error('Error updating complaint:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'Open': return 'Açık';
            case 'InReview': return 'İnceleniyor';
            case 'Resolved': return 'Çözüldü';
            case 'Rejected': return 'Reddedildi';
            default: return status;
        }
    };

    const getStatusColor = (status: string): "default" | "success" | "error" | "warning" | "info" => {
        switch (status) {
            case 'Open': return 'error';
            case 'InReview': return 'warning';
            case 'Resolved': return 'success';
            case 'Rejected': return 'default';
            default: return 'default';
        }
    };

    const getCategoryLabel = (category: string) => {
        switch (category) {
            case 'Expert': return 'Uzman';
            case 'System': return 'Sistem';
            case 'Payment': return 'Ödeme';
            default: return category;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'ServiceQuality': return 'Hizmet Kalitesi';
            case 'Communication': return 'İletişim';
            case 'Technical': return 'Teknik';
            case 'Billing': return 'Fatura';
            case 'Other': return 'Diğer';
            default: return type;
        }
    };

    if (loading && complaints.length === 0) {
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
                Şikayet Yönetimi
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Danışan ve uzman şikayetlerini yönetin
            </Typography>

            <Box display="flex" gap={2} mb={3}>
                <FormControl sx={{ minWidth: 150 }}>
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
                        {lookups.complaintStatuses.map((item) => (
                            <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Kategori</InputLabel>
                    <Select
                        value={filterCategory}
                        label="Kategori"
                        onChange={(e) => {
                            setFilterCategory(e.target.value);
                            setPage(1);
                        }}
                    >
                        <MenuItem value="">Tümü</MenuItem>
                        {lookups.complaintCategories.map((item) => (
                            <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Başlık</TableCell>
                            <TableCell>Şikayet Eden</TableCell>
                            <TableCell>Hakkında</TableCell>
                            <TableCell>Kategori</TableCell>
                            <TableCell>Tip</TableCell>
                            <TableCell>Durum</TableCell>
                            <TableCell>Tarih</TableCell>
                            <TableCell align="right">İşlemler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {complaints.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    <Typography color="text.secondary">Şikayet bulunamadı</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            complaints.map((complaint) => (
                                <TableRow key={complaint.id}>
                                    <TableCell>
                                        <Typography fontWeight="medium">{complaint.title}</Typography>
                                    </TableCell>
                                    <TableCell>{complaint.clientName || '-'}</TableCell>
                                    <TableCell>{complaint.expertName || '-'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getCategoryLabel(complaint.category)}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>{getTypeLabel(complaint.type)}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getStatusLabel(complaint.status)}
                                            color={getStatusColor(complaint.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {new Date(complaint.createdAt).toLocaleDateString('tr-TR')}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={() => fetchComplaintDetails(complaint.id)}
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

            {complaints.length >= 20 && (
                <Box display="flex" justifyContent="center" mt={3}>
                    <Pagination
                        count={complaints.length < 20 ? page : page + 1}
                        page={page}
                        onChange={(e, value) => setPage(value)}
                        color="primary"
                    />
                </Box>
            )}

            {/* Complaint Detail Dialog */}
            <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <ReportProblemIcon color="warning" />
                        Şikayet Detayları
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {detailLoading ? (
                        <Box display="flex" justifyContent="center" py={4}>
                            <CircularProgress />
                        </Box>
                    ) : selectedComplaint && (
                        <Box mt={2}>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Typography variant="h6">{selectedComplaint.title}</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Şikayet Eden</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {selectedComplaint.clientName || '-'}
                                    </Typography>
                                    {selectedComplaint.clientEmail && (
                                        <Typography variant="caption" color="text.secondary">
                                            {selectedComplaint.clientEmail}
                                        </Typography>
                                    )}
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Hakkında (Uzman)</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {selectedComplaint.expertName || '-'}
                                    </Typography>
                                    {selectedComplaint.expertEmail && (
                                        <Typography variant="caption" color="text.secondary">
                                            {selectedComplaint.expertEmail}
                                        </Typography>
                                    )}
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="subtitle2" color="text.secondary">Kategori</Typography>
                                    <Typography variant="body1">{getCategoryLabel(selectedComplaint.category)}</Typography>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="subtitle2" color="text.secondary">Tip</Typography>
                                    <Typography variant="body1">{getTypeLabel(selectedComplaint.type)}</Typography>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="subtitle2" color="text.secondary">Durum</Typography>
                                    <Chip
                                        label={getStatusLabel(selectedComplaint.status)}
                                        color={getStatusColor(selectedComplaint.status)}
                                        size="small"
                                    />
                                </Grid>
                                {selectedComplaint.appointmentDate && (
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">İlgili Randevu</Typography>
                                        <Typography variant="body1">
                                            {new Date(selectedComplaint.appointmentDate).toLocaleString('tr-TR')}
                                        </Typography>
                                    </Grid>
                                )}
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">Açıklama</Typography>
                                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                        <Typography variant="body1">
                                            {selectedComplaint.description || 'Açıklama yok'}
                                        </Typography>
                                    </Paper>
                                </Grid>

                                {(selectedComplaint.status === 'Open' || selectedComplaint.status === 'InReview') && (
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Admin Notu
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={2}
                                            value={adminNote}
                                            onChange={(e) => setAdminNote(e.target.value)}
                                            placeholder="Çözüm veya red açıklaması..."
                                        />
                                    </Grid>
                                )}

                                {selectedComplaint.adminNote && selectedComplaint.status !== 'Open' && selectedComplaint.status !== 'InReview' && (
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">Admin Notu</Typography>
                                        <Typography variant="body2">{selectedComplaint.adminNote}</Typography>
                                    </Grid>
                                )}

                                {selectedComplaint.closedAt && (
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">Kapatılma Tarihi</Typography>
                                        <Typography variant="body2">
                                            {new Date(selectedComplaint.closedAt).toLocaleString('tr-TR')}
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailDialogOpen(false)}>Kapat</Button>
                    {selectedComplaint && selectedComplaint.status === 'Open' && (
                        <Button
                            onClick={() => handleAction('InReview')}
                            color="warning"
                            variant="outlined"
                            disabled={actionLoading}
                        >
                            İncelemeye Al
                        </Button>
                    )}
                    {selectedComplaint && (selectedComplaint.status === 'Open' || selectedComplaint.status === 'InReview') && (
                        <>
                            <Button
                                onClick={() => handleAction('Rejected')}
                                color="error"
                                variant="outlined"
                                disabled={actionLoading}
                            >
                                Reddet
                            </Button>
                            <Button
                                onClick={() => handleAction('Resolved')}
                                color="success"
                                variant="contained"
                                disabled={actionLoading}
                            >
                                Çözüldü
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>
        </Container>
    );
}
