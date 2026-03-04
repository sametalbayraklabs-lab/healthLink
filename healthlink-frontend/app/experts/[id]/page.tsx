'use client';

import { use, useEffect, useState, useCallback } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    Avatar,
    Chip,
    Button,
    Rating,
    Divider,
    CircularProgress,
    Stack,
    Snackbar,
    Alert,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import StarIcon from '@mui/icons-material/Star';
import MessageIcon from '@mui/icons-material/Message';
import SchoolIcon from '@mui/icons-material/School';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VerifiedIcon from '@mui/icons-material/Verified';
import VideocamIcon from '@mui/icons-material/Videocam';
import PersonIcon from '@mui/icons-material/Person';
import ComputerIcon from '@mui/icons-material/Computer';

/* ─── Design tokens ─── */
const tokens = {
    bg: '#F8FAFC',
    cardRadius: '16px',
    shadow: '0 1px 8px rgba(0,0,0,0.04)',
    shadowHover: '0 2px 12px rgba(0,0,0,0.06)',
};

/* ─── Expert type labels ─── */
const expertTypeLabels: Record<string, string> = {
    Psychologist: 'Psikolog',
    Dietitian: 'Diyetisyen',
    SportsCoach: 'Spor Koçu',
    Physiotherapist: 'Fizyoterapist',
};

const expertServiceLabels: Record<string, string> = {
    Psychologist: 'Online Psikolojik Danışmanlık',
    Dietitian: 'Online Beslenme Danışmanlığı',
    SportsCoach: 'Online Spor Koçluğu',
    Physiotherapist: 'Online Fizyoterapi',
};

/* ─── YouTube URL → embed ID parser ─── */
function getYouTubeId(url: string | undefined | null): string | null {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    return match?.[1] ?? null;
}

/* ═══════════ Reviews Sub-Component ═══════════ */
interface ReviewItem {
    id: number;
    rating: number;
    comment: string | null;
    createdAt: string;
    clientId: number;
}

