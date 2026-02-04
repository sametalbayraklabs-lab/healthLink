'use client';

import { useState, useEffect } from 'react';
import { Box, Container, Typography, Chip, Paper, CircularProgress, IconButton, Stack, Avatar } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107';

interface Article {
    id: number;
    title: string;
    subTitle: string | null;
    slug: string;
    coverImageUrl: string | null;
    bodyHtml: string;
    category: string | null;
    publishedAt: string | null;
    createdAt: string;
}

export default function ArticleDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [userReaction, setUserReaction] = useState<{ hasReacted: boolean; isLike: boolean } | null>(null);

    useEffect(() => {
        fetchArticle();
        recordView();
    }, [params.slug]);

    const fetchArticle = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/content?type=Blog`);
            if (!response.ok) throw new Error('Failed to fetch article');
            const data = await response.json();
            const foundArticle = data.find((a: Article) => a.slug === params.slug);
            setArticle(foundArticle || null);
        } catch (error) {
            console.error('Error fetching article:', error);
        } finally {
            setLoading(false);
        }
    };

    const recordView = async () => {
        try {
            await fetch(`${API_URL}/api/content/${params.slug}/view`, { method: 'POST' });
        } catch (error) {
            console.error('Error recording view:', error);
        }
    };

    const handleReaction = async (isLike: boolean) => {
        if (!article) return;
        try {
            const response = await fetch(`${API_URL}/api/content/${article.id}/react`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isLike })
            });
            if (response.ok) {
                const data = await response.json();
                setUserReaction(data);
            }
        } catch (error) {
            console.error('Error reacting:', error);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const estimateReadTime = (html: string) => {
        const text = html.replace(/<[^>]*>/g, '');
        const words = text.split(/\s+/).length;
        const minutes = Math.ceil(words / 200);
        return `${minutes} dakika okuma`;
    };

    if (loading) {
        return (
            <Box>
                <Navbar />
                <Container maxWidth="lg" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Container>
            </Box>
        );
    }

    if (!article) {
        return (
            <Box>
                <Navbar />
                <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
                    <Typography variant="h4">Makale bulunamadı</Typography>
                </Container>
            </Box>
        );
    }

    return (
        <Box>
            <Navbar />

            <Container maxWidth="md" sx={{ py: 4 }}>
                <IconButton onClick={() => router.back()} sx={{ mb: 2 }}>
                    <ArrowBackIcon />
                </IconButton>

                {article.category && (
                    <Chip label={article.category} color="secondary" sx={{ mb: 2 }} />
                )}

                <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
                    {article.title}
                </Typography>

                {article.subTitle && (
                    <Typography variant="h6" color="text.secondary" paragraph>
                        {article.subTitle}
                    </Typography>
                )}

                {/* Meta Info */}
                <Stack direction="row" spacing={2} mb={3} alignItems="center" flexWrap="wrap">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            <PersonIcon sx={{ fontSize: '1rem' }} />
                        </Avatar>
                        <Typography variant="body2" color="text.secondary">
                            Admin
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarTodayIcon sx={{ fontSize: '1rem' }} />
                        <Typography variant="body2" color="text.secondary">
                            {formatDate(article.publishedAt || article.createdAt)}
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        ⏱️ {estimateReadTime(article.bodyHtml)}
                    </Typography>
                </Stack>

                {article.coverImageUrl && (
                    <Box
                        component="img"
                        src={article.coverImageUrl}
                        alt={article.title}
                        sx={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 2, mb: 4 }}
                    />
                )}

                {/* Reaction Buttons */}
                <Stack direction="row" spacing={2} mb={4}>
                    <IconButton
                        onClick={() => handleReaction(true)}
                        color={userReaction?.hasReacted && userReaction.isLike ? 'primary' : 'default'}
                    >
                        <ThumbUpIcon />
                    </IconButton>
                    <IconButton
                        onClick={() => handleReaction(false)}
                        color={userReaction?.hasReacted && !userReaction.isLike ? 'error' : 'default'}
                    >
                        <ThumbDownIcon />
                    </IconButton>
                </Stack>

                {/* Content */}
                <Paper sx={{ p: 4 }}>
                    <div dangerouslySetInnerHTML={{ __html: article.bodyHtml }} />
                </Paper>
            </Container>
        </Box>
    );
}
