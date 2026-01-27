'use client';

import { Container, Typography, Grid, Card, CardContent, Box } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PaymentIcon from '@mui/icons-material/Payment';

export default function AdminDashboard() {
    const stats = [
        {
            title: 'Toplam Danışan',
            value: 0,
            icon: <PeopleIcon sx={{ fontSize: 40 }} />,
            color: 'primary.main',
        },
        {
            title: 'Toplam Uzman',
            value: 0,
            icon: <LocalHospitalIcon sx={{ fontSize: 40 }} />,
            color: 'secondary.main',
        },
        {
            title: 'Toplam Randevu',
            value: 0,
            icon: <CalendarMonthIcon sx={{ fontSize: 40 }} />,
            color: 'success.main',
        },
        {
            title: 'Toplam Ödeme',
            value: '₺0',
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
