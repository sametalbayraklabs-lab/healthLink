'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CircularProgress, Box } from '@mui/material';

export default function AdminPackagesPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to parameters page with packages tab
        router.push('/admin/parameters');
    }, [router]);

    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
        </Box>
    );
}
