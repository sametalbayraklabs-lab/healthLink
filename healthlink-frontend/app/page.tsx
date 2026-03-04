'use client';

import { Box, Typography, Button, Card, CardContent, Chip, Tabs, Tab, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PsychologyIcon from '@mui/icons-material/Psychology';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import StarIcon from '@mui/icons-material/Star';
import WorkIcon from '@mui/icons-material/Work';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import ExpertCard, { ExpertCardData, getExpertTypeLabel } from '@/components/ExpertCard';
import { useChat } from '@/contexts/ChatContext';

interface Expert {
  id: number;
  displayName: string;
  expertType: string;
  specializations?: string[];
  averageRating?: number;
  experienceYears?: number;
  city?: string;
  profileDescription?: string;
  isOnline?: boolean;
}

interface Specialization {
  id: number;
  name: string;
  expertType: string;
}

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { openChatWithExpert } = useChat();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.roles.includes('Admin')) return '/admin/dashboard';
    if (user.roles.includes('Expert')) return '/expert/dashboard';
    if (user.roles.includes('Client')) return '/client/dashboard';
    return '/';
  };
  const [experts, setExperts] = useState<Expert[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [selectedExpertType, setSelectedExpertType] = useState<string>('All');
  const [selectedSpecializations, setSelectedSpecializations] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch experts and specializations
    const fetchData = async () => {
      try {
        const [expertsResponse, specsResponse] = await Promise.all([
          fetch('http://localhost:5107/api/experts'),
          fetch('http://localhost:5107/api/specializations')
        ]);

        if (expertsResponse.ok && specsResponse.ok) {
          const expertsData = await expertsResponse.json();
          const specsData = await specsResponse.json();

          setExperts(expertsData.items || expertsData || []);
          setSpecializations(specsData || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ExpertType values from backend enum
  const expertTypes = [
    { value: 'All', label: 'Tümü' },
    { value: 'Dietitian', label: 'Diyetisyen' },
    { value: 'Psychologist', label: 'Psikolog' },
    { value: 'SportsCoach', label: 'Spor Koçu' }
  ];

  const filteredExperts = experts.filter(expert => {
    // Filter by expert type
    if (selectedExpertType !== 'All' && expert.expertType !== selectedExpertType) {
      return false;
    }
    // Filter by specializations (if any selected)
    if (selectedSpecializations.length > 0) {
      return true;
    }
    return true;
  });

  const handleSpecializationToggle = (specId: number) => {
    setSelectedSpecializations(prev =>
      prev.includes(specId)
        ? prev.filter(id => id !== specId)
        : [...prev, specId]
    );
  };

  const handleAppointmentClick = (expertId: number) => {
    if (isAuthenticated) {
      router.push(`/client/appointments/new?expertId=${expertId}`);
    } else {
      router.push(`/login?returnTo=${encodeURIComponent(`/client/appointments/new?expertId=${expertId}`)}`);
    }
  };

  const stepItems = [
    {
      number: 1,
      title: 'Uzman Seçin',
      description: 'Uzmanlık alanına ve ihtiyaçlarınıza göre size en uygun uzmanı bulun',
      icon: <SearchIcon sx={{ fontSize: 28 }} />,
      gradient: 'linear-gradient(135deg, #1E8F8A, #2BA8A2)',
    },
    {
      number: 2,
      title: 'Randevu Alın',
      description: 'Uygun paketinizi seçin ve online görüşme için randevu oluşturun',
      icon: <EventAvailableIcon sx={{ fontSize: 28 }} />,
      gradient: 'linear-gradient(135deg, #6366F1, #818CF8)',
    },
    {
      number: 3,
      title: 'Rehberlik Alın',
      description: 'Kişisel planınızı alın ve sürekli destek ile hedeflerinize ulaşın',
      icon: <SupportAgentIcon sx={{ fontSize: 28 }} />,
      gradient: 'linear-gradient(135deg, #22C55E, #4ADE80)',
    },
  ];

  return (
    <Box>
      {/* Navigation Bar */}
      <Navbar />

      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: '#F8FAFC',
          minHeight: { xs: 'auto', md: '85vh' },
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          py: { xs: 6, md: 0 },
          '@keyframes heroFadeIn': {
            from: { opacity: 0, transform: 'translateY(12px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
        }}
      >
        <Box sx={{ px: 3, width: '100%', position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: { xs: 4, md: 8 },
              alignItems: 'center',
            }}
          >
            {/* Left Column - Text */}
            <Box sx={{ order: { xs: 2, md: 1 }, animation: 'heroFadeIn 0.5s ease-out both' }}>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  letterSpacing: '-0.5px',
                  lineHeight: 1.15,
                  mb: 3,
                  color: '#0F172A',
                }}
              >
                {user?.roles.includes('Client')
                  ? `Hoş geldin${user.firstName ? `, ${user.firstName}` : ''}! 👋 Sağlık yolculuğuna kaldığın yerden devam edelim.`
                  : user?.roles.includes('Expert')
                    ? `Tekrar hoş geldiniz${user.displayName ? `, ${user.displayName}` : ''}! 🩺 Danışanlarınıza rehberlik etmeye hazır mısınız?`
                    : 'Sağlığınızı Uzman Desteğiyle Güçlendirin'}
              </Typography>
              <Typography
                variant="h5"
                sx={{ color: '#475569', mb: 5, fontWeight: 400, fontSize: { xs: '1rem', md: '1.15rem' }, lineHeight: 1.6, maxWidth: '520px' }}
              >
                Online görüşmelerle, kişiye özel beslenme ve yaşam planları oluşturun.
                Sertifikalı uzmanlarla güvenli ve sürdürülebilir bir yolculuğa başlayın.
              </Typography>

              {/* Dynamic Hero Buttons by Role */}
              {user?.roles.includes('Admin') ? (
                <Stack direction="row" spacing={2}>
                  <Button variant="contained" size="large" onClick={() => router.push('/admin/dashboard')}
                    sx={{ bgcolor: '#1E8F8A', color: 'white', fontWeight: 600, px: 4, py: 1.5, borderRadius: '14px', boxShadow: '0 4px 16px rgba(30,143,138,0.25)', '&:hover': { bgcolor: '#196F6B' }, textTransform: 'none' }}>
                    Panelime Git — Yönetim
                  </Button>
                </Stack>
              ) : user?.roles.includes('Expert') ? (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button variant="contained" size="large" onClick={() => router.push('/expert/dashboard')}
                    sx={{ bgcolor: '#1E8F8A', color: 'white', fontWeight: 600, px: 4, py: 1.5, borderRadius: '14px', boxShadow: '0 4px 16px rgba(30,143,138,0.25)', '&:hover': { bgcolor: '#196F6B', transform: 'translateY(-1px)' }, transition: 'all 0.2s ease', textTransform: 'none' }}>
                    Panelime Git
                  </Button>
                  <Button variant="outlined" size="large" onClick={() => router.push('/articles')}
                    sx={{ borderColor: '#1E8F8A', borderWidth: '1.5px', color: '#1E8F8A', fontWeight: 500, px: 4, py: 1.5, borderRadius: '14px', '&:hover': { borderColor: '#196F6B', bgcolor: 'rgba(30,143,138,0.06)' }, textTransform: 'none' }}>
                    İçerikleri Yönet
                  </Button>
                </Stack>
              ) : user?.roles.includes('Client') ? (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button variant="contained" size="large" onClick={() => router.push('/client/dashboard')}
                    sx={{ bgcolor: '#1E8F8A', color: 'white', fontWeight: 600, px: 4, py: 1.5, borderRadius: '14px', boxShadow: '0 4px 16px rgba(30,143,138,0.25)', '&:hover': { bgcolor: '#196F6B', transform: 'translateY(-1px)' }, transition: 'all 0.2s ease', textTransform: 'none' }}>
                    Panelime Git
                  </Button>
                  <Button variant="outlined" size="large" onClick={() => router.push('/client/appointments/new')}
                    sx={{ borderColor: '#1E8F8A', borderWidth: '1.5px', color: '#1E8F8A', fontWeight: 500, px: 4, py: 1.5, borderRadius: '14px', '&:hover': { borderColor: '#196F6B', bgcolor: 'rgba(30,143,138,0.06)' }, textTransform: 'none' }}>
                    Randevu Al
                  </Button>
                </Stack>
              ) : (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button variant="contained" size="large" onClick={() => router.push('/register/client')}
                    sx={{ bgcolor: '#1E8F8A', color: 'white', fontWeight: 600, px: 4, py: 1.5, borderRadius: '14px', boxShadow: '0 4px 16px rgba(30,143,138,0.25)', '&:hover': { bgcolor: '#196F6B', transform: 'translateY(-1px)' }, transition: 'all 0.2s ease', textTransform: 'none' }}>
                    Hemen Başla
                  </Button>
                  <Button variant="outlined" size="large"
                    onClick={() => { const s = document.getElementById('experts-section'); s?.scrollIntoView({ behavior: 'smooth' }); }}
                    sx={{ borderColor: '#1E8F8A', borderWidth: '1.5px', color: '#1E8F8A', fontWeight: 500, px: 4, py: 1.5, borderRadius: '14px', '&:hover': { borderColor: '#196F6B', bgcolor: 'rgba(30,143,138,0.06)' }, textTransform: 'none' }}>
                    Uzmanları Keşfet
                  </Button>
                </Stack>
              )}
            </Box>

            {/* Right Column - Image */}
            <Box sx={{ order: { xs: 1, md: 2 }, display: 'flex', justifyContent: 'center', animation: 'heroFadeIn 0.5s ease-out 0.15s both' }}>
              <Box
                component="img"
                src="/images/hero-expert.png"
                alt="Sağlık uzmanı online danışmanlık"
                sx={{ width: '100%', maxWidth: 540, borderRadius: '24px', boxShadow: '0 8px 40px rgba(15,23,42,0.08)', transition: 'transform 0.3s ease', '&:hover': { transform: 'scale(1.02)' } }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ px: 3, py: { xs: 8, md: 12 }, width: '100%' }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
          <Typography
            variant="h3"
            gutterBottom
            fontWeight={700}
            sx={{
              letterSpacing: '-0.01em',
              color: 'text.primary',
            }}
          >
            Nasıl Çalışır?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520, mx: 'auto', fontSize: '1.05rem' }}>
            Üç kolay adımda uzman desteğiyle sağlıklı yaşamınıza başlayın
          </Typography>
        </Box>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 4, md: 6 }}
          sx={{ justifyContent: 'center', alignItems: { xs: 'center', md: 'flex-start' } }}
        >
          {stepItems.map((step) => (
            <Box key={step.number} sx={{ flex: 1, textAlign: 'center', maxWidth: { md: '320px' } }}>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '20px',
                  background: step.gradient,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2.5,
                  boxShadow: `0 8px 24px ${step.number === 1 ? 'rgba(14,165,164,0.25)' : step.number === 2 ? 'rgba(99,102,241,0.25)' : 'rgba(34,197,94,0.25)'}`,
                }}
              >
                {step.icon}
              </Box>
              <Typography variant="h6" gutterBottom fontWeight={600} sx={{ color: 'text.primary' }}>
                {step.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {step.description}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Experts Section */}
      <Box id="experts-section" sx={{ bgcolor: '#F1F5F9', py: { xs: 8, md: 12 } }}>
        <Box sx={{ px: 3, width: '100%' }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
            <Typography
              variant="h3"
              gutterBottom
              fontWeight={700}
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
              onChange={(_, newValue) => setSelectedExpertType(newValue)}
              sx={{
                bgcolor: 'white',
                borderRadius: '16px',
                p: 0.5,
                boxShadow: '0 1px 4px rgba(15, 23, 42, 0.06)',
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  borderRadius: '12px',
                  minHeight: 42,
                  px: 3,
                  color: 'text.secondary',
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    color: 'white',
                    bgcolor: 'primary.main',
                    fontWeight: 600,
                  },
                },
                '& .MuiTabs-indicator': {
                  display: 'none',
                },
              }}
            >
              {expertTypes.map((type) => (
                <Tab key={type.value} label={type.label} value={type.value} />
              ))}
            </Tabs>
          </Box>

          {/* Specialization Filters - Multi-select */}
          {selectedExpertType !== 'All' && specializations.filter(s => s.expertType === selectedExpertType).length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight={600} color="text.secondary" sx={{ textAlign: 'center', mb: 1.5 }}>
                Uzmanlık Alanları
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} justifyContent="center">
                {specializations
                  .filter(s => s.expertType === selectedExpertType)
                  .map(spec => (
                    <Chip
                      key={spec.id}
                      label={spec.name}
                      onClick={() => handleSpecializationToggle(spec.id)}
                      color={selectedSpecializations.includes(spec.id) ? 'primary' : 'default'}
                      variant={selectedSpecializations.includes(spec.id) ? 'filled' : 'outlined'}
                      sx={{
                        cursor: 'pointer',
                        borderRadius: '10px',
                        fontWeight: 500,
                        transition: 'all 0.2s ease',
                      }}
                    />
                  ))}
              </Stack>
            </Box>
          )}

          {/* Expert Cards */}
          {loading ? (
            <Typography align="center" color="text.secondary">Yükleniyor...</Typography>
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
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 3
            }}>
              {filteredExperts.map((expert) => (
                <ExpertCard
                  key={expert.id}
                  expert={expert as ExpertCardData}
                  onAppointmentClick={(e) => handleAppointmentClick(e.id)}
                  onMessageClick={isAuthenticated ? (e) => openChatWithExpert(e.id) : undefined}
                />
              ))}
            </Box>
          )}

          {/* Detaylı İncele Butonu */}
          {!loading && filteredExperts.length > 0 && (
            <Box sx={{ textAlign: 'center', mt: 5 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => {
                  if (isAuthenticated) {
                    router.push('/client/appointments/new');
                  } else {
                    router.push(`/login?returnTo=${encodeURIComponent('/client/appointments/new')}`);
                  }
                }}
                sx={{
                  bgcolor: '#0EA5A4',
                  color: 'white',
                  fontWeight: 600,
                  px: 5,
                  py: 1.5,
                  fontSize: '1rem',
                  borderRadius: '14px',
                  boxShadow: '0 4px 16px rgba(14, 165, 164, 0.25)',
                  '&:hover': {
                    bgcolor: '#0C8E8D',
                    boxShadow: '0 6px 24px rgba(14, 165, 164, 0.35)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Uzmanları Detaylı İncele →
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* CTA Section */}
      {!isAuthenticated && (
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1E8F8A 0%, #196F6B 40%, #4F46B8 70%, #6366F1 100%)',
            color: 'white',
            py: { xs: 8, md: 10 },
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-20%',
              right: '-10%',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
              pointerEvents: 'none',
            },
          }}
        >
          <Box textAlign="center" sx={{ position: 'relative', zIndex: 1, px: 3 }}>
            <Typography variant="h3" gutterBottom fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
              Sağlıklı Yaşam Yolculuğunuza Başlamaya Hazır mısınız?
            </Typography>
            <Typography variant="body1" paragraph sx={{ opacity: 0.9, mb: 5, fontSize: '1.1rem', maxWidth: 560, mx: 'auto' }}>
              Binlerce kişi uzman diyetisyenlerimizle hedeflerine ulaştı. Sıra sizde!
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push('/register/client')}
                sx={{
                  bgcolor: 'white',
                  color: '#1E8F8A',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  borderRadius: '14px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                  '&:hover': {
                    bgcolor: 'white',
                    boxShadow: '0 6px 28px rgba(0,0,0,0.18)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Danışan Olarak Kayıt Ol
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push('/register/expert')}
                sx={{
                  borderColor: 'rgba(255,255,255,0.5)',
                  borderWidth: '1.5px',
                  color: 'white',
                  fontWeight: 500,
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  borderRadius: '14px',
                  '&:hover': {
                    borderColor: 'white',
                    borderWidth: '1.5px',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Uzman Olarak Katıl
              </Button>
            </Stack>
          </Box>
        </Box>
      )}
    </Box>
  );
}
