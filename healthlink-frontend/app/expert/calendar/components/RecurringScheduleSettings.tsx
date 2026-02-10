'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Switch,
    FormControlLabel,
    TextField,
    Button,
    Paper,
    Stack,
    CircularProgress,
    IconButton,
    Checkbox,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import UpdateIcon from '@mui/icons-material/Update';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107';

interface TimeSlot {
    startTime: string;
    endTime: string;
}

interface ScheduleTemplate {
    dayOfWeek: number;
    isOpen: boolean;
    autoMarkAvailable: boolean;
    timeSlots: TimeSlot[];
}

// dayOfWeek: 0=Sunday, 1=Monday, ..., 6=Saturday
const DAY_NAMES = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

interface Props {
    onError: (message: string) => void;
    onSuccess: (message: string) => void;
}

export default function RecurringScheduleSettings({ onError, onSuccess }: Props) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [templates, setTemplates] = useState<ScheduleTemplate[]>([]);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/expert/schedule/templates`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

            if (!response.ok) throw new Error('Şablonlar yüklenemedi');

            const data = await response.json();
            setTemplates(data);
        } catch (err) {
            onError(err instanceof Error ? err.message : 'Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleDay = (dayOfWeek: number) => {
        setTemplates(prev => prev.map(t =>
            t.dayOfWeek === dayOfWeek
                ? { ...t, isOpen: !t.isOpen }
                : t
        ));
    };

    const handleAutoMarkChange = (dayOfWeek: number) => {
        setTemplates(prev => prev.map(t =>
            t.dayOfWeek === dayOfWeek
                ? { ...t, autoMarkAvailable: !t.autoMarkAvailable }
                : t
        ));
    };

    const handleAddTimeSlot = (dayOfWeek: number) => {
        setTemplates(prev => prev.map(t =>
            t.dayOfWeek === dayOfWeek
                ? { ...t, timeSlots: [...t.timeSlots, { startTime: '09:00', endTime: '17:00' }] }
                : t
        ));
    };

    const handleRemoveTimeSlot = (dayOfWeek: number, index: number) => {
        setTemplates(prev => prev.map(t =>
            t.dayOfWeek === dayOfWeek
                ? { ...t, timeSlots: t.timeSlots.filter((_, i) => i !== index) }
                : t
        ));
    };

    const handleTimeSlotChange = (dayOfWeek: number, index: number, field: 'startTime' | 'endTime', value: string) => {
        setTemplates(prev => prev.map(t =>
            t.dayOfWeek === dayOfWeek
                ? {
                    ...t,
                    timeSlots: t.timeSlots.map((slot, i) =>
                        i === index ? { ...slot, [field]: value } : slot
                    )
                }
                : t
        ));
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // Validation
            for (const template of templates) {
                if (template.isOpen) {
                    if (template.timeSlots.length === 0) {
                        onError(`${DAY_NAMES[template.dayOfWeek]} için en az bir zaman aralığı gereklidir`);
                        setSaving(false);
                        return;
                    }

                    // Validate each slot
                    for (let i = 0; i < template.timeSlots.length; i++) {
                        const slot = template.timeSlots[i];

                        // Check start < end
                        if (slot.startTime >= slot.endTime) {
                            onError(`${DAY_NAMES[template.dayOfWeek]} - Slot ${i + 1}: Bitiş saati başlangıç saatinden sonra olmalıdır`);
                            setSaving(false);
                            return;
                        }

                        // Check for overlaps with other slots
                        for (let j = i + 1; j < template.timeSlots.length; j++) {
                            const otherSlot = template.timeSlots[j];

                            // Check if slots overlap
                            const overlap = (
                                (slot.startTime < otherSlot.endTime && slot.endTime > otherSlot.startTime) ||
                                (otherSlot.startTime < slot.endTime && otherSlot.endTime > slot.startTime)
                            );

                            if (overlap) {
                                onError(`${DAY_NAMES[template.dayOfWeek]} - Slot ${i + 1} ve Slot ${j + 1} çakışıyor`);
                                setSaving(false);
                                return;
                            }
                        }
                    }
                }
            }

            const response = await fetch(`${API_URL}/api/expert/schedule/templates`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({ templates })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Kaydetme başarısız');
            }

            const updated = await response.json();
            setTemplates(updated);
            onSuccess('Haftalık çalışma saatleri başarıyla güncellendi');
        } catch (err) {
            onError(err instanceof Error ? err.message : 'Bir hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAndUpdate = async () => {
        try {
            setSaving(true);

            // First save the templates
            await handleSave();

            // Then apply to calendar
            const response = await fetch(`${API_URL}/api/expert/schedule/templates/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({
                    startDate: new Date(startDate).toISOString(),
                    endDate: new Date(endDate).toISOString()
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Takvim güncelleme başarısız');
            }

            const result = await response.json();
            onSuccess(result.message || 'Takvim başarıyla güncellendi');
            setShowConfirmDialog(false);
            setStartDate('');
            setEndDate('');
        } catch (err) {
            onError(err instanceof Error ? err.message : 'Bir hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
                Haftalık Çalışma Saatleri
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Her gün için çalışma saatlerinizi belirleyin. Gün başına birden fazla zaman aralığı ekleyebilirsiniz.
            </Typography>

            <Stack spacing={2}>
                {templates
                    .sort((a, b) => {
                        // Reorder: Monday (1) first, Sunday (0) last
                        const orderA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
                        const orderB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
                        return orderA - orderB;
                    })
                    .map((template) => (
                        <Paper key={template.dayOfWeek} variant="outlined" sx={{ p: 2 }}>
                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={template.isOpen}
                                                onChange={() => handleToggleDay(template.dayOfWeek)}
                                                color="primary"
                                            />
                                        }
                                        label={
                                            <Typography fontWeight={template.isOpen ? 600 : 400}>
                                                {DAY_NAMES[template.dayOfWeek]}
                                            </Typography>
                                        }
                                    />
                                    {template.isOpen && (
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={template.autoMarkAvailable}
                                                    onChange={() => handleAutoMarkChange(template.dayOfWeek)}
                                                    size="small"
                                                />
                                            }
                                            label={
                                                <Typography variant="body2" color="text.secondary">
                                                    Otomatik müsait işaretle
                                                </Typography>
                                            }
                                        />
                                    )}
                                </Box>

                                {template.isOpen && (
                                    <Stack spacing={1.5}>
                                        {template.timeSlots.map((slot, index) => (
                                            <Grid container spacing={2} alignItems="center" key={index}>
                                                <Grid item xs={12} sm={5}>
                                                    <TextField
                                                        fullWidth
                                                        type="time"
                                                        label="Başlangıç"
                                                        value={slot.startTime}
                                                        onChange={(e) => handleTimeSlotChange(template.dayOfWeek, index, 'startTime', e.target.value)}
                                                        InputLabelProps={{ shrink: true }}
                                                        size="small"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={5}>
                                                    <TextField
                                                        fullWidth
                                                        type="time"
                                                        label="Bitiş"
                                                        value={slot.endTime}
                                                        onChange={(e) => handleTimeSlotChange(template.dayOfWeek, index, 'endTime', e.target.value)}
                                                        InputLabelProps={{ shrink: true }}
                                                        size="small"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={2}>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleRemoveTimeSlot(template.dayOfWeek, index)}
                                                        disabled={template.timeSlots.length === 1}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        ))}
                                        <Button
                                            size="small"
                                            startIcon={<AddIcon />}
                                            onClick={() => handleAddTimeSlot(template.dayOfWeek)}
                                            sx={{ alignSelf: 'flex-start' }}
                                        >
                                            Zaman Aralığı Ekle
                                        </Button>
                                    </Stack>
                                )}

                                {!template.isOpen && (
                                    <Typography variant="body2" color="text.secondary">
                                        Kapalı
                                    </Typography>
                                )}
                            </Stack>
                        </Paper>
                    ))}
            </Stack>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
                <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} /> : <UpdateIcon />}
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={saving}
                >
                    Kaydet ve Güncelle
                </Button>
            </Box>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
                <DialogTitle>Takvimi Güncelle</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Otomatik müsait işaretle aktif olan günler için takviminiz güncellenecektir. Onaylıyor musunuz?
                    </DialogContentText>
                    <Stack spacing={2}>
                        <TextField
                            label="Başlangıç Tarihi"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />
                        <TextField
                            label="Bitiş Tarihi"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowConfirmDialog(false)} disabled={saving}>
                        İptal
                    </Button>
                    <Button
                        onClick={handleSaveAndUpdate}
                        variant="contained"
                        disabled={saving || !startDate || !endDate}
                    >
                        {saving ? 'İşleniyor...' : 'Onayla'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
