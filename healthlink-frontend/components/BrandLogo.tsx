'use client';

import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

interface BrandLogoProps {
    /** Size variant. Default: 'md' */
    size?: 'sm' | 'md' | 'lg';
    /** Link href. Default: '/' */
    href?: string;
    /** Disable the link wrapper */
    noLink?: boolean;
}

const sizeMap = {
    sm: { icon: 24, fontSize: '1.1rem' },
    md: { icon: 32, fontSize: '1.35rem' },
    lg: { icon: 44, fontSize: '1.75rem' },
};

export default function BrandLogo({ size = 'md', href = '/', noLink = false }: BrandLogoProps) {
    const s = sizeMap[size];

    const content = (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, textDecoration: 'none' }}>
            <Image
                src="/images/dengedekal-icon.png"
                alt="DengedeKal"
                width={s.icon}
                height={s.icon}
                style={{
                    objectFit: 'contain',
                    mixBlendMode: 'multiply',   // beyaz arka planı şeffaflaştırır
                }}
                priority
            />
            <Typography
                component="span"
                sx={{
                    fontSize: s.fontSize,
                    fontWeight: 900,
                    color: '#1E8F8A',
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                    fontFamily: 'Inter, sans-serif',
                    display: 'inline',
                    '& .light': {
                        fontWeight: 400,
                        color: '#334155',
                    },
                }}
            >
                Denge<span className="light">deKal</span>
            </Typography>
        </Box>
    );

    if (noLink) return content;

    return (
        <Link href={href} style={{ textDecoration: 'none' }}>
            {content}
        </Link>
    );
}
