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
    Rating,
    TextField,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import StarIcon from '@mui/icons-material/Star';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107';

interface LookupItem {
    value: string;
    label: string;
}

interface Review {
    id: number;
    appointmentId: number;
    clientId: number;
    clientName: string;
    expertId: number;
    expertName: string;
    expertType: string;
    rating: number;
    comment: string | null;
    status: string;
    createdAt: string;
}

interface ReviewDetail extends Review {
    clientEmail: string;
    expertEmail: string;
    appointmentDate: string;
    adminNote: string | null;
    reviewedAt: string | null;
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [filterRating, setFilterRating] = useState<string>('');
    const [page, setPage] = useState(1);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<ReviewDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [adminNote, setAdminNote] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [lookups, setLookups] = useState<{ reviewStatuses: LookupItem[] }>({ reviewStatuses: [] });

    useEffect(() => {
        fetchLookups();
    }, []);

    useEffect(() => {
        fetchReviews();
    }, [filterStatus, filterRating, page]);

    const fetchLookups = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${API_URL}/api/admin/lookups`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setLookups({ reviewStatuses: data.reviewStatuses || [] });
            }
        } catch (err) {
            console.error('Lookups yüklenemedi:', err);
        }
    };

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            const params = new URLSearchParams();
            if (filterStatus) params.append('status', filterStatus);
            if (filterRating) params.append('rating', filterRating);
            params.append('page', page.toString());
            params.append('pageSize', '20');

            const response = await fetch(`${API_URL}/api/admin/reviews?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch reviews');

            const data = await response.json();
            setReviews(data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviewDetails = async (id: number) => {
        try {
            setDetailLoading(true);
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/api/admin/reviews/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch review details');

            const data = await response.json();
            setSelectedReview(data);
            setAdminNote(data.adminNote || '');
            setDetailDialogOpen(true);
        } catch (error) {
            console.error('Error fetching review details:', error);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleAction = async (status: string) => {
        if (!selectedReview) return;

        try {
            setActionLoading(true);
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/api/admin/reviews/${selectedReview.id}/action`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ status, adminNote }),
            });

            if (!response.ok) throw new Error('Failed to update review');

            const updatedReview = await response.json();
            setSelectedReview(updatedReview);
            fetchReviews();
        } catch (error) {
            console.error('Error updating review:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PendingApproval': return 'Onay Bekliyor';
            case 'Approved': return 'Onaylandı';
            case 'Rejected': return 'Reddedildi';
            default: return status;
        }
    };

    const getStatusColor = (status: string): "default" | "success" | "error" | "warning" => {
        switch (status) {
            case 'PendingApproval': return 'warning';
            case 'Approved': return 'success';
            case 'Rejected': return 'error';
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

    if (loading && reviews.length === 0) {
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
                Değerlendirme Yönetimi
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Danışan değerlendirmelerini onaylayın veya reddedin
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
                        {lookups.reviewStatuses.map((item) => (
                            <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Puan</InputLabel>
                    <Select
                        value={filterRating}
                        label="Puan"
                        onChange={(e) => {
                            setFilterRating(e.target.value);
                            setPage(1);
                        }}
                    >
                        <MenuItem value="">Tümü</MenuItem>
                        <MenuItem value="5">5 Yıldız</MenuItem>
                        <MenuItem value="4">4 Yıldız</MenuItem>
                        <MenuItem value="3">3 Yıldız</MenuItem>
                        <MenuItem value="2">2 Yıldız</MenuItem>
                        <MenuItem value="1">1 Yıldız</MenuItem>
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
                            <TableCell>Puan</TableCell>
                            <TableCell>Yorum</TableCell>
                            <TableCell>Durum</TableCell>
                            <TableCell>Tarih</TableCell>
                            <TableCell align="right">İşlemler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reviews.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    <Typography color="text.secondary">Değerlendirme bulunamadı</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            reviews.map((review) => (
                                <TableRow key={review.id}>
                                    <TableCell>
                                        <Typography fontWeight="medium">{review.clientName}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography fontWeight="medium">{review.expertName}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getExpertTypeLabel(review.expertType)}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={0.5}>
                                            <Rating value={review.rating} readOnly size="small" />
                                            <Typography variant="caption">({review.rating})</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                maxWidth: 200,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {review.comment || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getStatusLabel(review.status)}
                                            color={getStatusColor(review.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={() => fetchReviewDetails(review.id)}
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

            {reviews.length >= 20 && (
                <Box display="flex" justifyContent="center" mt={3}>
                    <Pagination
                        count={reviews.length < 20 ? page : page + 1}
                        page={page}
                        onChange={(e, value) => setPage(value)}
                        color="primary"
                    />
                </Box>
            )}

            {/* Review Detail Dialog */}
            <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <StarIcon color="warning" />
                        Değerlendirme Detayları
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {detailLoading ? (
                        <Box display="flex" justifyContent="center" py={4}>
                            <CircularProgress />
                        </Box>
                    ) : selectedReview && (
                        <Box mt={2}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Danışan</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {selectedReview.clientName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {selectedReview.clientEmail}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Uzman</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {selectedReview.expertName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {selectedReview.expertEmail}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Uzman Tipi</Typography>
                                    <Typography variant="body1">{getExpertTypeLabel(selectedReview.expertType)}</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Randevu Tarihi</Typography>
                                    <Typography variant="body1">
                                        {new Date(selectedReview.appointmentDate).toLocaleDateString('tr-TR')}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Puan</Typography>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Rating value={selectedReview.rating} readOnly />
                                        <Typography>({selectedReview.rating}/5)</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Durum</Typography>
                                    <Chip
                                        label={getStatusLabel(selectedReview.status)}
                                        color={getStatusColor(selectedReview.status)}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">Yorum</Typography>
                                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                        <Typography variant="body1">
                                            {selectedReview.comment || 'Yorum yapılmamış'}
                                        </Typography>
                                    </Paper>
                                </Grid>

                                {selectedReview.status === 'PendingApproval' && (
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Admin Notu (Opsiyonel)
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={2}
                                            value={adminNote}
                                            onChange={(e) => setAdminNote(e.target.value)}
                                            placeholder="Red durumunda gösterilecek not..."
                                        />
                                    </Grid>
                                )}

                                {selectedReview.adminNote && selectedReview.status !== 'PendingApproval' && (
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">Admin Notu</Typography>
                                        <Typography variant="body2">{selectedReview.adminNote}</Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailDialogOpen(false)}>Kapat</Button>
                    {selectedReview && selectedReview.status === 'PendingApproval' && (
                        <>
                            <Button
                                onClick={() => handleAction('Rejected')}
                                color="error"
                                variant="outlined"
                                startIcon={<CancelIcon />}
                                disabled={actionLoading}
                            >
                                Reddet
                            </Button>
                            <Button
                                onClick={() => handleAction('Approved')}
                                color="success"
                                variant="contained"
                                startIcon={<CheckCircleIcon />}
                                disabled={actionLoading}
                            >
                                Onayla
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>
        </Container>
    );
}
