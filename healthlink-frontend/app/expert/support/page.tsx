'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    Chip,
    Divider,
    CircularProgress,
    Alert,
    IconButton,
    Badge,
    List,
    ListItemButton,
    ListItemText,
} from '@mui/material';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import InboxIcon from '@mui/icons-material/Inbox';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import api from '@/lib/api';
import { useChat } from '@/contexts/ChatContext';

interface SupportRequest {
    id: number;
    subject: string;
    description: string;
    status: string;
    createdAt: string;
    operatorUserId: number | null;
    unreadCount: number;
}

interface SupportMsg {
    id: number;
    senderUserId: number;
    senderName: string;
    senderRole: string;
    messageText: string;
    isRead: boolean;
    createdAt: string;
    isMine: boolean;
}

const statusLabel: Record<string, string> = {
    Open: 'Açık',
    InProgress: 'İşlemde',
    Closed: 'Kapalı',
};

const statusColor: Record<string, 'warning' | 'info' | 'default'> = {
    Open: 'warning',
    InProgress: 'info',
    Closed: 'default',
};

export default function ExpertSupportPage() {
    // New request form
    const [showForm, setShowForm] = useState(false);
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Request list & chat
    const [requests, setRequests] = useState<SupportRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeRequest, setActiveRequest] = useState<SupportRequest | null>(null);
    const [messages, setMessages] = useState<SupportMsg[]>([]);
    const [msgLoading, setMsgLoading] = useState(false);
    const [newMsg, setNewMsg] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const activeRequestRef = useRef<SupportRequest | null>(null);

    const { onSupportMessage } = useChat();

    useEffect(() => {
        activeRequestRef.current = activeRequest;
    }, [activeRequest]);

    const fetchRequests = useCallback(async () => {
        try {
            const res = await api.get('/api/support-requests/my');
            setRequests(res.data || []);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    // SignalR: listen for real-time support messages
    useEffect(() => {
        const unsub = onSupportMessage((msg) => {
            const active = activeRequestRef.current;
            if (active && msg.supportRequestId === active.id) {
                setMessages(prev => {
                    if (prev.some(m => m.id === msg.id)) return prev;
                    return [...prev, { ...msg, isRead: false }];
                });
                setRequests(prev =>
                    prev.map(r =>
                        r.id === msg.supportRequestId ? { ...r, unreadCount: 0 } : r
                    )
                );
            } else {
                setRequests(prev =>
                    prev.map(r =>
                        r.id === msg.supportRequestId ? { ...r, unreadCount: (r.unreadCount || 0) + 1 } : r
                    )
                );
            }
        });
        return unsub;
    }, [onSupportMessage]);

    const openChat = async (req: SupportRequest) => {
        setActiveRequest(req);
        setMsgLoading(true);
        try {
            const res = await api.get(`/api/support-requests/${req.id}/messages`);
            setMessages(res.data || []);
            setRequests(prev =>
                prev.map(r => r.id === req.id ? { ...r, unreadCount: 0 } : r)
            );
        } catch {
            setMessages([]);
        } finally {
            setMsgLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!activeRequest || !newMsg.trim()) return;
        setSending(true);
        try {
            const res = await api.post(`/api/support-requests/${activeRequest.id}/messages`, {
                messageText: newMsg.trim(),
            });
            setMessages(prev => [...prev, { ...res.data, isMine: true, senderName: 'Ben', senderRole: 'Expert' }]);
            setNewMsg('');
        } catch {
            // ignore
        } finally {
            setSending(false);
        }
    };

    const handleSubmit = async () => {
        if (!subject.trim() || !description.trim()) return;
        setSubmitting(true);
        setError('');
        try {
            await api.post('/api/support-requests', { subject, description });
            setSubject('');
            setDescription('');
            setSuccess(true);
            setShowForm(false);
            fetchRequests();
            setTimeout(() => setSuccess(false), 4000);
        } catch {
            setError('Talep gönderilemedi. Lütfen tekrar deneyin.');
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Box
                        sx={{
                            width: 48, height: 48, borderRadius: 2,
                            bgcolor: 'secondary.main', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', color: 'white',
                        }}
                    >
                        <SupportAgentIcon />
                    </Box>
                    <Box>
                        <Typography variant="h5" fontWeight={700}>Online Destek</Typography>
                        <Typography variant="body2" color="text.secondary">Ekibimiz en kısa sürede size ulaşacak</Typography>
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setShowForm(!showForm)}
                    sx={{ borderRadius: 2 }}
                >
                    Yeni Talep
                </Button>
            </Box>

            {success && <Alert severity="success" sx={{ mb: 2 }}>Talebiniz alındı! Ekibimiz en kısa sürede size ulaşacak.</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* New Request Form */}
            {showForm && (
                <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                    <Typography variant="h6" fontWeight={600} mb={2}>Yeni Destek Talebi</Typography>
                    <TextField fullWidth label="Konu" placeholder="Talebinizin konusunu kısaca belirtin"
                        value={subject} onChange={(e) => setSubject(e.target.value)} sx={{ mb: 2 }}
                    />
                    <TextField fullWidth label="Açıklama" placeholder="Sorununuzu veya talebinizi detaylı açıklayın..."
                        value={description} onChange={(e) => setDescription(e.target.value)}
                        multiline rows={3} sx={{ mb: 2 }}
                    />
                    <Box display="flex" gap={1}>
                        <Button variant="contained"
                            endIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                            onClick={handleSubmit}
                            disabled={!subject.trim() || !description.trim() || submitting}
                            sx={{ borderRadius: 2 }}
                        >
                            Gönder
                        </Button>
                        <Button variant="outlined" onClick={() => setShowForm(false)} sx={{ borderRadius: 2 }}>
                            İptal
                        </Button>
                    </Box>
                </Paper>
            )}

            {/* Split Panel Layout */}
            <Paper sx={{ borderRadius: 3, overflow: 'hidden', display: 'flex', minHeight: 500 }}>
                {/* Left: Request List */}
                <Box sx={{ width: 320, minWidth: 320, borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ px: 2, py: 1.5, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
                        <Typography variant="subtitle2" fontWeight={600}>Taleplerim ({requests.length})</Typography>
                    </Box>
                    {loading ? (
                        <Box display="flex" justifyContent="center" py={4}><CircularProgress size={24} /></Box>
                    ) : requests.length === 0 ? (
                        <Box textAlign="center" py={4} px={2}>
                            <InboxIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                                Henüz destek talebiniz yok
                            </Typography>
                        </Box>
                    ) : (
                        <List sx={{ overflowY: 'auto', flex: 1, p: 0 }}>
                            {requests.map((req) => (
                                <ListItemButton
                                    key={req.id}
                                    selected={activeRequest?.id === req.id}
                                    onClick={() => openChat(req)}
                                    sx={{
                                        py: 1.5, px: 2,
                                        borderBottom: 1, borderColor: 'divider',
                                        '&.Mui-selected': { bgcolor: 'primary.50' },
                                    }}
                                >
                                    <ListItemText
                                        secondaryTypographyProps={{ component: 'div' }}
                                        primary={
                                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                                <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 180 }}>
                                                    {req.subject}
                                                </Typography>
                                                {req.unreadCount > 0 && (
                                                    <Badge badgeContent={req.unreadCount} color="error" sx={{ ml: 1 }} />
                                                )}
                                            </Box>
                                        }
                                        secondary={
                                            <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                                                <Chip
                                                    label={statusLabel[req.status] ?? req.status}
                                                    color={statusColor[req.status] ?? 'default'}
                                                    size="small"
                                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                                />
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(req.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    )}
                </Box>

                {/* Right: Chat Panel */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {!activeRequest ? (
                        <Box display="flex" alignItems="center" justifyContent="center" flex={1}>
                            <Box textAlign="center">
                                <SupportAgentIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 1 }} />
                                <Typography variant="body1" color="text.secondary">
                                    Bir talep seçerek mesajları görüntüleyin
                                </Typography>
                            </Box>
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ px: 3, py: 1.5, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={600}>{activeRequest.subject}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Talep #{activeRequest.id}
                                    </Typography>
                                </Box>
                                <Chip
                                    label={statusLabel[activeRequest.status] ?? activeRequest.status}
                                    color={statusColor[activeRequest.status] ?? 'default'}
                                    size="small"
                                />
                            </Box>

                            <Box sx={{ px: 3, py: 1.5, bgcolor: 'secondary.50', borderBottom: 1, borderColor: 'divider' }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>Talep Açıklaması</Typography>
                                <Typography variant="body2" sx={{ mt: 0.3, whiteSpace: 'pre-wrap' }}>
                                    {activeRequest.description}
                                </Typography>
                            </Box>

                            <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {msgLoading ? (
                                    <Box display="flex" justifyContent="center" py={4}><CircularProgress size={24} /></Box>
                                ) : messages.length === 0 ? (
                                    <Box textAlign="center" py={4}>
                                        <Typography variant="body2" color="text.secondary">
                                            Henüz mesaj yok. Destek ekibi talebinizi inceliyor.
                                        </Typography>
                                    </Box>
                                ) : (
                                    messages.map((msg) => (
                                        <Box
                                            key={msg.id}
                                            sx={{
                                                display: 'flex', flexDirection: 'column',
                                                alignItems: msg.isMine ? 'flex-end' : 'flex-start',
                                                maxWidth: '75%',
                                                alignSelf: msg.isMine ? 'flex-end' : 'flex-start',
                                            }}
                                        >
                                            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.3, px: 1 }}>
                                                {msg.isMine ? 'Ben' : `${msg.senderName} (Destek)`}
                                            </Typography>
                                            <Box
                                                sx={{
                                                    px: 2, py: 1, borderRadius: 2,
                                                    bgcolor: msg.isMine ? 'secondary.main' : 'grey.100',
                                                    color: msg.isMine ? 'white' : 'text.primary',
                                                }}
                                            >
                                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                                    {msg.messageText}
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.3, px: 1 }}>
                                                {new Date(msg.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                            </Typography>
                                        </Box>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </Box>

                            <Divider />
                            <Box sx={{ px: 2, py: 1.5, display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                                {activeRequest.operatorUserId === null ? (
                                    <Box display="flex" alignItems="center" gap={1} sx={{ py: 1, width: '100%', justifyContent: 'center' }}>
                                        <HourglassEmptyIcon fontSize="small" color="disabled" />
                                        <Typography variant="body2" color="text.secondary">
                                            Talebiniz havuzda bekliyor. Bir operatör atandığında mesaj gönderebilirsiniz.
                                        </Typography>
                                    </Box>
                                ) : activeRequest.status === 'Closed' ? (
                                    <Typography variant="body2" color="text.secondary" sx={{ py: 1, textAlign: 'center', width: '100%' }}>
                                        Bu talep kapatılmıştır.
                                    </Typography>
                                ) : (
                                    <>
                                        <TextField
                                            fullWidth size="small"
                                            placeholder="Mesajınızı yazın..."
                                            value={newMsg}
                                            onChange={(e) => setNewMsg(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                                            multiline maxRows={3} disabled={sending}
                                        />
                                        <IconButton color="primary" onClick={sendMessage} disabled={sending || !newMsg.trim()}>
                                            {sending ? <CircularProgress size={20} /> : <SendIcon />}
                                        </IconButton>
                                    </>
                                )}
                            </Box>
                        </>
                    )}
                </Box>
            </Paper>
        </Container>
    );
}
