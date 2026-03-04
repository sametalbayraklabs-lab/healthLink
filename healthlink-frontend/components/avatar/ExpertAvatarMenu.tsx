'use client';

import { useEffect, useState } from 'react';
import { Avatar, Box, Chip, Divider, IconButton, ListItemIcon, Menu, MenuItem } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import ArticleIcon from '@mui/icons-material/Article';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LogoutIcon from '@mui/icons-material/Logout';
import CircleIcon from '@mui/icons-material/Circle';

const ACCENT = '#1E8F8A';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107';

const MENU_PAPER_SX = {
    elevation: 3,
    sx: {
        mt: 1,
        minWidth: 210,
        borderRadius: 2,
        overflow: 'visible',
        '& .MuiMenuItem-root': { borderRadius: 1, mx: 0.5, my: 0.25, px: 1.5 },
    },
};

export default function ExpertAvatarMenu() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isManuallyOffline, setIsManuallyOffline] = useState(false);
    const open = Boolean(anchorEl);

    const initial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';
    const onlineBorderColor = isManuallyOffline ? '#ef5350' : '#4caf50';

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch(`${API_URL}/api/experts/me`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setIsManuallyOffline(data.isManuallyOffline || false);
                }
            } catch (e) {
                console.error('Error fetching expert status:', e);
            }
        };
        fetchStatus();
    }, []);

    const toggleOnlineStatus = async () => {
        const newStatus = !isManuallyOffline;
        try {
            const res = await fetch(`${API_URL}/api/expert/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({ isOffline: newStatus }),
            });
            if (res.ok) setIsManuallyOffline(newStatus);
        } catch (e) {
            console.error('Error toggling status:', e);
        }
    };

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                    label="Uzman"
                    size="small"
                    sx={{
                        bgcolor: `${ACCENT}18`,
                        color: ACCENT,
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        height: 22,
                        border: `1px solid ${ACCENT}40`,
                    }}
                />
                <IconButton
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    size="small"
                    aria-controls={open ? 'expert-avatar-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                >
                    <Avatar
                        sx={{
                            width: 36,
                            height: 36,
                            bgcolor: ACCENT,
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: `2.5px solid ${onlineBorderColor}`,
                            transition: 'box-shadow 0.2s ease',
                            '&:hover': { boxShadow: `0 0 0 3px ${ACCENT}33` },
                        }}
                    >
                        {initial}
                    </Avatar>
                </IconButton>
            </Box>

            <Menu
                id="expert-avatar-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{ paper: MENU_PAPER_SX }}
            >
                {/* Online/Offline Toggle */}
                <MenuItem onClick={() => { setAnchorEl(null); toggleOnlineStatus(); }}>
                    <ListItemIcon>
                        <CircleIcon sx={{ fontSize: 12, color: isManuallyOffline ? '#4caf50' : '#ef5350' }} />
                    </ListItemIcon>
                    {isManuallyOffline ? 'Çevrimiçi Ol' : 'Çevrimdışı Ol'}
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />

                <MenuItem onClick={() => { setAnchorEl(null); router.push('/expert/dashboard'); }}>
                    <ListItemIcon><DashboardIcon fontSize="small" /></ListItemIcon>
                    Panelim
                </MenuItem>
                <MenuItem onClick={() => { setAnchorEl(null); router.push('/expert/profile'); }}>
                    <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                    Profilim
                </MenuItem>
                <MenuItem onClick={() => { setAnchorEl(null); router.push('/articles'); }}>
                    <ListItemIcon><ArticleIcon fontSize="small" /></ListItemIcon>
                    Makalelerim
                </MenuItem>
                <MenuItem onClick={() => { setAnchorEl(null); router.push('/recipes'); }}>
                    <ListItemIcon><RestaurantMenuIcon fontSize="small" /></ListItemIcon>
                    Tariflerim
                </MenuItem>
                <MenuItem onClick={() => { setAnchorEl(null); router.push('/expert/support'); }}>
                    <ListItemIcon><SupportAgentIcon fontSize="small" /></ListItemIcon>
                    Online Destek
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem
                    onClick={() => { setAnchorEl(null); logout(); router.push('/'); }}
                    sx={{ color: 'error.main' }}
                >
                    <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                    Güvenli Çıkış
                </MenuItem>
            </Menu>
        </>
    );
}
