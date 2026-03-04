'use client';

import { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    Box,
    CircularProgress,
    LinearProgress,
    Divider,
    Stack,
} from '@mui/material';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import type { ServicePackage } from '@/types/package';

interface ClientPackage {
    id: number;
    servicePackage: ServicePackage;
    totalSessions: number;
    usedSessions: number;
    status: string;
    purchaseDate: string;
}

const getExpertTypeLabel = (type: string) => {
    switch (type) {
        case 'All': return 'Tümü';
        case 'Dietitian': return 'Diyetisyen';
        case 'Psychologist': return 'Psikolog';
        case 'SportsCoach': return 'Spor Koçu';
        default: return type;
    }
};

export default function PackagesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo');
    const dateParam = searchParams.get('date');
    const slotParam = searchParams.get('slot');
    const [availablePackages, setAvailablePackages] = useState<ServicePackage[]>([]);
    const [myPackages, setMyPackages] = useState<ClientPackage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [packagesRes, myPackagesRes] = await Promise.all([
                api.get<ServicePackage[]>('/api/packages'),
                api.get<ClientPackage[]>('/api/client-packages/me'),
            ]);
            const statusPriority: Record<string, number> = { Active: 0, PendingPayment: 1, Completed: 2, Expired: 3 };
            const sorted = [...myPackagesRes.data].sort((a, b) => {
                const pa = statusPriority[a.status] ?? 9;
                const pb = statusPriority[b.status] ?? 9;
                if (pa !== pb) return pa - pb;
                // Within same status, more remaining sessions first
                const ra = (a.totalSessions ?? 0) - (a.usedSessions ?? 0);
                const rb = (b.totalSessions ?? 0) - (b.usedSessions ?? 0);
                return rb - ra;
            });
            setAvailablePackages(packagesRes.data);
            setMyPackages(sorted);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    const activePackages = myPackages.filter(pkg => pkg.status === 'Active' && (pkg.totalSessions - pkg.usedSessions) > 0);

    return (
        <Container maxWidth="lg">
            {/* My Active Packages */}
            {myPackages.length > 0 && (
                <>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
                            Paketlerim
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Aktif paketleriniz ve kalan seans sayıları
                        </Typography>
                    </Box>

                    {activePackages.length === 0 ? (
                        <Box py={2} mb={4}>
                            <Typography color="text.secondary">
                                Aktif paketiniz bulunmamaktadır.
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                            gap: 3,
                            mb: 6,
                        }}>
                            {activePackages.map((clientPkg) => {
                                const pkg = clientPkg.servicePackage;
                                const remainingSessions = clientPkg.totalSessions - clientPkg.usedSessions;
                                const progress = (clientPkg.usedSessions / clientPkg.totalSessions) * 100;

                                return (
                                    <Card key={clientPkg.id} sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        border: '1px solid',
                                        borderColor: 'rgba(226, 232, 240, 0.7)',
                                    }}>
                                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                                                <Typography variant="h6" fontWeight={600}>
                                                    {pkg.name}
                                                </Typography>
                                                <Chip
                                                    label="Aktif"
                                                    size="small"
                                                    sx={{
                                                        bgcolor: 'rgba(22, 163, 74, 0.1)',
                                                        color: '#16A34A',
                                                        fontWeight: 600,
                                                        borderRadius: '8px',
                                                    }}
                                                />
                                            </Box>

                                            <Typography variant="body2" color="text.secondary" paragraph>
                                                {getExpertTypeLabel(pkg.expertType)}
                                            </Typography>

                                            <Box sx={{ mt: 3 }}>
                                                <Box display="flex" justifyContent="space-between" mb={1}>
                                                    <Typography variant="body2" fontWeight={500} color="text.secondary">
                                                        Seans Kullanımı
                                                    </Typography>
                                                    <Typography variant="body2" color="primary.main" fontWeight={700}>
                                                        {clientPkg.usedSessions} / {clientPkg.totalSessions}
                                                    </Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={progress}
                                                    sx={{
                                                        height: 8,
                                                        borderRadius: 8,
                                                        bgcolor: 'rgba(30, 143, 138, 0.1)',
                                                        '& .MuiLinearProgress-bar': {
                                                            borderRadius: 8,
                                                            background: 'linear-gradient(90deg, #1E8F8A, #2BA8A2)',
                                                        },
                                                    }}
                                                />
                                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                                    {clientPkg.usedSessions} seans kullanıldı, {remainingSessions} seans kaldı
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </Box>
                    )}

                    <Divider sx={{ my: 5, borderColor: 'rgba(226, 232, 240, 0.5)' }} />
                </>
            )}

            {/* Available Packages to Purchase */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
                    Yeni Paket Satın Al
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Size uygun paketi seçin ve satın alın
                </Typography>
            </Box>

            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                gap: 3,
            }}>
                {availablePackages.map((pkg) => (
                    <Card key={pkg.id} sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid',
                        borderColor: 'rgba(226, 232, 240, 0.7)',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            borderColor: 'primary.light',
                            boxShadow: '0 12px 40px rgba(30, 143, 138, 0.1)',
                        },
                    }}>
                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                                <Typography variant="h6" fontWeight={600}>
                                    {pkg.name}
                                </Typography>
                                <Chip
                                    label={getExpertTypeLabel(pkg.expertType)}
                                    size="small"
                                    sx={{
                                        bgcolor: 'rgba(30, 143, 138, 0.1)',
                                        color: '#1E8F8A',
                                        fontWeight: 500,
                                        borderRadius: '8px',
                                    }}
                                />
                            </Box>

                            <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6 }}>
                                {pkg.description || 'Paket açıklaması'}
                            </Typography>

                            <Stack spacing={0.75} sx={{ mt: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    <Box component="span" fontWeight={500}>Seans Sayısı:</Box> {pkg.sessionCount}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <Box component="span" fontWeight={500}>Uzman Tipi:</Box> {getExpertTypeLabel(pkg.expertType)}
                                </Typography>
                            </Stack>

                            <Typography
                                variant="h4"
                                fontWeight={700}
                                sx={{
                                    mt: 3,
                                    color: '#1E8F8A',
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                {formatCurrency(pkg.price)}
                            </Typography>
                        </CardContent>

                        <CardActions sx={{ p: 3, pt: 0 }}>
                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                sx={{
                                    py: 1.2,
                                    fontWeight: 600,
                                    borderRadius: '12px',
                                }}
                                onClick={() => {
                                    const params = new URLSearchParams();
                                    if (returnTo) params.set('returnTo', returnTo);
                                    if (dateParam) params.set('date', dateParam);
                                    if (slotParam) params.set('slot', slotParam);
                                    const qs = params.toString();
                                    router.push(`/client/packages/${pkg.id}${qs ? '?' + qs : ''}`);
                                }}
                            >
                                Satın Al
                            </Button>
                        </CardActions>
                    </Card>
                ))}
            </Box>

            {availablePackages.length === 0 && (
                <Box textAlign="center" py={8}>
                    <Typography variant="h6" color="text.secondary">
                        Henüz paket bulunmamaktadır
                    </Typography>
                </Box>
            )}
        </Container>
    );
}
