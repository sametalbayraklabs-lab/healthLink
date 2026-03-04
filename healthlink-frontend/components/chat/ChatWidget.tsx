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
    CircularProgress,
    InputAdornment,
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
    _tempId?: string; // For optimistic update sync
}

export default function ChatWidget() {
    const { user } = useAuth();
    const {
        pendingTarget, clearPendingTarget,
        sendMessage: hubSendMessage,
        markAsRead: hubMarkAsRead,
        sendTyping: hubSendTyping,
        onNewMessage, onMessageRead, onTyping,
        isConnected,
    } = useChat();

    const [open, setOpen] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [typingUserId, setTypingUserId] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const activeConvRef = useRef<Conversation | null>(null);

    // Keep ref in sync with state for use in callbacks
    useEffect(() => {
        activeConvRef.current = activeConversation;
    }, [activeConversation]);

    const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

    // ─── REST Fetchers (initial load & fallback) ───
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

    // ─── SignalR Event Listeners ───
    useEffect(() => {
        // ReceiveMessage: incoming message from the other party
        const unsubMsg = onNewMessage(async (msg) => {
            // If this message belongs to the active conversation, add it to messages
            if (activeConvRef.current && msg.conversationId === activeConvRef.current.id) {
                setMessages(prev => {
                    if (prev.some(m => m.id === msg.id)) return prev;
                    return [...prev, msg];
                });
                // Auto mark as read since user is viewing this conversation
                // IMPORTANT: await before fetching so server returns unreadCount=0
                await hubMarkAsRead(msg.conversationId);
                // Locally zero out badge for this conversation immediately
                setConversations(prev =>
                    prev.map(c =>
                        c.id === msg.conversationId
                            ? { ...c, unreadCount: 0, lastMessage: msg.messageText, lastMessageAt: msg.createdAt }
                            : c
                    )
                );
                return; // skip full re-fetch, we updated locally
            }
            // Message is for a different conversation — re-fetch to update badges
            fetchConversations();
        });

        // MessageRead: other party read our messages
        const unsubRead = onMessageRead((conversationId) => {
            // Mark all messages in this conversation as read
            setMessages(prev =>
                prev.map(m =>
                    m.conversationId === conversationId && m.isMine
                        ? { ...m, isRead: true }
                        : m
                )
            );
            fetchConversations();
        });

        // UserTyping: other party is typing
        const unsubTyping = onTyping((data) => {
            if (activeConvRef.current && data.conversationId === activeConvRef.current.id) {
                setTypingUserId(data.userId);
                // Clear typing indicator after 2.5s
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => {
                    setTypingUserId(null);
                }, 2500);
            }
        });

        return () => {
            unsubMsg();
            unsubRead();
            unsubTyping();
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [onNewMessage, onMessageRead, onTyping, hubMarkAsRead, fetchConversations]);

    // ─── Handle pending target (from other pages) ───
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

    // ─── Load conversations on mount ───
    useEffect(() => {
        if (!user) return;
        fetchConversations();
    }, [user, fetchConversations]);

    // ─── Load messages when opening a conversation ───
    useEffect(() => {
        if (!activeConversation) return;

        const openConv = async () => {
            await fetchMessages(activeConversation.id);
            // Mark as read (uses SignalR with REST fallback)
            await hubMarkAsRead(activeConversation.id);
            // Locally zero out badge immediately
            setConversations(prev =>
                prev.map(c =>
                    c.id === activeConversation.id ? { ...c, unreadCount: 0 } : c
                )
            );
        };

        openConv();
    }, [activeConversation, fetchMessages, hubMarkAsRead]);

    // ─── Fallback polling (slow, only when SignalR is disconnected) ───
    useEffect(() => {
        if (isConnected || !user) return; // No polling when SignalR is active
        const interval = setInterval(() => {
            fetchConversations();
            if (activeConvRef.current) {
                fetchMessages(activeConvRef.current.id);
            }
        }, 8000);
        return () => clearInterval(interval);
    }, [isConnected, user, fetchConversations, fetchMessages]);

    // ─── Scroll to bottom on new messages ───
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ─── Send Message (optimistic update + hub) ───
    const handleSend = async () => {
        if (!newMessage.trim() || !activeConversation || sending) return;
        setSending(true);

        const tempId = `temp_${Date.now()}`;
        const optimisticMsg: Message = {
            id: -1,
            conversationId: activeConversation.id,
            senderUserId: 0, // will be overwritten
            messageText: newMessage.trim(),
            isRead: false,
            createdAt: new Date().toISOString(),
            isMine: true,
            _tempId: tempId,
        };

        // Optimistic: show message immediately
        setMessages(prev => [...prev, optimisticMsg]);
        const text = newMessage.trim();
        setNewMessage('');

        try {
            // Try SignalR first, fall back to REST
            let result = await hubSendMessage(activeConversation.id, text);

            if (!result) {
                // Fallback to REST if hub is not connected
                const res = await api.post('/api/messages/send', {
                    conversationId: activeConversation.id,
                    messageText: text,
                });
                result = res.data;
            }

            if (result) {
                // Replace optimistic message with real one (sync IDs)
                setMessages(prev =>
                    prev.map(m =>
                        m._tempId === tempId
                            ? { ...result!, isMine: true, _tempId: undefined }
                            : m
                    )
                );
            }

            fetchConversations();
        } catch (err) {
            console.error('Failed to send message:', err);
            // Remove optimistic message on failure
            setMessages(prev => prev.filter(m => m._tempId !== tempId));
            setNewMessage(text); // Restore the message
        } finally {
            setSending(false);
        }
    };

    // ─── Typing Indicator (debounced at 2s) ───
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);

        if (!activeConversation) return;

        // Debounce typing event: only send once every 2 seconds
        if (!typingDebounceRef.current) {
            // Determine the other user's ID
            const otherUserId = getOtherUserId();
            if (otherUserId) {
                hubSendTyping(activeConversation.id, otherUserId);
            }

            typingDebounceRef.current = setTimeout(() => {
                typingDebounceRef.current = null;
            }, 2000);
        }
    };

    // ─── Helper: Get other user's userId from conversation ───
    const getOtherUserId = (): number | null => {
        // This is used for typing events. We can't easily determine the other user's
        // userId from conversation data (which has clientId/expertId, not userIds).
        // As a workaround, we look at previous messages from the other party.
        if (!activeConversation) return null;
        const otherMsg = messages.find(m => !m.isMine);
        return otherMsg?.senderUserId ?? null;
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const openConversation = (conv: Conversation) => {
        setActiveConversation(conv);
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
                            <Box>
                                <Typography variant="subtitle1" fontWeight={600}>
                                    {activeConversation ? activeConversation.otherPartyName : 'Mesajlar'}
                                </Typography>
                                {activeConversation && typingUserId && (
                                    <Typography variant="caption" sx={{ opacity: 0.85, fontStyle: 'italic' }}>
                                        Yazıyor...
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                            {/* Connection indicator */}
                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: isConnected ? '#4CAF50' : '#FF9800',
                                    mr: 0.5,
                                }}
                            />
                            <IconButton size="small" sx={{ color: 'white' }} onClick={() => setOpen(false)}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
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
                                    messages.map((msg, idx) => (
                                        <Box
                                            key={msg._tempId || msg.id || idx}
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
                                                    opacity: msg._tempId ? 0.7 : 1, // Dim optimistic messages
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
                                    onChange={handleInputChange}
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
                </Paper >
            )
            }
        </>
    );
}
