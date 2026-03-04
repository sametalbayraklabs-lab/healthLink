'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { theme } from '@/lib/theme';
import { ChatProvider } from '@/contexts/ChatContext';
import ChatWidget from '@/components/chat/ChatWidget';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <AuthProvider>
                    <ChatProvider>
                        {children}
                        <ChatWidget />
                    </ChatProvider>
                </AuthProvider>
            </ThemeProvider>
        </AppRouterCacheProvider>
    );
}
