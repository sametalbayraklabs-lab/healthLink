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
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PaymentIcon from '@mui/icons-material/Payment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import ArticleIcon from '@mui/icons-material/Article';
import SettingsIcon from '@mui/icons-material/Settings';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import BrandLogo from '@/components/BrandLogo';
import AdminAvatarMenu from '@/components/avatar/AdminAvatarMenu';

const ACCENT = '#F59E0B';
const ACCENT_TEXT = '#B45309';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

    const menuItems = [
        { label: 'Panelim', path: '/admin/dashboard', icon: <DashboardIcon /> },
        { label: 'Danışanlar', path: '/admin/clients', icon: <PeopleIcon /> },
        { label: 'Uzmanlar', path: '/admin/experts', icon: <LocalHospitalIcon /> },
        { label: 'Ödemeler', path: '/admin/payments', icon: <PaymentIcon /> },
        { label: 'Randevular', path: '/admin/appointments', icon: <CalendarMonthIcon /> },
        { label: 'Değerlendirmeler', path: '/admin/reviews', icon: <RateReviewIcon /> },
        { label: 'Şikayetler', path: '/admin/complaints', icon: <ReportProblemIcon /> },
        { label: 'İçerik', path: '/admin/content', icon: <ArticleIcon /> },
        { label: 'Destek Talepleri', path: '/admin/support', icon: <SupportAgentIcon /> },
        { label: 'Parametreler', path: '/admin/parameters', icon: <SettingsIcon /> },
    ];

    return (
        <ProtectedRoute allowedRoles={['Admin']}>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <AppBar
                    position="sticky"
                    sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.97)',
                        backdropFilter: 'blur(12px)',
                        color: 'text.primary',
                        boxShadow: `0 1px 3px ${ACCENT}20`,
                        borderBottom: `1px solid ${ACCENT}60`,
                        borderTop: `3px solid ${ACCENT}`,
                    }}
                >
                    <Toolbar>
                        {/* Hamburger - mobile only */}
                        <IconButton
                            onClick={() => setMobileOpen(true)}
                            sx={{ display: { xs: 'flex', md: 'none' }, mr: 1, color: 'text.secondary' }}
                        >
                            <MenuIcon />
                        </IconButton>

                        <BrandLogo size="md" />

                        {/* Desktop nav links */}
                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 0.25, flexWrap: 'wrap', ml: 2 }}>
                            {menuItems.map((item) => (
                                <Button
                                    key={item.path}
                                    component={Link}
                                    href={item.path}
                                    size="small"
                                    sx={{
                                        textTransform: 'none',
                                        fontSize: '0.82rem',
                                        color: isActive(item.path) ? ACCENT_TEXT : 'text.secondary',
                                        fontWeight: isActive(item.path) ? 600 : 450,
                                        borderRadius: 2,
                                        px: 1.25,
                                        '&:hover': {
                                            bgcolor: `${ACCENT}14`,
                                            color: ACCENT_TEXT,
                                        },
                                    }}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                            <AdminAvatarMenu />
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
                                        bgcolor: `${ACCENT}14`,
                                        color: ACCENT_TEXT,
                                        '& .MuiListItemIcon-root': { color: ACCENT_TEXT },
                                        '&:hover': { bgcolor: `${ACCENT}20` },
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40, color: isActive(item.path) ? ACCENT_TEXT : 'text.secondary' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: isActive(item.path) ? 600 : 450 }} />
                            </ListItemButton>
                        ))}
                    </List>
                </Drawer>

                <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}>
                    {children}
                </Box>
            </Box>
        </ProtectedRoute>
    );
}
