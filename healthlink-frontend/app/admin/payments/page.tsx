'use client';

import { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    CircularProgress,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    Pagination,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PaymentIcon from '@mui/icons-material/Payment';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107';

interface LookupItem {
    value: string;
    label: string;
}

interface Payment {
    id: number;
    clientId: number;
    clientName: string;
    clientEmail: string;
    clientPackageId: number;
    packageName: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    status: string;
    gateway: string;
    confirmedAt: string | null;
    createdAt: string;
}

interface PaymentDetail extends Payment {
    gatewayPaymentId: string | null;
    providerRawResponse: string | null;
    updatedAt: string | null;
}

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [filterGateway, setFilterGateway] = useState<string>('');
    const [page, setPage] = useState(1);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<PaymentDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [lookups, setLookups] = useState<{ paymentGateways: LookupItem[]; paymentStatuses: LookupItem[] }>({ paymentGateways: [], paymentStatuses: [] });

    useEffect(() => {
        fetchLookups();
    }, []);

    useEffect(() => {
        fetchPayments();
    }, [filterStatus, filterGateway, page]);

    const fetchLookups = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${API_URL}/api/admin/lookups`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setLookups({
                    paymentGateways: data.paymentGateways || [],
                    paymentStatuses: data.paymentStatuses || []
                });
            }
        } catch (err) {
            console.error('Lookups yüklenemedi:', err);
        }
    };

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            const params = new URLSearchParams();
            if (filterStatus) params.append('status', filterStatus);
            if (filterGateway) params.append('gateway', filterGateway);
            params.append('page', page.toString());
            params.append('pageSize', '20');

            const response = await fetch(`${API_URL}/api/admin/payments?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch payments');

            const data = await response.json();
            setPayments(data);
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPaymentDetails = async (id: number) => {
        try {
            setDetailLoading(true);
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/api/admin/payments/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch payment details');

            const data = await response.json();
            setSelectedPayment(data);
            setDetailDialogOpen(true);
        } catch (error) {
            console.error('Error fetching payment details:', error);
        } finally {
            setDetailLoading(false);
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'Pending': return 'Bekliyor';
            case 'Success': return 'Başarılı';
            case 'Failed': return 'Başarısız';
            case 'Refunded': return 'İade Edildi';
            default: return status;
        }
    };

    const getStatusColor = (status: string): "default" | "success" | "error" | "warning" => {
        switch (status) {
            case 'Success': return 'success';
            case 'Failed': return 'error';
            case 'Pending': return 'warning';
            case 'Refunded': return 'default';
            default: return 'default';
        }
    };

    const getGatewayLabel = (gateway: string) => {
        switch (gateway) {
            case 'Iyzico': return 'Iyzico';
            case 'Stripe': return 'Stripe';
            case 'PayTR': return 'PayTR';
            case 'PayPal': return 'PayPal';
            case 'Unknown': return 'Bilinmiyor';
            default: return gateway;
        }
    };

    if (loading && payments.length === 0) {
        return (
            <Container maxWidth="xl">
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl">
            <Typography variant="h4" gutterBottom fontWeight={600}>
                Ödeme Yönetimi
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Tüm ödemeleri görüntüleyin ve yönetin
            </Typography>

            <Box display="flex" gap={2} mb={3}>
                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Durum</InputLabel>
                    <Select
                        value={filterStatus}
                        label="Durum"
                        onChange={(e) => {
                            setFilterStatus(e.target.value);
                            setPage(1);
                        }}
                    >
                        <MenuItem value="">Tümü</MenuItem>
                        {lookups.paymentStatuses.map((item) => (
                            <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Ödeme Yöntemi</InputLabel>
                    <Select
                        value={filterGateway}
                        label="Ödeme Yöntemi"
                        onChange={(e) => {
                            setFilterGateway(e.target.value);
                            setPage(1);
                        }}
                    >
                        <MenuItem value="">Tümü</MenuItem>
                        {lookups.paymentGateways.map((item) => (
                            <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Danışan</TableCell>
                            <TableCell>Paket</TableCell>
                            <TableCell align="right">Tutar</TableCell>
                            <TableCell>Ödeme Yöntemi</TableCell>
                            <TableCell>Ödeme Altyapısı</TableCell>
                            <TableCell>Durum</TableCell>
                            <TableCell>Tarih</TableCell>
                            <TableCell align="right">İşlemler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {payments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    <Typography color="text.secondary">Ödeme bulunamadı</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            payments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell>
                                        <Box>
                                            <Typography fontWeight="medium">{payment.clientName}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {payment.clientEmail}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{payment.packageName}</TableCell>
                                    <TableCell align="right">
                                        <Typography fontWeight="medium">
                                            {payment.amount.toLocaleString('tr-TR', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })} {payment.currency}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{payment.paymentMethod}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getGatewayLabel(payment.gateway)}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getStatusLabel(payment.status)}
                                            color={getStatusColor(payment.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {new Date(payment.createdAt).toLocaleDateString('tr-TR', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={() => fetchPaymentDetails(payment.id)}
                                        >
                                            <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {payments.length >= 20 && (
                <Box display="flex" justifyContent="center" mt={3}>
                    <Pagination
                        count={payments.length < 20 ? page : page + 1}
                        page={page}
                        onChange={(e, value) => setPage(value)}
                        color="primary"
                    />
                </Box>
            )}

            {/* Payment Detail Dialog */}
            <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <PaymentIcon />
                        Ödeme Detayları
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {detailLoading ? (
                        <Box display="flex" justifyContent="center" py={4}>
                            <CircularProgress />
                        </Box>
                    ) : selectedPayment && (
                        <Box mt={2}>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Danışan</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {selectedPayment.clientName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {selectedPayment.clientEmail}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Paket</Typography>
                                    <Typography variant="body1">{selectedPayment.packageName}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Tutar</Typography>
                                    <Typography variant="h6" color="primary">
                                        {selectedPayment.amount.toLocaleString('tr-TR', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })} {selectedPayment.currency}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Durum</Typography>
                                    <Chip
                                        label={getStatusLabel(selectedPayment.status)}
                                        color={getStatusColor(selectedPayment.status)}
                                        size="small"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Ödeme Yöntemi</Typography>
                                    <Typography variant="body1">{selectedPayment.paymentMethod}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Ödeme Altyapısı</Typography>
                                    <Typography variant="body1">{getGatewayLabel(selectedPayment.gateway)}</Typography>
                                </Grid>
                                {selectedPayment.gatewayPaymentId && (
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Ödeme İşlem ID</Typography>
                                        <Typography variant="body2" fontFamily="monospace">
                                            {selectedPayment.gatewayPaymentId}
                                        </Typography>
                                    </Grid>
                                )}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Oluşturulma Tarihi</Typography>
                                    <Typography variant="body1">
                                        {new Date(selectedPayment.createdAt).toLocaleString('tr-TR')}
                                    </Typography>
                                </Grid>
                                {selectedPayment.confirmedAt && (
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Onaylanma Tarihi</Typography>
                                        <Typography variant="body1">
                                            {new Date(selectedPayment.confirmedAt).toLocaleString('tr-TR')}
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailDialogOpen(false)}>Kapat</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
