'use client';

import { useState } from 'react';
import {
    AppBar, Toolbar, Button, Box, Stack, IconButton,
    Drawer, List, ListItemButton, ListItemIcon, ListItemText, Divider,
} from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ArticleIcon from '@mui/icons-material/Article';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ClientAvatarMenu from '@/components/avatar/ClientAvatarMenu';
import ExpertAvatarMenu from '@/components/avatar/ExpertAvatarMenu';
import AdminAvatarMenu from '@/components/avatar/AdminAvatarMenu';
import BrandLogo from '@/components/BrandLogo';

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const renderAvatarMenu = () => {
        if (!user) return null;
        if (user.roles.includes('Admin')) return <AdminAvatarMenu />;
        if (user.roles.includes('Expert')) return <ExpertAvatarMenu />;
        if (user.roles.includes('Client')) return <ClientAvatarMenu />;
        return null;
    };

    const getDashboardPath = () => {
        if (!user) return null;
        if (user.roles.includes('Admin')) return '/admin/dashboard';
        if (user.roles.includes('Expert')) return '/expert/dashboard';
        if (user.roles.includes('Client')) return '/client/dashboard';
        return null;
    };

    const navLinks = [
        { label: 'Tarifler', icon: <RestaurantMenuIcon />, path: '/recipes' },
        { label: 'Makaleler', icon: <ArticleIcon />, path: '/articles' },
    ];

    const dashboardPath = getDashboardPath();
    if (dashboardPath) {
        navLinks.push({ label: 'Panelim', icon: <DashboardIcon />, path: dashboardPath });
    }

    const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

    return (
        <>
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
                <Toolbar
                    disableGutters
                    sx={{ justifyContent: 'space-between', minHeight: { xs: 64, md: 70 }, px: 3 }}
                >
                    {/* Hamburger - mobile only */}
                    <IconButton
                        onClick={() => setMobileOpen(true)}
                        sx={{ display: { xs: 'flex', md: 'none' }, mr: 1, color: 'text.secondary' }}
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* Logo */}
                    <BrandLogo size="md" />

                    {/* Center Nav Links - desktop */}
                    <Stack direction="row" spacing={0.5} sx={{ flexGrow: 1, ml: 3, display: { xs: 'none', md: 'flex' } }}>
                        {navLinks.map((link) => (
                            <Button
                                key={link.path}
                                startIcon={link.icon}
                                onClick={() => router.push(link.path)}
                                sx={{
                                    color: isActive(link.path) ? 'primary.main' : 'text.secondary',
                                    fontWeight: isActive(link.path) ? 600 : 450,
                                    textTransform: 'none',
                                    borderRadius: 2,
                                    px: 2,
                                    '&:hover': {
                                        bgcolor: 'rgba(30, 143, 138, 0.06)',
                                        color: 'primary.main',
                                    }
                                }}
                            >
                                {link.label}
                            </Button>
                        ))}
                    </Stack>

                    {/* Right: Avatar or Login/Register */}
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ ml: 'auto' }}>
                        {user ? (
                            renderAvatarMenu()
                        ) : (
                            <>
                                <Button
                                    variant="text"
                                    onClick={() => router.push('/login')}
                                    sx={{
                                        color: 'text.secondary',
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        display: { xs: 'none', sm: 'inline-flex' },
                                        '&:hover': {
                                            color: 'primary.main',
                                            bgcolor: 'rgba(30, 143, 138, 0.06)',
                                        }
                                    }}
                                >
                                    Giriş Yap
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => router.push('/register/client')}
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        bgcolor: 'primary.main',
                                        boxShadow: '0 2px 8px rgba(30, 143, 138, 0.25)',
                                        display: { xs: 'none', sm: 'inline-flex' },
                                        '&:hover': {
                                            bgcolor: 'primary.dark',
                                            boxShadow: '0 4px 16px rgba(30, 143, 138, 0.35)',
                                        }
                                    }}
                                >
                                    Üye Ol
                                </Button>
                            </>
                        )}
                    </Stack>
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
                    {navLinks.map((link) => (
                        <ListItemButton
                            key={link.path}
                            selected={isActive(link.path)}
                            onClick={() => { router.push(link.path); setMobileOpen(false); }}
                            sx={{
                                mx: 1,
                                borderRadius: 2,
                                mb: 0.5,
                                '&.Mui-selected': {
                                    bgcolor: 'rgba(30, 143, 138, 0.08)',
                                    color: 'primary.main',
                                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                                    '&:hover': { bgcolor: 'rgba(30, 143, 138, 0.12)' },
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40, color: isActive(link.path) ? 'primary.main' : 'text.secondary' }}>
                                {link.icon}
                            </ListItemIcon>
                            <ListItemText primary={link.label} primaryTypographyProps={{ fontWeight: isActive(link.path) ? 600 : 450 }} />
                        </ListItemButton>
                    ))}
                </List>
                {!user && (
                    <>
                        <Divider sx={{ my: 1 }} />
                        <List sx={{ px: 1 }}>
                            <ListItemButton
                                onClick={() => { router.push('/login'); setMobileOpen(false); }}
                                sx={{ borderRadius: 2, mb: 0.5 }}
                            >
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    <LoginIcon />
                                </ListItemIcon>
                                <ListItemText primary="Giriş Yap" />
                            </ListItemButton>
                            <ListItemButton
                                onClick={() => { router.push('/register/client'); setMobileOpen(false); }}
                                sx={{ borderRadius: 2 }}
                            >
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    <PersonAddIcon />
                                </ListItemIcon>
                                <ListItemText primary="Üye Ol" />
                            </ListItemButton>
                        </List>
                    </>
                )}
            </Drawer>
        </>
    );
}
