'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Box, AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MessageIcon from '@mui/icons-material/Message';
import StarIcon from '@mui/icons-material/Star';
import { getInitials } from '@/lib/utils';

export default function ExpertLayout({ children }: { children: React.ReactNode }) {
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
        { label: 'Dashboard', path: '/expert/dashboard', icon: <DashboardIcon /> },
        { label: 'Profilim', path: '/expert/profile', icon: <PersonIcon /> },
        { label: 'Takvim', path: '/expert/calendar', icon: <CalendarMonthIcon /> },
        { label: 'Danışanlarım', path: '/expert/clients', icon: <PeopleIcon /> },
        { label: 'Randevular', path: '/expert/appointments', icon: <CalendarMonthIcon /> },
        { label: 'Mesajlar', path: '/expert/messages', icon: <MessageIcon /> },
        { label: 'Değerlendirmeler', path: '/expert/reviews', icon: <StarIcon /> },
    ];

    return (
        <ProtectedRoute allowedRoles={['Expert']}>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <AppBar position="static" sx={{ bgcolor: 'secondary.main' }}>
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4, fontWeight: 600 }}>
                            HealthLink Expert
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
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                    {user?.email ? getInitials(user.email.split('@')[0], '') : 'U'}
                                </Avatar>
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={() => { handleClose(); router.push('/expert/profile'); }}>
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
