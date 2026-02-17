'use client';

import { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    CircularProgress,
    Rating,
    Chip,
    Avatar,
} from '@mui/material';
import api from '@/lib/api';
import StarIcon from '@mui/icons-material/Star';

interface ReviewData {
    id: number;
    appointmentId: number;
    clientId: number;
    clientName: string | null;
    expertId: number;
    rating: number;
    comment: string | null;
    status: string;
    adminNote: string | null;
    createdAt: string;
    reviewedAt: string | null;
}

export default function ExpertReviewsPage() {
    const [reviews, setReviews] = useState<ReviewData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const response = await api.get('/api/reviews/my-expert');
            setReviews(response.data);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'Approved': return 'Onaylı';
            case 'Pending': return 'Beklemede';
            case 'Rejected': return 'Reddedildi';
            default: return status;
        }
    };

    const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
        switch (status) {
            case 'Approved': return 'success';
            case 'Pending': return 'warning';
            case 'Rejected': return 'error';
            default: return 'default';
        }
    };

    const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 2 }}>
            <Typography variant="h4" gutterBottom fontWeight={600}>
                Değerlendirmeler
            </Typography>

            {reviews.length === 0 ? (
                <Box textAlign="center" py={8}>
                    <Typography variant="h6" color="text.secondary">
                        Henüz değerlendirme bulunmamaktadır
                    </Typography>
                </Box>
            ) : (
                <>
                    {/* Summary Card */}
                    <Card sx={{ mb: 3, bgcolor: 'primary.50' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={3}>
                                <Box textAlign="center">
                                    <Typography variant="h3" fontWeight={700} color="primary.main">
                                        {averageRating.toFixed(1)}
                                    </Typography>
                                    <Rating
                                        value={averageRating}
                                        precision={0.1}
                                        readOnly
                                        size="small"
                                    />
                                </Box>
                                <Box>
                                    <Typography variant="h6" fontWeight={600}>
                                        Ortalama Puan
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {reviews.length} değerlendirme
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Reviews List */}
                    <Box display="flex" flexDirection="column" gap={2}>
                        {reviews.map((review) => (
                            <Card key={review.id} variant="outlined">
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                        <Box display="flex" alignItems="center" gap={1.5}>
                                            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14 }}>
                                                {review.clientName
                                                    ? review.clientName.split(' ').map(n => n[0]).join('').toUpperCase()
                                                    : '?'}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight={600}>
                                                    {review.clientName || `Danışan #${review.clientId}`}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(review.createdAt).toLocaleDateString('tr-TR', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Chip
                                                label={getStatusLabel(review.status)}
                                                color={getStatusColor(review.status)}
                                                size="small"
                                            />
                                            <Box display="flex" alignItems="center" gap={0.5}>
                                                <StarIcon sx={{ color: '#faaf00', fontSize: 20 }} />
                                                <Typography variant="subtitle1" fontWeight={600}>
                                                    {review.rating}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    {review.comment && (
                                        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                                            &ldquo;{review.comment}&rdquo;
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                </>
            )}
        </Container>
    );
}
