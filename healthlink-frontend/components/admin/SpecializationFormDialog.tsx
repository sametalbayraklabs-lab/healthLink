'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
} from '@mui/material';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107';

interface LookupItem {
    value: string;
    label: string;
}

interface Specialization {
    id?: number;
    name: string;
    description?: string;
    expertType: string;
    category: string;
    isActive: boolean;
}

interface SpecializationFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: () => void;
    specialization?: Specialization | null;
}



export default function SpecializationFormDialog({
    open,
    onClose,
    onSave,
    specialization,
}: SpecializationFormDialogProps) {
    const [formData, setFormData] = useState<Specialization>({
        name: '',
        description: '',
        expertType: 'Dietitian',
        category: 'Psychologist',
        isActive: true,
    });
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState<{ expertTypes: LookupItem[]; specializationCategories: LookupItem[] }>({ expertTypes: [], specializationCategories: [] });

    useEffect(() => {
        if (open) fetchLookups();
    }, [open]);

    useEffect(() => {
        if (specialization) {
            setFormData(specialization);
        } else {
            setFormData({
                name: '',
                description: '',
                expertType: 'Dietitian',
                category: 'Psychologist',
                isActive: true,
            });
        }
    }, [specialization, open]);

    const fetchLookups = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${API_URL}/api/admin/lookups`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setLookups({
                    expertTypes: data.expertTypes || [],
                    specializationCategories: data.specializationCategories || []
                });
            }
        } catch (err) {
            console.error('Error fetching lookups:', err);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const url = specialization
                ? `${API_URL}/api/admin/specializations/${specialization.id}`
                : `${API_URL}/api/admin/specializations`;

            const method = specialization ? 'PUT' : 'POST';

            const body = {
                name: formData.name,
                description: formData.description,
                expertType: formData.expertType,
                category: formData.category,
                isActive: formData.isActive,
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                onSave();
                onClose();
            } else {
                // Try to parse error message
                const text = await response.text();
                let errorMessage = 'İşlem başarısız';

                try {
                    const error = JSON.parse(text);
                    errorMessage = error.message || errorMessage;
                } catch {
                    // If not JSON, use text as is
                    errorMessage = text || errorMessage;
                }

                alert(errorMessage);
            }
        } catch (error) {
            console.error('Error saving specialization:', error);
            alert('Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {specialization ? 'Uzmanlık Alanı Düzenle' : 'Yeni Uzmanlık Alanı Ekle'}
            </DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    label="Ad"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    margin="normal"
                    required
                />

                <TextField
                    fullWidth
                    label="Açıklama"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    margin="normal"
                    multiline
                    rows={3}
                />

                <FormControl fullWidth margin="normal" required>
                    <InputLabel>Uzman Tipi</InputLabel>
                    <Select
                        value={formData.expertType}
                        label="Uzman Tipi"
                        onChange={(e) => setFormData({ ...formData, expertType: e.target.value })}
                    >
                        {lookups.expertTypes.map((item) => (
                            <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth margin="normal" required>
                    <InputLabel>Kategori</InputLabel>
                    <Select
                        value={formData.category}
                        label="Kategori"
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                        {lookups.specializationCategories.map((item) => (
                            <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControlLabel
                    control={
                        <Switch
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                    }
                    label="Aktif"
                    sx={{ mt: 2 }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    İptal
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || !formData.name}
                >
                    {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
