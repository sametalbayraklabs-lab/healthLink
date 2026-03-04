'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Box, AppBar, Toolbar, Button } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
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
                        <BrandLogo size="md" />

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

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AdminAvatarMenu />
                        </Box>
                    </Toolbar>
                </AppBar>

                <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}>
                    {children}
                </Box>
            </Box>
        </ProtectedRoute>
    );
}
