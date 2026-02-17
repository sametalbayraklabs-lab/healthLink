'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import {
    Box,
    IconButton,
    Badge,
    Paper,
    Typography,
    TextField,
    List,
    ListItemButton,
    ListItemText,
    Avatar,
    Divider,
    InputAdornment,
    CircularProgress,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
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

export default function ChatWidget() {
    const { user } = useAuth();
    const { pendingTarget, clearPendingTarget } = useChat();
    const [open, setOpen] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

    const fetchConversations = useCallback(async () => {
        try {
            const res = await api.get('/api/messages/conversations');
            setConversations(res.data || []);
        } catch (err) {
            console.error('Failed to fetch conversations:', err);
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

    // Handle pending target — when another page calls openChatWithExpert/openChatWithClient
    useEffect(() => {
        if (!pendingTarget) return;

        const startChat = async () => {
            try {
                let endpoint = '';
                if (pendingTarget.type === 'expert') {
                    endpoint = `/api/messages/start/${pendingTarget.id}`;
                } else {
                    endpoint = `/api/messages/start-with-client/${pendingTarget.id}`;
                }
                const res = await api.post(endpoint);
                const conv = res.data;
                setOpen(true);
                setActiveConversation(conv);
                await fetchConversations();
            } catch (err) {
                console.error('Failed to start conversation:', err);
            } finally {
                clearPendingTarget();
            }
        };

        startChat();
    }, [pendingTarget, clearPendingTarget, fetchConversations]);

    // Poll conversations list
    useEffect(() => {
        if (!user) return;
        fetchConversations();
        const interval = setInterval(fetchConversations, 5000);
        return () => clearInterval(interval);
    }, [user, fetchConversations]);

    // Poll active conversation messages
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

    // Scroll to bottom on new messages
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
            console.error('Failed to send message:', err);
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

    const formatTime = (dateStr?: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();
        if (isToday) {
            return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
    };

    if (!user) return null;

    return (
        <>
            {/* Floating Chat Button */}
            {!open && (
                <IconButton
                    onClick={() => setOpen(true)}
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        width: 56,
                        height: 56,
                        bgcolor: 'primary.main',
                        color: 'white',
                        boxShadow: 3,
                        zIndex: 1300,
                        '&:hover': { bgcolor: 'primary.dark' },
                    }}
                >
                    <Badge badgeContent={totalUnread} color="error">
                        <ChatIcon />
                    </Badge>
                </IconButton>
            )}

            {/* Chat Panel */}
            {open && (
                <Paper
                    elevation={8}
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        width: 370,
                        height: 500,
                        zIndex: 1300,
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 2,
                        overflow: 'hidden',
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            px: 2,
                            py: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Box display="flex" alignItems="center" gap={1}>
                            {activeConversation && (
                                <IconButton
                                    size="small"
                                    sx={{ color: 'white' }}
                                    onClick={() => setActiveConversation(null)}
                                >
                                    <ArrowBackIcon fontSize="small" />
                                </IconButton>
                            )}
                            <Typography variant="subtitle1" fontWeight={600}>
                                {activeConversation ? activeConversation.otherPartyName : 'Mesajlar'}
                            </Typography>
                        </Box>
                        <IconButton size="small" sx={{ color: 'white' }} onClick={() => setOpen(false)}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    {/* Content */}
                    {!activeConversation ? (
                        /* Conversation List */
                        <Box sx={{ flex: 1, overflowY: 'auto' }}>
                            {conversations.length === 0 ? (
                                <Box textAlign="center" py={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Henüz mesajınız yok
                                    </Typography>
                                </Box>
                            ) : (
                                <List disablePadding>
                                    {conversations.map((conv, idx) => (
                                        <Box key={conv.id}>
                                            <ListItemButton
                                                onClick={() => openConversation(conv)}
                                                sx={{
                                                    py: 1.5,
                                                    bgcolor: conv.unreadCount > 0 ? 'action.hover' : 'transparent',
                                                }}
                                            >
                                                <Avatar
                                                    sx={{
                                                        mr: 1.5,
                                                        width: 40,
                                                        height: 40,
                                                        bgcolor: 'primary.light',
                                                        fontSize: 16,
                                                    }}
                                                >
                                                    {conv.otherPartyName?.charAt(0)?.toUpperCase()}
                                                </Avatar>
                                                <ListItemText
                                                    primaryTypographyProps={{ component: 'div' }}
                                                    secondaryTypographyProps={{ component: 'div' }}
                                                    primary={
                                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                                            <Typography
                                                                variant="body2"
                                                                fontWeight={conv.unreadCount > 0 ? 700 : 400}
                                                                noWrap
                                                                sx={{ maxWidth: 180 }}
                                                            >
                                                                {conv.otherPartyName}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {formatTime(conv.lastMessageAt)}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                                noWrap
                                                                sx={{ maxWidth: 220 }}
                                                            >
                                                                {conv.lastMessage || 'Henüz mesaj yok'}
                                                            </Typography>
                                                            {conv.unreadCount > 0 && (
                                                                <Badge
                                                                    badgeContent={conv.unreadCount}
                                                                    color="primary"
                                                                    sx={{ ml: 1 }}
                                                                />
                                                            )}
                                                        </Box>
                                                    }
                                                />
                                            </ListItemButton>
                                            {idx < conversations.length - 1 && <Divider />}
                                        </Box>
                                    ))}
                                </List>
                            )}
                        </Box>
                    ) : (
                        /* Message Thread */
                        <>
                            <Box
                                sx={{
                                    flex: 1,
                                    overflowY: 'auto',
                                    px: 2,
                                    py: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 0.5,
                                    bgcolor: '#f5f5f5',
                                }}
                            >
                                {messages.length === 0 ? (
                                    <Box textAlign="center" py={4}>
                                        <Typography variant="body2" color="text.secondary">
                                            Henüz mesaj yok. İlk mesajı gönderin!
                                        </Typography>
                                    </Box>
                                ) : (
                                    messages.map((msg) => (
                                        <Box
                                            key={msg.id}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: msg.isMine ? 'flex-end' : 'flex-start',
                                                mb: 0.5,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    maxWidth: '75%',
                                                    px: 1.5,
                                                    py: 0.8,
                                                    borderRadius: msg.isMine
                                                        ? '12px 12px 2px 12px'
                                                        : '12px 12px 12px 2px',
                                                    bgcolor: msg.isMine ? 'primary.main' : 'white',
                                                    color: msg.isMine ? 'white' : 'text.primary',
                                                    boxShadow: 1,
                                                }}
                                            >
                                                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                                    {msg.messageText}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        display: 'block',
                                                        textAlign: 'right',
                                                        mt: 0.3,
                                                        opacity: 0.7,
                                                        fontSize: '0.65rem',
                                                    }}
                                                >
                                                    {formatTime(msg.createdAt)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </Box>

                            {/* Message Input */}
                            <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Mesajınızı yazın..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    multiline
                                    maxRows={3}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={handleSend}
                                                    disabled={!newMessage.trim() || sending}
                                                    color="primary"
                                                    size="small"
                                                >
                                                    {sending ? <CircularProgress size={20} /> : <SendIcon />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>
                        </>
                    )}
                </Paper>
            )}
        </>
    );
}
