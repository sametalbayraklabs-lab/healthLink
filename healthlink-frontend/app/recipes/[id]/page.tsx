'use client';

import { Box, Container, Typography, Chip, Stack, Paper } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton } from '@mui/material';

const recipesData: Record<string, any> = {
    '1': {
        id: 1,
        title: 'Quinoa ve Avokado Salatası',
        description: 'Protein ve sağlıklı yağlarla dolu, tok tutan ve besleyici bir öğün',
        image: '/artifacts/healthy_salad_recipe.png',
        prepTime: '15 dakika',
        servings: '2 kişilik',
        difficulty: 'Kolay',
        ingredients: [
            '1 su bardağı quinoa',
            '1 adet olgun avokado',
            '1 su bardağı kiraz domates',
            '1 demet maydanoz',
            '2 yemek kaşığı zeytinyağı',
            '1 adet limon suyu',
            'Tuz, karabiber'
        ],
        instructions: [
            'Quinoa\'yı bol suda haşlayın ve süzün.',
            'Avokadoyu küp şeklinde doğrayın.',
            'Kiraz domatesleri ikiye bölün.',
            'Maydanozu ince kıyın.',
            'Tüm malzemeleri bir kasede karıştırın.',
            'Zeytinyağı, limon suyu, tuz ve karabiber ile tatlandırın.',
            'Soğuk servis yapın.'
        ],
        nutrition: {
            calories: 380,
            protein: '12g',
            carbs: '42g',
            fat: '18g'
        },
        tags: ['Vegan', 'Glutensiz', 'Yüksek Protein']
    },
    '2': {
        id: 2,
        title: 'Protein Smoothie Bowl',
        description: 'Kahvaltı için ideal, enerji veren ve doyurucu smoothie bowl',
        image: '/artifacts/protein_smoothie_recipe.png',
        prepTime: '10 dakika',
        servings: '1 kişilik',
        difficulty: 'Çok Kolay',
        ingredients: [
            '1 adet donmuş muz',
            '1 su bardağı yaban mersini',
            '1 ölçek protein tozu (vanilya)',
            '1/2 su bardağı yoğurt',
            '1/4 su bardağı badem sütü',
            'Üzeri için: granola, taze meyveler, chia tohumu'
        ],
        instructions: [
            'Donmuş muz, yaban mersini, protein tozu, yoğurt ve badem sütünü blender\'a koyun.',
            'Kremsi bir kıvam elde edene kadar karıştırın.',
            'Kasede servis yapın.',
            'Üzerine granola, taze meyveler ve chia tohumu ekleyin.',
            'Hemen servis edin.'
        ],
        nutrition: {
            calories: 420,
            protein: '28g',
            carbs: '52g',
            fat: '12g'
        },
        tags: ['Yüksek Protein', 'Kahvaltı', 'Post-Workout']
    }
};

export default function RecipeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const recipe = recipesData[params.id as string];

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

    return (
        <Box>
            <Navbar />

            <Container maxWidth="md" sx={{ py: 4 }}>
                <IconButton onClick={() => router.back()} sx={{ mb: 2 }}>
                    <ArrowBackIcon />
                </IconButton>

                <Box
                    component="img"
                    src={recipe.image}
                    alt={recipe.title}
                    sx={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 2, mb: 4 }}
                />

                <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
                    {recipe.title}
                </Typography>

                <Typography variant="h6" color="text.secondary" paragraph>
                    {recipe.description}
                </Typography>

                {/* Tags */}
                <Stack direction="row" spacing={1} mb={3} flexWrap="wrap" gap={1}>
                    {recipe.tags.map((tag: string) => (
                        <Chip key={tag} label={tag} color="primary" variant="outlined" />
                    ))}
                </Stack>

                {/* Meta Info */}
                <Stack direction="row" spacing={3} mb={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon />
                        <Typography>{recipe.prepTime}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <RestaurantIcon />
                        <Typography>{recipe.servings}</Typography>
                    </Box>
                    <Chip label={recipe.difficulty} />
                </Stack>

                {/* Nutrition */}
                <Paper sx={{ p: 3, mb: 4, bgcolor: 'grey.50' }}>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                        Besin Değerleri (Porsiyon Başı)
                    </Typography>
                    <Stack direction="row" spacing={3} flexWrap="wrap">
                        <Typography>🔥 {recipe.nutrition.calories} kcal</Typography>
                        <Typography>💪 Protein: {recipe.nutrition.protein}</Typography>
                        <Typography>🍞 Karbonhidrat: {recipe.nutrition.carbs}</Typography>
                        <Typography>🥑 Yağ: {recipe.nutrition.fat}</Typography>
                    </Stack>
                </Paper>

                {/* Ingredients */}
                <Box mb={4}>
                    <Typography variant="h5" gutterBottom fontWeight={600}>
                        Malzemeler
                    </Typography>
                    <Box component="ul" sx={{ pl: 3 }}>
                        {recipe.ingredients.map((ingredient: string, idx: number) => (
                            <Typography component="li" key={idx} sx={{ mb: 1 }}>
                                {ingredient}
                            </Typography>
                        ))}
                    </Box>
                </Box>

                {/* Instructions */}
                <Box>
                    <Typography variant="h5" gutterBottom fontWeight={600}>
                        Hazırlanışı
                    </Typography>
                    <Box component="ol" sx={{ pl: 3 }}>
                        {recipe.instructions.map((step: string, idx: number) => (
                            <Typography component="li" key={idx} sx={{ mb: 2 }}>
                                {step}
                            </Typography>
                        ))}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
