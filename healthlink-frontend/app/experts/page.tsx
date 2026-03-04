'use client';

import { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Chip, Stack, Tabs, Tab,
    CircularProgress, Snackbar, Alert,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import ExpertCard, { ExpertCardData } from '@/components/ExpertCard';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';

const API_URL = 'http://localhost:5107';

// Static expert types — matches backend enum (same as landing page)
const EXPERT_TYPES = [
    { value: 'All', label: 'Tümü' },
    { value: 'Dietitian', label: 'Diyetisyen' },
    { value: 'Psychologist', label: 'Psikolog' },
    { value: 'SportsCoach', label: 'Spor Koçu' },
];

interface Specialization {
    id: number;
    name: string;
    expertType: string;
}

export default function ExpertsPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const { openChatWithExpert } = useChat();

    const isClient = user?.roles.includes('Client');

    const [experts, setExperts] = useState<ExpertCardData[]>([]);
    const [specializations, setSpecializations] = useState<Specialization[]>([]);
    const [selectedExpertType, setSelectedExpertType] = useState<string>('All');
    const [selectedSpecializations, setSelectedSpecializations] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [appointmentWarning, setAppointmentWarning] = useState(false);
    const [messageWarning, setMessageWarning] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (selectedExpertType !== 'All') params.append('expertType', selectedExpertType);
                if (selectedSpecializations.length === 1) {
                    params.append('specializationId', selectedSpecializations[0].toString());
                }

                const [expertsRes, specsRes] = await Promise.all([
                    fetch(`${API_URL}/api/experts?${params}`),
                    fetch(`${API_URL}/api/specializations?${selectedExpertType !== 'All' ? `expertType=${selectedExpertType}` : ''}`),
                ]);

                if (expertsRes.ok) {
                    const data = await expertsRes.json();
                    setExperts(data.items || data || []);
                }
                if (specsRes.ok) {
                    const data = await specsRes.json();
                    setSpecializations(data || []);
                }
            } catch (err) {
                console.error('Error fetching experts:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedExpertType, selectedSpecializations]);

    const handleAppointmentClick = (expertId: number) => {
        if (!isAuthenticated) {
            router.push(`/login?returnTo=${encodeURIComponent(`/client/appointments/new?expertId=${expertId}`)}`);
        } else if (isClient) {
            router.push(`/client/appointments/new?expertId=${expertId}`);
        } else {
            setAppointmentWarning(true);
        }
    };

    const handleMessageClick = (expertId: number) => {
        if (!isAuthenticated) {
            router.push(`/login?returnTo=${encodeURIComponent(`/client/messages?expertId=${expertId}`)}`);
        } else if (isClient) {
            openChatWithExpert(expertId);
        } else {
            setMessageWarning(true);
        }
    };

    const handleSpecializationToggle = (specId: number) => {
        setSelectedSpecializations(prev =>
            prev.includes(specId) ? prev.filter(id => id !== specId) : [...prev, specId]
        );
    };

    const filteredExperts = selectedSpecializations.length > 0
        ? experts.filter(e => e.specializations?.some(s => selectedSpecializations.includes(s as unknown as number)))
        : experts;

    return (
        <>
            <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', py: { xs: 6, md: 8 } }}>
                <Container maxWidth="lg">
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
                        <Typography
                            variant="h3"
                            fontWeight={700}
                            gutterBottom
                            sx={{ letterSpacing: '-0.01em', color: 'text.primary' }}
                        >
                            Uzmanlarımızla Tanışın
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520, mx: 'auto', fontSize: '1.05rem' }}>
                            Alanında uzman, sertifikalı sağlık danışmanlarımızı keşfedin
                        </Typography>
                    </Box>

                    {/* Expert Type Tabs */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                        <Tabs
                            value={selectedExpertType}
                            onChange={(_, v) => { setSelectedExpertType(v); setSelectedSpecializations([]); }}
                            sx={{
                                bgcolor: 'white', borderRadius: '16px', p: 0.5,
                                boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
                                '& .MuiTab-root': {
                                    textTransform: 'none', fontSize: '0.95rem', fontWeight: 500,
                                    borderRadius: '12px', minHeight: 42, px: 3, color: 'text.secondary',
                                    '&.Mui-selected': { color: 'white', bgcolor: 'primary.main', fontWeight: 600 },
                                },
                                '& .MuiTabs-indicator': { display: 'none' },
                            }}
                        >
                            {EXPERT_TYPES.map(t => <Tab key={t.value} label={t.label} value={t.value} />)}
                        </Tabs>
                    </Box>

                    {/* Specialization Chips */}
                    {selectedExpertType !== 'All' && specializations.filter(s => s.expertType === selectedExpertType).length > 0 && (
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="subtitle2" gutterBottom fontWeight={600} color="text.secondary" sx={{ textAlign: 'center', mb: 1.5 }}>
                                Uzmanlık Alanları
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} justifyContent="center">
                                {specializations.filter(s => s.expertType === selectedExpertType).map(spec => (
                                    <Chip
                                        key={spec.id}
                                        label={spec.name}
                                        onClick={() => handleSpecializationToggle(spec.id)}
                                        color={selectedSpecializations.includes(spec.id) ? 'primary' : 'default'}
                                        variant={selectedSpecializations.includes(spec.id) ? 'filled' : 'outlined'}
                                        sx={{ cursor: 'pointer', borderRadius: '10px', fontWeight: 500, transition: 'all 0.2s ease' }}
                                    />
                                ))}
                            </Stack>
                        </Box>
                    )}

                    {/* Expert Cards Grid */}
                    {loading ? (
                        <Box display="flex" justifyContent="center" py={8}>
                            <CircularProgress />
                        </Box>
                    ) : filteredExperts.length === 0 ? (
                        <Box textAlign="center" py={8}>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                Henüz onaylanmış uzman bulunmuyor
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Yakında uzmanlarımız sisteme eklenecek
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)' }, gap: 3 }}>
                            {filteredExperts.map(expert => (
                                <ExpertCard
                                    key={expert.id}
                                    expert={expert}
                                    profileHref={`/experts/${expert.id}`}
                                    onAppointmentClick={e => handleAppointmentClick(e.id)}
                                    onMessageClick={isAuthenticated ? e => handleMessageClick(e.id) : undefined}
                                />
                            ))}
                        </Box>
                    )}
                </Container>
            </Box>

            {/* Appointment warning */}
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

            {/* Message warning */}
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
