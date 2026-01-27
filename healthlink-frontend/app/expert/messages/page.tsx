'use client';

import { Container, Typography, Box } from '@mui/material';

export default function ExpertMessagesPage() {
    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom fontWeight={600}>
                Mesajlar
            </Typography>
            <Box textAlign="center" py={8}>
                <Typography variant="h6" color="text.secondary">
                    Mesajlaşma özelliği yakında eklenecektir
                </Typography>
            </Box>
        </Container>
    );
}
