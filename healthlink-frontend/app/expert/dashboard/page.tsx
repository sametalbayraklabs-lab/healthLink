'use client';

import { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, Box, CircularProgress } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MessageIcon from '@mui/icons-material/Message';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107';

interface DashboardStats {
    todayAppointmentsCount: number;
    totalClientsCount: number;
    completedSessionsCount: number;
    unreadMessagesCount: number;
}

export default function ExpertDashboard() {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await fetch(`${API_URL}/api/expert/dashboard`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setDashboardData(data);
                }
            } catch (error) {
                console.error('Error fetching dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    const stats = [
        {
            title: 'Bugünkü Randevular',
            value: dashboardData?.todayAppointmentsCount ?? 0,
            icon: <CalendarMonthIcon sx={{ fontSize: 40 }} />,
            color: 'primary.main',
        },
        {
            title: 'Toplam Danışan',
            value: dashboardData?.totalClientsCount ?? 0,
            icon: <PeopleIcon sx={{ fontSize: 40 }} />,
            color: 'secondary.main',
        },
        {
            title: 'Tamamlanan Seanslar',
            value: dashboardData?.completedSessionsCount ?? 0,
            icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
            color: 'success.main',
        },
        {
            title: 'Okunmamış Mesajlar',
            value: dashboardData?.unreadMessagesCount ?? 0,
            icon: <MessageIcon sx={{ fontSize: 40 }} />,
            color: 'warning.main',
        },
    ];

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom fontWeight={600}>
                Uzman Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Hoş geldiniz! İşte hesabınızın özeti.
            </Typography>

            {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={3} sx={{ mt: 2 }}>
                    {stats.map((stat, index) => (
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
            )}
        </Container>
    );
}
