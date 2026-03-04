'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel, HubConnectionState } from '@microsoft/signalr';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107';

// ─── Types ───
interface MessageDto {
    id: number;
    conversationId: number;
    senderUserId: number;
    messageText: string;
    isRead: boolean;
    createdAt: string;
    isMine: boolean;
}

type NewMessageCallback = (message: MessageDto) => void;
type MessageReadCallback = (conversationId: number) => void;
type TypingCallback = (data: { conversationId: number; userId: number }) => void;

interface SupportMessageDto {
    id: number;
    supportRequestId: number;
    senderUserId: number;
    senderName: string;
    senderRole: string;
    messageText: string;
    createdAt: string;
    isMine: boolean;
}
type SupportMessageCallback = (message: SupportMessageDto) => void;

interface ChatContextType {
    /** Open chat widget with a specific expert (client side) */
    openChatWithExpert: (expertId: number) => void;
    /** Open chat widget with a specific client (expert side) */
    openChatWithClient: (clientId: number) => void;
    /** Internal state: pending target to open */
    pendingTarget: { type: 'expert' | 'client'; id: number } | null;
    /** Clear the pending target after ChatWidget handles it */
    clearPendingTarget: () => void;
    /** SignalR connection instance */
    connection: HubConnection | null;
    /** Whether the SignalR connection is active */
    isConnected: boolean;
    /** Send a message via SignalR hub */
    sendMessage: (conversationId: number, messageText: string) => Promise<MessageDto | null>;
    /** Mark messages as read via SignalR hub */
    markAsRead: (conversationId: number) => Promise<void>;
    /** Send typing indicator via SignalR hub (caller should debounce) */
    sendTyping: (conversationId: number, receiverUserId: number) => Promise<void>;
    /** Register a callback for new incoming messages */
    onNewMessage: (cb: NewMessageCallback) => () => void;
    /** Register a callback for message read events */
    onMessageRead: (cb: MessageReadCallback) => () => void;
    /** Register a callback for typing events */
    onTyping: (cb: TypingCallback) => () => void;
    /** Register a callback for support messages */
    onSupportMessage: (cb: SupportMessageCallback) => () => void;
}

