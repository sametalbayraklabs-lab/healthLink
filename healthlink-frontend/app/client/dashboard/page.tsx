'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Box,
    CircularProgress,
    Button,
} from '@mui/material';
import api from '@/lib/api';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MessageIcon from '@mui/icons-material/Message';

interface DashboardData {
    upcomingAppointmentsCount: number;
    completedAppointmentsCount: number;
    activePackagesCount: number;
    unreadMessagesCount: number;
}

export default function ClientDashboard() {
    const router = useRouter();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await api.get('/api/client/dashboard');
            setData(response.data);
            setError(null);
        } catch (error: any) {
            console.error('Failed to fetch dashboard:', error);
            setError(error.response?.data?.message || 'Dashboard yüklenirken bir hata oluştu');
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

    if (error) {
        return (
            <Container maxWidth="lg">
                <Box textAlign="center" py={8}>
                    <Typography variant="h5" color="error" gutterBottom>
                        {error}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        Lütfen daha sonra tekrar deneyin veya destek ekibiyle iletişime geçin.
                    </Typography>
                    <Button variant="contained" onClick={fetchDashboard}>
                        Tekrar Dene
                    </Button>
                </Box>
            </Container>
        );
    }

    const stats = [
        {
            title: 'Yaklaşan Randevular',
            value: data?.upcomingAppointmentsCount || 0,
            icon: <CalendarMonthIcon sx={{ fontSize: 40 }} />,
            color: 'primary.main',
        },
        {
            title: 'Tamamlanan Randevular',
            value: data?.completedAppointmentsCount || 0,
            icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
            color: 'success.main',
        },
        {
            title: 'Aktif Paketler',
            value: data?.activePackagesCount || 0,
            icon: <LocalHospitalIcon sx={{ fontSize: 40 }} />,
            color: 'secondary.main',
        },
        {
            title: 'Okunmamış Mesajlar',
            value: data?.unreadMessagesCount || 0,
            icon: <MessageIcon sx={{ fontSize: 40 }} />,
            color: 'warning.main',
        },
    ];

    const quickActions = [
        {
            title: 'Uzman Ara',
            description: 'Size uygun uzmanları keşfedin',
            onClick: () => router.push('/client/experts'),
        },
        {
            title: 'Paket Satın Al',
            description: 'Avantajlı paketlere göz atın',
            onClick: () => router.push('/client/packages'),
        },
        {
            title: 'Randevu Al',
            description: 'Hemen randevu oluşturun',
            onClick: () => router.push('/client/appointments'),
        },
    ];

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom fontWeight={600}>
                Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Hoş geldiniz! İşte hesabınızın özeti.
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
                {stats.map((stat, index) => (
                    <Grid item key={index} xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography variant="h4" fontWeight={600}>
                                            {stat.value}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {stat.title}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ color: stat.color }}>
                                        {stat.icon}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom fontWeight={600}>
                    Hızlı İşlemler
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    {quickActions.map((action, index) => (
                        <Grid item key={index} xs={12} sm={6} md={4}>
                            <Card
                                sx={{
                                    cursor: 'pointer',
                                    '&:hover': { boxShadow: 4 },
                                    transition: 'box-shadow 0.3s',
                                }}
                                onClick={action.onClick}
                            >
                                <CardContent>
                                    <Typography variant="h6">{action.title}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {action.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Container>
    );
}
