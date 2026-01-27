'use client';

import { Container, Typography, Box } from '@mui/material';

export default function AdminReviewsPage() {
    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom fontWeight={600}>
                Değerlendirme Yönetimi
            </Typography>
            <Box textAlign="center" py={8}>
                <Typography variant="h6" color="text.secondary">
                    Değerlendirme onay/red işlemleri yakında eklenecektir
                </Typography>
            </Box>
        </Container>
    );
}
