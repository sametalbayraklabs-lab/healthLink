'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Container,
    Typography,
    Card,
    CardContent,
    Box,
    CircularProgress,
    Tabs,
    Tab,
    Chip,
    Button,
    Stack,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    IconButton,
    Avatar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import LockIcon from '@mui/icons-material/Lock';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MessageIcon from '@mui/icons-material/Message';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AddIcon from '@mui/icons-material/Add';
import api from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { useChat } from '@/contexts/ChatContext';

// ─── Types ───
interface ExpertClient {
    clientId: number;
    fullName: string;
    email?: string;
    totalAppointments: number;
    completedAppointments: number;
    lastAppointmentDate?: string;
    birthDate?: string;
    gender?: string;
}

interface ClientAppointment {
    id: number;
    clientId: number;
    expertId: number;
    clientName?: string;
    serviceType: string;
    status: string;
    startDateTime: string;
    endDateTime: string;
}

interface ClientNote {
    id: number;
    clientId: number;
    expertId: number;
    appointmentId?: number;
    appointmentDate?: string;
    noteType: string;
    noteTypeLabel: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
}

interface ClientMeasurement {
    id: number;
    clientId: number;
    expertId: number;
    date: string;
    heightCm: number;
    weightKg: number;
    bodyFatPercentage?: number;
    bmi: number;
    bmiCategory: string;
    createdAt: string;
    updatedAt?: string;
}

// ─── Helpers ───
const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
};

const genderLabel = (gender?: string) => {
    switch (gender) {
        case 'Male': return 'Erkek';
        case 'Female': return 'Kadın';
        default: return 'Belirtilmemiş';
    }
};

const bmiColor = (category: string) => {
    switch (category) {
        case 'Zayıf': return { color: '#2563EB', bg: '#EFF6FF' };
        case 'Normal': return { color: '#059669', bg: '#ECFDF5' };
        case 'Fazla Kilolu': return { color: '#D97706', bg: '#FFFBEB' };
        default: return { color: '#DC2626', bg: '#FEF2F2' }; // Obez variants
    }
};
const statusColor = (status: string) => {
    switch (status) {
        case 'Completed': return 'success';
        case 'Cancelled': return 'error';
        case 'Scheduled': return 'info';
        case 'InProgress': return 'warning';
        default: return 'default';
    }
};

const statusLabel = (status: string) => {
    switch (status) {
        case 'Completed': return 'Tamamlandı';
        case 'Cancelled': return 'İptal';
        case 'Scheduled': return 'Planlandı';
        case 'InProgress': return 'Devam Ediyor';
        case 'Incomplete': return 'Tamamlanmadı';
        default: return status;
    }
};

const serviceTypeLabel = (type: string) => {
    switch (type) {
        case 'Online': return 'Online';
        case 'InPerson': return 'Yüz Yüze';
        default: return type;
    }
};

const noteTypeConfig: Record<string, { color: string; bgColor: string; icon: React.ReactNode }> = {
    General: { color: '#2563EB', bgColor: '#EFF6FF', icon: <DescriptionIcon sx={{ fontSize: 18 }} /> },
    Session: { color: '#059669', bgColor: '#ECFDF5', icon: <CalendarMonthIcon sx={{ fontSize: 18 }} /> },
    Private: { color: '#7C3AED', bgColor: '#F5F3FF', icon: <LockIcon sx={{ fontSize: 18 }} /> },
};

