'use client';

import { Container, Typography, Box } from '@mui/material';

export default function ExpertClientsPage() {
    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom fontWeight={600}>
                Danışanlarım
            </Typography>
            <Box textAlign="center" py={8}>
                <Typography variant="h6" color="text.secondary">
                    Henüz danışanınız bulunmamaktadır
                </Typography>
            </Box>
        </Container>
    );
}
