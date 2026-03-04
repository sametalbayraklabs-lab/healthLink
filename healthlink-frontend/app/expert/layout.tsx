'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Box, AppBar, Toolbar, Button } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MessageIcon from '@mui/icons-material/Message';
import StarIcon from '@mui/icons-material/Star';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import BrandLogo from '@/components/BrandLogo';
import ExpertAvatarMenu from '@/components/avatar/ExpertAvatarMenu';

const ACCENT = '#1E8F8A';

export default function ExpertLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

    const menuItems = [
        { label: 'Panelim', path: '/expert/dashboard', icon: <DashboardIcon /> },
        { label: 'Profilim', path: '/expert/profile', icon: <PersonIcon /> },
        { label: 'Takvim', path: '/expert/calendar', icon: <CalendarMonthIcon /> },
        { label: 'Danışanlarım', path: '/expert/clients', icon: <PeopleIcon /> },
        { label: 'Randevular', path: '/expert/appointments', icon: <CalendarMonthIcon /> },
        { label: 'Mesajlar', path: '/expert/messages', icon: <MessageIcon /> },
        { label: 'Değerlendirmeler', path: '/expert/reviews', icon: <StarIcon /> },
    ];

    return (
        <ProtectedRoute allowedRoles={['Expert']}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                <AppBar
                    position="sticky"
                    sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.97)',
                        backdropFilter: 'blur(12px)',
                        color: 'text.primary',
                        boxShadow: '0 1px 3px rgba(30, 143, 138, 0.08)',
                        borderBottom: '1px solid #CCFBF1',
                        borderTop: `3px solid ${ACCENT}`,
                    }}
                >
                    <Toolbar sx={{ minHeight: { xs: 64, md: 68 } }}>
                        <BrandLogo size="md" />

                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 0.5, ml: 2 }}>
                            {menuItems.map((item) => (
                                <Button
                                    key={item.path}
                                    component={Link}
                                    href={item.path}
                                    startIcon={item.icon}
                                    sx={{
                                        textTransform: 'none',
                                        color: isActive(item.path) ? ACCENT : 'text.secondary',
                                        fontWeight: isActive(item.path) ? 600 : 450,
                                        borderRadius: 2,
                                        px: 1.5,
                                        '&:hover': {
                                            bgcolor: `${ACCENT}0F`,
                                            color: ACCENT,
                                        },
                                    }}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ExpertAvatarMenu />
                        </Box>
                    </Toolbar>
                </AppBar>

                <Box component="main" sx={{ flex: 1, bgcolor: 'background.default', overflow: 'auto' }}>
                    {children}
                </Box>
            </Box>
        </ProtectedRoute>
    );
}
