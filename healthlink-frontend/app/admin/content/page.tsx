'use client';

import { Container, Typography, Box } from '@mui/material';

export default function AdminContentPage() {
    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom fontWeight={600}>
                İçerik Yönetimi
            </Typography>
            <Box textAlign="center" py={8}>
                <Typography variant="h6" color="text.secondary">
                    İçerik oluşturma ve yayınlama işlemleri yakında eklenecektir
                </Typography>
            </Box>
        </Container>
    );
}
