'use client';

import { useState, useEffect } from 'react';
import { Box, Container, Typography, Chip, Stack, Paper, CircularProgress, IconButton } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import VisibilityIcon from '@mui/icons-material/Visibility';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107';

interface Recipe {
    id: number;
    title: string;
    subTitle: string | null;
    slug: string;
    coverImageUrl: string | null;
    bodyHtml: string;
    category: string | null;
}

export default function RecipeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [userReaction, setUserReaction] = useState<{ hasReacted: boolean; isLike: boolean } | null>(null);

    useEffect(() => {
        fetchRecipe();
        recordView();
    }, [params.slug]);

    const fetchRecipe = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/content?type=Recipe`);
            if (!response.ok) throw new Error('Failed to fetch recipe');
            const data = await response.json();
            const foundRecipe = data.find((r: Recipe) => r.slug === params.slug);
            setRecipe(foundRecipe || null);
        } catch (error) {
            console.error('Error fetching recipe:', error);
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
        if (!recipe) return;
        try {
            const response = await fetch(`${API_URL}/api/content/${recipe.id}/react`, {
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

    if (!recipe) {
        return (
            <Box>
                <Navbar />
                <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
                    <Typography variant="h4">Tarif bulunamadı</Typography>
                </Container>
            </Box>
        );
    }

    // Extract metadata from bodyHtml
    const extractMetadata = (html: string) => {
        const prepMatch = html.match(/(\d+)\s*(?:dk|dakika|min)/i);
        const servingMatch = html.match(/(\d+)\s*kişilik/i);
        const calorieMatch = html.match(/(\d+)\s*(?:kcal|kalori)/i);
        return {
            prepTime: prepMatch ? `${prepMatch[1]} dakika` : null,
            servings: servingMatch ? `${servingMatch[1]} kişilik` : null,
            calories: calorieMatch ? parseInt(calorieMatch[1]) : null
        };
    };

    const metadata = extractMetadata(recipe.bodyHtml);

    return (
        <Box>
            <Navbar />

            <Container maxWidth="md" sx={{ py: 4 }}>
                <IconButton onClick={() => router.back()} sx={{ mb: 2 }}>
                    <ArrowBackIcon />
                </IconButton>

                {recipe.coverImageUrl && (
                    <Box
                        component="img"
                        src={recipe.coverImageUrl}
                        alt={recipe.title}
                        sx={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 2, mb: 4 }}
                    />
                )}

                <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
                    {recipe.title}
                </Typography>

                {recipe.subTitle && (
                    <Typography variant="h6" color="text.secondary" paragraph>
                        {recipe.subTitle}
                    </Typography>
                )}

                {/* Category */}
                {recipe.category && (
                    <Stack direction="row" spacing={1} mb={3}>
                        <Chip label={recipe.category} color="primary" variant="outlined" />
                    </Stack>
                )}

                {/* Meta Info */}
                <Stack direction="row" spacing={3} mb={4} flexWrap="wrap">
                    {metadata.prepTime && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTimeIcon />
                            <Typography>{metadata.prepTime}</Typography>
                        </Box>
                    )}
                    {metadata.servings && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <RestaurantIcon />
                            <Typography>{metadata.servings}</Typography>
                        </Box>
                    )}
                    {metadata.calories && (
                        <Typography fontWeight={600} color="primary">
                            🔥 {metadata.calories} kcal
                        </Typography>
                    )}
                </Stack>

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
                <Paper sx={{ p: 3 }}>
                    <div dangerouslySetInnerHTML={{ __html: recipe.bodyHtml }} />
                </Paper>
            </Container>
        </Box>
    );
}
