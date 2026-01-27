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
} from '@mui/material';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import type { ServicePackage } from '@/types/package';

export default function PackagesPage() {
    const router = useRouter();
    const [packages, setPackages] = useState<ServicePackage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const response = await api.get<ServicePackage[]>('/api/packages');
            setPackages(response.data);
        } catch (error) {
            console.error('Failed to fetch packages:', error);
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

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom fontWeight={600}>
                Paketler
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Size uygun paketi seçin ve satın alın
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
                {packages.map((pkg) => (
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

            {packages.length === 0 && (
                <Box textAlign="center" py={8}>
                    <Typography variant="h6" color="text.secondary">
                        Henüz paket bulunmamaktadır
                    </Typography>
                </Box>
            )}
        </Container>
    );
}
