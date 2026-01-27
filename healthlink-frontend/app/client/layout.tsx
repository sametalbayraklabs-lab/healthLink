'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Box, AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MessageIcon from '@mui/icons-material/Message';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { getInitials } from '@/lib/utils';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
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
        { label: 'Dashboard', path: '/client/dashboard', icon: <DashboardIcon /> },
        { label: 'Profilim', path: '/client/profile', icon: <PersonIcon /> },
        { label: 'Paketler', path: '/client/packages', icon: <LocalHospitalIcon /> },
        { label: 'Randevularım', path: '/client/appointments', icon: <CalendarMonthIcon /> },
        { label: 'Mesajlar', path: '/client/messages', icon: <MessageIcon /> },
        { label: 'Değerlendirmelerim', path: '/client/reviews', icon: <RateReviewIcon /> },
        { label: 'Şikayetlerim', path: '/client/complaints', icon: <ReportProblemIcon /> },
    ];

    return (
        <ProtectedRoute allowedRoles={['Client']}>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4, fontWeight: 600 }}>
                            HealthLink
                        </Typography>

                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                            {menuItems.map((item) => (
                                <Button
                                    key={item.path}
                                    color="inherit"
                                    component={Link}
                                    href={item.path}
                                    startIcon={item.icon}
                                    sx={{ textTransform: 'none' }}
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
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                                    {user?.email ? getInitials(user.email.split('@')[0], '') : 'U'}
                                </Avatar>
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={() => { handleClose(); router.push('/client/profile'); }}>
                                    Profil
                                </MenuItem>
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
