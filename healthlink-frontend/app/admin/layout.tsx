'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Box, AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PaymentIcon from '@mui/icons-material/Payment';
import DiscountIcon from '@mui/icons-material/Discount';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import ArticleIcon from '@mui/icons-material/Article';
import { getInitials } from '@/lib/utils';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logout();
    };

    const menuItems = [
        { label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
        { label: 'Danışanlar', path: '/admin/clients', icon: <PeopleIcon /> },
        { label: 'Uzmanlar', path: '/admin/experts', icon: <LocalHospitalIcon /> },
        { label: 'Paketler', path: '/admin/packages', icon: <LocalHospitalIcon /> },
        { label: 'Ödemeler', path: '/admin/payments', icon: <PaymentIcon /> },
        { label: 'İndirim Kodları', path: '/admin/discount-codes', icon: <DiscountIcon /> },
        { label: 'Randevular', path: '/admin/appointments', icon: <CalendarMonthIcon /> },
        { label: 'Değerlendirmeler', path: '/admin/reviews', icon: <RateReviewIcon /> },
        { label: 'Şikayetler', path: '/admin/complaints', icon: <ReportProblemIcon /> },
        { label: 'İçerik', path: '/admin/content', icon: <ArticleIcon /> },
    ];

    return (
        <ProtectedRoute allowedRoles={['Admin']}>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <AppBar position="static" sx={{ bgcolor: 'error.main' }}>
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4, fontWeight: 600 }}>
                            HealthLink Admin
                        </Typography>

                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 0.5, flexWrap: 'wrap' }}>
                            {menuItems.map((item) => (
                                <Button
                                    key={item.path}
                                    color="inherit"
                                    component={Link}
                                    href={item.path}
                                    size="small"
                                    sx={{ textTransform: 'none', fontSize: '0.875rem' }}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                                {user?.email}
                            </Typography>
                            <IconButton onClick={handleMenu} size="small">
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'warning.main' }}>
                                    {user?.email ? getInitials(user.email.split('@')[0], '') : 'A'}
                                </Avatar>
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={handleLogout}>Çıkış Yap</MenuItem>
                            </Menu>
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
