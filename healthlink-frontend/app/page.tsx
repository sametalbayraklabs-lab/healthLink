'use client';

import { Box, Container, Typography, Button, Card, CardContent, Chip, Tabs, Tab, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PsychologyIcon from '@mui/icons-material/Psychology';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import StarIcon from '@mui/icons-material/Star';
import WorkIcon from '@mui/icons-material/Work';
import Navbar from '@/components/Navbar';

interface Expert {
  id: number;
  displayName: string;
  expertType: string;
  specializations?: string[];
  averageRating?: number;
  experienceYears?: number;
  city?: string;
}

interface Specialization {
  id: number;
  name: string;
  expertType: string;
}

export default function Home() {
  const router = useRouter();
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
      // Check if expert has any of the selected specializations
      // Note: This requires expert.specializationIds or similar field from backend
      // For now, we'll skip this filter if no specialization data
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

  const getExpertIcon = (type: string) => {
    switch (type) {
      case 'Dietitian': return <LocalHospitalIcon />;
      case 'Psychologist': return <PsychologyIcon />;
      case 'SportsCoach': return <FitnessCenterIcon />;
      default: return <LocalHospitalIcon />;
    }
  };

  const getExpertTypeLabel = (type: string) => {
    const found = expertTypes.find(t => t.value === type);
    return found ? found.label : type;
  };

  return (
    <Box>
      {/* Navigation Bar */}
      <Navbar />

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: '800px' }}>
            <Typography variant="h2" component="h1" gutterBottom fontWeight={700} sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
              Uzman Sağlık Danışmanlarınızla Tanışın
            </Typography>
            <Typography variant="h5" paragraph sx={{ opacity: 0.95, mb: 4 }}>
              Sertifikalı diyetisyenlerden kişiselleştirilmiş rehberlik alın.
              Online görüşmeler, beslenme planları ve sürekli destek.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                size="large"
                onClick={() => {
                  const expertsSection = document.getElementById('experts-section');
                  expertsSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'grey.100' },
                  px: 4,
                  py: 1.5,
                }}
              >
                Uzmanları Keşfet
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push('/register/client')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                  px: 4,
                  py: 1.5,
                }}
              >
                Hemen Başla
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" align="center" gutterBottom fontWeight={600} mb={6}>
          Nasıl Çalışır?
        </Typography>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={4}
          sx={{ justifyContent: 'center' }}
        >
          <Box sx={{ flex: 1, textAlign: 'center', maxWidth: { md: '300px' } }}>
            <Box sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 'bold',
              mx: 'auto',
              mb: 2
            }}>
              1
            </Box>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Uzman Seçin
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Uzmanlık alanına ve ihtiyaçlarınıza göre size en uygun diyetisyeni bulun
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'center', maxWidth: { md: '300px' } }}>
            <Box sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'secondary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 'bold',
              mx: 'auto',
              mb: 2
            }}>
              2
            </Box>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Randevu Alın
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Uygun paketinizi seçin ve online görüşme için randevu oluşturun
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'center', maxWidth: { md: '300px' } }}>
            <Box sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'success.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 'bold',
              mx: 'auto',
              mb: 2
            }}>
              3
            </Box>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Rehberlik Alın
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Kişisel beslenme planınızı alın ve sürekli destek ile hedeflerinize ulaşın
            </Typography>
          </Box>
        </Stack>
      </Container>

      {/* Experts Section */}
      <Box id="experts-section" sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" gutterBottom fontWeight={600} mb={2}>
            Uzmanlarımızla Tanışın
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" mb={6}>
            Alanında uzman, sertifikalı sağlık danışmanlarımızı keşfedin
          </Typography>

          {/* Expert Type Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
            <Tabs
              value={selectedExpertType}
              onChange={(_, newValue) => setSelectedExpertType(newValue)}
              centered
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500
                }
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
              <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                Uzmanlık Alanları (Çoklu seçim yapabilirsiniz)
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {specializations
                  .filter(s => s.expertType === selectedExpertType)
                  .map(spec => (
                    <Chip
                      key={spec.id}
                      label={spec.name}
                      onClick={() => handleSpecializationToggle(spec.id)}
                      color={selectedSpecializations.includes(spec.id) ? 'primary' : 'default'}
                      variant={selectedSpecializations.includes(spec.id) ? 'filled' : 'outlined'}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
              </Stack>
            </Box>
          )}

          {/* Expert Cards */}
          {loading ? (
            <Typography align="center">Yükleniyor...</Typography>
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
                <Card key={expert.id} sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                      <Box sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        bgcolor: 'primary.light',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'primary.main',
                      }}>
                        {getExpertIcon(expert.expertType)}
                      </Box>
                      <Box>
                        <Typography variant="h6" component="div" fontWeight={600}>
                          {expert.displayName}
                        </Typography>
                        <Chip
                          label={getExpertTypeLabel(expert.expertType)}
                          size="small"
                          color="primary"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Stack>

                    <Stack spacing={1} mb={2}>
                      {expert.city && (
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          📍 {expert.city}
                        </Typography>
                      )}

                      {expert.experienceYears && (
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <WorkIcon fontSize="small" /> {expert.experienceYears}+ yıl deneyim
                        </Typography>
                      )}

                      {expert.averageRating && (
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <StarIcon fontSize="small" sx={{ color: 'warning.main' }} />
                          {expert.averageRating.toFixed(1)}
                        </Typography>
                      )}
                    </Stack>

                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => router.push(`/experts/${expert.id}`)}
                    >
                      Profili Görüntüle
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
        <Container maxWidth="md">
          <Box textAlign="center">
            <Typography variant="h3" gutterBottom fontWeight={600}>
              Sağlıklı Yaşam Yolculuğunuza Başlamaya Hazır mısınız?
            </Typography>
            <Typography variant="body1" paragraph sx={{ opacity: 0.9, mb: 4 }}>
              Binlerce kişi uzman diyetisyenlerimizle hedeflerine ulaştı. Sıra sizde!
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push('/register/client')}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'grey.100' },
                  px: 4
                }}
              >
                Danışan Olarak Kayıt Ol
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push('/register/expert')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                  px: 4
                }}
              >
                Uzman Olarak Katıl
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
