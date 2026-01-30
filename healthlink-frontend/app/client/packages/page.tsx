'use client';

import { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    Box,
    CircularProgress,
    LinearProgress,
    Divider,
} from '@mui/material';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import type { ServicePackage } from '@/types/package';

interface ClientPackage {
    id: number;
    servicePackage: ServicePackage;
    remainingSessions: number;
    status: string;
    purchaseDate: string;
}

export default function PackagesPage() {
    const router = useRouter();
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
            setAvailablePackages(packagesRes.data);
            setMyPackages(myPackagesRes.data);
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

    const activePackages = myPackages.filter(pkg => pkg.status === 'Active');

    return (
        <Container maxWidth="lg">
            {/* My Active Packages */}
            {activePackages.length > 0 && (
                <>
                    <Typography variant="h4" gutterBottom fontWeight={600}>
                        Paketlerim
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        Aktif paketleriniz ve kalan seans sayıları
                    </Typography>

                    <Grid container spacing={3} sx={{ mt: 1, mb: 6 }}>
                        {activePackages.map((clientPkg) => {
                            const pkg = clientPkg.servicePackage;
                            const usedSessions = pkg.sessionCount - clientPkg.remainingSessions;
                            const progress = (usedSessions / pkg.sessionCount) * 100;

                            return (
                                <Grid key={clientPkg.id} xs={12} sm={6} md={4}>
                                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                                                <Typography variant="h6" fontWeight={600}>
                                                    {pkg.name}
                                                </Typography>
                                                <Chip
                                                    label="Aktif"
                                                    size="small"
                                                    color="success"
                                                />
                                            </Box>

                                            <Typography variant="body2" color="text.secondary" paragraph>
                                                {pkg.expertType === 'Psychologist' ? 'Psikolog' : 'Diyetisyen'}
                                            </Typography>

                                            <Box sx={{ mt: 3 }}>
                                                <Box display="flex" justifyContent="space-between" mb={1}>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        Seans Kullanımı
                                                    </Typography>
                                                    <Typography variant="body2" color="primary" fontWeight={600}>
                                                        {clientPkg.remainingSessions} / {pkg.sessionCount}
                                                    </Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={progress}
                                                    sx={{ height: 8, borderRadius: 1 }}
                                                />
                                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                                    {usedSessions} seans kullanıldı, {clientPkg.remainingSessions} seans kaldı
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>

                    <Divider sx={{ my: 4 }} />
                </>
            )}

            {/* Available Packages to Purchase */}
            <Typography variant="h4" gutterBottom fontWeight={600}>
                Yeni Paket Satın Al
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Size uygun paketi seçin ve satın alın
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
                {availablePackages.map((pkg) => (
                    <Grid key={pkg.id} xs={12} sm={6} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                                    <Typography variant="h6" fontWeight={600}>
                                        {pkg.name}
                                    </Typography>
                                    <Chip
                                        label={pkg.expertType === 'Psychologist' ? 'Psikolog' : 'Diyetisyen'}
                                        size="small"
                                        color="primary"
                                    />
                                </Box>

                                <Typography variant="body2" color="text.secondary" paragraph>
                                    {pkg.description || 'Paket açıklaması'}
                                </Typography>

                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Seans Sayısı:</strong> {pkg.sessionCount}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Seans Süresi:</strong> {pkg.durationMinutes} dakika
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Hizmet Tipi:</strong> {pkg.serviceType}
                                    </Typography>
                                </Box>

                                <Typography variant="h5" color="primary" fontWeight={600} sx={{ mt: 3 }}>
                                    {formatCurrency(pkg.price)}
                                </Typography>
                            </CardContent>

                            <CardActions>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={() => router.push(`/client/packages/${pkg.id}`)}
                                >
                                    Satın Al
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

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
