'use client';

import { Box, Container, Typography, Chip, Stack, Avatar, Paper } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton } from '@mui/material';

const articlesData: Record<string, any> = {
    '1': {
        id: 1,
        title: 'Dengeli Beslenmenin Temelleri: Sağlıklı Yaşamın Anahtarı',
        excerpt: 'Dengeli beslenme, vücudumuzun ihtiyaç duyduğu tüm besin öğelerini doğru oranlarda almak demektir.',
        image: '/artifacts/nutrition_article_image.png',
        author: 'Dyt. Ayşe Yılmaz',
        date: '15 Ocak 2026',
        readTime: '5 dakika',
        category: 'Beslenme',
        content: [
            {
                subtitle: 'Dengeli Beslenme Nedir?',
                text: 'Dengeli beslenme, vücudumuzun günlük enerji ve besin öğesi ihtiyacını karşılayacak şekilde, çeşitli gıda gruplarından yeterli ve dengeli miktarlarda tüketim yapmaktır. Bu, sadece kilo kontrolü için değil, genel sağlığımız, bağışıklık sistemimiz ve yaşam kalitemiz için de kritik öneme sahiptir.'
            },
            {
                subtitle: 'Temel Besin Grupları',
                text: 'Sağlıklı bir beslenme planı şu besin gruplarını içermelidir:\n\n1. **Karbonhidratlar**: Vücudumuzun ana enerji kaynağıdır. Tam tahıllar, esmer pirinç, yulaf gibi kompleks karbonhidratları tercih edin.\n\n2. **Proteinler**: Kas yapımı ve onarımı için gereklidir. Tavuk, balık, yumurta, baklagiller ve süt ürünleri iyi protein kaynaklarıdır.\n\n3. **Sağlıklı Yağlar**: Omega-3 ve omega-6 yağ asitleri beyin sağlığı için önemlidir. Zeytinyağı, avokado, kuruyemişler tercih edilmelidir.\n\n4. **Vitaminler ve Mineraller**: Bol miktarda sebze ve meyve tüketin. Her öğünde farklı renklerde sebze bulundurmaya çalışın.'
            },
            {
                subtitle: 'Porsiyon Kontrolü',
                text: 'Dengeli beslenmenin bir diğer önemli yönü porsiyon kontrolüdür. Tabak modelini kullanabilirsiniz:\n\n- Tabağınızın yarısı sebze ve meyvelerden oluşmalı\n- Çeyreği protein kaynaklarından\n- Kalan çeyreği tam tahıllardan\n\nBu basit kural, dengeli beslenmeyi günlük yaşamınıza entegre etmenin kolay bir yoludur.'
            },
            {
                subtitle: 'Su Tüketimi',
                text: 'Günde en az 2-2.5 litre su içmeyi unutmayın. Su, metabolizmanın düzgün çalışması, toksinlerin atılması ve cilt sağlığı için hayati önem taşır.'
            },
            {
                subtitle: 'Sonuç',
                text: 'Dengeli beslenme bir yaşam tarzıdır, kısa süreli bir diyet değil. Küçük adımlarla başlayın, sabırlı olun ve vücudunuzu dinleyin. Unutmayın, herkesin beslenme ihtiyaçları farklıdır. Kişisel bir beslenme planı için mutlaka bir diyetisyene danışın.'
            }
        ],
        tags: ['Dengeli Beslenme', 'Sağlıklı Yaşam', 'Besin Grupları']
    },
    '2': {
        id: 2,
        title: 'Su İçmenin Önemi: Hidrasyon ve Sağlık',
        excerpt: 'Vücudumuzun %60\'ı sudan oluşur. Yeterli su tüketimi, metabolizmadan cilt sağlığına kadar birçok konuda kritik rol oynar.',
        image: '/artifacts/hydration_article_image.png',
        author: 'Dyt. Mehmet Kaya',
        date: '12 Ocak 2026',
        readTime: '4 dakika',
        category: 'Sağlık',
        content: [
            {
                subtitle: 'Neden Su İçmeliyiz?',
                text: 'Su, vücudumuzun en temel ihtiyaçlarından biridir. Hücrelerimizin çalışması, besinlerin taşınması, toksinlerin atılması ve vücut ısısının düzenlenmesi gibi hayati fonksiyonlar için su gereklidir.'
            },
            {
                subtitle: 'Su İçmenin Faydaları',
                text: '**1. Metabolizmayı Hızlandırır**: Yeterli su tüketimi metabolizma hızını %30\'a kadar artırabilir.\n\n**2. Cilt Sağlığı**: Su, cildin nemli ve elastik kalmasını sağlar, kırışıklıkları azaltır.\n\n**3. Sindirim Sistemi**: Su, sindirim sisteminin düzgün çalışması için gereklidir. Kabızlığı önler.\n\n**4. Enerji Seviyesi**: Dehidrasyon yorgunluğa neden olur. Yeterli su içmek enerji seviyenizi yüksek tutar.\n\n**5. Böbrek Sağlığı**: Su, böbreklerin toksinleri filtrelemesine yardımcı olur ve böbrek taşı riskini azaltır.\n\n**6. Kilo Kontrolü**: Su içmek tokluk hissi verir ve aşırı kalori alımını önleyebilir.'
            },
            {
                subtitle: 'Ne Kadar Su İçmeliyiz?',
                text: 'Genel kural günde 8 bardak (yaklaşık 2 litre) su içmektir. Ancak bu miktar kişiden kişiye değişir:\n\n- Fiziksel aktivite seviyeniz\n- Hava koşulları\n- Genel sağlık durumunuz\n- Hamilelik veya emzirme durumu\n\ngibi faktörler su ihtiyacınızı etkiler. İdrar renginiz iyi bir göstergedir: Açık sarı renk yeterli hidrasyon gösterir.'
            },
            {
                subtitle: 'Su İçme İpuçları',
                text: '- Sabah kalktığınızda bir bardak su için\n- Her öğün öncesi su için\n- Yanınızda su şişesi bulundurun\n- Meyve suları yerine sade su tercih edin\n- Kafeinli içecekleri sınırlayın (dehidrasyon yapabilir)\n- Egzersiz öncesi, sırası ve sonrasında bol su için'
            },
            {
                subtitle: 'Sonuç',
                text: 'Su içmek basit ama güçlü bir sağlık alışkanlığıdır. Günlük su tüketiminizi artırarak enerji seviyenizi yükseltebilir, cilt sağlığınızı iyileştirebilir ve genel sağlığınızı koruyabilirsiniz. Bugün bir bardak su ile başlayın!'
            }
        ],
        tags: ['Hidrasyon', 'Su', 'Sağlıklı Alışkanlıklar', 'Metabolizma']
    }
};