function ExpertReviews({ expertId }: { expertId: number }) {
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = useCallback(async () => {
        try {
            const res = await api.get(`/api/reviews/expert/${expertId}`);
            setReviews(res.data || []);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    }, [expertId]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" py={3}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (reviews.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                Henüz değerlendirme bulunmamaktadır.
            </Typography>
        );
    }

    return (
        <Stack spacing={1.5}>
            {reviews.map((review) => (
                <Box
                    key={review.id}
                    sx={{
                        p: 2,
                        borderRadius: '12px',
                        bgcolor: tokens.bg,
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                        <Rating value={review.rating} readOnly size="small" />
                        <Typography variant="caption" color="text.secondary">
                            {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                        </Typography>
                    </Box>
                    {review.comment && (
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                            {review.comment}
                        </Typography>
                    )}
                </Box>
            ))}
        </Stack>
    );
}

/* ═══════════ Types ═══════════ */
interface ExpertProfile {
    id: number;
    displayName: string;
    email: string;
    phone: string;
    expertType: string;
    title: string;
    profilePhotoUrl?: string;
    introVideoUrl?: string;
    bio: string;
    education?: string;
    certificates?: string;
    city: string;
    workType: string;
    averageRating: number;
    totalReviews: number;
    experienceStartDate: string;
    specializations: Array<{
        id: number;
        name: string;
        category: string;
    }>;
}

/* ═══════════ Section Card Helper ═══════════ */
function SectionCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
    return (
        <Card sx={{
            borderRadius: tokens.cardRadius,
            boxShadow: tokens.shadow,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'visible',
        }}>
            <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                    {icon}
                    <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
                </Stack>
                {children}
            </CardContent>
        </Card>
    );
}

/* ═══════════ Main Page ═══════════ */
export default function ExpertProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const { user } = useAuth();
    const [expert, setExpert] = useState<ExpertProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [appointmentWarning, setAppointmentWarning] = useState(false);
    const [messageWarning, setMessageWarning] = useState(false);

    const handleAppointmentClick = () => {
        if (user?.roles.includes('Client') || !user) {
            router.push(`/client/appointments/new?expertId=${expert?.id}`);
        } else {
            setAppointmentWarning(true);
        }
    };

    const handleMessageClick = () => {
        if (user?.roles.includes('Client') || !user) {
            router.push(`/client/messages?expertId=${expert?.id}`);
        } else {
            setMessageWarning(true);
        }
    };

    useEffect(() => {
        fetchExpert();
    }, [resolvedParams.id]);

    const fetchExpert = async () => {
        try {
            const response = await api.get(`/api/experts/${resolvedParams.id}`);
            setExpert(response.data);
        } catch (error) {
            console.error('Failed to fetch expert:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (!expert) {
        return (
            <Container maxWidth="lg">
                <Typography variant="h5" sx={{ mt: 4 }}>
                    Uzman bulunamadı
                </Typography>
            </Container>
        );
    }

    const experienceYears = expert.experienceStartDate
        ? new Date().getFullYear() - new Date(expert.experienceStartDate).getFullYear()
        : 0;

    const videoId = getYouTubeId(expert.introVideoUrl);
    const serviceLabel = expertServiceLabels[expert.expertType] || 'Online Danışmanlık';
    const typeLabel = expertTypeLabels[expert.expertType] || expert.expertType;

    return (
        <>
            <Box sx={{ bgcolor: tokens.bg, minHeight: '100vh' }}>
                <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>

                    {/* ═══════════ 1. HERO SECTION ═══════════ */}
                    <Card sx={{
                        mb: 3,
                        borderRadius: tokens.cardRadius,
                        boxShadow: tokens.shadow,
                        border: '1px solid',
                        borderColor: 'divider',
                        overflow: 'visible',
                    }}>
                        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                            <Grid container spacing={3} alignItems="center">
                                {/* Left: Identity */}
                                <Grid size={{ xs: 12, md: 8 }}>
                                    <Box display="flex" gap={{ xs: 2, md: 3 }} alignItems="center" flexWrap={{ xs: 'wrap', sm: 'nowrap' }}>
                                        <Avatar
                                            src={expert.profilePhotoUrl ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107'}${expert.profilePhotoUrl}` : undefined}
                                            sx={{
                                                width: { xs: 80, md: 96 },
                                                height: { xs: 80, md: 96 },
                                                bgcolor: 'primary.main',
                                                fontSize: '2rem',
                                                border: '3px solid',
                                                borderColor: 'primary.light',
                                                flexShrink: 0,
                                            }}
                                        >
                                            {expert.displayName.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.3 }}>
                                                {expert.displayName}
                                            </Typography>

                                            {/* Role badge + Online label */}
                                            <Box sx={{ mt: 0.5, mb: 1 }}>
                                                <Chip
                                                    label={typeLabel}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 600,
                                                        bgcolor: '#F0F9F8',
                                                        color: 'primary.main',
                                                        border: '1px solid',
                                                        borderColor: 'primary.light',
                                                        borderRadius: '8px',
                                                    }}
                                                />
                                            </Box>

                                            {/* Rating */}
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Rating
                                                    value={expert.averageRating || 0}
                                                    readOnly
                                                    precision={0.5}
                                                    size="small"
                                                    icon={<StarIcon sx={{ color: '#faaf00', fontSize: 18 }} />}
                                                    emptyIcon={<StarIcon sx={{ color: '#E2E8F0', fontSize: 18 }} />}
                                                />
                                                <Typography variant="body2" fontWeight={500} sx={{ color: '#475569' }}>
                                                    {expert.averageRating ? expert.averageRating.toFixed(1) : '0.0'}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                                                    ({expert.totalReviews} değerlendirme)
                                                </Typography>
                                            </Stack>

                                            {/* Experience badge */}
                                            {experienceYears > 0 && (
                                                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1 }}>
                                                    <AccessTimeIcon sx={{ fontSize: 16, color: '#64748B' }} />
                                                    <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
                                                        {experienceYears} yıl deneyim
                                                    </Typography>
                                                </Stack>
                                            )}
                                        </Box>
                                    </Box>
                                </Grid>

                                {/* Right: CTAs */}
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Stack spacing={1.5}>
                                        <Button
                                            variant="contained"
                                            size="large"
                                            fullWidth
                                            startIcon={<CalendarMonthIcon />}
                                            onClick={handleAppointmentClick}
                                            sx={{
                                                borderRadius: '12px',
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                py: 1.5,
                                                boxShadow: '0 2px 8px rgba(14,165,164,0.2)',
                                                '&:hover': { boxShadow: '0 4px 16px rgba(14,165,164,0.3)' },
                                            }}
                                        >
                                            Randevu Al
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="large"
                                            fullWidth
                                            startIcon={<MessageIcon />}
                                            onClick={handleMessageClick}
                                            sx={{
                                                borderRadius: '12px',
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                py: 1.5,
                                                borderColor: '#CBD5E1',
                                                color: '#475569',
                                                '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' },
                                            }}
                                        >
                                            Mesaj Gönder
                                        </Button>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* ═══════════ 2. HAKKINDA + VIDEO (2-col) ═══════════ */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        {/* Left: Hakkında */}
                        <Grid size={{ xs: 12, md: videoId ? 7 : 12 }}>
                            <SectionCard
                                icon={<PersonIcon sx={{ color: 'primary.main', fontSize: 22 }} />}
                                title="Hakkında"
                            >
                                <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                                    {expert.bio || 'Henüz biyografi eklenmemiş.'}
                                </Typography>
                            </SectionCard>
                        </Grid>

                        {/* Right: YouTube Video */}
                        {videoId && (
                            <Grid size={{ xs: 12, md: 5 }}>
                                <Card sx={{
                                    borderRadius: tokens.cardRadius,
                                    boxShadow: tokens.shadow,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}>
                                    <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                            <VideocamIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                                            <Typography variant="subtitle1" fontWeight={700}>Tanıtım Videosu</Typography>
                                        </Stack>
                                        <Box sx={{
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            position: 'relative',
                                            paddingTop: '56.25%',
                                            flex: 1,
                                        }}>
                                            <iframe
                                                src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
                                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}
                    </Grid>

                    {/* ═══════════ 3. UZMANLIK ALANLARI ═══════════ */}
                    <Box sx={{ mb: 3 }}>
                        <SectionCard
                            icon={<VerifiedIcon sx={{ color: 'primary.main', fontSize: 22 }} />}
                            title="Uzmanlık Alanları"
                        >
                            {expert.specializations.length > 0 ? (
                                <Box display="flex" flexWrap="wrap" gap={1}>
                                    {expert.specializations.map((spec) => (
                                        <Chip
                                            key={spec.id}
                                            label={spec.name}
                                            sx={{
                                                fontWeight: 600,
                                                borderRadius: '10px',
                                                bgcolor: '#F0F9F8',
                                                color: 'primary.main',
                                                border: '1px solid',
                                                borderColor: 'primary.light',
                                                transition: 'all 0.2s',
                                                '&:hover': { boxShadow: '0 2px 8px rgba(14,165,164,0.12)' },
                                            }}
                                        />
                                    ))}
                                </Box>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    Henüz uzmanlık alanı eklenmemiş.
                                </Typography>
                            )}
                        </SectionCard>
                    </Box>

                    {/* ═══════════ 4. DENEYİM + EĞİTİM (combined) ═══════════ */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        {/* Deneyim */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card sx={{
                                borderRadius: tokens.cardRadius,
                                boxShadow: tokens.shadow,
                                border: '1px solid',
                                borderColor: 'divider',
                                height: '100%',
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                        <AccessTimeIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                                        <Typography variant="subtitle1" fontWeight={700}>Deneyim</Typography>
                                    </Stack>
                                    <Box sx={{
                                        display: 'flex', alignItems: 'center', gap: 2,
                                        p: 2, borderRadius: '12px', bgcolor: '#F0F9F8',
                                    }}>
                                        <Box sx={{
                                            width: 48, height: 48, borderRadius: '12px',
                                            bgcolor: 'primary.main', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center', color: 'white',
                                        }}>
                                            <CalendarMonthIcon />
                                        </Box>
                                        <Box>
                                            <Typography variant="h5" fontWeight={700} sx={{ color: 'primary.main' }}>
                                                {experienceYears > 0 ? `${experienceYears} Yıl` : '—'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Profesyonel Deneyim
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Eğitim */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <SectionCard
                                icon={<SchoolIcon sx={{ color: 'primary.main', fontSize: 22 }} />}
                                title="Eğitim"
                            >
                                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                                    {expert.education || 'Henüz eğitim bilgisi eklenmemiş.'}
                                </Typography>
                            </SectionCard>
                        </Grid>
                    </Grid>

                    {/* ═══════════ 5. SERTİFİKALAR ═══════════ */}
                    <Box sx={{ mb: 3 }}>
                        <SectionCard
                            icon={<WorkspacePremiumIcon sx={{ color: 'primary.main', fontSize: 22 }} />}
                            title="Sertifikalar"
                        >
                            <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                                {expert.certificates || 'Henüz sertifika bilgisi eklenmemiş.'}
                            </Typography>
                        </SectionCard>
                    </Box>

                    {/* ═══════════ 6. DEĞERLENDİRMELER (scrollable) ═══════════ */}
                    <Card sx={{
                        mb: 3,
                        borderRadius: tokens.cardRadius,
                        boxShadow: tokens.shadow,
                        border: '1px solid',
                        borderColor: 'divider',
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                                <StarIcon sx={{ color: '#faaf00', fontSize: 22 }} />
                                <Typography variant="subtitle1" fontWeight={700}>Değerlendirmeler</Typography>
                            </Stack>

                            {/* Rating summary — stays always visible */}
                            <Box sx={{
                                display: 'flex', alignItems: 'center', gap: 2,
                                p: 2, borderRadius: '12px', bgcolor: '#F0F9F8',
                                mb: 2,
                            }}>
                                <Typography variant="h3" fontWeight={800} sx={{ color: 'primary.main' }}>
                                    {expert.averageRating ? expert.averageRating.toFixed(1) : '—'}
                                </Typography>
                                <Box>
                                    <Rating
                                        value={expert.averageRating || 0}
                                        readOnly
                                        precision={0.5}
                                        size="small"
                                        icon={<StarIcon sx={{ color: '#faaf00' }} />}
                                        emptyIcon={<StarIcon sx={{ color: '#E2E8F0' }} />}
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                        {expert.totalReviews} değerlendirme
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ mb: 2 }} />

                            {/* Scrollable reviews container */}
                            <Box sx={{
                                maxHeight: 440,
                                overflowY: 'auto',
                                pr: 0.5,
                                '&::-webkit-scrollbar': { width: 6 },
                                '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                                '&::-webkit-scrollbar-thumb': {
                                    bgcolor: '#CBD5E1',
                                    borderRadius: 3,
                                    '&:hover': { bgcolor: '#94A3B8' },
                                },
                            }}>
                                <ExpertReviews expertId={expert.id} />
                            </Box>
                        </CardContent>
                    </Card>

                    {/* ═══════════ 7. SUBTLE BOTTOM CTA ═══════════ */}
                    <Card sx={{
                        borderRadius: tokens.cardRadius,
                        boxShadow: tokens.shadow,
                        border: '1px solid',
                        borderColor: 'primary.light',
                        background: 'linear-gradient(135deg, rgba(14,165,164,0.03), rgba(99,102,241,0.03))',
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#334155' }}>
                                        {expert.displayName} ile görüşmeye başlayın
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#64748B' }}>
                                        Uygun tarih ve saatleri görüntüleyerek randevunuzu oluşturabilirsiniz.
                                    </Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    startIcon={<CalendarMonthIcon />}
                                    onClick={handleAppointmentClick}
                                    sx={{
                                        borderRadius: '12px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        px: 4,
                                        py: 1.25,
                                        boxShadow: '0 2px 8px rgba(14,165,164,0.2)',
                                        '&:hover': { boxShadow: '0 4px 16px rgba(14,165,164,0.3)' },
                                    }}
                                >
                                    Randevu Al
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Container>
            </Box>

            <Snackbar
                open={appointmentWarning}
                autoHideDuration={4000}
                onClose={() => setAppointmentWarning(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setAppointmentWarning(false)} severity="warning" variant="filled" sx={{ borderRadius: 2 }}>
                    Randevu oluşturabilmek için danışan olmalısınız.
                </Alert>
            </Snackbar>
            <Snackbar
                open={messageWarning}
                autoHideDuration={4000}
                onClose={() => setMessageWarning(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setMessageWarning(false)} severity="warning" variant="filled" sx={{ borderRadius: 2 }}>
                    Uzmanlarla mesajlaşabilmek için danışan olmalısınız.
                </Alert>
            </Snackbar>
        </>
    );
}
