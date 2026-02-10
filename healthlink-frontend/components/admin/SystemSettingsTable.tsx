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
    Typography,
    CircularProgress,
    TextField,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107';

interface SystemSetting {
    id: number;
    key: string;
    value: string;
}

export default function SystemSettingsTable() {
    const [settings, setSettings] = useState<SystemSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch(`${API_URL}/api/admin/system-settings`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setSettings(data);
            }
        } catch (error) {
            console.error('Error fetching system settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (setting: SystemSetting) => {
        setEditingId(setting.id);
        setEditValue(setting.value);
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditValue('');
    };

    const handleSave = async (key: string) => {
        try {
            const response = await fetch(`${API_URL}/api/admin/system-settings/${key}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ value: editValue }),
            });

            if (response.ok) {
                fetchSettings();
                setEditingId(null);
                setEditValue('');
            } else {
                alert('Güncelleme başarısız');
            }
        } catch (error) {
            console.error('Error updating system setting:', error);
            alert('Bir hata oluştu');
        }
    };

    const handleDelete = async (key: string) => {
        if (!confirm('Bu ayarı silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/admin/system-settings/${key}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            if (response.ok) {
                fetchSettings();
            } else {
                alert('Silme işlemi başarısız');
            }
        } catch (error) {
            console.error('Error deleting system setting:', error);
            alert('Bir hata oluştu');
        }
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
                <Typography variant="h6">Sistem Ayarları</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => alert('Ekleme formu yakında eklenecek')}
                >
                    Yeni Ayar Ekle
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Anahtar</TableCell>
                            <TableCell>Değer</TableCell>
                            <TableCell align="right">İşlemler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {settings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center">
                                    <Typography variant="body2" color="text.secondary">
                                        Henüz sistem ayarı eklenmemiş
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            settings.map((setting) => (
                                <TableRow key={setting.id}>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                                            {setting.key}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {editingId === setting.id ? (
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                multiline
                                                maxRows={4}
                                            />
                                        ) : (
                                            <Typography variant="body2" fontFamily="monospace">
                                                {setting.value}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        {editingId === setting.id ? (
                                            <>
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleSave(setting.key)}
                                                >
                                                    <SaveIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={handleCancel}
                                                >
                                                    <CancelIcon fontSize="small" />
                                                </IconButton>
                                            </>
                                        ) : (
                                            <>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleEdit(setting)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDelete(setting.key)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
