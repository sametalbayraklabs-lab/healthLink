'use client';

import { use, useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    Button,
    Chip,
    Divider,
    CircularProgress,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    TextField,
    InputAdornment,
    Alert,
} from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface PackageDetails {
    id: number;
    name: string;
    description: string;
    price: number;
    sessionCount: number;
    validityDays: number;
    expertType: string;
    isActive: boolean;
}

export default function PackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo');
    const dateParam = searchParams.get('date');
    const slotParam = searchParams.get('slot');
    const [packageData, setPackageData] = useState<PackageDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [discountCode, setDiscountCode] = useState('');
    const [validatingCode, setValidatingCode] = useState(false);
    const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; discountAmount: number; finalAmount: number } | null>(null);
    const [discountError, setDiscountError] = useState('');

    useEffect(() => {
        fetchPackage();
    }, [resolvedParams.id]);

    const fetchPackage = async () => {
        try {
            const response = await api.get(`/api/packages/${resolvedParams.id}`);
            setPackageData(response.data);
        } catch (error) {
            console.error('Failed to fetch package:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleValidateCode = async () => {
        if (!discountCode.trim()) return;
        setValidatingCode(true);
        setDiscountError('');
        setAppliedDiscount(null);
        try {
            const response = await api.post('/api/discount-codes/validate', {
                code: discountCode.trim(),
                servicePackageId: packageData?.id,
            });
            const data = response.data;
            if (!data.isValid) {
                setDiscountError(data.errorMessage || 'Geçersiz veya süresi dolmuş indirim kodu.');
            } else {
                setAppliedDiscount({
                    code: discountCode.trim(),
                    discountAmount: data.discountAmount,
                    finalAmount: data.finalAmount,
                });
            }
        } catch (err: any) {
            setDiscountError(err.response?.data?.message || err.response?.data?.error || 'Geçersiz veya süresi dolmuş indirim kodu.');
        } finally {
            setValidatingCode(false);
        }
    };

    const handlePurchase = async () => {
        setPurchasing(true);
        try {
            // Create client package + payment, get Iyzico checkout form
            const response = await api.post('/api/client-packages/purchase', {
                servicePackageId: packageData?.id,
                discountCode: appliedDiscount?.code || undefined,
            });

            const { paymentId, checkoutFormContent, paymentToken } = response.data;

            if (checkoutFormContent) {
                // Store checkout form content and redirect to checkout page
                sessionStorage.setItem('iyzicoCheckoutForm', checkoutFormContent);
                sessionStorage.setItem('iyzicoPaymentId', paymentId.toString());
                sessionStorage.setItem('iyzicoPaymentToken', paymentToken || '');

                // Store return info for after payment
                if (returnTo) {
                    const params = new URLSearchParams();
                    if (dateParam) params.set('date', dateParam);
                    if (slotParam) params.set('slot', slotParam);
                    sessionStorage.setItem('iyzicoReturnTo', `${returnTo}${params.toString() ? '?' + params.toString() : ''}`);
                }

                window.location.href = `/client/payments/${paymentId}/checkout`;
            } else {
                alert('Ödeme formu oluşturulamadı. Lütfen tekrar deneyin.');
            }
        } catch (error: any) {
            console.error('Failed to purchase package:', error);
            alert(error.response?.data?.message || 'Paket satın alınırken bir hata oluştu');
        } finally {
            setPurchasing(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (!packageData) {
        return (
            <Container maxWidth="lg">
                <Typography variant="h5" sx={{ mt: 4 }}>
                    Paket bulunamadı
                </Typography>
            </Container>
        );
    }

    const features = [
        `${packageData.sessionCount} seans`,
        `${packageData.validityDays} gün geçerlilik`,
        `${packageData.expertType} uzmanı ile`,
        'Esnek randevu saatleri',
        'Online veya yüz yüze görüşme',
    ];

    return (
        <ProtectedRoute allowedRoles={['Client']}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Grid container spacing={4}>
                    {/* Left Column - Package Details */}
                    <Grid item xs={12} md={8}>
                        <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                                <LocalHospitalIcon color="primary" sx={{ fontSize: 40 }} />
                                <Box>
                                    <Typography variant="h4" fontWeight={600}>
                                        {packageData.name}
                                    </Typography>
                                    <Chip
                                        label={packageData.expertType}
                                        color="primary"
                                        size="small"
                                        sx={{ mt: 1 }}
                                    />
                                </Box>
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                Paket Açıklaması
                            </Typography>
                            <Typography variant="body1" color="text.secondary" paragraph>
                                {packageData.description}
                            </Typography>

                            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 3 }}>
                                Paket Özellikleri
                            </Typography>
                            <List>
                                {features.map((feature, index) => (
                                    <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                            <CheckCircleIcon color="success" />
                                        </ListItemIcon>
                                        <ListItemText primary={feature} />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>

                        {/* Terms and Conditions */}
                        <Card>
                            <CardContent>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    Kullanım Koşulları
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    • Paket satın alındıktan sonra {packageData.validityDays} gün içinde kullanılmalıdır.
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    • Seanslar uzman ile mutabık kalınarak planlanır.
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    • İptal ve iade koşulları için müşteri hizmetleri ile iletişime geçiniz.
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    • Kullanılmayan seanslar geçerlilik süresi sonunda iptal olur.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Right Column - Purchase Card */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ position: 'sticky', top: 20 }}>
                            <CardContent>
                                <Box textAlign="center" mb={3}>
                                    <Typography variant="h3" fontWeight={700} color="primary.main">
                                        ₺{packageData.price.toLocaleString('tr-TR')}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Tek seferlik ödeme
                                    </Typography>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box display="flex" flexDirection="column" gap={2} mb={3}>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">
                                            Seans Sayısı
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600}>
                                            {packageData.sessionCount}
                                        </Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">
                                            Geçerlilik
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600}>
                                            {packageData.validityDays} gün
                                        </Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">
                                            Seans Başı
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600} color="success.main">
                                            ₺{(packageData.price / packageData.sessionCount).toFixed(2)}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Discount Code Section */}
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    İndirim Kodu
                                </Typography>
                                <Box display="flex" gap={1} mb={1}>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        placeholder="Kodu girin"
                                        value={discountCode}
                                        onChange={(e) => { setDiscountCode(e.target.value.toUpperCase()); setDiscountError(''); setAppliedDiscount(null); }}
                                        disabled={!!appliedDiscount}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LocalOfferIcon fontSize="small" color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={appliedDiscount ? () => { setAppliedDiscount(null); setDiscountCode(''); } : handleValidateCode}
                                        disabled={validatingCode || (!appliedDiscount && !discountCode.trim())}
                                        sx={{ borderRadius: 2, whiteSpace: 'nowrap', minWidth: 72 }}
                                    >
                                        {validatingCode ? <CircularProgress size={16} /> : appliedDiscount ? 'Kaldır' : 'Uygula'}
                                    </Button>
                                </Box>
                                {discountError && <Alert severity="error" sx={{ mb: 1, py: 0 }}>{discountError}</Alert>}
                                {appliedDiscount && (
                                    <Alert severity="success" sx={{ mb: 1, py: 0 }}>
                                        ₺{appliedDiscount.discountAmount.toFixed(2)} indirim uygulandı!
                                    </Alert>
                                )}

                                {/* Final Price */}
                                {appliedDiscount && (
                                    <Box sx={{ bgcolor: 'success.50', borderRadius: 2, p: 1.5, mt: 1, border: '1px solid', borderColor: 'success.200' }}>
                                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                                            <Typography variant="body2" color="text.secondary">Normal Fiyat:</Typography>
                                            <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.disabled' }}>₺{packageData.price.toLocaleString('tr-TR')}</Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2" fontWeight={700} color="success.main">İndirimli Fiyat:</Typography>
                                            <Typography variant="body2" fontWeight={700} color="success.main">
                                                ₺{appliedDiscount.finalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                                <Divider sx={{ my: 2 }} />

                                <Button
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    onClick={handlePurchase}
                                    disabled={!packageData.isActive || purchasing}
                                    sx={{ mb: 2 }}
                                >
                                    {purchasing ? 'İşleniyor...' : 'Paketi Satın Al'}
                                </Button>

                                {!packageData.isActive && (
                                    <Typography variant="caption" color="error" display="block" textAlign="center">
                                        Bu paket şu anda satışta değil
                                    </Typography>
                                )}

                                <Box display="flex" alignItems="center" justifyContent="center" gap={1} mt={2}>
                                    <AccessTimeIcon fontSize="small" color="action" />
                                    <Typography variant="caption" color="text.secondary">
                                        Güvenli ödeme
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Info Card */}
                        <Card sx={{ mt: 2 }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    Bilgi
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    Paket satın aldıktan sonra uzmanlarımızla randevu oluşturabilirsiniz.
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Sorularınız için müşteri hizmetlerimiz ile iletişime geçebilirsiniz.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </ProtectedRoute>
    );
}
