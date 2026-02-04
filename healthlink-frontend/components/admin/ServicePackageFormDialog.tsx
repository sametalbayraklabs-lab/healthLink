'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Switch,
    FormControlLabel,
    Box,
} from '@mui/material';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107';

interface ServicePackage {
    id: number;
    name: string;
    description: string | null;
    expertType: string;
    sessionCount: number;
    price: number;
    isActive: boolean;
}

interface ServicePackageFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: () => void;
    servicePackage: ServicePackage | null;
}

const expertTypes = ['All', 'Dietitian', 'Psychologist', 'SportsCoach'];

export default function ServicePackageFormDialog({
    open,
    onClose,
    onSave,
    servicePackage,
}: ServicePackageFormDialogProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        expertType: 'All',
        sessionCount: 1,
        price: 0,
        isActive: true,
    });

    useEffect(() => {
        if (servicePackage) {
            setFormData({
                name: servicePackage.name,
                description: servicePackage.description || '',
                expertType: servicePackage.expertType,
                sessionCount: servicePackage.sessionCount,
                price: servicePackage.price,
                isActive: servicePackage.isActive,
            });
        } else {
            setFormData({
                name: '',
                description: '',
                expertType: 'All',
                sessionCount: 1,
                price: 0,
                isActive: true,
            });
        }
    }, [servicePackage, open]);

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = servicePackage
                ? `${API_URL}/api/admin/service-packages/${servicePackage.id}`
                : `${API_URL}/api/admin/service-packages`;

            const method = servicePackage ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.json();
                alert(error.message || 'İşlem başarısız');
                return;
            }

            onSave();
            onClose();
        } catch (error) {
            console.error('Error saving package:', error);
            alert('Kaydetme sırasında hata oluştu');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {servicePackage ? 'Paketi Düzenle' : 'Yeni Paket Ekle'}
            </DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2} mt={2}>
                    <TextField
                        label="Paket Adı"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        fullWidth
                    />

                    <TextField
                        label="Açıklama"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        multiline
                        rows={3}
                        fullWidth
                    />

                    <FormControl fullWidth>
                        <InputLabel>Uzman Tipi</InputLabel>
                        <Select
                            value={formData.expertType}
                            label="Uzman Tipi"
                            onChange={(e) => setFormData({ ...formData, expertType: e.target.value })}
                        >
                            {expertTypes.map((type) => (
                                <MenuItem key={type} value={type}>
                                    {type === 'All' ? 'Tümü' :
                                        type === 'Dietitian' ? 'Diyetisyen' :
                                            type === 'Psychologist' ? 'Psikolog' :
                                                'Spor Koçu'}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label="Seans Sayısı"
                        type="number"
                        value={formData.sessionCount}
                        onChange={(e) => setFormData({ ...formData, sessionCount: parseInt(e.target.value) || 1 })}
                        required
                        fullWidth
                        inputProps={{ min: 1 }}
                    />

                    <TextField
                        label="Fiyat (₺)"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        required
                        fullWidth
                        inputProps={{ min: 0, step: 0.01 }}
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            />
                        }
                        label="Aktif"
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>İptal</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!formData.name || formData.sessionCount < 1 || formData.price < 0}
                >
                    Kaydet
                </Button>
            </DialogActions>
        </Dialog>
    );
}
