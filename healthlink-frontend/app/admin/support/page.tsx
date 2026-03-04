'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Chip,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    IconButton,
    TextField,
    Badge,
    Divider,
    List,
    ListItemButton,
    ListItemText,
    Tabs,
    Tab,
    Alert,
} from '@mui/material';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import SendIcon from '@mui/icons-material/Send';
import InboxIcon from '@mui/icons-material/Inbox';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import api from '@/lib/api';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';

interface SupportRequest {
    id: number;
    subject: string;
    description: string;
    status: string;
    createdAt: string;
    createdByUserId: number;
    operatorUserId: number | null;
    operatorName: string | null;
    requesterName: string;
    requesterEmail: string;
    requesterRole: string;
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

interface Operator {
    userId: number;
    name: string;
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

export default function AdminSupportPage() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<SupportRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [tab, setTab] = useState(0); // 0 = Havuz, 1 = Benim Taleplerim, 2 = Tümü

    // Operators
    const [operators, setOperators] = useState<Operator[]>([]);
    const [selectedOperator, setSelectedOperator] = useState<number | ''>('');

    // Chat panel
    const [activeRequest, setActiveRequest] = useState<SupportRequest | null>(null);
    const [messages, setMessages] = useState<SupportMsg[]>([]);
    const [msgLoading, setMsgLoading] = useState(false);
    const [newMsg, setNewMsg] = useState('');
    const [sending, setSending] = useState(false);
    const [assignError, setAssignError] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const activeRequestRef = useRef<SupportRequest | null>(null);

    const { onSupportMessage } = useChat();

    useEffect(() => {
        activeRequestRef.current = activeRequest;
    }, [activeRequest]);

    // Fetch operators list
    useEffect(() => {
        const fetchOps = async () => {
            try {
                const res = await api.get('/api/support-requests/operators');
                setOperators(res.data || []);
            } catch {
                // ignore
            }
        };
        fetchOps();
    }, []);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const params = statusFilter ? `?status=${statusFilter}` : '';
            const res = await api.get(`/api/support-requests${params}`);
            setRequests(res.data || []);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

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

    // Filter requests by tab
    const filteredRequests = requests.filter(req => {
        if (tab === 0) return req.operatorUserId === null; // Havuz
        if (tab === 1) return req.operatorUserId === user?.id; // Benim
        return true; // Tümü
    });

    // Set selectedOperator when activeRequest changes
    useEffect(() => {
        if (activeRequest) {
            setSelectedOperator(activeRequest.operatorUserId ?? '');
        }
    }, [activeRequest]);

