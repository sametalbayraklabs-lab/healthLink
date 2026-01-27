'use client';

import { AppBar, Toolbar, Typography, Button, Box, Container, Stack } from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ArticleIcon from '@mui/icons-material/Article';

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();

    const navLinks = [
        { label: 'Tarifler', icon: <RestaurantMenuIcon />, path: '/recipes' },
        { label: 'Makaleler', icon: <ArticleIcon />, path: '/articles' },
    ];

    return (
        <AppBar
            position="sticky"
            sx={{
                bgcolor: 'white',
                color: 'text.primary',
                boxShadow: 1
            }}
        >
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
                    {/* Logo/Brand */}
                    <Typography
                        variant="h6"
                        component="div"
                        onClick={() => router.push('/')}
                        sx={{
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            cursor: 'pointer',
                            mr: 4
                        }}
                    >
                        HealthLink
                    </Typography>

                    {/* Left Navigation Links */}
                    <Stack direction="row" spacing={2} sx={{ flexGrow: 1 }}>
                        {navLinks.map((link) => (
                            <Button
                                key={link.path}
                                startIcon={link.icon}
                                onClick={() => router.push(link.path)}
                                sx={{
                                    color: pathname === link.path ? 'primary.main' : 'text.primary',
                                    fontWeight: pathname === link.path ? 600 : 400,
                                    textTransform: 'none',
                                    '&:hover': {
                                        bgcolor: 'grey.100'
                                    }
                                }}
                            >
                                {link.label}
                            </Button>
                        ))}
                    </Stack>

                    {/* Right Auth Buttons */}
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="text"
                            onClick={() => router.push('/login')}
                            sx={{
                                color: 'text.primary',
                                textTransform: 'none',
                                fontWeight: 500
                            }}
                        >
                            Giriş Yap
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => router.push('/register/client')}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 500,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                                }
                            }}
                        >
                            Üye Ol
                        </Button>
                    </Stack>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
