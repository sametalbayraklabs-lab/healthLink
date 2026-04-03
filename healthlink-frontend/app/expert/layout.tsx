'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import {
    Box, AppBar, Toolbar, Button, IconButton,
    Drawer, List, ListItemButton, ListItemIcon, ListItemText,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
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
    const [mobileOpen, setMobileOpen] = useState(false);

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
                        {/* Hamburger - mobile only */}
                        <IconButton
                            onClick={() => setMobileOpen(true)}
                            sx={{ display: { xs: 'flex', md: 'none' }, mr: 1, color: 'text.secondary' }}
                        >
                            <MenuIcon />
                        </IconButton>

                        <BrandLogo size="md" />

                        {/* Desktop nav links */}
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

                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                            <ExpertAvatarMenu />
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* Mobile Drawer */}
                <Drawer
                    anchor="left"
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: 280, borderTopRightRadius: 16, borderBottomRightRadius: 16 } }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <BrandLogo size="sm" />
                        <IconButton onClick={() => setMobileOpen(false)} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <List sx={{ pt: 1 }}>
                        {menuItems.map((item) => (
                            <ListItemButton
                                key={item.path}
                                component={Link}
                                href={item.path}
                                selected={isActive(item.path)}
                                onClick={() => setMobileOpen(false)}
                                sx={{
                                    mx: 1,
                                    borderRadius: 2,
                                    mb: 0.5,
                                    '&.Mui-selected': {
                                        bgcolor: 'rgba(30, 143, 138, 0.08)',
                                        color: ACCENT,
                                        '& .MuiListItemIcon-root': { color: ACCENT },
                                        '&:hover': { bgcolor: 'rgba(30, 143, 138, 0.12)' },
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40, color: isActive(item.path) ? ACCENT : 'text.secondary' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: isActive(item.path) ? 600 : 450 }} />
                            </ListItemButton>
                        ))}
                    </List>
                </Drawer>

                <Box component="main" sx={{ flex: 1, bgcolor: 'background.default', overflow: 'auto' }}>
                    {children}
                </Box>
            </Box>
        </ProtectedRoute>
    );
}
