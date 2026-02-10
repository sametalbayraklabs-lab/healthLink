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
    Pagination,
    Tooltip,
    Stack,
    Alert,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import BlockIcon from '@mui/icons-material/Block';
import api from '@/lib/api';

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

const genderOptions = [
    { value: 0, label: 'Bilinmiyor' },
    { value: 1, label: 'Erkek' },
    { value: 2, label: 'Kadın' },
    { value: 3, label: 'Diğer' },
];

export default function AdminClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterActive, setFilterActive] = useState<string>('');
    const [page, setPage] = useState(1);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    // Detail dialog
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<ClientDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    // Edit dialog
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        gender: 0,
        birthDate: '',
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchClients();
    }, [search, filterActive, page]);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (filterActive) params.append('isActive', filterActive);
            params.append('page', page.toString());
            params.append('pageSize', '20');

            const response = await api.get(`/api/admin/clients?${params}`);
            setClients(response.data);
        } catch (err) {
            console.error('Error fetching clients:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchClientDetails = async (id: number) => {
        try {
            setDetailLoading(true);
            const response = await api.get(`/api/admin/clients/${id}`);
            setSelectedClient(response.data);
            setDetailDialogOpen(true);
        } catch (err) {
            console.error('Error fetching client details:', err);
        } finally {
            setDetailLoading(false);
        }
    };

    const toggleClientActive = async (client: Client) => {
        try {
            await api.put(`/api/admin/clients/${client.id}/toggle-active`, {
                isActive: !client.isActive,
            });
            setSuccess(`${client.firstName} ${client.lastName} ${client.isActive ? 'pasife alındı' : 'aktif yapıldı'}!`);
            fetchClients();
            if (selectedClient && selectedClient.id === client.id) {
                setSelectedClient({ ...selectedClient, isActive: !client.isActive });
            }
        } catch (err) {
            console.error('Error toggling client status:', err);
            setError('İşlem sırasında hata oluştu');
        }
    };

    const openEditDialog = (client: Client) => {
        setEditForm({
            firstName: client.firstName,
            lastName: client.lastName,
            gender: getGenderValue(client.gender),
            birthDate: client.birthDate ? client.birthDate.split('T')[0] : '',
        });
        setSelectedClient(client as ClientDetail);
        setEditDialogOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedClient) return;
        try {
            setSaving(true);
            await api.put(`/api/admin/clients/${selectedClient.id}`, {
                firstName: editForm.firstName,
                lastName: editForm.lastName,
                gender: editForm.gender,
                birthDate: editForm.birthDate ? new Date(editForm.birthDate).toISOString() : null,
            });
            setSuccess('Danışan bilgileri güncellendi!');
            setEditDialogOpen(false);
            fetchClients();
        } catch (err) {
            console.error('Error updating client:', err);
            setError('Güncelleme sırasında hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    const getGenderLabel = (gender: string | null) => {
        if (!gender) return '-';
        switch (gender) {
            case 'Male': return 'Erkek';
            case 'Female': return 'Kadın';
            case 'Other': return 'Diğer';
            case 'Unknown': return 'Bilinmiyor';
            default: return gender;
        }
    };

    const getGenderValue = (gender: string | null): number => {
        if (!gender) return 0;
        switch (gender) {
            case 'Male': return 1;
            case 'Female': return 2;
            case 'Other': return 3;
            default: return 0;
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
                Tüm danışanları görüntüleyin, düzenleyin ve yönetin
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

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
                            <TableCell align="center">İşlemler</TableCell>
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
                                <TableRow key={client.id} sx={{ opacity: client.isActive ? 1 : 0.5 }}>
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
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <Tooltip title="Detaylar">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => fetchClientDetails(client.id)}
                                                >
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Düzenle">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => openEditDialog(client)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={client.isActive ? 'Pasife Al' : 'Aktif Yap'}>
                                                <IconButton
                                                    size="small"
                                                    color={client.isActive ? 'error' : 'success'}
                                                    onClick={() => toggleClientActive(client)}
                                                >
                                                    <BlockIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {clients.length >= 20 && (
                <Box display="flex" justifyContent="center" mt={3}>
                    <Pagination
                        count={clients.length < 20 ? page : page + 1}
                        page={page}
                        onChange={(e, value) => setPage(value)}
                        color="primary"
                    />
                </Box>
            )}

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
                            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={3}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Ad Soyad</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {selectedClient.firstName} {selectedClient.lastName}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                                    <Typography variant="body1">{selectedClient.email}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Cinsiyet</Typography>
                                    <Typography variant="body1">{getGenderLabel(selectedClient.gender)}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Doğum Tarihi</Typography>
                                    <Typography variant="body1">
                                        {selectedClient.birthDate
                                            ? new Date(selectedClient.birthDate).toLocaleDateString('tr-TR')
                                            : '-'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Kayıt Tarihi</Typography>
                                    <Typography variant="body1">
                                        {new Date(selectedClient.createdAt).toLocaleDateString('tr-TR')}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Durum</Typography>
                                    <Chip
                                        label={selectedClient.isActive ? 'Aktif' : 'Pasif'}
                                        color={selectedClient.isActive ? 'success' : 'default'}
                                        size="small"
                                    />
                                </Box>
                            </Box>

                            <Box mt={4}>
                                <Typography variant="h6" gutterBottom>İstatistikler</Typography>
                                <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={2}>
                                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                                        <Typography variant="h4" color="primary">
                                            {selectedClient.totalPackages}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Toplam Paket
                                        </Typography>
                                    </Paper>
                                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                                        <Typography variant="h4" color="secondary">
                                            {selectedClient.totalAppointments}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Toplam Randevu
                                        </Typography>
                                    </Paper>
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
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailDialogOpen(false)}>Kapat</Button>
                    {selectedClient && (
                        <Button
                            onClick={() => toggleClientActive(selectedClient)}
                            variant="contained"
                            color={selectedClient.isActive ? 'error' : 'success'}
                        >
                            {selectedClient.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Danışan Düzenle</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <TextField
                            label="Ad"
                            fullWidth
                            value={editForm.firstName}
                            onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        />
                        <TextField
                            label="Soyad"
                            fullWidth
                            value={editForm.lastName}
                            onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Cinsiyet</InputLabel>
                            <Select
                                value={editForm.gender}
                                label="Cinsiyet"
                                onChange={(e) => setEditForm({ ...editForm, gender: Number(e.target.value) })}
                            >
                                {genderOptions.map(opt => (
                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Doğum Tarihi"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={editForm.birthDate}
                            onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>İptal</Button>
                    <Button onClick={handleSaveEdit} variant="contained" disabled={saving}>
                        {saving ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
