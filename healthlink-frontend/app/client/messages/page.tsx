'use client';

import { Container, Typography, Box } from '@mui/material';

export default function MessagesPage() {
    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom fontWeight={600}>
                Mesajlar
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Uzmanlarınızla mesajlaşın
            </Typography>

            <Box textAlign="center" py={8}>
                <Typography variant="h6" color="text.secondary">
                    Mesajlaşma özelliği yakında eklenecektir
                </Typography>
            </Box>
        </Container>
    );
}
