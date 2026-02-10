'use client';

import { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, Box, CircularProgress } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PaymentIcon from '@mui/icons-material/Payment';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107';

interface DashboardStats {
    totalClients: number;
    totalExperts: number;
    totalAppointments: number;
    totalPayments: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/api/admin/dashboard/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch stats');

            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg">
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    const statsCards = [
        {
            title: 'Toplam Danışan',
            value: stats?.totalClients || 0,
            icon: <PeopleIcon sx={{ fontSize: 40 }} />,
            color: 'primary.main',
        },
        {
            title: 'Toplam Uzman',
            value: stats?.totalExperts || 0,
            icon: <LocalHospitalIcon sx={{ fontSize: 40 }} />,
            color: 'secondary.main',
        },
        {
            title: 'Toplam Randevu',
            value: stats?.totalAppointments || 0,
            icon: <CalendarMonthIcon sx={{ fontSize: 40 }} />,
            color: 'success.main',
        },
        {
            title: 'Toplam Ödeme',
            value: `₺${stats?.totalPayments.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}`,
            icon: <PaymentIcon sx={{ fontSize: 40 }} />,
            color: 'warning.main',
        },
    ];

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom fontWeight={600}>
                Admin Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Sistem genelinde istatistikler ve yönetim
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
                {statsCards.map((stat, index) => (
                    <Grid key={index} xs={12} sm={6} md={3}>
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
        </Container>
    );
}