// ─── Main Component ───
export default function ClientDetailPage() {
    const params = useParams();
    const router = useRouter();
    const clientId = Number(params.id);
    const { openChatWithClient } = useChat();

    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [client, setClient] = useState<ExpertClient | null>(null);
    const [appointments, setAppointments] = useState<ClientAppointment[]>([]);
    const [notes, setNotes] = useState<ClientNote[]>([]);
    const [measurements, setMeasurements] = useState<ClientMeasurement[]>([]);

    // Modal state
    const [noteModalOpen, setNoteModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<ClientNote | null>(null);
    const [noteForm, setNoteForm] = useState({ noteType: 'General', appointmentId: '', content: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    // Measurement modal state
    const [measureModalOpen, setMeasureModalOpen] = useState(false);
    const [measureForm, setMeasureForm] = useState({ date: new Date().toISOString().split('T')[0], heightCm: '', weightKg: '', bodyFatPercentage: '' });
    const [measureSaving, setMeasureSaving] = useState(false);
    const [deleteMeasureId, setDeleteMeasureId] = useState<number | null>(null);

    // Fetch client info from the clients list
    const fetchClientInfo = useCallback(async () => {
        try {
            const res = await api.get('/api/expert/clients');
            const found = (res.data || []).find((c: ExpertClient) => c.clientId === clientId);
            setClient(found || null);
        } catch (err) {
            console.error('Failed to fetch client info', err);
        }
    }, [clientId]);

    // Fetch appointments for this client
    const fetchAppointments = useCallback(async () => {
        try {
            const res = await api.get('/api/appointments/expert');
            const filtered = (res.data || []).filter((a: ClientAppointment) => a.clientId === clientId);
            filtered.sort((a: ClientAppointment, b: ClientAppointment) =>
                new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime()
            );
            setAppointments(filtered);
        } catch (err) {
            console.error('Failed to fetch appointments', err);
        }
    }, [clientId]);

    // Fetch notes
    const fetchNotes = useCallback(async () => {
        try {
            const res = await api.get(`/api/expert/client-notes/${clientId}`);
            setNotes(res.data || []);
        } catch (err) {
            console.error('Failed to fetch notes', err);
        }
    }, [clientId]);

    // Fetch measurements
    const fetchMeasurements = useCallback(async () => {
        try {
            const res = await api.get(`/api/expert/measurements/${clientId}`);
            setMeasurements(res.data || []);
        } catch (err) {
            console.error('Failed to fetch measurements', err);
        }
    }, [clientId]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await Promise.all([fetchClientInfo(), fetchAppointments(), fetchNotes(), fetchMeasurements()]);
            setLoading(false);
        };
        load();
    }, [fetchClientInfo, fetchAppointments, fetchNotes, fetchMeasurements]);

    // ─── Note CRUD ───
    const openAddNote = (appointmentId?: number) => {
        setEditingNote(null);
        setNoteForm({
            noteType: 'Session',
            appointmentId: appointmentId ? String(appointmentId) : '',
            content: '',
        });
        setNoteModalOpen(true);
    };

    const openEditNote = (note: ClientNote) => {
        setEditingNote(note);
        setNoteForm({
            noteType: note.noteType,
            appointmentId: note.appointmentId ? String(note.appointmentId) : '',
            content: note.content,
        });
        setNoteModalOpen(true);
    };

    const handleSaveNote = async () => {
        setSaving(true);
        try {
            if (editingNote) {
                await api.put(`/api/expert/client-notes/${editingNote.id}`, {
                    content: noteForm.content,
                    noteType: noteForm.noteType,
                });
            } else {
                await api.post('/api/expert/client-notes', {
                    clientId,
                    noteType: noteForm.noteType,
                    appointmentId: noteForm.appointmentId ? Number(noteForm.appointmentId) : null,
                    content: noteForm.content,
                });
            }
            setNoteModalOpen(false);
            await fetchNotes();
        } catch (err) {
            console.error('Failed to save note', err);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteNote = async (id: number) => {
        try {
            await api.delete(`/api/expert/client-notes/${id}`);
            setDeleteConfirmId(null);
            await fetchNotes();
        } catch (err) {
            console.error('Failed to delete note', err);
        }
    };

    // Past appointments for the session note dropdown
    const pastAppointments = appointments.filter(
        (a) => a.status === 'Completed' || new Date(a.endDateTime) < new Date()
    );

    // ─── Measurement CRUD ───
    const openAddMeasurement = () => {
        setMeasureForm({ date: new Date().toISOString().split('T')[0], heightCm: '', weightKg: '', bodyFatPercentage: '' });
        setMeasureModalOpen(true);
    };

    const handleSaveMeasurement = async () => {
        setMeasureSaving(true);
        try {
            await api.post('/api/expert/measurements', {
                clientId,
                date: measureForm.date,
                heightCm: Number(measureForm.heightCm),
                weightKg: Number(measureForm.weightKg),
                bodyFatPercentage: measureForm.bodyFatPercentage ? Number(measureForm.bodyFatPercentage) : null,
            });
            setMeasureModalOpen(false);
            await fetchMeasurements();
        } catch (err) {
            console.error('Failed to save measurement', err);
        } finally {
            setMeasureSaving(false);
        }
    };

    const handleDeleteMeasurement = async (id: number) => {
        try {
            await api.delete(`/api/expert/measurements/${id}`);
            setDeleteMeasureId(null);
            await fetchMeasurements();
        } catch (err) {
            console.error('Failed to delete measurement', err);
        }
    };

    // ─── Loading / Not Found ───
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (!client) {
        return (
            <Container maxWidth="lg">
                <Box textAlign="center" py={8}>
                    <Typography variant="h6" color="text.secondary">Danışan bulunamadı</Typography>
                    <Button sx={{ mt: 2 }} onClick={() => router.push('/expert/clients')}>Geri Dön</Button>
                </Box>
            </Container>
        );
    }

    // ─── Render ───
    return (
        <Container maxWidth="lg">
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.push('/expert/clients')}
                    sx={{ mb: 2, color: '#64748B' }}
                >
                    Danışanlarım
                </Button>

                <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                    <Avatar
                        sx={{
                            width: 56,
                            height: 56,
                            bgcolor: '#0F766E',
                            fontSize: '1.3rem',
                            fontWeight: 700,
                        }}
                    >
                        {client.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </Avatar>
                    <Box flex={1}>
                        <Typography variant="h5" fontWeight={700} sx={{ color: '#1E293B' }}>
                            {client.fullName}
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <Chip label={`${client.totalAppointments} Randevu`} color="primary" variant="outlined" size="small" />
                        <Chip label={`${client.completedAppointments} Tamamlandı`} color="success" variant="outlined" size="small" />
                    </Stack>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<MessageIcon />}
                        onClick={() => openChatWithClient(client.clientId)}
                    >
                        Mesaj Gönder
                    </Button>
                </Box>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    sx={{
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                        },
                    }}
                >
                    <Tab icon={<PersonIcon />} iconPosition="start" label="Genel Bilgi" />
                    <Tab icon={<EventIcon />} iconPosition="start" label="Randevular" />
                    <Tab icon={<DescriptionIcon />} iconPosition="start" label="Notlar" />
                    <Tab icon={<FitnessCenterIcon />} iconPosition="start" label="Ölçümler" />
                </Tabs>
            </Box>

            {/* ═══ Tab 0: Genel Bilgi ═══ */}
            {tab === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Card sx={{ borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                                Danışan Bilgileri
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Stack spacing={1.5}>
                                <Box display="flex" gap={1}>
                                    <Typography variant="body2" sx={{ color: '#64748B', minWidth: 140 }}>Ad Soyad:</Typography>
                                    <Typography variant="body2" fontWeight={600}>{client.fullName}</Typography>
                                </Box>
                                <Box display="flex" gap={1}>
                                    <Typography variant="body2" sx={{ color: '#64748B', minWidth: 140 }}>Toplam Randevu:</Typography>
                                    <Typography variant="body2" fontWeight={600}>{client.totalAppointments}</Typography>
                                </Box>
                                <Box display="flex" gap={1}>
                                    <Typography variant="body2" sx={{ color: '#64748B', minWidth: 140 }}>Tamamlanan:</Typography>
                                    <Typography variant="body2" fontWeight={600}>{client.completedAppointments}</Typography>
                                </Box>
                                {client.lastAppointmentDate && (
                                    <Box display="flex" gap={1}>
                                        <Typography variant="body2" sx={{ color: '#64748B', minWidth: 140 }}>Son Randevu:</Typography>
                                        <Typography variant="body2" fontWeight={600}>{formatDateTime(client.lastAppointmentDate)}</Typography>
                                    </Box>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </Box>
            )}

            {/* ═══ Tab 1: Randevular ═══ */}
            {tab === 1 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {appointments.length === 0 ? (
                        <Box textAlign="center" py={6}>
                            <Typography variant="body1" color="text.secondary">
                                Bu danışan ile henüz randevunuz bulunmuyor.
                            </Typography>
                        </Box>
                    ) : (
                        appointments.map((appt) => (
                            <Card
                                key={appt.id}
                                sx={{
                                    borderRadius: '16px',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                    transition: 'box-shadow 0.2s',
                                    '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
                                }}
                            >
                                <CardContent sx={{ p: 2.5 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                                        <Box>
                                            <Typography variant="body1" fontWeight={600}>
                                                📅 {formatDateTime(appt.startDateTime)}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#64748B', mt: 0.3 }}>
                                                {serviceTypeLabel(appt.serviceType)}
                                            </Typography>
                                        </Box>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Chip
                                                label={statusLabel(appt.status)}
                                                color={statusColor(appt.status) as any}
                                                size="small"
                                                variant="outlined"
                                            />
                                            {(appt.status === 'Completed' || new Date(appt.endDateTime) < new Date()) && (
                                                <Button
                                                    size="small"
                                                    variant="text"
                                                    startIcon={<NoteAddIcon />}
                                                    onClick={() => {
                                                        setTab(2);
                                                        setTimeout(() => openAddNote(appt.id), 100);
                                                    }}
                                                    sx={{ textTransform: 'none', fontSize: '0.8rem' }}
                                                >
                                                    Seans Notu Ekle
                                                </Button>
                                            )}
                                        </Stack>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </Box>
            )}

            {/* ═══ Tab 2: Notlar ═══ */}
            {tab === 2 && (() => {
                const generalNote = notes.find(n => n.noteType === 'General');
                const sessionNotes = notes.filter(n => n.noteType === 'Session');
                return (
                    <Box>
                        {/* ── Genel Not (always pinned at top) ── */}
                        <Card sx={{
                            borderRadius: '16px',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                            borderLeft: '4px solid #2563EB',
                            mb: 3,
                        }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <DescriptionIcon sx={{ fontSize: 18, color: '#2563EB' }} />
                                        <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#2563EB' }}>
                                            Genel Not
                                        </Typography>
                                    </Stack>
                                    <Button
                                        size="small"
                                        startIcon={<EditIcon />}
                                        onClick={() => {
                                            if (generalNote) {
                                                openEditNote(generalNote);
                                            } else {
                                                setEditingNote(null);
                                                setNoteForm({ noteType: 'General', appointmentId: '', content: '' });
                                                setNoteModalOpen(true);
                                            }
                                        }}
                                        sx={{ textTransform: 'none', fontSize: '0.8rem', color: '#2563EB' }}
                                    >
                                        {generalNote ? 'Düzenle' : 'Ekle'}
                                    </Button>
                                </Box>
                                {generalNote && generalNote.content.trim() ? (
                                    <>
                                        <Typography
                                            variant="body2"
                                            sx={{ color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}
                                        >
                                            {generalNote.content}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#94A3B8', mt: 1, display: 'block' }}>
                                            {formatDateTime(generalNote.createdAt)}
                                            {generalNote.updatedAt && ' · Düzenlendi'}
                                        </Typography>
                                    </>
                                ) : (
                                    <Typography variant="body2" sx={{ color: '#94A3B8', fontStyle: 'italic' }}>
                                        Henüz genel not eklenmemiş. Danışan hakkında genel gözlemlerinizi buraya ekleyebilirsiniz.
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>

                        {/* ── Seans Notları ── */}
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#334155' }}>
                                Seans Notları
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<NoteAddIcon />}
                                onClick={() => openAddNote()}
                                sx={{
                                    textTransform: 'none',
                                    borderRadius: '12px',
                                    px: 3,
                                    fontWeight: 600,
                                    boxShadow: 'none',
                                    '&:hover': { boxShadow: '0 2px 8px rgba(15,118,110,0.3)' },
                                }}
                            >
                                Seans Notu Ekle
                            </Button>
                        </Box>

                        {sessionNotes.length === 0 ? (
                            <Card sx={{ borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                                <CardContent sx={{ py: 4, textAlign: 'center' }}>
                                    <CalendarMonthIcon sx={{ fontSize: 40, color: '#CBD5E1', mb: 1 }} />
                                    <Typography variant="body2" color="text.secondary">
                                        Henüz seans notu eklenmemiş.
                                    </Typography>
                                </CardContent>
                            </Card>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {sessionNotes.map((note) => {
                                    const config = noteTypeConfig[note.noteType] || noteTypeConfig.Session;
                                    return (
                                        <Card
                                            key={note.id}
                                            sx={{
                                                borderRadius: '16px',
                                                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                                borderLeft: `4px solid ${config.color}`,
                                                transition: 'box-shadow 0.2s',
                                                '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
                                            }}
                                        >
                                            <CardContent sx={{ p: 2.5 }}>
                                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                                                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                                        <Chip
                                                            icon={config.icon as React.ReactElement}
                                                            label={note.noteTypeLabel}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: config.bgColor,
                                                                color: config.color,
                                                                fontWeight: 600,
                                                                borderRadius: '8px',
                                                                '& .MuiChip-icon': { color: config.color },
                                                            }}
                                                        />
                                                        {note.appointmentId && note.appointmentDate && (
                                                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                                                                Seans – {formatDateTime(note.appointmentDate)}
                                                            </Typography>
                                                        )}
                                                    </Stack>
                                                    <Stack direction="row" spacing={0}>
                                                        <IconButton size="small" onClick={() => openEditNote(note)} sx={{ color: '#94A3B8' }}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton size="small" onClick={() => setDeleteConfirmId(note.id)} sx={{ color: '#94A3B8' }}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Stack>
                                                </Box>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}
                                                >
                                                    {note.content}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#94A3B8', mt: 1.5, display: 'block' }}>
                                                    {formatDateTime(note.createdAt)}
                                                    {note.updatedAt && ' · Düzenlendi'}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </Box>
                        )}
                    </Box>
                );
            })()}

            {/* ═══ Tab 3: Ölçümler ═══ */}
            {tab === 3 && (
                <Box>
                    {/* Static client info */}
                    <Card sx={{ borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', mb: 2 }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Stack direction="row" spacing={4} flexWrap="wrap">
                                <Box>
                                    <Typography variant="caption" sx={{ color: '#64748B' }}>Yaş</Typography>
                                    <Typography variant="body1" fontWeight={700}>
                                        {client.birthDate ? `${calculateAge(client.birthDate)} yaşında` : 'Belirtilmemiş'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: '#64748B' }}>Cinsiyet</Typography>
                                    <Typography variant="body1" fontWeight={700}>
                                        {genderLabel(client.gender)}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>

                    {/* Header + Add Button */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#334155' }}>
                            Ölçüm Kayıtları
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={openAddMeasurement}
                            sx={{
                                textTransform: 'none',
                                borderRadius: '12px',
                                px: 3,
                                fontWeight: 600,
                                boxShadow: 'none',
                                '&:hover': { boxShadow: '0 2px 8px rgba(15,118,110,0.3)' },
                            }}
                        >
                            Yeni Ölçüm Ekle
                        </Button>
                    </Box>

                    {/* Measurements Table */}
                    {measurements.length === 0 ? (
                        <Card sx={{ borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                            <CardContent sx={{ py: 6, textAlign: 'center' }}>
                                <FitnessCenterIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 1 }} />
                                <Typography variant="body1" color="text.secondary">
                                    Henüz ölçüm kaydı eklenmemiş.
                                </Typography>
                            </CardContent>
                        </Card>
                    ) : (
                        <TableContainer component={Paper} sx={{ borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                                        <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Tarih</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Boy (cm)</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Kilo (kg)</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: '#334155' }}>BMI</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Yağ Oranı (%)</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: '#334155' }} align="right">İşlem</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {measurements.map((m) => {
                                        const bmiStyle = bmiColor(m.bmiCategory);
                                        return (
                                            <TableRow key={m.id} hover>
                                                <TableCell>{new Date(m.date).toLocaleDateString('tr-TR')}</TableCell>
                                                <TableCell>{m.heightCm}</TableCell>
                                                <TableCell>{Number(m.weightKg).toFixed(1)}</TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {Number(m.bmi).toFixed(1)}
                                                        </Typography>
                                                        <Chip
                                                            label={m.bmiCategory}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: bmiStyle.bg,
                                                                color: bmiStyle.color,
                                                                fontWeight: 600,
                                                                fontSize: '0.7rem',
                                                                borderRadius: '8px',
                                                                height: 22,
                                                            }}
                                                        />
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    {m.bodyFatPercentage != null
                                                        ? `%${Number(m.bodyFatPercentage).toFixed(1)}`
                                                        : <Typography variant="body2" sx={{ color: '#94A3B8' }}>—</Typography>
                                                    }
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton size="small" onClick={() => setDeleteMeasureId(m.id)} sx={{ color: '#94A3B8' }}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            )}

            {/* ═══ Add/Edit Note Modal ═══ */}
            <Dialog
                open={noteModalOpen}
                onClose={() => setNoteModalOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        p: 1,
                    },
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                    {editingNote ? 'Notu Düzenle' : (noteForm.noteType === 'General' ? 'Genel Not Ekle' : 'Seans Notu Ekle')}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2.5} sx={{ mt: 1 }}>
                        <Chip
                            label={noteForm.noteType === 'General' ? 'Genel Not' : 'Seans Notu'}
                            size="small"
                            sx={{
                                width: 'fit-content',
                                bgcolor: noteForm.noteType === 'General' ? '#EFF6FF' : '#ECFDF5',
                                color: noteForm.noteType === 'General' ? '#2563EB' : '#059669',
                                fontWeight: 600,
                            }}
                        />

                        {noteForm.noteType === 'Session' && !editingNote && (
                            <TextField
                                select
                                label="Randevu Seçin"
                                value={noteForm.appointmentId}
                                onChange={(e) => setNoteForm({ ...noteForm, appointmentId: e.target.value })}
                                size="small"
                                fullWidth
                                helperText="Notu bağlamak istediğiniz geçmiş randevuyu seçin"
                            >
                                <MenuItem value="">Seçiniz...</MenuItem>
                                {pastAppointments.map((a) => (
                                    <MenuItem key={a.id} value={String(a.id)}>
                                        📅 {formatDateTime(a.startDateTime)} – {statusLabel(a.status)}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}

                        <TextField
                            label="Not İçeriği"
                            multiline
                            rows={5}
                            value={noteForm.content}
                            onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                            fullWidth
                            placeholder="Danışan hakkında notunuzu buraya yazabilirsiniz..."
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setNoteModalOpen(false)}
                        sx={{ textTransform: 'none', color: '#64748B' }}
                    >
                        İptal
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveNote}
                        disabled={saving || !noteForm.content.trim()}
                        sx={{
                            textTransform: 'none',
                            borderRadius: '10px',
                            px: 3,
                            fontWeight: 600,
                            boxShadow: 'none',
                        }}
                    >
                        {saving ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ═══ Delete Confirm Dialog ═══ */}
            <Dialog
                open={deleteConfirmId !== null}
                onClose={() => setDeleteConfirmId(null)}
                PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 700 }}>Notu Sil</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ color: '#475569' }}>
                        Bu notu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setDeleteConfirmId(null)}
                        sx={{ textTransform: 'none', color: '#64748B' }}
                    >
                        İptal
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => deleteConfirmId && handleDeleteNote(deleteConfirmId)}
                        sx={{ textTransform: 'none', borderRadius: '10px', fontWeight: 600, boxShadow: 'none' }}
                    >
                        Sil
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ═══ Add Measurement Modal ═══ */}
            <Dialog
                open={measureModalOpen}
                onClose={() => setMeasureModalOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                    Yeni Ölçüm Ekle
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2.5} sx={{ mt: 1 }}>
                        <TextField
                            type="date"
                            label="Tarih"
                            value={measureForm.date}
                            onChange={(e) => setMeasureForm({ ...measureForm, date: e.target.value })}
                            size="small"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            type="number"
                            label="Boy (cm)"
                            value={measureForm.heightCm}
                            onChange={(e) => setMeasureForm({ ...measureForm, heightCm: e.target.value })}
                            size="small"
                            fullWidth
                            placeholder="Örn: 175"
                            required
                        />
                        <TextField
                            type="number"
                            label="Kilo (kg)"
                            value={measureForm.weightKg}
                            onChange={(e) => setMeasureForm({ ...measureForm, weightKg: e.target.value })}
                            size="small"
                            fullWidth
                            placeholder="Örn: 72.5"
                            inputProps={{ step: '0.1' }}
                            required
                        />
                        <TextField
                            type="number"
                            label="Yağ Oranı (%) — Opsiyonel"
                            value={measureForm.bodyFatPercentage}
                            onChange={(e) => setMeasureForm({ ...measureForm, bodyFatPercentage: e.target.value })}
                            size="small"
                            fullWidth
                            placeholder="Örn: 18.5"
                            inputProps={{ step: '0.1' }}
                            helperText="Bu alan zorunlu değildir, boş bırakabilirsiniz"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setMeasureModalOpen(false)}
                        sx={{ textTransform: 'none', color: '#64748B' }}
                    >
                        İptal
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveMeasurement}
                        disabled={measureSaving || !measureForm.heightCm || !measureForm.weightKg}
                        sx={{
                            textTransform: 'none',
                            borderRadius: '10px',
                            px: 3,
                            fontWeight: 600,
                            boxShadow: 'none',
                        }}
                    >
                        {measureSaving ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ═══ Delete Measurement Confirm ═══ */}
            <Dialog
                open={deleteMeasureId !== null}
                onClose={() => setDeleteMeasureId(null)}
                PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 700 }}>Ölçümü Sil</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ color: '#475569' }}>
                        Bu ölçüm kaydını silmek istediğinizden emin misiniz?  Bu işlem geri alınamaz.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setDeleteMeasureId(null)}
                        sx={{ textTransform: 'none', color: '#64748B' }}
                    >
                        İptal
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => deleteMeasureId && handleDeleteMeasurement(deleteMeasureId)}
                        sx={{ textTransform: 'none', borderRadius: '10px', fontWeight: 600, boxShadow: 'none' }}
                    >
                        Sil
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
