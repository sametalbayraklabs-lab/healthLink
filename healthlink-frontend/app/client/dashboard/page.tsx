'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Container,
    Typography,
    Card,
    CardContent,
    Box,
    CircularProgress,
    Button,
    Stack,
} from '@mui/material';
import api from '@/lib/api';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MessageIcon from '@mui/icons-material/Message';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

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
            icon: <CalendarMonthIcon sx={{ fontSize: 28 }} />,
            gradient: 'linear-gradient(135deg, #1E8F8A, #2BA8A2)',
            bgLight: 'rgba(30, 143, 138, 0.08)',
        },
        {
            title: 'Tamamlanan Randevular',
            value: data?.completedAppointmentsCount || 0,
            icon: <CheckCircleIcon sx={{ fontSize: 28 }} />,
            gradient: 'linear-gradient(135deg, #16A34A, #4ADE80)',
            bgLight: 'rgba(22, 163, 74, 0.08)',
        },
        {
            title: 'Aktif Paketler',
            value: data?.activePackagesCount || 0,
            icon: <LocalHospitalIcon sx={{ fontSize: 28 }} />,
            gradient: 'linear-gradient(135deg, #6366F1, #818CF8)',
            bgLight: 'rgba(99, 102, 241, 0.08)',
        },
        {
            title: 'Okunmamış Mesajlar',
            value: data?.unreadMessagesCount || 0,
            icon: <MessageIcon sx={{ fontSize: 28 }} />,
            gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
            bgLight: 'rgba(245, 158, 11, 0.08)',
        },
    ];

    const quickActions = [
        {
            title: 'Uzman Ara',
            description: 'Size uygun uzmanları keşfedin',
            onClick: () => router.push('/client/appointments/new'),
        },
        {
            title: 'Paket Satın Al',
            description: 'Avantajlı paketlere göz atın',
            onClick: () => router.push('/client/packages'),
        },
        {
            title: 'Randevu Al',
            description: 'Hemen randevu oluşturun',
            onClick: () => router.push('/client/appointments/new'),
        },
    ];

    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
                    Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Hoş geldiniz! İşte hesabınızın özeti.
                </Typography>
            </Box>

            {/* Stats Grid */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                gap: 3,
                mb: 5,
            }}>
                {stats.map((stat, index) => (
                    <Card key={index} sx={{
                        border: '1px solid',
                        borderColor: 'rgba(226, 232, 240, 0.7)',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 32px rgba(15, 23, 42, 0.08)',
                        },
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography
                                        variant="h3"
                                        fontWeight={700}
                                        sx={{ letterSpacing: '-0.02em', lineHeight: 1.1, mb: 0.5 }}
                                    >
                                        {stat.value}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" fontWeight={450}>
                                        {stat.title}
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: '14px',
                                    background: stat.gradient,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    flexShrink: 0,
                                }}>
                                    {stat.icon}
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {/* Quick Actions */}
            <Box>
                <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
                    Hızlı İşlemler
                </Typography>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                    gap: 2.5,
                }}>
                    {quickActions.map((action, index) => (
                        <Card
                            key={index}
                            sx={{
                                cursor: 'pointer',
                                border: '1px solid',
                                borderColor: 'rgba(226, 232, 240, 0.7)',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    borderColor: 'primary.light',
                                    boxShadow: '0 8px 32px rgba(30, 143, 138, 0.08)',
                                    '& .action-arrow': {
                                        transform: 'translateX(4px)',
                                        color: 'primary.main',
                                    },
                                },
                            }}
                            onClick={action.onClick}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                                            {action.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {action.description}
                                        </Typography>
                                    </Box>
                                    <ArrowForwardIcon
                                        className="action-arrow"
                                        sx={{
                                            color: 'text.disabled',
                                            transition: 'all 0.2s ease',
                                            flexShrink: 0,
                                            ml: 2,
                                        }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            </Box>
        </Container>
    );
}
