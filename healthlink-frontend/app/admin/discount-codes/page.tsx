'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CircularProgress, Box } from '@mui/material';

export default function AdminDiscountCodesPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to parameters page with discount codes tab
        router.push('/admin/parameters');
    }, [router]);

    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
        </Box>
    );
}
