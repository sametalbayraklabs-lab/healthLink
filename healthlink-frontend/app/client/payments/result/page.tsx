'use client';

import { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Button,
    CircularProgress,
} from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

export default function PaymentResultPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const status = searchParams.get('status');
    const paymentId = searchParams.get('paymentId');
    const message = searchParams.get('message');
    const [returnTo, setReturnTo] = useState<string | null>(null);

    useEffect(() => {
        // Get return URL from sessionStorage
        const storedReturnTo = sessionStorage.getItem('iyzicoReturnTo');
        if (storedReturnTo) {
            setReturnTo(storedReturnTo);
        }

        // Clean up sessionStorage
        sessionStorage.removeItem('iyzicoCheckoutForm');
        sessionStorage.removeItem('iyzicoPaymentId');
        sessionStorage.removeItem('iyzicoPaymentToken');
        sessionStorage.removeItem('iyzicoReturnTo');
    }, []);

    const isSuccess = status === 'success';

    return (
        <Container maxWidth="sm" sx={{ py: 6 }}>
            <Paper
                elevation={3}
                sx={{
                    p: 5,
                    textAlign: 'center',
                    borderTop: `4px solid`,
                    borderColor: isSuccess ? 'success.main' : 'error.main',
                }}
            >
                {/* Icon */}
                <Box mb={3}>
                    {isSuccess ? (
                        <CheckCircleIcon
                            sx={{ fontSize: 80 }}
                            color="success"
                        />
                    ) : (
                        <ErrorIcon
                            sx={{ fontSize: 80 }}
                            color="error"
                        />
                    )}
                </Box>

                {/* Title */}
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    {isSuccess ? 'Ödeme Başarılı!' : 'Ödeme Başarısız'}
                </Typography>

                {/* Message */}
                <Typography variant="body1" color="text.secondary" paragraph>
                    {isSuccess
                        ? 'Paketiniz başarıyla aktifleştirildi. Artık randevu oluşturabilirsiniz.'
                        : message
                            ? decodeURIComponent(message)
                            : 'Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.'}
                </Typography>

                {paymentId && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Ödeme No: #{paymentId}
                    </Typography>
                )}

                {/* Action Buttons */}
                <Box display="flex" flexDirection="column" gap={2} mt={3}>
                    {isSuccess ? (
                        <>
                            {returnTo ? (
                                <Button
                                    variant="contained"
                                    size="large"
                                    endIcon={<ArrowForwardIcon />}
                                    onClick={() => router.push(returnTo)}
                                >
                                    Randevu Oluşturmaya Devam Et
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    size="large"
                                    endIcon={<ArrowForwardIcon />}
                                    onClick={() => router.push('/client/appointments/new')}
                                >
                                    Randevu Oluştur
                                </Button>
                            )}
                            <Button
                                variant="outlined"
                                onClick={() => router.push('/client/my-packages')}
                                startIcon={<ShoppingCartIcon />}
                            >
                                Paketlerime Git
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => router.push('/client/packages')}
                            >
                                Tekrar Dene
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => router.push('/client/dashboard')}
                            >
                                Ana Sayfaya Dön
                            </Button>
                        </>
                    )}
                </Box>
            </Paper>
        </Container>
    );
}
