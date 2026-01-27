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
} from '@mui/material';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
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
    const [packageData, setPackageData] = useState<PackageDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);

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

    const handlePurchase = async () => {
        setPurchasing(true);
        try {
            // Create a client package purchase
            await api.post('/api/client-packages', {
                servicePackageId: packageData?.id,
            });

            // Show success and redirect
            alert('Paket başarıyla satın alındı!');
            router.push('/client/my-packages');
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
    );
}
