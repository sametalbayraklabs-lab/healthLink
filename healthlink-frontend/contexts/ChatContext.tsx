'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface ChatContextType {
    /** Open chat widget with a specific expert (client side — uses expertId from DB) */
    openChatWithExpert: (expertId: number) => void;
    /** Open chat widget with a specific client (expert side — uses clientId from DB) */
    openChatWithClient: (clientId: number) => void;
    /** Internal state: pending target to open */
    pendingTarget: { type: 'expert' | 'client'; id: number } | null;
    /** Clear the pending target after ChatWidget handles it */
    clearPendingTarget: () => void;
}

const ChatContext = createContext<ChatContextType>({
    openChatWithExpert: () => { },
    openChatWithClient: () => { },
    pendingTarget: null,
    clearPendingTarget: () => { },
});

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [pendingTarget, setPendingTarget] = useState<{ type: 'expert' | 'client'; id: number } | null>(null);

    const openChatWithExpert = useCallback((expertId: number) => {
        setPendingTarget({ type: 'expert', id: expertId });
    }, []);

    const openChatWithClient = useCallback((clientId: number) => {
        setPendingTarget({ type: 'client', id: clientId });
    }, []);

    const clearPendingTarget = useCallback(() => {
        setPendingTarget(null);
    }, []);

    return (
        <ChatContext.Provider value={{ openChatWithExpert, openChatWithClient, pendingTarget, clearPendingTarget }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    return useContext(ChatContext);
}
