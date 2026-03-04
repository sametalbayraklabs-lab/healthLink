'use client';

import { useEffect, useRef, useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    CircularProgress,
    Button,
    Alert,
    Divider,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import LockIcon from '@mui/icons-material/Lock';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function CheckoutPage() {
    const router = useRouter();
    const [checkoutFormContent, setCheckoutFormContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [popupClosed, setPopupClosed] = useState(false);
    const observerRef = useRef<MutationObserver | null>(null);

    useEffect(() => {
        const formContent = sessionStorage.getItem('iyzicoCheckoutForm');
        if (formContent) setCheckoutFormContent(formContent);
        setLoading(false);
    }, []);

    const injectForm = (content: string) => {
        const container = document.getElementById('iyzico-checkout-form');
        if (!container) return;

        container.innerHTML = content;

        // Re-execute iyzico scripts
        const scripts = container.querySelectorAll('script');
        scripts.forEach((oldScript) => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach((attr) => {
                newScript.setAttribute(attr.name, attr.value);
            });
            newScript.textContent = oldScript.textContent;
            oldScript.parentNode?.replaceChild(newScript, oldScript);
        });

        // Watch body for iyzico overlay removal (popup close detection)
        // Iyzico injects a modal/overlay div directly into <body>.
        // When user closes it, that div is removed → we detect it here.
        let iyzicoOverlayAdded = false;

        observerRef.current?.disconnect();
        observerRef.current = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                // Track when iyzico adds something to body (overlay open)
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node instanceof HTMLElement) {
                            const id = node.id || '';
                            const cls = node.className || '';
                            if (
                                id.toLowerCase().includes('iyzico') ||
                                cls.toLowerCase().includes('iyzico') ||
                                id === 'iyzipay-checkout-form-modal'
                            ) {
                                iyzicoOverlayAdded = true;
                            }
                        }
                    });
                }
                // Track when iyzico overlay is removed (popup closed)
                if (iyzicoOverlayAdded && mutation.removedNodes.length > 0) {
                    mutation.removedNodes.forEach((node) => {
                        if (node instanceof HTMLElement) {
                            const id = node.id || '';
                            const cls = node.className || '';
                            if (
                                id.toLowerCase().includes('iyzico') ||
                                cls.toLowerCase().includes('iyzico') ||
                                id === 'iyzipay-checkout-form-modal'
                            ) {
                                observerRef.current?.disconnect();
                                setPopupClosed(true);
                            }
                        }
                    });
                }
            }
        });

        observerRef.current.observe(document.body, { childList: true, subtree: false });
    };

    useEffect(() => {
        if (!checkoutFormContent || popupClosed) return;
        injectForm(checkoutFormContent);
        return () => observerRef.current?.disconnect();
    }, [checkoutFormContent]);

    const handleRetry = () => {
        if (!checkoutFormContent) return;
        setPopupClosed(false);
        setTimeout(() => injectForm(checkoutFormContent), 100);
    };

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
                    Ödeme formu süresi dolmuş olabilir. Lütfen tekrar deneyin.
                </Typography>
                <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={() => router.push('/client/packages')}>
                    Paketlere Dön
                </Button>
            </Container>
        );
    }

    if (popupClosed) {
        return (
            <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
                <Alert severity="warning" sx={{ mb: 4, textAlign: 'left' }}>
                    Ödeme penceresi kapatıldı. Ödeme tamamlanmadı.
                </Alert>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                    Ne yapmak istersiniz?
                </Typography>
                <Box display="flex" gap={2} justifyContent="center" mt={3} flexWrap="wrap">
                    <Button variant="contained" size="large" startIcon={<RefreshIcon />} onClick={handleRetry}>
                        Tekrar Dene
                    </Button>
                    <Button variant="outlined" size="large" startIcon={<ArrowBackIcon />} onClick={() => router.push('/client/packages')}>
                        Paketlere Dön
                    </Button>
                </Box>
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

                <Box
                    id="iyzico-checkout-form"
                    sx={{
                        minHeight: 300,
                        '& iframe': { width: '100%', minHeight: 500, border: 'none' },
                    }}
                />

                {/* Always-visible escape hatch */}
                <Divider sx={{ mt: 4, mb: 2 }} />
                <Box textAlign="center">
                    <Button
                        variant="text"
                        color="inherit"
                        size="small"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => router.push('/client/packages')}
                        sx={{ color: 'text.secondary' }}
                    >
                        Ödemeyi iptal et, paketlere dön
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}
