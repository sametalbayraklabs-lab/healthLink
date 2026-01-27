'use client';

import { Container, Typography, Box } from '@mui/material';

export default function ExpertReviewsPage() {
    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom fontWeight={600}>
                Değerlendirmeler
            </Typography>
            <Box textAlign="center" py={8}>
                <Typography variant="h6" color="text.secondary">
                    Henüz değerlendirme bulunmamaktadır
                </Typography>
            </Box>
        </Container>
    );
}
