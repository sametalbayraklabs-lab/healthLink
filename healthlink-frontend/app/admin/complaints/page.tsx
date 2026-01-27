'use client';

import { Container, Typography, Box } from '@mui/material';

export default function AdminComplaintsPage() {
    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom fontWeight={600}>
                Şikayet Yönetimi
            </Typography>
            <Box textAlign="center" py={8}>
                <Typography variant="h6" color="text.secondary">
                    Şikayet listesi ve güncelleme işlemleri yakında eklenecektir
                </Typography>
            </Box>
        </Container>
    );
}