export default function ArticleDetailPage() {
    const params = useParams();
    const router = useRouter();
    const article = articlesData[params.id as string];

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

                <Box
                    component="img"
                    src={article.image}
                    alt={article.title}
                    sx={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 2, mb: 4 }}
                />

                <Chip label={article.category} color="secondary" sx={{ mb: 2 }} />

                <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
                    {article.title}
                </Typography>

                <Stack direction="row" spacing={3} mb={4} alignItems="center" flexWrap="wrap">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                            <PersonIcon />
                        </Avatar>
                        <Typography variant="body1" color="text.secondary">
                            {article.author}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarTodayIcon color="action" />
                        <Typography variant="body1" color="text.secondary">
                            {article.date}
                        </Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary">
                        ⏱️ {article.readTime}
                    </Typography>
                </Stack>

                <Typography variant="h6" paragraph color="text.secondary" sx={{ fontStyle: 'italic', mb: 4 }}>
                    {article.excerpt}
                </Typography>

                {/* Tags */}
                <Stack direction="row" spacing={1} mb={4} flexWrap="wrap" gap={1}>
                    {article.tags.map((tag: string) => (
                        <Chip key={tag} label={tag} variant="outlined" />
                    ))}
                </Stack>

                {/* Article Content */}
                <Paper sx={{ p: 4 }}>
                    {article.content.map((section: any, idx: number) => (
                        <Box key={idx} sx={{ mb: 4 }}>
                            <Typography variant="h5" gutterBottom fontWeight={600} color="primary.main">
                                {section.subtitle}
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    whiteSpace: 'pre-line',
                                    lineHeight: 1.8,
                                    color: 'text.primary'
                                }}
                            >
                                {section.text}
                            </Typography>
                        </Box>
                    ))}
                </Paper>
            </Container>
        </Box>
    );
}
