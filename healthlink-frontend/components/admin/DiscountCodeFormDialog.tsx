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
    Grid,
} from '@mui/material';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107';

interface LookupItem {
    value: string;
    label: string;
}

interface DiscountCode {
    id?: number;
    code: string;
    description?: string;
    discountType: string;
    discountValue: number;
    maxUsageCount?: number;
    validFrom: string;
    validTo?: string;
    applicableExpertType: string;
    isActive: boolean;
}

interface DiscountCodeFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: () => void;
    discountCode?: DiscountCode | null;
}

const discountTypes = ['Percentage', 'Fixed'];

export default function DiscountCodeFormDialog({
    open,
    onClose,
    onSave,
    discountCode,
}: DiscountCodeFormDialogProps) {
    const [formData, setFormData] = useState<DiscountCode>({
        code: '',
        description: '',
        discountType: 'Percentage',
        discountValue: 0,
        maxUsageCount: undefined,
        validFrom: new Date().toISOString().split('T')[0],
        validTo: '',
        applicableExpertType: 'All',
        isActive: true,
    });
    const [loading, setLoading] = useState(false);
    const [expertTypes, setExpertTypes] = useState<LookupItem[]>([]);

    useEffect(() => {
        if (open) fetchLookups();
    }, [open]);

    const fetchLookups = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${API_URL}/api/admin/lookups`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setExpertTypes(data.expertTypes || []);
            }
        } catch (err) {
            console.error('Error fetching lookups:', err);
        }
    };

    useEffect(() => {
        if (discountCode) {
            setFormData({
                ...discountCode,
                validFrom: discountCode.validFrom.split('T')[0],
                validTo: discountCode.validTo ? discountCode.validTo.split('T')[0] : '',
            });
        } else {
            setFormData({
                code: '',
                description: '',
                discountType: 'Percentage',
                discountValue: 0,
                maxUsageCount: undefined,
                validFrom: new Date().toISOString().split('T')[0],
                validTo: '',
                applicableExpertType: 'All',
                isActive: true,
            });
        }
    }, [discountCode, open]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const url = discountCode
                ? `${API_URL}/api/admin/discount-codes/${discountCode.id}`
                : `${API_URL}/api/admin/discount-codes`;

            const method = discountCode ? 'PUT' : 'POST';

            const body = discountCode
                ? {
                    description: formData.description,
                    discountValue: formData.discountValue,
                    maxUsageCount: formData.maxUsageCount || null,
                    validFrom: formData.validFrom ? new Date(formData.validFrom + 'T00:00:00Z').toISOString() : undefined,
                    validTo: formData.validTo ? new Date(formData.validTo + 'T23:59:59Z').toISOString() : null,
                    isActive: formData.isActive,
                }
                : {
                    code: formData.code,
                    description: formData.description,
                    discountType: formData.discountType,
                    discountValue: formData.discountValue,
                    maxUsageCount: formData.maxUsageCount || null,
                    validFrom: formData.validFrom ? new Date(formData.validFrom + 'T00:00:00Z').toISOString() : new Date().toISOString(),
                    validTo: formData.validTo ? new Date(formData.validTo + 'T23:59:59Z').toISOString() : null,
                    applicableExpertType: formData.applicableExpertType,
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
                const text = await response.text();
                let errorMessage = 'İşlem başarısız';

                try {
                    const error = JSON.parse(text);
                    errorMessage = error.message || errorMessage;
                } catch {
                    errorMessage = text || errorMessage;
                }

                alert(errorMessage);
            }
        } catch (error) {
            console.error('Error saving discount code:', error);
            alert('Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {discountCode ? 'İndirim Kodu Düzenle' : 'Yeni İndirim Kodu Ekle'}
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Kod"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            required
                            disabled={!!discountCode}
                            helperText={discountCode ? "Kod düzenlenemez" : "Örn: YENI20"}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required disabled={!!discountCode}>
                            <InputLabel>İndirim Tipi</InputLabel>
                            <Select
                                value={formData.discountType}
                                label="İndirim Tipi"
                                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                            >
                                {discountTypes.map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {type === 'Percentage' ? 'Yüzde (%)' : 'Sabit Tutar (₺)'}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Açıklama"
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            multiline
                            rows={2}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label={formData.discountType === 'Percentage' ? 'İndirim Yüzdesi' : 'İndirim Tutarı'}
                            type="number"
                            value={formData.discountValue}
                            onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                            required
                            inputProps={{ min: 0, max: formData.discountType === 'Percentage' ? 100 : undefined, step: formData.discountType === 'Percentage' ? 1 : 0.01 }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Maksimum Kullanım Sayısı"
                            type="number"
                            value={formData.maxUsageCount || ''}
                            onChange={(e) => setFormData({ ...formData, maxUsageCount: e.target.value ? parseInt(e.target.value) : undefined })}
                            helperText="Boş bırakılırsa sınırsız"
                            inputProps={{ min: 1 }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Başlangıç Tarihi"
                            type="date"
                            value={formData.validFrom}
                            onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                            required
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Bitiş Tarihi"
                            type="date"
                            value={formData.validTo || ''}
                            onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            helperText="Boş bırakılırsa süresiz"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required disabled={!!discountCode}>
                            <InputLabel>Geçerli Uzman Tipi</InputLabel>
                            <Select
                                value={formData.applicableExpertType}
                                label="Geçerli Uzman Tipi"
                                onChange={(e) => setFormData({ ...formData, applicableExpertType: e.target.value })}
                            >
                                {expertTypes.map((item) => (
                                    <MenuItem key={item.value} value={item.value}>
                                        {item.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                            }
                            label="Aktif"
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    İptal
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || !formData.code || formData.discountValue <= 0}
                >
                    {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
