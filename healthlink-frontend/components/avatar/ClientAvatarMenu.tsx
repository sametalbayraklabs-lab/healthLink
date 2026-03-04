'use client';

import { useState } from 'react';
import { Avatar, Box, Chip, Divider, IconButton, ListItemIcon, Menu, MenuItem } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LogoutIcon from '@mui/icons-material/Logout';

const ACCENT = '#1E8F8A';

const MENU_PAPER_SX = {
    elevation: 3,
    sx: {
        mt: 1,
        minWidth: 200,
        borderRadius: 2,
        overflow: 'visible',
        '& .MuiMenuItem-root': { borderRadius: 1, mx: 0.5, my: 0.25, px: 1.5 },
    },
};

export default function ClientAvatarMenu() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const initial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                    label="Danışan"
                    size="small"
                    sx={{
                        bgcolor: `${ACCENT}18`,
                        color: ACCENT,
                        fontWeight: 600,
                        fontSize: '0.72rem',
                        height: 22,
                        border: `1px solid ${ACCENT}40`,
                    }}
                />
                <IconButton
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    size="small"
                    aria-controls={open ? 'client-avatar-menu' : undefined}
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
                            transition: 'box-shadow 0.2s ease',
                            '&:hover': { boxShadow: `0 0 0 3px ${ACCENT}33` },
                        }}
                    >
                        {initial}
                    </Avatar>
                </IconButton>
            </Box>

            <Menu
                id="client-avatar-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{ paper: MENU_PAPER_SX }}
            >
                <MenuItem onClick={() => { setAnchorEl(null); router.push('/client/dashboard'); }}>
                    <ListItemIcon><DashboardIcon fontSize="small" /></ListItemIcon>
                    Panelim
                </MenuItem>
                <MenuItem onClick={() => { setAnchorEl(null); router.push('/client/profile'); }}>
                    <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                    Profilim
                </MenuItem>
                <MenuItem onClick={() => { setAnchorEl(null); router.push('/client/support'); }}>
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
