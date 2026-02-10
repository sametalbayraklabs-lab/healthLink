'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Stack,
    CircularProgress,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107';

interface ScheduleException {
    id: number;
    date: string;
    type: number; // 1=Holiday, 2=PartialClose, 3=CustomBlock
    startTime: string | null;
    endTime: string | null;
    reason: string | null;
}

const EXCEPTION_TYPES = [
    { value: 1, label: 'Tatil/İzin (Tüm Gün Kapalı)' },
    { value: 2, label: 'Kısmi Kapalı' },
    { value: 3, label: 'Özel Blok' }
];

interface Props {
    onError: (message: string) => void;
    onSuccess: (message: string) => void;
}

export default function TimeOffManager({ onError, onSuccess }: Props) {
    const [loading, setLoading] = useState(true);
    const [exceptions, setExceptions] = useState<ScheduleException[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        date: '',
        type: 1,
        startTime: '',
        endTime: '',
        reason: ''
    });

    useEffect(() => {
        fetchExceptions();
    }, []);

    const fetchExceptions = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/expert/schedule/exceptions`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

            if (!response.ok) throw new Error('İzinler yüklenemedi');

            const data = await response.json();
            setExceptions(data);
        } catch (err) {
            onError(err instanceof Error ? err.message : 'Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (exception?: ScheduleException) => {
        if (exception) {
            setEditingId(exception.id);
            setFormData({
                date: exception.date,
                type: exception.type,
                startTime: exception.startTime || '',
                endTime: exception.endTime || '',
                reason: exception.reason || ''
            });
        } else {
            setEditingId(null);
            setFormData({ date: '', type: 1, startTime: '', endTime: '', reason: '' });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingId(null);
    };

    const handleSave = async () => {
        try {
            const url = editingId
                ? `${API_URL}/api/expert/schedule/exceptions/${editingId}`
                : `${API_URL}/api/expert/schedule/exceptions`;

            const response = await fetch(url, {
                method: editingId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Kaydetme başarısız');
            }

            await fetchExceptions();
            handleCloseDialog();
            onSuccess(editingId ? 'İzin güncellendi' : 'İzin eklendi');
        } catch (err) {
            onError(err instanceof Error ? err.message : 'Bir hata oluştu');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bu izni silmek istediğinizden emin misiniz?')) return;

        try {
            const response = await fetch(`${API_URL}/api/expert/schedule/exceptions/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

            if (!response.ok) throw new Error('Silme başarısız');

            await fetchExceptions();
            onSuccess('İzin silindi');
        } catch (err) {
            onError(err instanceof Error ? err.message : 'Bir hata oluştu');
        }
    };

    const getTypeLabel = (type: number) => {
        return EXCEPTION_TYPES.find(t => t.value === type)?.label || 'Bilinmeyen';
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <div>
                    <Typography variant="h6" fontWeight={600}>
                        İzin Günleri ve Özel Saatler
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Tatil günlerinizi ve özel çalışma saatlerinizi yönetin
                    </Typography>
                </div>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Yeni Ekle
                </Button>
            </Box>

            {exceptions.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        Henüz izin günü eklenmemiş
                    </Typography>
                </Paper>
            ) : (
                <Stack spacing={2}>
                    {exceptions.map((exception) => (
                        <Paper key={exception.id} variant="outlined" sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            {new Date(exception.date).toLocaleDateString('tr-TR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </Typography>
                                        <Chip
                                            label={getTypeLabel(exception.type)}
                                            size="small"
                                            color={exception.type === 1 ? 'error' : 'warning'}
                                        />
                                    </Box>
                                    {exception.type !== 1 && exception.startTime && exception.endTime && (
                                        <Typography variant="body2" color="text.secondary">
                                            {exception.startTime} - {exception.endTime}
                                        </Typography>
                                    )}
                                    {exception.reason && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                            {exception.reason}
                                        </Typography>
                                    )}
                                </Box>
                                <Box>
                                    <IconButton size="small" onClick={() => handleOpenDialog(exception)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => handleDelete(exception.id)} color="error">
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>
                        </Paper>
                    ))}
                </Stack>
            )}

            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editingId ? 'İzin Düzenle' : 'Yeni İzin Ekle'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Tarih"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            fullWidth
                            select
                            label="Tip"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: Number(e.target.value) })}
                        >
                            {EXCEPTION_TYPES.map((type) => (
                                <MenuItem key={type.value} value={type.value}>
                                    {type.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        {formData.type !== 1 && (
                            <>
                                <TextField
                                    fullWidth
                                    type="time"
                                    label="Başlangıç Saati"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    fullWidth
                                    type="time"
                                    label="Bitiş Saati"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </>
                        )}
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="Açıklama (Opsiyonel)"
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>İptal</Button>
                    <Button onClick={handleSave} variant="contained">
                        Kaydet
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
