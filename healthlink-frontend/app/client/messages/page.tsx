'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Container,
    Typography,
    Box,
    Paper,
    TextField,
    InputAdornment,
    List,
    ListItemButton,
    ListItemText,
    Avatar,
    Divider,
    Badge,
    IconButton,
    CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import api from '@/lib/api';
import { useChat } from '@/contexts/ChatContext';

interface Conversation {
    id: number;
    clientId: number;
    expertId: number;
    otherPartyName: string;
    lastMessage?: string;
    lastMessageAt?: string;
    unreadCount: number;
}

interface Message {
    id: number;
    conversationId: number;
    senderUserId: number;
    messageText: string;
    isRead: boolean;
    createdAt: string;
    isMine: boolean;
}

export default function ClientMessagesPage() {
    const searchParams = useSearchParams();
    const expertIdParam = searchParams.get('expertId');
    const { openChatWithExpert } = useChat();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollRef = useRef<NodeJS.Timeout | null>(null);
    const handledExpertId = useRef(false);

    const fetchConversations = useCallback(async () => {
        try {
            const res = await api.get('/api/messages/conversations');
            setConversations(res.data || []);
        } catch (err) {
            console.error('Failed to fetch conversations:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMessages = useCallback(async (convId: number) => {
        try {
            const res = await api.get(`/api/messages/conversations/${convId}`);
            setMessages(res.data || []);
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        }
    }, []);

    // Auto-open chat from URL param (e.g., from expert profile page)
    useEffect(() => {
        if (expertIdParam && !handledExpertId.current) {
            handledExpertId.current = true;
            openChatWithExpert(Number(expertIdParam));
        }
    }, [expertIdParam, openChatWithExpert]);

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 5000);
        return () => clearInterval(interval);
    }, [fetchConversations]);

    useEffect(() => {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
        if (!activeConversation) return;

        fetchMessages(activeConversation.id);
        api.post(`/api/messages/conversations/${activeConversation.id}/read`).catch(() => { });

        pollRef.current = setInterval(() => {
            fetchMessages(activeConversation.id);
        }, 3000);

        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [activeConversation, fetchMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() || !activeConversation || sending) return;
        setSending(true);
        try {
            await api.post('/api/messages/send', {
                conversationId: activeConversation.id,
                messageText: newMessage.trim(),
            });
            setNewMessage('');
            await fetchMessages(activeConversation.id);
            await fetchConversations();
        } catch (err) {
            console.error('Failed to send:', err);
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const openConversation = (conv: Conversation) => {
        setActiveConversation(conv);
        api.post(`/api/messages/conversations/${conv.id}/read`).catch(() => { });
    };

    const filteredConversations = conversations.filter((c) =>
        c.otherPartyName.toLowerCase().includes(search.toLowerCase())
    );

    const formatTime = (dateStr?: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();
        if (isToday) {
            return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom fontWeight={600}>
                Mesajlar
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Uzmanlarınızla mesajlaşın
            </Typography>

            <Paper elevation={2} sx={{ display: 'flex', height: 'calc(100vh - 250px)', overflow: 'hidden', borderRadius: 2 }}>
                {/* Left — Conversation List */}
                <Box sx={{ width: 320, borderRight: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ p: 1.5 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Uzman Ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                    <Divider />
                    <Box sx={{ flex: 1, overflowY: 'auto' }}>
                        {loading ? (
                            <Box display="flex" justifyContent="center" py={4}><CircularProgress size={24} /></Box>
                        ) : filteredConversations.length === 0 ? (
                            <Box textAlign="center" py={4}>
                                <Typography variant="body2" color="text.secondary">
                                    {search ? 'Aramanıza uygun mesaj bulunamadı' : 'Henüz mesajınız yok'}
                                </Typography>
                            </Box>
                        ) : (
                            <List disablePadding>
                                {filteredConversations.map((conv, idx) => (
                                    <Box key={conv.id}>
                                        <ListItemButton
                                            selected={activeConversation?.id === conv.id}
                                            onClick={() => openConversation(conv)}
                                            sx={{ py: 1.5 }}
                                        >
                                            <Avatar sx={{ mr: 1.5, width: 40, height: 40, bgcolor: 'primary.light', fontSize: 16 }}>
                                                {conv.otherPartyName?.charAt(0)?.toUpperCase()}
                                            </Avatar>
                                            <ListItemText
                                                primaryTypographyProps={{ component: 'div' }}
                                                secondaryTypographyProps={{ component: 'div' }}
                                                primary={
                                                    <Box display="flex" justifyContent="space-between">
                                                        <Typography variant="body2" fontWeight={conv.unreadCount > 0 ? 700 : 400} noWrap sx={{ maxWidth: 140 }}>
                                                            {conv.otherPartyName}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {formatTime(conv.lastMessageAt)}
                                                        </Typography>
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                                        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 180 }}>
                                                            {conv.lastMessage || 'Henüz mesaj yok'}
                                                        </Typography>
                                                        {conv.unreadCount > 0 && <Badge badgeContent={conv.unreadCount} color="primary" sx={{ ml: 1 }} />}
                                                    </Box>
                                                }
                                            />
                                        </ListItemButton>
                                        {idx < filteredConversations.length - 1 && <Divider />}
                                    </Box>
                                ))}
                            </List>
                        )}
                    </Box>
                </Box>

                {/* Right — Messages */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {!activeConversation ? (
                        <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
                            <Typography variant="body1" color="text.secondary">
                                Mesajlaşmak için sol panelden bir konuşma seçin
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
                                <Typography variant="subtitle1" fontWeight={600}>
                                    {activeConversation.otherPartyName}
                                </Typography>
                            </Box>

                            {/* Messages */}
                            <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 1, display: 'flex', flexDirection: 'column', gap: 0.5, bgcolor: '#fafafa' }}>
                                {messages.length === 0 ? (
                                    <Box textAlign="center" py={4}>
                                        <Typography variant="body2" color="text.secondary">Henüz mesaj yok. İlk mesajı gönderin!</Typography>
                                    </Box>
                                ) : (
                                    messages.map((msg) => (
                                        <Box key={msg.id} sx={{ display: 'flex', justifyContent: msg.isMine ? 'flex-end' : 'flex-start', mb: 0.5 }}>
                                            <Box sx={{
                                                maxWidth: '60%', px: 1.5, py: 0.8,
                                                borderRadius: msg.isMine ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                                                bgcolor: msg.isMine ? 'primary.main' : 'white',
                                                color: msg.isMine ? 'white' : 'text.primary',
                                                boxShadow: 1,
                                            }}>
                                                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>{msg.messageText}</Typography>
                                                <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.3, opacity: 0.7, fontSize: '0.65rem' }}>
                                                    {formatTime(msg.createdAt)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </Box>

                            {/* Input */}
                            <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Mesajınızı yazın..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    multiline
                                    maxRows={3}
                                />
                                <IconButton onClick={handleSend} disabled={!newMessage.trim() || sending} color="primary">
                                    {sending ? <CircularProgress size={20} /> : <SendIcon />}
                                </IconButton>
                            </Box>
                        </>
                    )}
                </Box>
            </Paper>
        </Container>
    );
}