const ChatContext = createContext<ChatContextType>({
    openChatWithExpert: () => { },
    openChatWithClient: () => { },
    pendingTarget: null,
    clearPendingTarget: () => { },
    connection: null,
    isConnected: false,
    sendMessage: async () => null,
    markAsRead: async () => { },
    sendTyping: async () => { },
    onNewMessage: () => () => { },
    onMessageRead: () => () => { },
    onTyping: () => () => { },
    onSupportMessage: () => () => { },
});

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [pendingTarget, setPendingTarget] = useState<{ type: 'expert' | 'client'; id: number } | null>(null);
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    // Callback registries (using refs to avoid re-render loops)
    const newMessageCallbacks = useRef<Set<NewMessageCallback>>(new Set());
    const messageReadCallbacks = useRef<Set<MessageReadCallback>>(new Set());
    const typingCallbacks = useRef<Set<TypingCallback>>(new Set());
    const supportMessageCallbacks = useRef<Set<SupportMessageCallback>>(new Set());

    const openChatWithExpert = useCallback((expertId: number) => {
        setPendingTarget({ type: 'expert', id: expertId });
    }, []);

    const openChatWithClient = useCallback((clientId: number) => {
        setPendingTarget({ type: 'client', id: clientId });
    }, []);

    const clearPendingTarget = useCallback(() => {
        setPendingTarget(null);
    }, []);

    // ─── SignalR Connection ───
    const { user } = useAuth();

    useEffect(() => {
        // Only connect when user is logged in
        if (!user) return;

        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (!token) return;

        let cancelled = false;

        const conn = new HubConnectionBuilder()
            .withUrl(`${API_BASE_URL}/chathub`, {
                accessTokenFactory: () => token,
            })
            .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
            .configureLogging(LogLevel.None) // Suppress internal SignalR logs
            .build();

        // Event listeners
        conn.on('ReceiveMessage', (message: MessageDto) => {
            newMessageCallbacks.current.forEach(cb => cb(message));
        });

        conn.on('MessageRead', (conversationId: number) => {
            messageReadCallbacks.current.forEach(cb => cb(conversationId));
        });

        conn.on('UserTyping', (data: { conversationId: number; userId: number }) => {
            typingCallbacks.current.forEach(cb => cb(data));
        });

        conn.on('ReceiveSupportMessage', (message: SupportMessageDto) => {
            supportMessageCallbacks.current.forEach(cb => cb(message));
        });

        conn.onreconnected(() => {
            if (!cancelled) {
                console.log('[SignalR] Reconnected');
                setIsConnected(true);
            }
        });

        conn.onclose(() => {
            if (!cancelled) {
                setIsConnected(false);
            }
        });

        // Delay start to avoid React StrictMode double-mount killing negotiation
        const startTimer = setTimeout(() => {
            conn.start()
                .then(() => {
                    if (!cancelled) {
                        console.log('[SignalR] Connected');
                        setIsConnected(true);
                        setConnection(conn);
                    } else {
                        conn.stop();
                    }
                })
                .catch(err => {
                    if (!cancelled) {
                        console.error('[SignalR] Connection failed:', err);
                    }
                });
        }, 100);

        return () => {
            cancelled = true;
            clearTimeout(startTimer);
            conn.stop().catch(() => { });
        };
    }, [user]); // Re-run when user logs in/out

    // ─── Hub Methods ───
    const sendMessage = useCallback(async (conversationId: number, messageText: string): Promise<MessageDto | null> => {
        if (!connection || connection.state !== HubConnectionState.Connected) {
            console.warn('[SignalR] Not connected, cannot send message');
            return null;
        }
        try {
            const result = await connection.invoke<MessageDto>('SendMessage', conversationId, messageText);
            return result;
        } catch (err) {
            console.error('[SignalR] SendMessage failed:', err);
            return null;
        }
    }, [connection]);

    const markAsRead = useCallback(async (conversationId: number): Promise<void> => {
        if (connection && connection.state === HubConnectionState.Connected) {
            try {
                await connection.invoke('MarkAsRead', conversationId);
                return;
            } catch (err) {
                console.error('[SignalR] MarkAsRead failed, falling back to REST:', err);
            }
        }
        // REST fallback
        try {
            await api.post(`/api/messages/conversations/${conversationId}/read`);
        } catch (err) {
            console.error('[REST] MarkAsRead failed:', err);
        }
    }, [connection]);

    const sendTyping = useCallback(async (conversationId: number, receiverUserId: number): Promise<void> => {
        if (!connection || connection.state !== HubConnectionState.Connected) return;
        try {
            await connection.invoke('SendTyping', conversationId, receiverUserId);
        } catch (err) {
            // Silently fail for typing indicators
        }
    }, [connection]);

    // ─── Callback Registration ───
    const onNewMessage = useCallback((cb: NewMessageCallback) => {
        newMessageCallbacks.current.add(cb);
        return () => { newMessageCallbacks.current.delete(cb); };
    }, []);

    const onMessageRead = useCallback((cb: MessageReadCallback) => {
        messageReadCallbacks.current.add(cb);
        return () => { messageReadCallbacks.current.delete(cb); };
    }, []);

    const onTyping = useCallback((cb: TypingCallback) => {
        typingCallbacks.current.add(cb);
        return () => { typingCallbacks.current.delete(cb); };
    }, []);

    const onSupportMessage = useCallback((cb: SupportMessageCallback) => {
        supportMessageCallbacks.current.add(cb);
        return () => { supportMessageCallbacks.current.delete(cb); };
    }, []);

    return (
        <ChatContext.Provider value={{
            openChatWithExpert, openChatWithClient, pendingTarget, clearPendingTarget,
            connection, isConnected,
            sendMessage, markAsRead, sendTyping,
            onNewMessage, onMessageRead, onTyping, onSupportMessage,
        }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    return useContext(ChatContext);
}
