'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MessageIcon from '@mui/icons-material/Message';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ClientAvatarMenu from '@/components/avatar/ClientAvatarMenu';
import ChatWidget from '@/components/chat/ChatWidget';
import BrandLogo from '@/components/BrandLogo';
import { ChatProvider } from '@/contexts/ChatContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const menuItems = [
        { label: 'Panelim', path: '/client/dashboard', icon: <DashboardIcon /> },
        { label: 'Paketler', path: '/client/packages', icon: <LocalHospitalIcon /> },
        { label: 'Randevularım', path: '/client/appointments', icon: <CalendarMonthIcon /> },
        { label: 'Uzmanlarım', path: '/client/my-experts', icon: <FavoriteIcon /> },
        { label: 'Mesajlar', path: '/client/messages', icon: <MessageIcon /> },
    ];

    const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

    return (
        <ProtectedRoute allowedRoles={['Client', 'Expert', 'Admin']}>
            <ChatProvider>
                <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <AppBar
                        position="sticky"
                        sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.97)',
                            backdropFilter: 'blur(12px)',
                            color: 'text.primary',
                            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            borderTop: '3px solid #1E8F8A',
                        }}
                    >
                        <Toolbar sx={{ minHeight: { xs: 64, md: 68 } }}>
                            <BrandLogo size="md" />

                            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
                                {menuItems.map((item) => (
                                    <Button
                                        key={item.path}
                                        component={Link}
                                        href={item.path}
                                        startIcon={item.icon}
                                        sx={{
                                            textTransform: 'none',
                                            color: isActive(item.path) ? 'primary.main' : 'text.secondary',
                                            fontWeight: isActive(item.path) ? 600 : 450,
                                            borderRadius: 2,
                                            px: 1.5,
                                            position: 'relative',
                                            '&::after': isActive(item.path) ? {
                                                content: '""',
                                                position: 'absolute',
                                                bottom: 6,
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                width: 20,
                                                height: 3,
                                                borderRadius: 2,
                                                bgcolor: 'primary.main',
                                            } : {},
                                            '&:hover': {
                                                bgcolor: 'rgba(30, 143, 138, 0.06)',
                                                color: 'primary.main',
                                            },
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        {item.label}
                                    </Button>
                                ))}
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <ClientAvatarMenu />
                            </Box>
                        </Toolbar>
                    </AppBar>

                    <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: { xs: 2, md: 3 } }}>
                        {children}
                    </Box>
                    <ChatWidget />
                </Box>
            </ChatProvider>
        </ProtectedRoute>
    );
}
