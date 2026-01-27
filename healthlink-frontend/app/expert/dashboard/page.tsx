'use client';

import { Container, Typography, Grid, Card, CardContent, Box } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MessageIcon from '@mui/icons-material/Message';

export default function ExpertDashboard() {
    const stats = [
        {
            title: 'Bugünkü Randevular',
            value: 0,
            icon: <CalendarMonthIcon sx={{ fontSize: 40 }} />,
            color: 'primary.main',
        },
        {
            title: 'Toplam Danışan',
            value: 0,
            icon: <PeopleIcon sx={{ fontSize: 40 }} />,
            color: 'secondary.main',
        },
        {
            title: 'Tamamlanan Seanslar',
            value: 0,
            icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
            color: 'success.main',
        },
        {
            title: 'Okunmamış Mesajlar',
            value: 0,
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
        </Container>
    );
}
