'use client';

import { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Chip,
    Box,
    CircularProgress,
    LinearProgress,
} from '@mui/material';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { ClientPackage } from '@/types/package';

export default function MyPackagesPage() {
    const [packages, setPackages] = useState<ClientPackage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyPackages();
    }, []);

    const fetchMyPackages = async () => {
        try {
            const response = await api.get<ClientPackage[]>('/api/client-packages/me');
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
                Paketlerim
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Satın aldığınız paketler ve kalan seanslarınız
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
                {packages.map((clientPkg) => {
                    const totalSessions = clientPkg.package?.sessionCount || 0;
                    const usedSessions = totalSessions - clientPkg.remainingSessions;
                    const progress = (usedSessions / totalSessions) * 100;

                    return (
                        <Grid key={clientPkg.id} xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                                        <Typography variant="h6" fontWeight={600}>
                                            {clientPkg.package?.name}
                                        </Typography>
                                        <Chip
                                            label={clientPkg.isActive ? 'Aktif' : 'Pasif'}
                                            color={clientPkg.isActive ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {clientPkg.package?.description}
                                    </Typography>

                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2" gutterBottom>
                                            Kalan Seans: {clientPkg.remainingSessions} / {totalSessions}
                                        </Typography>
                                        <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
                                    </Box>

                                    <Box sx={{ mt: 3 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Satın Alma Tarihi:</strong> {formatDate(clientPkg.purchaseDate)}
                                        </Typography>
                                        {clientPkg.expiryDate && (
                                            <Typography variant="body2" color="text.secondary">
                                                <strong>Geçerlilik Tarihi:</strong> {formatDate(clientPkg.expiryDate)}
                                            </Typography>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {packages.length === 0 && (
                <Box textAlign="center" py={8}>
                    <Typography variant="h6" color="text.secondary">
                        Henüz paket satın almadınız
                    </Typography>
                </Box>
            )}
        </Container>
    );
}
