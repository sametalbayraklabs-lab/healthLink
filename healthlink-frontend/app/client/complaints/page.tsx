'use client';

import { Container, Typography, Box } from '@mui/material';

export default function ComplaintsPage() {
    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom fontWeight={600}>
                Şikayetlerim
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Gönderdiğiniz şikayetler ve durumları
            </Typography>

            <Box textAlign="center" py={8}>
                <Typography variant="h6" color="text.secondary">
                    Henüz şikayet göndermediniz
                </Typography>
            </Box>
        </Container>
    );
}
