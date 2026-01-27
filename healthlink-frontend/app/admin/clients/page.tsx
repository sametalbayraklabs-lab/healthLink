'use client';

import { Container, Typography, Box } from '@mui/material';

export default function AdminClientsPage() {
    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom fontWeight={600}>
                Danışan Yönetimi
            </Typography>
            <Box textAlign="center" py={8}>
                <Typography variant="h6" color="text.secondary">
                    Danışan listesi yakında eklenecektir
                </Typography>
            </Box>
        </Container>
    );
}
