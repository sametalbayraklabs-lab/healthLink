'use client';

import { useState, useEffect } from 'react';
import { Box, Container, Typography, Card, CardContent, CardMedia, Chip, Stack, Button, Avatar, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107';

interface Article {
    id: number;
    title: string;
    subTitle: string | null;
    slug: string;
    coverImageUrl: string | null;
    category: string | null;
    bodyHtml: string;
    publishedAt: string | null;
    createdAt: string;
}

export default function ArticlesPage() {
    const router = useRouter();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/content?type=Blog`);
            if (!response.ok) throw new Error('Failed to fetch articles');
            const data = await response.json();
            setArticles(data);
        } catch (error) {
            console.error('Error fetching articles:', error);
        } finally {
            setLoading(false);
        }
    };

    // Extract read time from bodyHtml
    const estimateReadTime = (bodyHtml: string) => {
        const text = bodyHtml.replace(/<[^>]*>/g, '');
        const words = text.split(/\s+/).length;
        const minutes = Math.ceil(words / 200); // Average reading speed
        return `${minutes} dakika`;
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <Box>
            <Navbar />

            {/* Hero Section */}
            <Box sx={{ bgcolor: 'secondary.main', color: 'white', py: 6 }}>
                <Container maxWidth="lg">
                    <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
                        Sağlık ve Beslenme Makaleleri
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9 }}>
                        Uzman diyetisyenlerimizden sağlıklı yaşam için ipuçları ve bilgiler
                    </Typography>
                </Container>
            </Box>

            {/* Articles Grid */}
            <Container maxWidth="lg" sx={{ py: 6 }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" py={8}>
                        <CircularProgress />
                    </Box>
                ) : articles.length === 0 ? (
                    <Box textAlign="center" py={8}>
                        <Typography variant="h6" color="text.secondary">
                            Henüz makale bulunmuyor
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                        gap: 2
                    }}>
                        {articles.map((article) => (
                            <Card
                                key={article.id}
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4
                                    }
                                }}
                                onClick={() => router.push(`/articles/${article.slug}`)}
                            >
                                <CardMedia
                                    component="img"
                                    height="160"
                                    image={article.coverImageUrl || '/placeholder-article.jpg'}
                                    alt={article.title}
                                    sx={{ objectFit: 'cover' }}
                                />
                                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                                    {article.category && (
                                        <Chip label={article.category} color="secondary" size="small" sx={{ mb: 1, alignSelf: 'flex-start', fontSize: '0.7rem', height: '20px' }} />
                                    )}

                                    <Typography variant="subtitle1" component="h2" gutterBottom fontWeight={600} sx={{ fontSize: '0.95rem', lineHeight: 1.3 }}>
                                        {article.title}
                                    </Typography>

                                    <Stack direction="row" spacing={1} mb={1} alignItems="center" flexWrap="wrap" sx={{ fontSize: '0.7rem' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Avatar sx={{ width: 20, height: 20, bgcolor: 'primary.main' }}>
                                                <PersonIcon sx={{ fontSize: '0.7rem' }} />
                                            </Avatar>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                                Admin
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            ⏱️ {estimateReadTime(article.bodyHtml)}
                                        </Typography>
                                    </Stack>

                                    <Typography variant="body2" color="text.secondary" paragraph sx={{ flexGrow: 1, fontSize: '0.8rem', lineHeight: 1.4 }}>
                                        {article.subTitle ? article.subTitle.substring(0, 80) + '...' : ''}
                                    </Typography>

                                    {/* Date */}
                                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.7rem' }}>
                                        📅 {formatDate(article.publishedAt || article.createdAt)}
                                    </Typography>

                                    <Button variant="outlined" fullWidth size="small" sx={{ fontSize: '0.7rem', py: 0.5 }}>
                                        Oku
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                )}
            </Container>
        </Box>
    );
}
