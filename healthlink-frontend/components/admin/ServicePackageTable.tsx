'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Typography,
    CircularProgress,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ServicePackageFormDialog from './ServicePackageFormDialog';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107';

interface LookupItem {
    value: string;
    label: string;
}

interface ServicePackage {
    id: number;
    name: string;
    description: string | null;
    expertType: string;
    sessionCount: number;
    validityDays: number;
    price: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string | null;
}

export default function ServicePackageTable() {
    const [packages, setPackages] = useState<ServicePackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [packageToDelete, setPackageToDelete] = useState<ServicePackage | null>(null);
    const [filterExpertType, setFilterExpertType] = useState<string>('');
    const [filterActive, setFilterActive] = useState<string>('');
    const [lookups, setLookups] = useState<{ expertTypes: LookupItem[] }>({ expertTypes: [] });

    useEffect(() => {
        fetchLookups();
    }, []);

    useEffect(() => {
        fetchPackages();
    }, [filterExpertType, filterActive]);

    const fetchLookups = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${API_URL}/api/admin/lookups`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setLookups({ expertTypes: data.expertTypes || [] });
            }
        } catch (err) {
            console.error('Error fetching lookups:', err);
        }
    };

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            const params = new URLSearchParams();
            if (filterExpertType) params.append('expertType', filterExpertType);
            if (filterActive) params.append('isActive', filterActive);

            const response = await fetch(`${API_URL}/api/admin/service-packages?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch packages');

            const data = await response.json();
            setPackages(data);
        } catch (error) {
            console.error('Error fetching packages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!packageToDelete) return;

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/api/admin/service-packages/${packageToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                alert(error.message || 'Silme işlemi başarısız');
                return;
            }

            fetchPackages();
            setDeleteDialogOpen(false);
            setPackageToDelete(null);
        } catch (error) {
            console.error('Error deleting package:', error);
            alert('Silme işlemi sırasında hata oluştu');
        }
    };

    const getExpertTypeLabel = (type: string) => {
        switch (type) {
            case 'All': return 'Tümü';
            case 'Dietitian': return 'Diyetisyen';
            case 'Psychologist': return 'Psikolog';
            case 'SportsCoach': return 'Spor Koçu';
            default: return type;
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">Hizmet Paketleri</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setSelectedPackage(null);
                        setDialogOpen(true);
                    }}
                >
                    Yeni Paket Ekle
                </Button>
            </Box>

            <Box display="flex" gap={2} mb={3}>
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Uzman Tipi</InputLabel>
                    <Select
                        value={filterExpertType}
                        label="Uzman Tipi"
                        onChange={(e) => setFilterExpertType(e.target.value)}
                    >
                        <MenuItem value="">Tümü</MenuItem>
                        {lookups.expertTypes.filter((item) => item.value !== 'All').map((item) => (
                            <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Durum</InputLabel>
                    <Select
                        value={filterActive}
                        label="Durum"
                        onChange={(e) => setFilterActive(e.target.value)}
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
                            <TableCell>Paket Adı</TableCell>
                            <TableCell>Açıklama</TableCell>
                            <TableCell>Uzman Tipi</TableCell>
                            <TableCell align="right">Seans Sayısı</TableCell>
                            <TableCell align="right">Geçerlilik</TableCell>
                            <TableCell align="right">Fiyat</TableCell>
                            <TableCell>Durum</TableCell>
                            <TableCell align="right">İşlemler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {packages.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    <Typography color="text.secondary">Henüz paket bulunmuyor</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            packages.map((pkg) => (
                                <TableRow key={pkg.id}>
                                    <TableCell>
                                        <Typography fontWeight="medium">{pkg.name}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {pkg.description || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getExpertTypeLabel(pkg.expertType)}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography>{pkg.sessionCount} Seans</Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography>{pkg.validityDays} Gün</Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography fontWeight="medium">₺{pkg.price.toFixed(2)}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={pkg.isActive ? 'Aktif' : 'Pasif'}
                                            color={pkg.isActive ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                setSelectedPackage(pkg);
                                                setDialogOpen(true);
                                            }}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => {
                                                setPackageToDelete(pkg);
                                                setDeleteDialogOpen(true);
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <ServicePackageFormDialog
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                    setSelectedPackage(null);
                }}
                onSave={() => {
                    fetchPackages();
                }}
                servicePackage={selectedPackage}
            />

            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Paketi Sil</DialogTitle>
                <DialogContent>
                    <Typography>
                        &quot;{packageToDelete?.name}&quot; paketini silmek istediğinizden emin misiniz?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        Sil
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
