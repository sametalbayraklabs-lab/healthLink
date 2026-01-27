'use client';

import { Container, Typography, Box } from '@mui/material';

export default function AdminPaymentsPage() {
    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom fontWeight={600}>
                Ödeme Yönetimi
            </Typography>
            <Box textAlign="center" py={8}>
                <Typography variant="h6" color="text.secondary">
                    Ödeme listesi yakında eklenecektir
                </Typography>
            </Box>
        </Container>
    );
}
