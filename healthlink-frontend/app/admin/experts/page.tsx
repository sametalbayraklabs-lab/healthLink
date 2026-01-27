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
    Stack
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
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
    status: string;
    experienceStartDate: string;
    createdAt: string;
}

export default function AdminExpertsPage() {
    const [experts, setExperts] = useState<Expert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
    const [actionDialog, setActionDialog] = useState(false);
    const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

    useEffect(() => {
        fetchExperts();
    }, []);

    const fetchExperts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/experts/admin/all');
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

    const getExpertTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'Dietitian': 'Diyetisyen',
            'Psychologist': 'Psikolog',
            'SportsCoach': 'Spor Koçu'
        };
        return labels[type] || type;
    };

    const getWorkTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'Online': 'Online',
            'InPerson': 'Yüz Yüze',
            'Both': 'Her İkisi'
        };
        return labels[type] || type;
    };

    if (loading) {
        return (
            <Container maxWidth="lg">
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box mb={4}>
                <Typography variant="h4" gutterBottom fontWeight={600}>
                    Uzman Yönetimi
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Bekleyen uzman başvurularını onaylayın veya reddedin
                </Typography>
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
                        Henüz uzman başvurusu bulunmuyor
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
                                <TableCell><strong>Deneyim</strong></TableCell>
                                <TableCell><strong>Durum</strong></TableCell>
                                <TableCell align="center"><strong>İşlemler</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {experts.map((expert) => {
                                const experienceYears = new Date().getFullYear() -
                                    new Date(expert.experienceStartDate).getFullYear();

                                return (
                                    <TableRow key={expert.id}>
                                        <TableCell>{expert.displayName}</TableCell>
                                        <TableCell>{expert.email}</TableCell>
                                        <TableCell>{getExpertTypeLabel(expert.expertType)}</TableCell>
                                        <TableCell>{expert.city}</TableCell>
                                        <TableCell>{getWorkTypeLabel(expert.workType)}</TableCell>
                                        <TableCell>{experienceYears} yıl</TableCell>
                                        <TableCell>
                                            {expert.status === 'Approved' ? (
                                                <Chip
                                                    label="Onaylı"
                                                    color="success"
                                                    size="small"
                                                    icon={<CheckCircleIcon />}
                                                />
                                            ) : expert.status === 'Rejected' ? (
                                                <Chip
                                                    label="Reddedildi"
                                                    color="error"
                                                    size="small"
                                                    icon={<CancelIcon />}
                                                />
                                            ) : (
                                                <Chip
                                                    label="Bekliyor"
                                                    color="warning"
                                                    size="small"
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
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
                                                {expert.status === 'Approved' && (
                                                    <Chip label="Onaylandı" color="success" size="small" />
                                                )}
                                                {expert.status === 'Rejected' && (
                                                    <Chip label="Reddedildi" color="error" size="small" />
                                                )}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
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
        </Container>
    );
}
