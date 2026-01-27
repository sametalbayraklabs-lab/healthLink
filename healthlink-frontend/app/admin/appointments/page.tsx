'use client';

import { Container, Typography, Box } from '@mui/material';

export default function AdminAppointmentsPage() {
    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom fontWeight={600}>
                Randevu Yönetimi
            </Typography>
            <Box textAlign="center" py={8}>
                <Typography variant="h6" color="text.secondary">
                    Tüm randevular listesi yakında eklenecektir
                </Typography>
            </Box>
        </Container>
    );
}
