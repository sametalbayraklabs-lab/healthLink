'use client';

import { Container, Typography, Box } from '@mui/material';

export default function ExpertAppointmentsPage() {
    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom fontWeight={600}>
                Randevularım
            </Typography>
            <Box textAlign="center" py={8}>
                <Typography variant="h6" color="text.secondary">
                    Henüz randevunuz bulunmamaktadır
                </Typography>
            </Box>
        </Container>
    );
}