    const handleAssign = async (reqId: number) => {
        setActionLoading(reqId);
        setAssignError('');
        try {
            const operatorUserId = selectedOperator === '' ? null : selectedOperator;
            const res = await api.post(`/api/support-requests/${reqId}/assign`, { operatorUserId });
            // Update the request locally
            setRequests(prev =>
                prev.map(r =>
                    r.id === reqId ? { ...r, operatorUserId: res.data.operatorUserId, operatorName: res.data.operatorName, status: res.data.status } : r
                )
            );
            if (activeRequest?.id === reqId) {
                setActiveRequest(prev => prev ? { ...prev, operatorUserId: res.data.operatorUserId, operatorName: res.data.operatorName, status: res.data.status } : null);
            }
        } catch (err: any) {
            setAssignError(err.response?.data?.error || 'Atama yapılamadı.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleStatusChange = async (id: number, newStatus: string) => {
        setActionLoading(id);
        try {
            await api.post(`/api/support-requests/${id}/status`, { status: newStatus });
            fetchRequests();
            if (activeRequest?.id === id) {
                setActiveRequest(prev => prev ? { ...prev, status: newStatus } : null);
            }
        } catch {
            // ignore
        } finally {
            setActionLoading(null);
        }
    };

    const openChat = async (req: SupportRequest) => {
        setActiveRequest(req);
        setAssignError('');
        setSelectedOperator(req.operatorUserId ?? '');
        if (req.operatorUserId === null) {
            // Pool item — don't load messages
            setMessages([]);
            return;
        }
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
            setMessages(prev => {
                if (prev.some(m => m.id === res.data.id)) return prev;
                return [...prev, { ...res.data, isMine: true, senderName: 'Destek Ekibi', senderRole: 'Admin' }];
            });
            setNewMsg('');
        } catch {
            // ignore
        } finally {
            setSending(false);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const isMyRequest = activeRequest?.operatorUserId === user?.id;
    const canMessage = activeRequest && isMyRequest && activeRequest.status !== 'Closed';

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Box
                        sx={{
                            width: 48, height: 48, borderRadius: 2,
                            bgcolor: 'error.main', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', color: 'white',
                        }}
                    >
                        <SupportAgentIcon />
                    </Box>
                    <Box>
                        <Typography variant="h5" fontWeight={700}>Destek Talepleri</Typography>
                        <Typography variant="body2" color="text.secondary">{requests.length} talep</Typography>
                    </Box>
                </Box>

                <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel>Durum Filtresi</InputLabel>
                    <Select value={statusFilter} label="Durum Filtresi" onChange={(e) => setStatusFilter(e.target.value)}>
                        <MenuItem value="">Tümü</MenuItem>
                        <MenuItem value="Open">Açık</MenuItem>
                        <MenuItem value="InProgress">İşlemde</MenuItem>
                        <MenuItem value="Closed">Kapalı</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Split Panel */}
            <Paper sx={{ borderRadius: 3, overflow: 'hidden', display: 'flex', minHeight: 600 }}>
                {/* Left: Request List */}
                <Box sx={{ width: 380, minWidth: 380, borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
                    <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tab label={
                            <Badge badgeContent={requests.filter(r => r.operatorUserId === null).length} color="error" max={99}>
                                <Box sx={{ pr: 1 }}>Havuz</Box>
                            </Badge>
                        } />
                        <Tab label={
                            <Badge badgeContent={requests.filter(r => r.operatorUserId === user?.id && r.status !== 'Closed').length} color="primary" max={99}>
                                <Box sx={{ pr: 1 }}>Taleplerim</Box>
                            </Badge>
                        } />
                        <Tab label="Tümü" />
                    </Tabs>

                    {loading ? (
                        <Box display="flex" justifyContent="center" py={4}><CircularProgress size={24} /></Box>
                    ) : filteredRequests.length === 0 ? (
                        <Box textAlign="center" py={4} px={2}>
                            <InboxIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                                {tab === 0 ? 'Havuzda talep yok.' : tab === 1 ? 'Üstlendiğiniz talep yok.' : 'Talep bulunamadı.'}
                            </Typography>
                        </Box>
                    ) : (
                        <List sx={{ overflowY: 'auto', flex: 1, p: 0 }}>
                            {filteredRequests.map((req) => (
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
                                                <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 200 }}>
                                                    {req.subject}
                                                </Typography>
                                                {req.unreadCount > 0 && (
                                                    <Badge badgeContent={req.unreadCount} color="error" sx={{ ml: 1 }} />
                                                )}
                                            </Box>
                                        }
                                        secondary={
                                            <Box mt={0.5}>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    {req.requesterName} • {req.requesterRole === 'Expert' ? 'Uzman' : 'Danışan'}
                                                </Typography>
                                                <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                                                    <Box display="flex" gap={0.5} alignItems="center">
                                                        <Chip
                                                            label={statusLabel[req.status] ?? req.status}
                                                            color={statusColor[req.status] ?? 'default'}
                                                            size="small"
                                                            sx={{ height: 20, fontSize: '0.7rem' }}
                                                        />
                                                        {req.operatorName && (
                                                            <Chip label={req.operatorName} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                                                        )}
                                                        {req.operatorUserId === null && (
                                                            <Chip label="Havuzda" size="small" variant="outlined" color="warning" sx={{ height: 20, fontSize: '0.7rem' }} />
                                                        )}
                                                    </Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(req.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        }
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    )}
                </Box>

                {/* Right: Chat / Assign Panel */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {!activeRequest ? (
                        <Box display="flex" alignItems="center" justifyContent="center" flex={1}>
                            <Box textAlign="center">
                                <SupportAgentIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 1 }} />
                                <Typography variant="body1" color="text.secondary">
                                    Bir talep seçerek detayları görüntüleyin
                                </Typography>
                            </Box>
                        </Box>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <Box sx={{ px: 3, py: 1.5, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={600}>{activeRequest.subject}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {activeRequest.requesterName} ({activeRequest.requesterRole === 'Expert' ? 'Uzman' : 'Danışan'}) • Talep #{activeRequest.id}
                                        </Typography>
                                    </Box>
                                    <Box display="flex" gap={1} alignItems="center">
                                        <Chip
                                            label={statusLabel[activeRequest.status] ?? activeRequest.status}
                                            color={statusColor[activeRequest.status] ?? 'default'}
                                            size="small"
                                        />
                                        {/* Status Actions (only for operator) */}
                                        {isMyRequest && activeRequest.status !== 'Closed' && (
                                            <Button size="small" variant="outlined" color="success"
                                                startIcon={actionLoading === activeRequest.id ? <CircularProgress size={14} /> : <CheckCircleIcon />}
                                                onClick={() => handleStatusChange(activeRequest.id, 'Closed')}
                                                disabled={actionLoading === activeRequest.id}
                                                sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.75rem' }}
                                            >Kapat</Button>
                                        )}
                                        {isMyRequest && activeRequest.status === 'Closed' && (
                                            <Button size="small" variant="outlined" color="warning"
                                                startIcon={actionLoading === activeRequest.id ? <CircularProgress size={14} /> : <ReplayIcon />}
                                                onClick={() => handleStatusChange(activeRequest.id, 'InProgress')}
                                                disabled={actionLoading === activeRequest.id}
                                                sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.75rem' }}
                                            >Tekrar Aç</Button>
                                        )}
                                    </Box>
                                </Box>
                            </Box>

                            {assignError && <Alert severity="error" sx={{ mx: 2, mt: 1 }}>{assignError}</Alert>}

                            {/* Operator Assignment Bar */}
                            <Box sx={{ px: 3, py: 1.5, bgcolor: 'info.50', borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <AssignmentIndIcon fontSize="small" color="action" />
                                <FormControl size="small" sx={{ minWidth: 200 }}>
                                    <InputLabel>Operatör</InputLabel>
                                    <Select
                                        value={selectedOperator}
                                        label="Operatör"
                                        onChange={(e) => setSelectedOperator(e.target.value as number | '')}
                                    >
                                        <MenuItem value="">
                                            <em>Atanmamış (Havuz)</em>
                                        </MenuItem>
                                        {operators.map(op => (
                                            <MenuItem key={op.userId} value={op.userId}>
                                                {op.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={actionLoading === activeRequest.id ? <CircularProgress size={14} color="inherit" /> : <PersonAddIcon />}
                                    onClick={() => handleAssign(activeRequest.id)}
                                    disabled={actionLoading === activeRequest.id}
                                    sx={{ borderRadius: 2, textTransform: 'none', whiteSpace: 'nowrap' }}
                                >
                                    Talebi Ata
                                </Button>
                            </Box>

                            {/* Request Description */}
                            <Box sx={{ px: 3, py: 1.5, bgcolor: 'warning.50', borderBottom: 1, borderColor: 'divider' }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>Talep Açıklaması</Typography>
                                <Typography variant="body2" sx={{ mt: 0.3, whiteSpace: 'pre-wrap' }}>
                                    {activeRequest.description}
                                </Typography>
                            </Box>

                            {/* Pool / Unclaimed state */}
                            {activeRequest.operatorUserId === null ? (
                                <Box display="flex" alignItems="center" justifyContent="center" flex={1}>
                                    <Box textAlign="center" px={4}>
                                        <PersonAddIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                                        <Typography variant="h6" color="text.secondary" gutterBottom>
                                            Bu talep henüz atanmadı
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Yukarıdaki operatör seçiminden bir kişi seçip &quot;Talebi Ata&quot; butonuna basın.
                                        </Typography>
                                    </Box>
                                </Box>
                            ) : (
                                <>
                                    {/* Messages */}
                                    <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        {msgLoading ? (
                                            <Box display="flex" justifyContent="center" py={4}><CircularProgress size={24} /></Box>
                                        ) : messages.length === 0 ? (
                                            <Box textAlign="center" py={4}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Henüz mesaj yok. İlk mesajı gönderin.
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
                                                        {msg.senderName} ({msg.senderRole === 'Admin' ? 'Destek' : msg.senderRole === 'Expert' ? 'Uzman' : 'Danışan'})
                                                    </Typography>
                                                    <Box
                                                        sx={{
                                                            px: 2, py: 1, borderRadius: 2,
                                                            bgcolor: msg.isMine ? 'primary.main' : 'grey.100',
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

                                    {/* Input */}
                                    <Divider />
                                    <Box sx={{ px: 2, py: 1.5, display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                                        {canMessage ? (
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
                                        ) : (
                                            <Typography variant="body2" color="text.secondary" sx={{ py: 1, textAlign: 'center', width: '100%' }}>
                                                {activeRequest.status === 'Closed' ? 'Bu talep kapatılmıştır.' : 'Bu talebin operatörü değilsiniz.'}
                                            </Typography>
                                        )}
                                    </Box>
                                </>
                            )}
                        </>
                    )}
                </Box>
            </Paper>
        </Container>
    );
}
