'use client';

import { useSearchParams } from 'next/navigation';
import { Container, Typography, Box, Paper } from '@mui/material';

export default function NewAppointmentPage() {
    const searchParams = useSearchParams();
    const expertId = searchParams.get('expertId');

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={2} sx={{ p: 4 }}>
                <Typography variant="h4" fontWeight={600} gutterBottom>
                    Randevu Al
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    Randevu alma özelliği yakında eklenecek.
                </Typography>
                {expertId && (
                    <Box mt={2}>
                        <Typography variant="body2" color="text.secondary">
                            Uzman ID: {expertId}
                        </Typography>
                    </Box>
                )}
            </Paper>
        </Container>
    );
}
