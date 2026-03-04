'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ExpertsRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/client/appointments/new');
    }, [router]);

    return null;
}
