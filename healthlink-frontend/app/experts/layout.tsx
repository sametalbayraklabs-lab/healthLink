'use client';

import Navbar from '@/components/Navbar';
import { Box } from '@mui/material';

export default function ExpertsLayout({ children }: { children: React.ReactNode }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
                {children}
            </Box>
        </Box>
    );
}
