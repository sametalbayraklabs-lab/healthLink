'use client';

import { Container, Typography, Box } from '@mui/material';

export default function ReviewsPage() {
    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom fontWeight={600}>
                Değerlendirmelerim
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Uzmanlar hakkında yazdığınız değerlendirmeler
            </Typography>

            <Box textAlign="center" py={8}>
                <Typography variant="h6" color="text.secondary">
                    Henüz değerlendirme yapmadınız
                </Typography>
            </Box>
        </Container>
    );
}
