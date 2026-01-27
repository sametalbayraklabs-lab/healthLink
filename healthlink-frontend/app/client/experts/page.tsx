'use client';

import { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    Button,
    Chip,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Stack,
    Avatar,
    Rating,
    Divider,
    InputAdornment,
    CircularProgress,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import StarIcon from '@mui/icons-material/Star';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

interface Expert {
    id: number;
    displayName: string;
    title: string;
    expertType: string;
    bio: string;
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

interface Specialization {
    id: number;
    name: string;
    category: string;
    expertType: string;
}

export default function ClientExpertsPage() {
    const router = useRouter();
    const [experts, setExperts] = useState<Expert[]>([]);
    const [specializations, setSpecializations] = useState<Specialization[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedExpertType, setSelectedExpertType] = useState('All');
    const [selectedCity, setSelectedCity] = useState('All');
    const [selectedSpecializations, setSelectedSpecializations] = useState<number[]>([]);
    const [minRating, setMinRating] = useState(0);
    const [sortBy, setSortBy] = useState('rating');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [expertsResponse, specsResponse] = await Promise.all([
                api.get('/api/experts'),
                api.get('/api/specializations'),
            ]);

            setExperts(expertsResponse.data.items || expertsResponse.data || []);
            setSpecializations(specsResponse.data || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const expertTypes = [
        { value: 'All', label: 'Tümü' },
        { value: 'Dietitian', label: 'Diyetisyen' },
        { value: 'Psychologist', label: 'Psikolog' },
        { value: 'SportsCoach', label: 'Spor Koçu' },
    ];

    const cities = ['All', 'Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya'];

    const getExperienceYears = (startDate: string) => {
        if (!startDate) return 0;
        return new Date().getFullYear() - new Date(startDate).getFullYear();
    };

    const filteredAndSortedExperts = experts
        .filter((expert) => {
            // Search filter
            if (searchQuery && !expert.displayName.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !expert.specializations.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))) {
                return false;
            }

            // Expert type filter
            if (selectedExpertType !== 'All' && expert.expertType !== selectedExpertType) {
                return false;
            }

            // City filter
            if (selectedCity !== 'All' && expert.city !== selectedCity) {
                return false;
            }

            // Specialization filter
            if (selectedSpecializations.length > 0) {
                const expertSpecIds = expert.specializations.map(s => s.id);
                if (!selectedSpecializations.some(id => expertSpecIds.includes(id))) {
                    return false;
                }
            }

            // Rating filter
            if ((expert.averageRating || 0) < minRating) {
                return false;
            }

            return true;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'rating':
                    return (b.averageRating || 0) - (a.averageRating || 0);
                case 'experience':
                    return getExperienceYears(b.experienceStartDate) - getExperienceYears(a.experienceStartDate);
                case 'reviews':
                    return (b.totalReviews || 0) - (a.totalReviews || 0);
                default:
                    return 0;
            }
        });

    const handleSpecializationToggle = (specId: number) => {
        setSelectedSpecializations(prev =>
            prev.includes(specId)
                ? prev.filter(id => id !== specId)
                : [...prev, specId]
        );
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedExpertType('All');
        setSelectedCity('All');
        setSelectedSpecializations([]);
        setMinRating(0);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight={600} gutterBottom>
                Uzman Ara
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Size en uygun uzmanı bulun ve hemen randevu alın
            </Typography>

            {/* Filters - Horizontal Top Layout */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <FilterListIcon color="primary" />
                            <Typography variant="h6" fontWeight={600}>
                                Filtreler
                            </Typography>
                        </Box>
                        <Button size="small" onClick={clearFilters}>
                            Temizle
                        </Button>
                    </Box>

                    <Grid container spacing={2}>
                        {/* Search */}
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Uzman veya uzmanlık ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        {/* Expert Type */}
                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Uzman Tipi</InputLabel>
                                <Select
                                    value={selectedExpertType}
                                    label="Uzman Tipi"
                                    onChange={(e) => setSelectedExpertType(e.target.value)}
                                >
                                    {expertTypes.map((type) => (
                                        <MenuItem key={type.value} value={type.value}>
                                            {type.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* City */}
                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Şehir</InputLabel>
                                <Select
                                    value={selectedCity}
                                    label="Şehir"
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                >
                                    {cities.map((city) => (
                                        <MenuItem key={city} value={city}>
                                            {city === 'All' ? 'Tümü' : city}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Sort By */}
                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Sırala</InputLabel>
                                <Select
                                    value={sortBy}
                                    label="Sırala"
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <MenuItem value="rating">En Yüksek Puan</MenuItem>
                                    <MenuItem value="experience">En Deneyimli</MenuItem>
                                    <MenuItem value="reviews">En Çok Değerlendirilen</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Minimum Rating */}
                        <Grid item xs={12} sm={6} md={2}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                    Minimum Puan
                                </Typography>
                                <Rating
                                    value={minRating}
                                    onChange={(_, newValue) => setMinRating(newValue || 0)}
                                    precision={0.5}
                                    size="small"
                                />
                            </Box>
                        </Grid>

                        {/* Specializations */}
                        {selectedExpertType !== 'All' && (
                            <Grid item xs={12}>
                                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                    Uzmanlık Alanları
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
                                                size="small"
                                                sx={{ cursor: 'pointer' }}
                                            />
                                        ))}
                                </Stack>
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
            </Card>

            {/* Expert List */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="body1" color="text.secondary">
                    {filteredAndSortedExperts.length} uzman bulundu
                </Typography>
            </Box>

            {filteredAndSortedExperts.length === 0 ? (
                <Card>
                    <CardContent>
                        <Box textAlign="center" py={4}>
                            <LocalHospitalIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                Uzman bulunamadı
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Filtrelerinizi değiştirerek tekrar deneyin
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            ) : (
                <Stack spacing={2}>
                    {filteredAndSortedExperts.map((expert) => (
                        <Card key={expert.id} sx={{ '&:hover': { boxShadow: 4 }, transition: 'box-shadow 0.3s' }}>
                            <CardContent>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={8}>
                                        <Box display="flex" gap={2}>
                                            <Avatar
                                                sx={{
                                                    width: 80,
                                                    height: 80,
                                                    bgcolor: 'primary.main',
                                                    fontSize: '2rem',
                                                }}
                                            >
                                                {expert.displayName.charAt(0)}
                                            </Avatar>
                                            <Box flex={1}>
                                                <Typography variant="h6" fontWeight={600}>
                                                    {expert.displayName}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    {expert.title}
                                                </Typography>

                                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                                    <Rating value={expert.averageRating || 0} readOnly size="small" precision={0.5} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {(expert.averageRating || 0).toFixed(1)} ({expert.totalReviews || 0} değerlendirme)
                                                    </Typography>
                                                </Box>

                                                <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5} mb={1}>
                                                    <Chip
                                                        icon={<LocationOnIcon />}
                                                        label={expert.city}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                    <Chip
                                                        icon={<WorkIcon />}
                                                        label={`${getExperienceYears(expert.experienceStartDate)} yıl deneyim`}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                    <Chip
                                                        label={expert.workType}
                                                        size="small"
                                                        color="primary"
                                                        variant="outlined"
                                                    />
                                                </Stack>

                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                    {expert.bio ? expert.bio.substring(0, 150) : 'Henüz biyografi eklenmemiş'}
                                                    {expert.bio && expert.bio.length > 150 && '...'}
                                                </Typography>

                                                <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                                                    {expert.specializations.slice(0, 3).map((spec) => (
                                                        <Chip
                                                            key={spec.id}
                                                            label={spec.name}
                                                            size="small"
                                                            color="secondary"
                                                        />
                                                    ))}
                                                    {expert.specializations.length > 3 && (
                                                        <Chip
                                                            label={`+${expert.specializations.length - 3}`}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    )}
                                                </Stack>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12} sm={4}>
                                        <Box display="flex" flexDirection="column" gap={1} height="100%" justifyContent="center">
                                            <Button
                                                variant="contained"
                                                fullWidth
                                                startIcon={<CalendarMonthIcon />}
                                                onClick={() => router.push(`/client/appointments/new?expertId=${expert.id}`)}
                                            >
                                                Randevu Al
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                fullWidth
                                                onClick={() => router.push(`/experts/${expert.id}`)}
                                            >
                                                Profili Görüntüle
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            )}
        </Container>
    );
}
