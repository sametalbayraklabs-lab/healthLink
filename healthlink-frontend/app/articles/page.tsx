'use client';

import { Box, Container, Typography, Card, CardContent, CardMedia, Chip, Stack, Button, Avatar } from '@mui/material';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';

const articles = [
    {
        id: 1,
        title: 'Dengeli Beslenmenin Temelleri: Sağlıklı Yaşamın Anahtarı',
        excerpt: 'Dengeli beslenme, vücudumuzun ihtiyaç duyduğu tüm besin öğelerini doğru oranlarda almak demektir. Bu makalede dengeli beslenmenin temel prensiplerini öğreneceksiniz.',
        image: '/artifacts/nutrition_article_image.png',
        author: 'Dyt. Ayşe Yılmaz',
        date: '15 Ocak 2026',
        readTime: '5 dakika',
        category: 'Beslenme',
        tags: ['Dengeli Beslenme', 'Sağlıklı Yaşam', 'Besin Grupları']
    },
    {
        id: 2,
        title: 'Su İçmenin Önemi: Hidrasyon ve Sağlık',
        excerpt: 'Vücudumuzun %60\'ı sudan oluşur. Yeterli su tüketimi, metabolizmadan cilt sağlığına kadar birçok konuda kritik rol oynar. İşte su içmenin faydaları ve doğru hidrasyon ipuçları.',
        image: '/artifacts/hydration_article_image.png',
        author: 'Dyt. Mehmet Kaya',
        date: '12 Ocak 2026',
        readTime: '4 dakika',
        category: 'Sağlık',
        tags: ['Hidrasyon', 'Su', 'Sağlıklı Alışkanlıklar', 'Metabolizma']
    }
];

export default function ArticlesPage() {
    const router = useRouter();

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
                            onClick={() => router.push(`/articles/${article.id}`)}
                        >
                            <CardMedia
                                component="img"
                                height="160"
                                image={article.image}
                                alt={article.title}
                            />
                            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                                <Chip label={article.category} color="secondary" size="small" sx={{ mb: 1, alignSelf: 'flex-start', fontSize: '0.7rem', height: '20px' }} />

                                <Typography variant="subtitle1" component="h2" gutterBottom fontWeight={600} sx={{ fontSize: '0.95rem', lineHeight: 1.3 }}>
                                    {article.title}
                                </Typography>

                                <Stack direction="row" spacing={1} mb={1} alignItems="center" flexWrap="wrap" sx={{ fontSize: '0.7rem' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Avatar sx={{ width: 20, height: 20, bgcolor: 'primary.main' }}>
                                            <PersonIcon sx={{ fontSize: '0.7rem' }} />
                                        </Avatar>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                            {article.author.split(' ')[1]}
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                        ⏱️ {article.readTime}
                                    </Typography>
                                </Stack>

                                <Typography variant="body2" color="text.secondary" paragraph sx={{ flexGrow: 1, fontSize: '0.8rem', lineHeight: 1.4 }}>
                                    {article.excerpt.substring(0, 80)}...
                                </Typography>

                                {/* Tags */}
                                <Stack direction="row" spacing={0.5} mb={1.5} flexWrap="wrap" gap={0.5}>
                                    {article.tags.slice(0, 2).map((tag) => (
                                        <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: '18px' }} />
                                    ))}
                                </Stack>

                                <Button variant="outlined" fullWidth size="small" sx={{ fontSize: '0.7rem', py: 0.5 }}>
                                    Oku
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}
