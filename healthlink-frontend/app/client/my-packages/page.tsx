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
import { formatDate } from '@/lib/utils';

interface ServicePackageInfo {
    id: number;
    name: string;
    description: string;
    expertType: string;
}

interface ClientPackage {
    id: number;
    clientId: number;
    servicePackage: ServicePackageInfo;
    totalSessions: number;
    usedSessions: number;
    remainingSessions: number;
    status: string; // 'PendingPayment' | 'Active' | 'Completed' | 'Expired'
    purchaseDate: string;
    expireDate?: string;
}

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'Active': return 'Aktif';
        case 'Completed': return 'Tamamlandı';
        case 'Expired': return 'Süresi Doldu';
        case 'PendingPayment': return 'Ödeme Bekliyor';
        default: return status;
    }
};

const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
        case 'Active': return 'success';
        case 'PendingPayment': return 'warning';
        case 'Expired': return 'error';
        default: return 'default';
    }
};

export default function MyPackagesPage() {
    const [packages, setPackages] = useState<ClientPackage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyPackages();
    }, []);

    const fetchMyPackages = async () => {
        try {
            const response = await api.get<ClientPackage[]>('/api/client-packages/me');
            const statusPriority: Record<string, number> = { Active: 0, PendingPayment: 1, Completed: 2, Expired: 3 };
            const sorted = [...response.data].sort((a, b) => {
                const pa = statusPriority[a.status] ?? 9;
                const pb = statusPriority[b.status] ?? 9;
                if (pa !== pb) return pa - pb;
                const ra = (a.totalSessions ?? 0) - (a.usedSessions ?? 0);
                const rb = (b.totalSessions ?? 0) - (b.usedSessions ?? 0);
                return rb - ra;
            });
            setPackages(sorted);
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
                    const total = clientPkg.totalSessions || 0;
                    const used = clientPkg.usedSessions || 0;
                    const progress = total > 0 ? (used / total) * 100 : 0;

                    return (
                        <Grid key={clientPkg.id} size={{ xs: 12, md: 6 }}>
                            <Card>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                                        <Typography variant="h6" fontWeight={600}>
                                            {clientPkg.servicePackage?.name}
                                        </Typography>
                                        <Chip
                                            label={getStatusLabel(clientPkg.status)}
                                            color={getStatusColor(clientPkg.status)}
                                            size="small"
                                        />
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {clientPkg.servicePackage?.description}
                                    </Typography>

                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2" gutterBottom>
                                            Kalan Seans: {clientPkg.remainingSessions} / {total}
                                        </Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={progress}
                                            sx={{ height: 8, borderRadius: 4 }}
                                        />
                                    </Box>

                                    <Box sx={{ mt: 3 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Satın Alma Tarihi:</strong> {formatDate(clientPkg.purchaseDate)}
                                        </Typography>
                                        {clientPkg.expireDate && (
                                            <Typography variant="body2" color="text.secondary">
                                                <strong>Geçerlilik Tarihi:</strong> {formatDate(clientPkg.expireDate)}
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
