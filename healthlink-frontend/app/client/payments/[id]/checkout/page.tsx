'use client';

import { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    CircularProgress,
    Button,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import LockIcon from '@mui/icons-material/Lock';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [checkoutFormContent, setCheckoutFormContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Retrieve checkout form from sessionStorage
        const formContent = sessionStorage.getItem('iyzicoCheckoutForm');

        if (formContent) {
            setCheckoutFormContent(formContent);
        }
        setLoading(false);
    }, []);

    // Inject and execute the Iyzico checkout form scripts
    useEffect(() => {
        if (!checkoutFormContent) return;

        const container = document.getElementById('iyzico-checkout-form');
        if (!container) return;

        // Set the HTML content
        container.innerHTML = checkoutFormContent;

        // Execute any script tags within the content
        const scripts = container.querySelectorAll('script');
        scripts.forEach((oldScript) => {
            const newScript = document.createElement('script');
            // Copy attributes
            Array.from(oldScript.attributes).forEach((attr) => {
                newScript.setAttribute(attr.name, attr.value);
            });
            // Copy inline script content
            newScript.textContent = oldScript.textContent;
            oldScript.parentNode?.replaceChild(newScript, oldScript);
        });
    }, [checkoutFormContent]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (!checkoutFormContent) {
        return (
            <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom>
                    Ödeme formu bulunamadı
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    Ödeme formu süresi dolmuş veya geçersiz olabilir. Lütfen tekrar deneyin.
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.push('/client/packages')}
                >
                    Paketlere Dön
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <LockIcon color="success" />
                    <Typography variant="h5" fontWeight={600}>
                        Güvenli Ödeme
                    </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" mb={3}>
                    Kart bilgileriniz iyzico güvenli ödeme altyapısı üzerinden işlenmektedir.
                    Bilgileriniz bizimle paylaşılmaz.
                </Typography>

                {/* Iyzico Checkout Form will be rendered here */}
                <Box
                    id="iyzico-checkout-form"
                    sx={{
                        minHeight: 300,
                        '& iframe': {
                            width: '100%',
                            minHeight: 500,
                            border: 'none',
                        },
                    }}
                />
            </Paper>
        </Container>
    );
}
