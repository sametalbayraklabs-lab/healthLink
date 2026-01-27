'use client';

import { Container, Typography, Box } from '@mui/material';

export default function ExpertProfilePage() {
    return (
        <Container maxWidth="md">
            <Typography variant="h4" gutterBottom fontWeight={600}>
                Profilim
            </Typography>
            <Box textAlign="center" py={8}>
                <Typography variant="h6" color="text.secondary">
                    Profil düzenleme özelliği yakında eklenecektir
                </Typography>
            </Box>
        </Container>
    );
}
