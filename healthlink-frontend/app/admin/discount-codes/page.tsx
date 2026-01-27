'use client';

import { Container, Typography, Box } from '@mui/material';

export default function AdminDiscountCodesPage() {
    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom fontWeight={600}>
                İndirim Kodu Yönetimi
            </Typography>
            <Box textAlign="center" py={8}>
                <Typography variant="h6" color="text.secondary">
                    İndirim kodu CRUD işlemleri yakında eklenecektir
                </Typography>
            </Box>
        </Container>
    );
}
