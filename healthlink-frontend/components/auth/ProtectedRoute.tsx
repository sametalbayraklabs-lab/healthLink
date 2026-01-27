'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
                return;
            }

            if (allowedRoles && allowedRoles.length > 0) {
                const hasRequiredRole = allowedRoles.some(role => user?.roles.includes(role));
                if (!hasRequiredRole) {
                    // Redirect to appropriate dashboard based on user role
                    if (user?.roles.includes('Admin')) {
                        router.push('/admin/dashboard');
                    } else if (user?.roles.includes('Expert')) {
                        router.push('/expert/dashboard');
                    } else if (user?.roles.includes('Client')) {
                        router.push('/client/dashboard');
                    } else {
                        router.push('/');
                    }
                }
            }
        }
    }, [isLoading, isAuthenticated, user, allowedRoles, router]);

    if (isLoading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const hasRequiredRole = allowedRoles.some(role => user?.roles.includes(role));
        if (!hasRequiredRole) {
            return null;
        }
    }

    return <>{children}</>;
}
