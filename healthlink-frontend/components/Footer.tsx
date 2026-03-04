'use client';

import { Box, Container, Typography, Link, Divider, Stack } from '@mui/material';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BrandLogo from '@/components/BrandLogo';

export default function Footer() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();

    // Determine Online Destek path based on role
    const getSupportPath = () => {
        if (!isAuthenticated) return '/login';
        if (user?.roles.includes('Expert')) return '/expert/support';
        if (user?.roles.includes('Client')) return '/client/support';
        return '/client/support';
    };

    return (
        <Box
            component="footer"
            sx={{
                mt: 'auto',
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: 'rgba(248, 250, 252, 0.95)',
                py: 4,
            }}
        >
            <Container maxWidth="lg">
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={3}
                >
                    {/* Brand */}
                    <Box>
                        <BrandLogo size="sm" noLink />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            Sağlıklı yaşamın dijital adresi
                        </Typography>
                    </Box>

                    {/* Links */}
                    <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
                        <Link
                            component="button"
                            onClick={() => router.push('/recipes')}
                            underline="hover"
                            color="text.secondary"
                            variant="body2"
                            sx={{ cursor: 'pointer' }}
                        >
                            Tarifler
                        </Link>
                        <Link
                            component="button"
                            onClick={() => router.push('/articles')}
                            underline="hover"
                            color="text.secondary"
                            variant="body2"
                            sx={{ cursor: 'pointer' }}
                        >
                            Makaleler
                        </Link>
                        <Link
                            component="button"
                            onClick={() => router.push(getSupportPath())}
                            underline="hover"
                            color="primary.main"
                            variant="body2"
                            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}
                        >
                            <SupportAgentIcon sx={{ fontSize: 16 }} />
                            Online Destek
                        </Link>
                    </Stack>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Typography variant="caption" color="text.disabled" textAlign="center" display="block">
                    © {new Date().getFullYear()} DengedeKal. Tüm hakları saklıdır.
                </Typography>
            </Container>
        </Box>
    );
}
