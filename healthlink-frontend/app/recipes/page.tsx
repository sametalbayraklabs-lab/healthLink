'use client';

import { useState, useEffect } from 'react';
import { Box, Container, Typography, Card, CardContent, CardMedia, Chip, Stack, Button, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RestaurantIcon from '@mui/icons-material/Restaurant';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107';

interface Recipe {
    id: number;
    title: string;
    subTitle: string | null;
    slug: string;
    coverImageUrl: string | null;
    category: string | null;
    bodyHtml?: string;
    content?: string; // API returns this instead of bodyHtml
}

export default function RecipesPage() {
    const router = useRouter();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecipes();
    }, []);

    const fetchRecipes = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/content?type=Recipe`);
            if (!response.ok) throw new Error('Failed to fetch recipes');
            const data = await response.json();
            setRecipes(data);
        } catch (error) {
            console.error('Error fetching recipes:', error);
        } finally {
            setLoading(false);
        }
    };

    // Extract prep time and servings from bodyHtml or content if available
    const extractMetadata = (html: string | null | undefined) => {
        if (!html) {
            return { prepTime: null, servings: null, calories: null };
        }
        const prepMatch = html.match(/(\d+)\s*(?:dk|dakika|min)/i);
        const servingMatch = html.match(/(\d+)\s*kişilik/i);
        const calorieMatch = html.match(/(\d+)\s*(?:kcal|kalori)/i);

        return {
            prepTime: prepMatch ? `${prepMatch[1]} dakika` : null,
            servings: servingMatch ? `${servingMatch[1]} kişilik` : null,
            calories: calorieMatch ? parseInt(calorieMatch[1]) : null
        };
    };

    return (
        <Box>
            <Navbar />

            {/* Hero Section */}
            <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6 }}>
                <Container maxWidth="lg">
                    <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
                        Sağlıklı Tarifler
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9 }}>
                        Besleyici ve lezzetli tariflerle sağlıklı yaşam yolculuğunuza destek olun
                    </Typography>
                </Container>
            </Box>

            {/* Recipes Grid */}
            <Container maxWidth="lg" sx={{ py: 6 }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" py={8}>
                        <CircularProgress />
                    </Box>
                ) : recipes.length === 0 ? (
                    <Box textAlign="center" py={8}>
                        <Typography variant="h6" color="text.secondary">
                            Henüz tarif bulunmuyor
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                        gap: 2
                    }}>
                        {recipes.map((recipe) => {
                            const metadata = extractMetadata(recipe.bodyHtml || recipe.content);
                            return (
                                <Card
                                    key={recipe.id}
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
                                    onClick={() => router.push(`/recipes/${recipe.slug}`)}
                                >
                                    <CardMedia
                                        component="img"
                                        height="160"
                                        image={recipe.coverImageUrl || '/placeholder-recipe.jpg'}
                                        alt={recipe.title}
                                        sx={{ objectFit: 'cover' }}
                                    />
                                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                                        <Typography variant="subtitle1" component="h2" gutterBottom fontWeight={600} sx={{ fontSize: '0.95rem' }}>
                                            {recipe.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" paragraph sx={{ flexGrow: 1, fontSize: '0.85rem' }}>
                                            {recipe.subTitle || ''}
                                        </Typography>

                                        {/* Category */}
                                        {recipe.category && (
                                            <Stack direction="row" spacing={0.5} mb={1.5}>
                                                <Chip label={recipe.category} size="small" color="primary" variant="outlined" sx={{ fontSize: '0.7rem', height: '20px' }} />
                                            </Stack>
                                        )}

                                        {/* Meta Info */}
                                        {(metadata.prepTime || metadata.servings) && (
                                            <Stack direction="row" spacing={1.5} mb={1.5} sx={{ fontSize: '0.75rem' }}>
                                                {metadata.prepTime && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <AccessTimeIcon sx={{ fontSize: '0.9rem' }} />
                                                        <Typography variant="caption">{metadata.prepTime}</Typography>
                                                    </Box>
                                                )}
                                                {metadata.servings && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <RestaurantIcon sx={{ fontSize: '0.9rem' }} />
                                                        <Typography variant="caption">{metadata.servings}</Typography>
                                                    </Box>
                                                )}
                                            </Stack>
                                        )}

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            {metadata.calories && (
                                                <Typography variant="caption" fontWeight={600} color="primary">
                                                    🔥 {metadata.calories} kcal
                                                </Typography>
                                            )}
                                            <Button size="small" variant="outlined" sx={{ fontSize: '0.7rem', py: 0.5, ml: 'auto' }}>
                                                Detay
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Box>
                )}
            </Container>
        </Box>
    );
}
