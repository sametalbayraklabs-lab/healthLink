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
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" gutterBottom fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
                    Mesajlar
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Uzmanlarınızla mesajlaşın
                </Typography>
            </Box>

            <Paper
                elevation={0}
                sx={{
                    display: 'flex',
                    height: 'calc(100vh - 260px)',
                    overflow: 'hidden',
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'rgba(226, 232, 240, 0.7)',
                    boxShadow: '0 1px 4px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.04)',
                }}
            >
                {/* Left — Conversation List */}
                <Box sx={{
                    width: 340,
                    borderRight: '1px solid',
                    borderColor: 'rgba(226, 232, 240, 0.7)',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'rgba(248, 250, 252, 0.5)',
                }}>
                    <Box sx={{ p: 2 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Uzman Ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'white',
                                    borderRadius: 3,
                                },
                            }}
                        />
                    </Box>
                    <Divider sx={{ borderColor: 'rgba(226, 232, 240, 0.5)' }} />
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
                                            sx={{
                                                py: 1.5,
                                                px: 2,
                                                transition: 'all 0.15s ease',
                                                borderLeft: '3px solid transparent',
                                                ...(activeConversation?.id === conv.id ? {
                                                    bgcolor: 'rgba(30, 143, 138, 0.06)',
                                                    borderLeftColor: '#1E8F8A',
                                                } : {}),
                                                '&:hover': {
                                                    bgcolor: 'rgba(30, 143, 138, 0.04)',
                                                },
                                                '&.Mui-selected': {
                                                    bgcolor: 'rgba(30, 143, 138, 0.06)',
                                                    borderLeftColor: '#1E8F8A',
                                                    '&:hover': {
                                                        bgcolor: 'rgba(30, 143, 138, 0.08)',
                                                    },
                                                },
                                            }}
                                        >
                                            <Avatar sx={{
                                                mr: 1.5,
                                                width: 42,
                                                height: 42,
                                                bgcolor: activeConversation?.id === conv.id ? '#1E8F8A' : '#CBD5E1',
                                                fontSize: 16,
                                                fontWeight: 600,
                                                transition: 'background-color 0.2s ease',
                                            }}>
                                                {conv.otherPartyName?.charAt(0)?.toUpperCase()}
                                            </Avatar>
                                            <ListItemText
                                                primaryTypographyProps={{ component: 'div' }}
                                                secondaryTypographyProps={{ component: 'div' }}
                                                primary={
                                                    <Box display="flex" justifyContent="space-between">
                                                        <Typography variant="body2" fontWeight={conv.unreadCount > 0 ? 700 : 500} noWrap sx={{ maxWidth: 140, color: 'text.primary' }}>
                                                            {conv.otherPartyName}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                                            {formatTime(conv.lastMessageAt)}
                                                        </Typography>
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                                        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 180 }}>
                                                            {conv.lastMessage || 'Henüz mesaj yok'}
                                                        </Typography>
                                                        {conv.unreadCount > 0 && (
                                                            <Box sx={{
                                                                bgcolor: '#1E8F8A',
                                                                color: 'white',
                                                                borderRadius: '10px',
                                                                minWidth: 20,
                                                                height: 20,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '0.7rem',
                                                                fontWeight: 700,
                                                                px: 0.5,
                                                                ml: 1,
                                                            }}>
                                                                {conv.unreadCount}
                                                            </Box>
                                                        )}
                                                    </Box>
                                                }
                                            />
                                        </ListItemButton>
                                        {idx < filteredConversations.length - 1 && <Divider sx={{ borderColor: 'rgba(226, 232, 240, 0.4)' }} />}
                                    </Box>
                                ))}
                            </List>
                        )}
                    </Box>
                </Box>

                {/* Right — Messages */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
                    {!activeConversation ? (
                        <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
                            <Typography variant="body1" color="text.secondary">
                                Mesajlaşmak için sol panelden bir konuşma seçin
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <Box sx={{
                                px: 3,
                                py: 2,
                                borderBottom: '1px solid',
                                borderColor: 'rgba(226, 232, 240, 0.7)',
                                bgcolor: 'rgba(248, 250, 252, 0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                            }}>
                                <Avatar sx={{ width: 36, height: 36, bgcolor: '#1E8F8A', fontSize: 14, fontWeight: 600 }}>
                                    {activeConversation.otherPartyName?.charAt(0)?.toUpperCase()}
                                </Avatar>
                                <Typography variant="subtitle1" fontWeight={600}>
                                    {activeConversation.otherPartyName}
                                </Typography>
                            </Box>

                            {/* Messages */}
                            <Box sx={{
                                flex: 1,
                                overflowY: 'auto',
                                px: 3,
                                py: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 0.75,
                                bgcolor: '#FAFBFC',
                            }}>
                                {messages.length === 0 ? (
                                    <Box textAlign="center" py={4}>
                                        <Typography variant="body2" color="text.secondary">Henüz mesaj yok. İlk mesajı gönderin!</Typography>
                                    </Box>
                                ) : (
                                    messages.map((msg) => (
                                        <Box key={msg.id} sx={{ display: 'flex', justifyContent: msg.isMine ? 'flex-end' : 'flex-start', mb: 0.5 }}>
                                            <Box sx={{
                                                maxWidth: '60%',
                                                px: 2,
                                                py: 1,
                                                borderRadius: msg.isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                                bgcolor: msg.isMine ? '#1E8F8A' : 'white',
                                                color: msg.isMine ? 'white' : 'text.primary',
                                                boxShadow: msg.isMine
                                                    ? '0 2px 8px rgba(30, 143, 138, 0.2)'
                                                    : '0 1px 4px rgba(15, 23, 42, 0.06)',
                                                border: msg.isMine ? 'none' : '1px solid rgba(226, 232, 240, 0.5)',
                                            }}>
                                                <Typography variant="body2" sx={{ wordBreak: 'break-word', lineHeight: 1.5 }}>{msg.messageText}</Typography>
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
                            <Box sx={{
                                p: 2,
                                borderTop: '1px solid',
                                borderColor: 'rgba(226, 232, 240, 0.7)',
                                display: 'flex',
                                gap: 1,
                                bgcolor: 'white',
                            }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Mesajınızı yazın..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    multiline
                                    maxRows={3}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                        },
                                    }}
                                />
                                <IconButton
                                    onClick={handleSend}
                                    disabled={!newMessage.trim() || sending}
                                    sx={{
                                        bgcolor: !newMessage.trim() || sending ? 'rgba(226, 232, 240, 0.5)' : '#1E8F8A',
                                        color: !newMessage.trim() || sending ? 'text.disabled' : 'white',
                                        borderRadius: 3,
                                        width: 42,
                                        height: 42,
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            bgcolor: '#166E6A',
                                        },
                                        '&.Mui-disabled': {
                                            bgcolor: 'rgba(226, 232, 240, 0.5)',
                                            color: 'text.disabled',
                                        },
                                    }}
                                >
                                    {sending ? <CircularProgress size={20} sx={{ color: 'inherit' }} /> : <SendIcon sx={{ fontSize: 20 }} />}
                                </IconButton>
                            </Box>
                        </>
                    )}
                </Box>
            </Paper>
        </Container>
    );
}
