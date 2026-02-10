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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SpecializationFormDialog from './SpecializationFormDialog';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107';

interface Specialization {
    id: number;
    name: string;
    description?: string;
    expertType: string;
    category: string;
    isActive: boolean;
}

export default function SpecializationTable() {
    const [specializations, setSpecializations] = useState<Specialization[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingSpecialization, setEditingSpecialization] = useState<Specialization | null>(null);

    useEffect(() => {
        fetchSpecializations();
    }, []);

    const fetchSpecializations = async () => {
        try {
            const response = await fetch(`${API_URL}/api/admin/specializations`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setSpecializations(data);
            }
        } catch (error) {
            console.error('Error fetching specializations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bu uzmanlık alanını silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/admin/specializations/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            if (response.ok) {
                fetchSpecializations();
            } else {
                const error = await response.json();
                alert(error.message || 'Silme işlemi başarısız');
            }
        } catch (error) {
            console.error('Error deleting specialization:', error);
            alert('Bir hata oluştu');
        }
    };

    const handleAdd = () => {
        setEditingSpecialization(null);
        setDialogOpen(true);
    };

    const handleEdit = (specialization: Specialization) => {
        setEditingSpecialization(specialization);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setEditingSpecialization(null);
    };

    const handleDialogSave = () => {
        fetchSpecializations();
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Uzmanlık Alanları</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAdd}
                >
                    Yeni Alan Ekle
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Ad</TableCell>
                            <TableCell>Açıklama</TableCell>
                            <TableCell>Uzman Tipi</TableCell>
                            <TableCell>Kategori</TableCell>
                            <TableCell>Durum</TableCell>
                            <TableCell align="right">İşlemler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {specializations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Typography variant="body2" color="text.secondary">
                                        Henüz uzmanlık alanı eklenmemiş
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            specializations.map((spec) => (
                                <TableRow key={spec.id}>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={600}>
                                            {spec.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{spec.description || '-'}</TableCell>
                                    <TableCell>
                                        <Chip label={spec.expertType} size="small" color="primary" variant="outlined" />
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={spec.category} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={spec.isActive ? 'Aktif' : 'Pasif'}
                                            color={spec.isActive ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEdit(spec)}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDelete(spec.id)}
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

            <SpecializationFormDialog
                open={dialogOpen}
                onClose={handleDialogClose}
                onSave={handleDialogSave}
                specialization={editingSpecialization}
            />
        </Box>
    );
}
