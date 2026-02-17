'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    Button,
    Chip,
    Stack,
    Avatar,
    Rating,
    CircularProgress,
    Tabs,
    Tab,
    IconButton,
    Tooltip,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatIcon from '@mui/icons-material/Chat';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WorkIcon from '@mui/icons-material/Work';

interface MyExpert {
    expertId: number;
    displayName: string;
    expertType: string;
    profilePhotoUrl: string | null;
    averageRating: number;
    totalReviewCount: number;
    totalSessions: number;
    lastSessionDate: string;
    isFavorite: boolean;
}

const expertTypeLabels: Record<string, string> = {
    Psychologist: 'Psikolog',
    Dietitian: 'Diyetisyen',
    SportsCoach: 'Spor Koçu',
    All: 'Uzman',
};

export default function MyExpertsPage() {
    const router = useRouter();
    const [experts, setExperts] = useState<MyExpert[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState(0);

    const fetchExperts = useCallback(async () => {
        try {
            const res = await api.get('/api/appointments/my-experts');
            setExperts(res.data || []);
        } catch (error) {
            console.error('Failed to fetch my experts:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchExperts();
    }, [fetchExperts]);

    const toggleFavorite = async (expertId: number, currentlyFavorite: boolean) => {
        try {
            if (currentlyFavorite) {
                await api.delete(`/api/favorites/${expertId}`);
            } else {
                await api.post(`/api/favorites/${expertId}`);
            }
            setExperts(prev =>
                prev.map(e =>
                    e.expertId === expertId ? { ...e, isFavorite: !e.isFavorite } : e
                )
            );
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        }
    };

    const filteredExperts = tab === 0
        ? experts
        : tab === 1
            ? experts.filter(e => e.isFavorite)
            : experts.filter(e => e.totalSessions > 0);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight={600} gutterBottom>
                Uzmanlarım
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Favori uzmanlarınız ve daha önce görüştüğünüz uzmanlar
            </Typography>

            <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
                <Tab label={`Tümü (${experts.length})`} />
                <Tab label={`Favoriler (${experts.filter(e => e.isFavorite).length})`} />
                <Tab label={`Görüşülenler (${experts.filter(e => e.totalSessions > 0).length})`} />
            </Tabs>

            {filteredExperts.length === 0 ? (
                <Card>
                    <CardContent>
                        <Box textAlign="center" py={4}>
                            <FavoriteIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                {tab === 1 ? 'Henüz favori uzmanınız yok' : tab === 2 ? 'Henüz görüşme yapmadınız' : 'Henüz uzmanınız yok'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                Uzman arayarak favori listenizi oluşturabilirsiniz
                            </Typography>
                            <Button variant="contained" onClick={() => router.push('/client/experts')}>
                                Uzman Ara
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            ) : (
                <Stack spacing={2}>
                    {filteredExperts.map((expert) => {
                        const typeLabel = expertTypeLabels[expert.expertType] || expert.expertType;
                        const lastDate = expert.lastSessionDate && expert.lastSessionDate !== '0001-01-01T00:00:00'
                            ? new Date(expert.lastSessionDate).toLocaleDateString('tr-TR')
                            : null;

                        return (
                            <Card
                                key={expert.expertId}
                                sx={{
                                    '&:hover': { boxShadow: 4 },
                                    transition: 'box-shadow 0.3s',
                                    borderLeft: expert.isFavorite ? '4px solid' : 'none',
                                    borderColor: expert.isFavorite ? 'error.main' : 'transparent',
                                }}
                            >
                                <CardContent>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Avatar
                                            src={expert.profilePhotoUrl || undefined}
                                            sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.5rem' }}
                                        >
                                            {expert.displayName?.charAt(0)}
                                        </Avatar>

                                        <Box flex={1}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Typography variant="h6" fontWeight={600}>
                                                    {expert.displayName}
                                                </Typography>
                                                <Chip label={typeLabel} size="small" color="primary" variant="outlined" />
                                            </Box>

                                            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                                <Rating value={expert.averageRating || 0} readOnly size="small" precision={0.5} />
                                                <Typography variant="body2" color="text.secondary">
                                                    {(expert.averageRating || 0).toFixed(1)} ({expert.totalReviewCount || 0} değerlendirme)
                                                </Typography>
                                            </Box>

                                            <Stack direction="row" spacing={1} mt={1}>
                                                {expert.totalSessions > 0 && (
                                                    <Chip
                                                        icon={<WorkIcon />}
                                                        label={`${expert.totalSessions} seans`}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                )}
                                                {lastDate && (
                                                    <Chip
                                                        icon={<CalendarMonthIcon />}
                                                        label={`Son: ${lastDate}`}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                )}
                                            </Stack>
                                        </Box>

                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Tooltip title={expert.isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}>
                                                <IconButton
                                                    onClick={() => toggleFavorite(expert.expertId, expert.isFavorite)}
                                                    color="error"
                                                >
                                                    {expert.isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Mesaj gönder">
                                                <IconButton
                                                    onClick={() => router.push(`/client/messages?expertId=${expert.expertId}`)}
                                                    color="primary"
                                                >
                                                    <ChatIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<VisibilityIcon />}
                                                onClick={() => router.push(`/experts/${expert.expertId}`)}
                                            >
                                                Profil
                                            </Button>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                startIcon={<CalendarMonthIcon />}
                                                onClick={() => router.push(`/client/appointments/new?expertId=${expert.expertId}`)}
                                            >
                                                Randevu
                                            </Button>
                                        </Stack>
                                    </Box>
                                </CardContent>
                            </Card>
                        );
                    })}
                </Stack>
            )}
        </Container>
    );
}
