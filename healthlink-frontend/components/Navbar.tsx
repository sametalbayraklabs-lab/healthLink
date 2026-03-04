'use client';

import { AppBar, Toolbar, Button, Box, Stack } from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ArticleIcon from '@mui/icons-material/Article';
import ClientAvatarMenu from '@/components/avatar/ClientAvatarMenu';
import ExpertAvatarMenu from '@/components/avatar/ExpertAvatarMenu';
import AdminAvatarMenu from '@/components/avatar/AdminAvatarMenu';
import BrandLogo from '@/components/BrandLogo';

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useAuth();

    const renderAvatarMenu = () => {
        if (!user) return null;
        if (user.roles.includes('Admin')) return <AdminAvatarMenu />;
        if (user.roles.includes('Expert')) return <ExpertAvatarMenu />;
        if (user.roles.includes('Client')) return <ClientAvatarMenu />;
        return null;
    };

    const navLinks = [
        { label: 'Tarifler', icon: <RestaurantMenuIcon />, path: '/recipes' },
        { label: 'Makaleler', icon: <ArticleIcon />, path: '/articles' },
    ];

    const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

    return (
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
                {/* Logo */}
                <BrandLogo size="md" />

                {/* Center Nav Links */}
                <Stack direction="row" spacing={0.5} sx={{ flexGrow: 1, ml: 3 }}>
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
                <Stack direction="row" spacing={1.5} alignItems="center">
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
    );
}
