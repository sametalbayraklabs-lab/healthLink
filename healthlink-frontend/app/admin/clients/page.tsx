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
    TextField,
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
import PersonIcon from '@mui/icons-material/Person';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107';

interface Client {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    gender: string | null;
    birthDate: string | null;
    isActive: boolean;
    createdAt: string;
}

interface ClientDetail extends Client {
    userId: number;
    updatedAt: string | null;
    totalPackages: number;
    totalAppointments: number;
    totalSpent: number;
}

export default function AdminClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterActive, setFilterActive] = useState<string>('');
    const [page, setPage] = useState(1);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<ClientDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        fetchClients();
    }, [search, filterActive, page]);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (filterActive) params.append('isActive', filterActive);
            params.append('page', page.toString());
            params.append('pageSize', '20');

            const response = await fetch(`${API_URL}/api/admin/clients?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch clients');

            const data = await response.json();
            setClients(data);
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClientDetails = async (id: number) => {
        try {
            setDetailLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/clients/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch client details');

            const data = await response.json();
            setSelectedClient(data);
            setDetailDialogOpen(true);
        } catch (error) {
            console.error('Error fetching client details:', error);
        } finally {
            setDetailLoading(false);
        }
    };

    const toggleClientActive = async () => {
        if (!selectedClient) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/clients/${selectedClient.id}/toggle-active`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ isActive: !selectedClient.isActive }),
            });

            if (!response.ok) throw new Error('Failed to toggle client status');

            const updatedClient = await response.json();
            setSelectedClient(updatedClient);
            fetchClients(); // Refresh list
        } catch (error) {
            console.error('Error toggling client status:', error);
        }
    };

    const getGenderLabel = (gender: string | null) => {
        if (!gender) return '-';
        switch (gender) {
            case 'Male': return 'Erkek';
            case 'Female': return 'Kadın';
            case 'Other': return 'Diğer';
            default: return gender;
        }
    };

    const calculateAge = (birthDate: string | null) => {
        if (!birthDate) return '-';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    if (loading && clients.length === 0) {
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
                Danışan Yönetimi
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Tüm danışanları görüntüleyin ve yönetin
            </Typography>

            <Box display="flex" gap={2} mb={3}>
                <TextField
                    label="Ara (İsim, Email)"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    sx={{ minWidth: 300 }}
                />

                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Durum</InputLabel>
                    <Select
                        value={filterActive}
                        label="Durum"
                        onChange={(e) => {
                            setFilterActive(e.target.value);
                            setPage(1);
                        }}
                    >
                        <MenuItem value="">Tümü</MenuItem>
                        <MenuItem value="true">Aktif</MenuItem>
                        <MenuItem value="false">Pasif</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Ad Soyad</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Cinsiyet</TableCell>
                            <TableCell>Yaş</TableCell>
                            <TableCell>Durum</TableCell>
                            <TableCell>Kayıt Tarihi</TableCell>
                            <TableCell align="right">İşlemler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {clients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Typography color="text.secondary">Danışan bulunamadı</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            clients.map((client) => (
                                <TableRow key={client.id}>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <PersonIcon fontSize="small" color="action" />
                                            <Typography fontWeight="medium">
                                                {client.firstName} {client.lastName}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{client.email}</TableCell>
                                    <TableCell>{getGenderLabel(client.gender)}</TableCell>
                                    <TableCell>{calculateAge(client.birthDate)}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={client.isActive ? 'Aktif' : 'Pasif'}
                                            color={client.isActive ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {new Date(client.createdAt).toLocaleDateString('tr-TR')}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={() => fetchClientDetails(client.id)}
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

            <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                    count={10}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                />
            </Box>

            {/* Client Detail Dialog */}
            <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Danışan Detayları</DialogTitle>
                <DialogContent>
                    {detailLoading ? (
                        <Box display="flex" justifyContent="center" py={4}>
                            <CircularProgress />
                        </Box>
                    ) : selectedClient && (
                        <Box mt={2}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Ad Soyad</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {selectedClient.firstName} {selectedClient.lastName}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                                    <Typography variant="body1">{selectedClient.email}</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Cinsiyet</Typography>
                                    <Typography variant="body1">{getGenderLabel(selectedClient.gender)}</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Doğum Tarihi</Typography>
                                    <Typography variant="body1">
                                        {selectedClient.birthDate
                                            ? new Date(selectedClient.birthDate).toLocaleDateString('tr-TR')
                                            : '-'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Kayıt Tarihi</Typography>
                                    <Typography variant="body1">
                                        {new Date(selectedClient.createdAt).toLocaleDateString('tr-TR')}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Durum</Typography>
                                    <Chip
                                        label={selectedClient.isActive ? 'Aktif' : 'Pasif'}
                                        color={selectedClient.isActive ? 'success' : 'default'}
                                        size="small"
                                    />
                                </Grid>
                            </Grid>

                            <Box mt={4}>
                                <Typography variant="h6" gutterBottom>İstatistikler</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={4}>
                                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                                            <Typography variant="h4" color="primary">
                                                {selectedClient.totalPackages}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Toplam Paket
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                                            <Typography variant="h4" color="secondary">
                                                {selectedClient.totalAppointments}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Toplam Randevu
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                                            <Typography variant="h4" color="success.main">
                                                ₺{selectedClient.totalSpent.toLocaleString('tr-TR', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Toplam Harcama
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailDialogOpen(false)}>Kapat</Button>
                    {selectedClient && (
                        <Button
                            onClick={toggleClientActive}
                            variant="contained"
                            color={selectedClient.isActive ? 'error' : 'success'}
                        >
                            {selectedClient.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Container>
    );
}
