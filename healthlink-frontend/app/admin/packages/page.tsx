'use client';

import { Container, Typography, Box } from '@mui/material';

export default function AdminPackagesPage() {
    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom fontWeight={600}>
                Paket Yönetimi
            </Typography>
            <Box textAlign="center" py={8}>
                <Typography variant="h6" color="text.secondary">
                    Paket CRUD işlemleri yakında eklenecektir
                </Typography>
            </Box>
        </Container>
    );
}
