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
    Button,
    Chip,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    IconButton,
    Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import api from '@/lib/api';

interface Expert {
    id: number;
    userId: number;
    displayName: string;
    email: string;
    expertType: string;
    city: string;
    workType: string;
    isApproved: boolean;
    isActive: boolean;
    status: string;
    bio: string;
    experienceStartDate: string;
    createdAt: string;
}

const expertTypeOptions = [
    { value: 0, label: 'Tümü' },
    { value: 1, label: 'Diyetisyen' },
    { value: 2, label: 'Psikolog' },
    { value: 3, label: 'Spor Koçu' },
];

const statusOptions = [
    { value: 0, label: 'Bekliyor' },
    { value: 1, label: 'Onaylı' },
    { value: 2, label: 'Reddedildi' },
    { value: 3, label: 'Askıya Alındı' },
];

const workTypeOptions = [
    { value: 0, label: 'Belirsiz' },
    { value: 1, label: 'Online' },
    { value: 2, label: 'Yüz Yüze' },
    { value: 3, label: 'Her İkisi' },
];

export default function AdminExpertsPage() {
    const [experts, setExperts] = useState<Expert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
    const [actionDialog, setActionDialog] = useState(false);
    const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
    const [filterActive, setFilterActive] = useState<string>('');
    const [search, setSearch] = useState('');
    // Edit dialog
    const [editDialog, setEditDialog] = useState(false);
    const [editForm, setEditForm] = useState({
        displayName: '',
        bio: '',
        city: '',
        expertType: 0,
        workType: 0,
        status: 0,
        isActive: true,
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchExperts();
    }, [filterActive, search]);

    const fetchExperts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filterActive) params.append('isActive', filterActive);
            if (search) params.append('search', search);
            const response = await api.get(`/api/experts/admin/all?${params}`);
            setExperts(response.data.items || response.data || []);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching experts:', err);
            setError('Uzmanlar yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (expertId: number) => {
        try {
            await api.put(`/api/experts/${expertId}/approve`, { adminNote: '' });
            setSuccess('Uzman başarıyla onaylandı!');
            fetchExperts();
            setActionDialog(false);
        } catch (err: any) {
            console.error('Error approving expert:', err);
            setError('Uzman onaylanırken hata oluştu');
        }
    };

    const handleReject = async (expertId: number) => {
        try {
            await api.put(`/api/experts/${expertId}/reject`, { adminNote: '' });
            setSuccess('Uzman reddedildi');
            fetchExperts();
            setActionDialog(false);
        } catch (err: any) {
            console.error('Error rejecting expert:', err);
            setError('İşlem sırasında hata oluştu');
        }
    };

    const openActionDialog = (expert: Expert, type: 'approve' | 'reject') => {
        setSelectedExpert(expert);
        setActionType(type);
        setActionDialog(true);
    };

    const openEditDialog = (expert: Expert) => {
        setSelectedExpert(expert);
        setEditForm({
            displayName: expert.displayName || '',
            bio: expert.bio || '',
            city: expert.city || '',
            expertType: expertTypeOptions.find(o => o.label === getExpertTypeLabel(expert.expertType))?.value ?? 0,
            workType: workTypeOptions.find(o => o.label === getWorkTypeLabel(expert.workType))?.value ?? 0,
            status: statusOptions.find(o => o.label === getStatusLabel(expert.status))?.value ?? 0,
            isActive: expert.isActive ?? true,
        });
        setEditDialog(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedExpert) return;
        try {
            setSaving(true);
            await api.put(`/api/experts/admin/${selectedExpert.id}`, editForm);
            setSuccess('Uzman bilgileri güncellendi!');
            setEditDialog(false);
            fetchExperts();
        } catch (err: any) {
            console.error('Error updating expert:', err);
            setError('Güncelleme sırasında hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (expert: Expert) => {
        try {
            await api.put(`/api/experts/admin/${expert.id}/toggle-active`);
            setSuccess(`${expert.displayName} ${expert.isActive ? 'pasife alındı' : 'aktif yapıldı'}!`);
            fetchExperts();
        } catch (err: any) {
            console.error('Error toggling active:', err);
            setError('İşlem sırasında hata oluştu');
        }
    };

    const getExpertTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'All': 'Tümü',
            'Dietitian': 'Diyetisyen',
            'Psychologist': 'Psikolog',
            'SportsCoach': 'Spor Koçu'
        };
        return labels[type] || type;
    };

    const getWorkTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'Undefined': 'Belirsiz',
            'Online': 'Online',
            'Onsite': 'Yüz Yüze',
            'Hybrid': 'Her İkisi'
        };
        return labels[type] || type || '-';
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            'Pending': 'Bekliyor',
            'Approved': 'Onaylı',
            'Rejected': 'Reddedildi',
            'Suspended': 'Askıya Alındı',
        };
        return labels[status] || status;
    };

    const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'default' => {
        switch (status) {
            case 'Approved': return 'success';
            case 'Rejected': return 'error';
            case 'Pending': return 'warning';
            case 'Suspended': return 'default';
            default: return 'default';
        }
    };

    if (loading) {
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
            <Box mb={4}>
                <Typography variant="h4" gutterBottom fontWeight={600}>
                    Uzman Yönetimi
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Uzmanları görüntüleyin, düzenleyin ve yönetin
                </Typography>
            </Box>

            <Box display="flex" gap={2} mb={3}>
                <TextField
                    label="Ara (İsim, Email)"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ minWidth: 300 }}
                />
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

            {experts.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                        Henüz uzman bulunmuyor
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Ad Soyad</strong></TableCell>
                                <TableCell><strong>E-posta</strong></TableCell>
                                <TableCell><strong>Uzmanlık</strong></TableCell>
                                <TableCell><strong>Şehir</strong></TableCell>
                                <TableCell><strong>Çalışma Tipi</strong></TableCell>
                                <TableCell><strong>Durum</strong></TableCell>
                                <TableCell><strong>Aktif</strong></TableCell>
                                <TableCell align="center"><strong>İşlemler</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {experts.map((expert) => (
                                <TableRow key={expert.id} sx={{ opacity: expert.isActive === false ? 0.5 : 1 }}>
                                    <TableCell>{expert.displayName}</TableCell>
                                    <TableCell>{expert.email}</TableCell>
                                    <TableCell>{getExpertTypeLabel(expert.expertType)}</TableCell>
                                    <TableCell>{expert.city || '-'}</TableCell>
                                    <TableCell>{getWorkTypeLabel(expert.workType)}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getStatusLabel(expert.status)}
                                            color={getStatusColor(expert.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={expert.isActive !== false ? 'Aktif' : 'Pasif'}
                                            color={expert.isActive !== false ? 'success' : 'default'}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <Tooltip title="Düzenle">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => openEditDialog(expert)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={expert.isActive !== false ? 'Pasife Al' : 'Aktif Yap'}>
                                                <IconButton
                                                    size="small"
                                                    color={expert.isActive !== false ? 'error' : 'success'}
                                                    onClick={() => handleToggleActive(expert)}
                                                >
                                                    <BlockIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            {expert.status === 'Pending' && (
                                                <>
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        size="small"
                                                        onClick={() => openActionDialog(expert, 'approve')}
                                                        startIcon={<CheckCircleIcon />}
                                                    >
                                                        Onayla
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        size="small"
                                                        onClick={() => openActionDialog(expert, 'reject')}
                                                        startIcon={<CancelIcon />}
                                                    >
                                                        Reddet
                                                    </Button>
                                                </>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Confirmation Dialog */}
            <Dialog open={actionDialog} onClose={() => setActionDialog(false)}>
                <DialogTitle>
                    {actionType === 'approve' ? 'Uzmanı Onayla' : 'Uzmanı Reddet'}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {selectedExpert?.displayName} adlı uzmanı {actionType === 'approve' ? 'onaylamak' : 'reddetmek'} istediğinizden emin misiniz?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setActionDialog(false)}>İptal</Button>
                    <Button
                        onClick={() => {
                            if (selectedExpert) {
                                if (actionType === 'approve') {
                                    handleApprove(selectedExpert.id);
                                } else {
                                    handleReject(selectedExpert.id);
                                }
                            }
                        }}
                        color={actionType === 'approve' ? 'success' : 'error'}
                        variant="contained"
                    >
                        {actionType === 'approve' ? 'Onayla' : 'Reddet'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Uzman Düzenle</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <TextField
                            label="Görünen Ad"
                            fullWidth
                            value={editForm.displayName}
                            onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                        />
                        <TextField
                            label="Biyografi"
                            fullWidth
                            multiline
                            rows={3}
                            value={editForm.bio}
                            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        />
                        <TextField
                            label="Şehir"
                            fullWidth
                            value={editForm.city}
                            onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Uzmanlık Tipi</InputLabel>
                            <Select
                                value={editForm.expertType}
                                label="Uzmanlık Tipi"
                                onChange={(e) => setEditForm({ ...editForm, expertType: Number(e.target.value) })}
                            >
                                {expertTypeOptions.map(opt => (
                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Çalışma Tipi</InputLabel>
                            <Select
                                value={editForm.workType}
                                label="Çalışma Tipi"
                                onChange={(e) => setEditForm({ ...editForm, workType: Number(e.target.value) })}
                            >
                                {workTypeOptions.map(opt => (
                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Durum</InputLabel>
                            <Select
                                value={editForm.status}
                                label="Durum"
                                onChange={(e) => setEditForm({ ...editForm, status: Number(e.target.value) })}
                            >
                                {statusOptions.map(opt => (
                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={editForm.isActive}
                                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                                />
                            }
                            label="Aktif"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialog(false)}>İptal</Button>
                    <Button onClick={handleSaveEdit} variant="contained" disabled={saving}>
                        {saving ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
