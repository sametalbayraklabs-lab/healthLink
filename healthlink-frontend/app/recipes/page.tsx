'use client';

import { Box, Container, Typography, Card, CardContent, CardMedia, Chip, Stack, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RestaurantIcon from '@mui/icons-material/Restaurant';

const recipes = [
    {
        id: 1,
        title: 'Quinoa ve Avokado Salatası',
        description: 'Protein ve sağlıklı yağlarla dolu, tok tutan ve besleyici bir öğün',
        image: '/artifacts/healthy_salad_recipe.png',
        prepTime: '15 dakika',
        servings: '2 kişilik',
        difficulty: 'Kolay',
        tags: ['Vegan', 'Glutensiz', 'Yüksek Protein'],
        calories: 380
    },
    {
        id: 2,
        title: 'Protein Smoothie Bowl',
        description: 'Kahvaltı için ideal, enerji veren ve doyurucu smoothie bowl',
        image: '/artifacts/protein_smoothie_recipe.png',
        prepTime: '10 dakika',
        servings: '1 kişilik',
        difficulty: 'Çok Kolay',
        tags: ['Yüksek Protein', 'Kahvaltı', 'Post-Workout'],
        calories: 420
    }
];

export default function RecipesPage() {
    const router = useRouter();

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
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                    gap: 2
                }}>
                    {recipes.map((recipe) => (
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
                            onClick={() => router.push(`/recipes/${recipe.id}`)}
                        >
                            <CardMedia
                                component="img"
                                height="160"
                                image={recipe.image}
                                alt={recipe.title}
                            />
                            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                                <Typography variant="subtitle1" component="h2" gutterBottom fontWeight={600} sx={{ fontSize: '0.95rem' }}>
                                    {recipe.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph sx={{ flexGrow: 1, fontSize: '0.85rem' }}>
                                    {recipe.description}
                                </Typography>

                                {/* Tags */}
                                <Stack direction="row" spacing={0.5} mb={1.5} flexWrap="wrap" gap={0.5}>
                                    {recipe.tags.slice(0, 2).map((tag) => (
                                        <Chip key={tag} label={tag} size="small" color="primary" variant="outlined" sx={{ fontSize: '0.7rem', height: '20px' }} />
                                    ))}
                                </Stack>

                                {/* Meta Info */}
                                <Stack direction="row" spacing={1.5} mb={1.5} sx={{ fontSize: '0.75rem' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <AccessTimeIcon sx={{ fontSize: '0.9rem' }} />
                                        <Typography variant="caption">{recipe.prepTime}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <RestaurantIcon sx={{ fontSize: '0.9rem' }} />
                                        <Typography variant="caption">{recipe.servings}</Typography>
                                    </Box>
                                </Stack>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="caption" fontWeight={600} color="primary">
                                        🔥 {recipe.calories} kcal
                                    </Typography>
                                    <Button size="small" variant="outlined" sx={{ fontSize: '0.7rem', py: 0.5 }}>
                                        Detay
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}
