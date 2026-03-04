'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Box,
    Container,
    Typography,
    TextField,
    FormControlLabel,
    Checkbox,
    MenuItem,
    Paper,
    Button,
    Card,
    CardContent,
    Chip,
    Avatar,
    Rating,
    Badge,
    Stack,
    FormControl,
    InputLabel,
    Select,
    OutlinedInput,
    ListItemText,
    InputAdornment,
    Tooltip,
    Snackbar,
    Alert,
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PsychologyIcon from '@mui/icons-material/Psychology';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import StarIcon from '@mui/icons-material/Star';
import WorkIcon from '@mui/icons-material/Work';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CircleIcon from '@mui/icons-material/Circle';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/tr';
import TurkishDateCalendar from '@/app/shared/TurkishDateCalendar';
import { useSearchParams, useRouter } from 'next/navigation';
import ExpertCard, { ExpertCardData } from '@/components/ExpertCard';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';

dayjs.locale('tr');
import { Availability, TimeSlot } from '@/types/expert';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107';

const getExpertTypeLabel = (type: string) => {
    switch (type) {
        case 'All': return 'Tümü';
        case 'Dietitian': return 'Diyetisyen';
        case 'Psychologist': return 'Psikolog';
        case 'SportsCoach': return 'Spor Koçu';
        default: return type;
    }
};

const getExpertIcon = (type: string) => {
    switch (type) {
        case 'Dietitian': return <LocalHospitalIcon />;
        case 'Psychologist': return <PsychologyIcon />;
        case 'SportsCoach': return <FitnessCenterIcon />;
        default: return <LocalHospitalIcon />;
    }
};

const getServiceType = (expertType: string) => {
    switch (expertType) {
        case 'Dietitian': return 'NutritionSession';
        case 'Psychologist': return 'TherapySession';
        case 'SportsCoach': return 'TrainingSession';
        default: return 'TherapySession';
    }
};

interface LookupItem {
    value: string;
    label: string;
}

interface ExpertListItem {
    id: number;
    displayName?: string;
    expertType: string;
    city?: string;
    averageRating?: number;
    totalReviewCount: number;
    specializations: string[];
    profileDescription?: string;
    profilePhotoUrl?: string;
    isOnline?: boolean;
}

interface SpecializationItem {
    id: number;
    name: string;
    category: string;
    expertType: string;
}

export default function NewAppointmentPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const expertIdParam = searchParams.get('expertId');
    const autoSelectedRef = useRef(false);
    const { openChatWithExpert } = useChat();
    const { user } = useAuth();
    const isClient = user?.roles.includes('Client');

    const [experts, setExperts] = useState<ExpertListItem[]>([]);
    const [selectedExpert, setSelectedExpert] = useState<ExpertListItem | null>(null);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [availability, setAvailability] = useState<Availability | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [myPackages, setMyPackages] = useState<any[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<number | null>(null);

    // Filters
    const [expertType, setExpertType] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [specializations, setSpecializations] = useState<SpecializationItem[]>([]);
    const [selectedSpecializations, setSelectedSpecializations] = useState<number[]>([]);
    const [sortBy, setSortBy] = useState('');
    const [minRating, setMinRating] = useState<number | null>(null);
    const [filterOnline, setFilterOnline] = useState(false);
    const [appointmentWarning, setAppointmentWarning] = useState(false);
    const [messageWarning, setMessageWarning] = useState(false);

    useEffect(() => {
        fetchExperts();
        fetchMyPackages();
    }, [expertType, selectedSpecializations, sortBy, filterOnline]);
    useEffect(() => {
        fetchSpecializations();
    }, [expertType]);


    // Auto-select expert from URL param + auto-select today's date
    useEffect(() => {
        if (expertIdParam && experts.length > 0 && !autoSelectedRef.current) {
            const expert = experts.find(e => e.id === Number(expertIdParam));
            if (expert) {
                autoSelectedRef.current = true;
                setSelectedExpert(expert);

                // Auto-select today and fetch availability
                const today = dayjs();
                setSelectedDate(today);
                const dateStr = today.format('YYYY-MM-DD');
                fetch(`${API_URL}/api/experts/${expert.id}/availability?date=${dateStr}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                })
                    .then(res => res.ok ? res.json() : null)
                    .then(data => { if (data) setAvailability(data); })
                    .catch(err => console.error('Error fetching availability:', err));
            }
        }
    }, [expertIdParam, experts]);

    // When browser back removes the expertId param, clear the selected expert
    useEffect(() => {
        if (!expertIdParam) {
            setSelectedExpert(null);
            setSelectedDate(null);
            setAvailability(null);
            setSelectedSlot(null);
            autoSelectedRef.current = false;
        }
    }, [expertIdParam]);

    const fetchSpecializations = async () => {
        try {
            const params = new URLSearchParams();
            if (expertType) params.append('expertType', expertType);
            const response = await fetch(`${API_URL}/api/specializations?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setSpecializations(data || []);
            }
        } catch (error) {
            console.error('Error fetching specializations:', error);
        }
    };

    const fetchExperts = async () => {
        try {
            const params = new URLSearchParams();
            if (expertType) params.append('expertType', expertType);
            if (selectedSpecializations.length === 1) {
                params.append('specializationId', selectedSpecializations[0].toString());
            }
            if (sortBy) params.append('sort', sortBy);
            if (filterOnline) params.append('isOnline', 'true');

            const response = await fetch(`${API_URL}/api/experts?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setExperts(data.items || []);
            }
        } catch (error) {
            console.error('Error fetching experts:', error);
        }
    };

    const fetchMyPackages = async () => {
        try {
            const response = await fetch(`${API_URL}/api/client-packages/me`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                const activePackages = data.filter((pkg: any) => pkg.status === 'Active' && (pkg.totalSessions - pkg.usedSessions) > 0);
                setMyPackages(activePackages);
                // Auto-select if only 1 active package
                if (activePackages.length === 1) {
                    setSelectedPackage(activePackages[0].id);
                }
            }
        } catch (error) {
            console.error('Error fetching packages:', error);
        }
    };

    const handleExpertSelect = (expert: ExpertListItem) => {
        setSelectedExpert(expert);
        setSelectedDate(null);
        setAvailability(null);
        setSelectedSlot(null);
        router.push(`/client/appointments/new?expertId=${expert.id}`);
    };

    const handleBackToList = () => {
        setSelectedExpert(null);
        setSelectedDate(null);
        setAvailability(null);
        setSelectedSlot(null);
        autoSelectedRef.current = false;
        router.push('/client/appointments/new');
    };

    const handleDateChange = async (date: Dayjs | null) => {
        if (!date || !selectedExpert) return;

        setSelectedDate(date);
        setSelectedSlot(null);

        try {
            const dateStr = date.format('YYYY-MM-DD');
            const response = await fetch(
                `${API_URL}/api/experts/${selectedExpert.id}/availability?date=${dateStr}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                console.log('[NewAppointment] Availability API response:', JSON.stringify(data));
                setAvailability(data);
            } else {
                console.error('[NewAppointment] API error:', response.status, await response.text());
            }
        } catch (error) {
            console.error('Error fetching availability:', error);
        }
    };

    const handleCreateAppointment = async () => {
        if (!selectedExpert || !selectedDate || !selectedSlot || !selectedPackage) {
            alert('Lütfen tüm alanları doldurun');
            return;
        }

        try {
            const startDateTime = dayjs(`${selectedDate.format('YYYY-MM-DD')} ${selectedSlot.startTime}`).format('YYYY-MM-DDTHH:mm:ss');
            const endDateTime = dayjs(`${selectedDate.format('YYYY-MM-DD')} ${selectedSlot.endTime}`).format('YYYY-MM-DDTHH:mm:ss');

            const response = await fetch(`${API_URL}/api/appointments/${selectedPackage}/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({
                    expertId: selectedExpert.id,
                    clientPackageId: selectedPackage,
                    serviceType: getServiceType(selectedExpert.expertType),
                    startDateTime,
                    endDateTime,
                }),
            });

            if (response.ok) {
                alert('Randevu başarıyla oluşturuldu!');
                window.location.href = '/client/appointments';
            } else {
                const error = await response.json();
                alert(`Hata: ${error.message || 'Randevu oluşturulamadı'}`);
            }
        } catch (error) {
            console.error('Error creating appointment:', error);
            alert('Bir hata oluştu');
        }
    };

    return (
        <>
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Typography variant="h4" gutterBottom fontWeight={600}>
                    Uzmanlarımız
                </Typography>

                {/* Filters - Only show when no expert is selected */}
                {!selectedExpert && (
                    <Card sx={{ p: 3, mb: 3, transition: 'none', '&:hover': { transform: 'none' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <FilterListIcon color="primary" />
                            <Typography variant="h6" fontWeight={600}>Filtreler</Typography>
                        </Box>
                        {/* Filtreler: sol grup + sağda sıralama */}
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            {/* Sol grup: tüm filtreler */}
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
                                {/* Search */}
                                <TextField
                                    size="small"
                                    placeholder="İsim ara..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    sx={{ minWidth: 130 }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                {/* Expert Type */}
                                <TextField
                                    select
                                    size="small"
                                    label="Uzman Türü"
                                    value={expertType}
                                    onChange={(e) => {
                                        setExpertType(e.target.value);
                                        setSelectedSpecializations([]);
                                    }}
                                    sx={{ minWidth: 130 }}
                                >
                                    <MenuItem value="">Tümü</MenuItem>
                                    <MenuItem value="Dietitian">Diyetisyen</MenuItem>
                                    <MenuItem value="Psychologist">Psikolog</MenuItem>
                                    <MenuItem value="SportsCoach">Spor Koçu</MenuItem>
                                </TextField>

                                {/* Specializations */}
                                <Tooltip title={!expertType ? 'Önce uzman türü seçin' : ''} placement="top">
                                    <FormControl size="small" sx={{ minWidth: 130 }} disabled={!expertType}>
                                        <InputLabel>Uzmanlık</InputLabel>
                                        <Select
                                            multiple
                                            value={selectedSpecializations}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setSelectedSpecializations(typeof val === 'string' ? [] : val as number[]);
                                            }}
                                            input={<OutlinedInput label="Uzmanlık" />}
                                            renderValue={(selected) => {
                                                if (selected.length === 0) return '';
                                                return selected.map(id => specializations.find(s => s.id === id)?.name || '').join(', ');
                                            }}
                                        >
                                            {specializations.map((spec) => (
                                                <MenuItem key={spec.id} value={spec.id}>
                                                    <Checkbox checked={selectedSpecializations.indexOf(spec.id) > -1} size="small" />
                                                    <ListItemText primary={spec.name} />
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Tooltip>

                                {/* Min Rating */}
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                                        Min. Puan
                                    </Typography>
                                    <Rating
                                        value={minRating}
                                        onChange={(_, newValue) => setMinRating(newValue)}
                                        size="small"
                                    />
                                </Box>

                                {/* Çevrimiçi */}
                                <Chip
                                    icon={<CircleIcon sx={{ fontSize: '10px !important', color: filterOnline ? '#4caf50 !important' : undefined }} />}
                                    label="Çevrimiçi"
                                    onClick={() => setFilterOnline(!filterOnline)}
                                    color={filterOnline ? 'success' : 'default'}
                                    variant={filterOnline ? 'filled' : 'outlined'}
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: '0.85rem',
                                        py: 2.5,
                                        px: 1,
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        whiteSpace: 'nowrap',
                                        ...(filterOnline && {
                                            boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                                        }),
                                    }}
                                />
                            </Box>

                            {/* Sağ: Sıralama */}
                            <TextField
                                select
                                size="small"
                                label="Sıralama"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                sx={{ minWidth: 160 }}
                            >
                                <MenuItem value="">Varsayılan</MenuItem>
                                <MenuItem value="rating-desc">En Yüksek Puan</MenuItem>
                            </TextField>
                        </Box>

                        {/* Active filter chips */}
                        {(searchQuery || expertType || selectedSpecializations.length > 0 || sortBy || minRating || filterOnline) && (
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2, alignItems: 'center' }}>
                                <Typography variant="caption" color="text.secondary">Aktif filtreler:</Typography>
                                {searchQuery && (
                                    <Chip label={`Arama: ${searchQuery}`} size="small" onDelete={() => setSearchQuery('')} />
                                )}
                                {expertType && (
                                    <Chip label={getExpertTypeLabel(expertType)} size="small" color="primary" variant="outlined" onDelete={() => setExpertType('')} />
                                )}
                                {selectedSpecializations.map(id => {
                                    const spec = specializations.find(s => s.id === id);
                                    return spec ? (
                                        <Chip key={id} label={spec.name} size="small" color="secondary" variant="outlined"
                                            onDelete={() => setSelectedSpecializations(prev => prev.filter(s => s !== id))} />
                                    ) : null;
                                })}
                                {sortBy && (
                                    <Chip label="En Yüksek Puan" size="small" onDelete={() => setSortBy('')} />
                                )}
                                {minRating && (
                                    <Chip label={`Min ${minRating}★`} size="small" onDelete={() => setMinRating(null)} />
                                )}
                                {filterOnline && (
                                    <Chip icon={<CircleIcon sx={{ fontSize: '10px !important' }} />} label="Çevrimiçi" size="small" color="success" onDelete={() => setFilterOnline(false)} />
                                )}
                                <Button size="small" onClick={() => {
                                    setSearchQuery('');
                                    setExpertType('');
                                    setSelectedSpecializations([]);
                                    setSortBy('');
                                    setMinRating(null);
                                    setFilterOnline(false);
                                }}>
                                    Temizle
                                </Button>
                            </Box>
                        )}
                    </Card>
                )}


                {/* Expert Grid or Selected Expert */}
                {!selectedExpert ? (
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                        gap: 3
                    }}>
                        {experts
                            .filter(e => !searchQuery || e.displayName?.toLowerCase().includes(searchQuery.toLowerCase()))
                            .filter(e => !minRating || (e.averageRating && e.averageRating >= minRating))
                            .filter(e => selectedSpecializations.length <= 1 || selectedSpecializations.every(specId => {
                                const specName = specializations.find(s => s.id === specId)?.name;
                                return specName && e.specializations.includes(specName);
                            }))
                            .map((expert) => (
                                <ExpertCard
                                    key={expert.id}
                                    expert={expert as ExpertCardData}
                                    onAppointmentClick={() => {
                                        if (isClient) handleExpertSelect(expert);
                                        else setAppointmentWarning(true);
                                    }}
                                    onMessageClick={(e) => {
                                        if (isClient) openChatWithExpert(e.id);
                                        else setMessageWarning(true);
                                    }}
                                />
                            ))}
                    </Box>
                ) : (
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                        gap: 3,
                    }}>
                        {/* Expert Profile */}
                        <Box>
                            <Card>
                                <CardContent>
                                    <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                                        <Badge
                                            overlap="circular"
                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                            badgeContent={
                                                <Box
                                                    sx={{
                                                        width: 16,
                                                        height: 16,
                                                        borderRadius: '50%',
                                                        bgcolor: '#4caf50',
                                                        border: '3px solid white',
                                                    }}
                                                />
                                            }
                                        >
                                            <Avatar src={selectedExpert.profilePhotoUrl ? `${API_URL}${selectedExpert.profilePhotoUrl}` : undefined} sx={{ width: 120, height: 120, mb: 2 }}>
                                                {selectedExpert.displayName?.[0] || 'U'}
                                            </Avatar>
                                        </Badge>
                                        <Typography variant="h5" fontWeight={600}>
                                            {selectedExpert.displayName || 'İsimsiz Uzman'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {getExpertTypeLabel(selectedExpert.expertType)}
                                        </Typography>
                                        <Box display="flex" alignItems="center" gap={1} mt={1}>
                                            <Rating value={selectedExpert.averageRating || 0} readOnly />
                                            <Typography variant="caption">
                                                ({selectedExpert.totalReviewCount || 0} değerlendirme)
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {selectedExpert.specializations && selectedExpert.specializations.length > 0 && (
                                        <>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Uzmanlık Alanları:
                                            </Typography>
                                            <Box mb={2}>
                                                {selectedExpert.specializations.map((s, idx) => (
                                                    <Chip key={idx} label={s} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                                                ))}
                                            </Box>
                                        </>
                                    )}

                                    {/* Profile Description */}
                                    {selectedExpert.profileDescription && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                                            {selectedExpert.profileDescription}
                                        </Typography>
                                    )}

                                    {/* Profile Button */}
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        href={`/experts/${selectedExpert.id}`}
                                        sx={{ borderRadius: '12px' }}
                                    >
                                        Profili Görüntüle
                                    </Button>
                                </CardContent>
                            </Card>
                        </Box>

                        {/* Calendar */}
                        <Box>
                            <Paper sx={{ p: 3 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h6">
                                        Tarih Seçin
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={handleBackToList}
                                    >
                                        Geri
                                    </Button>
                                </Box>
                                <TurkishDateCalendar
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    minDate={dayjs()}
                                />
                            </Paper>
                        </Box>

                        {/* Time Slots */}
                        <Box>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Saat Seçin
                                </Typography>

                                {!selectedDate ? (
                                    <Typography color="text.secondary">
                                        Lütfen önce bir tarih seçin.
                                    </Typography>
                                ) : !availability ? (
                                    <Typography color="text.secondary">
                                        Yükleniyor...
                                    </Typography>
                                ) : availability.availableSlots.length === 0 ? (
                                    <Typography color="text.secondary">
                                        Bu tarihte müsait saat bulunmamaktadır.
                                    </Typography>
                                ) : (
                                    <>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            {selectedDate.format('DD MMMM YYYY')} — {availability.availableSlots.length} müsait saat
                                        </Typography>
                                        <Box sx={{
                                            display: 'grid',
                                            gridTemplateColumns: {
                                                xs: 'repeat(2, 1fr)',
                                                sm: 'repeat(3, 1fr)',
                                                md: 'repeat(4, 1fr)'
                                            },
                                            gap: 1
                                        }}>
                                            {availability.availableSlots.map((slot, index) => (
                                                <Box
                                                    key={index}
                                                    onClick={() => setSelectedSlot(slot)}
                                                    sx={{
                                                        border: '2px solid',
                                                        borderColor: selectedSlot === slot ? 'primary.main' : 'divider',
                                                        borderRadius: 2,
                                                        p: 1.5,
                                                        textAlign: 'center',
                                                        cursor: 'pointer',
                                                        bgcolor: selectedSlot === slot ? 'primary.main' : 'transparent',
                                                        color: selectedSlot === slot ? 'white' : 'text.primary',
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            borderColor: 'primary.main',
                                                            bgcolor: selectedSlot === slot ? 'primary.dark' : 'primary.50',
                                                        }
                                                    }}
                                                >
                                                    <Typography variant="subtitle2" fontWeight="bold">
                                                        {slot.startTime}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        — {slot.endTime}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </>
                                )}

                                {selectedSlot && myPackages.length > 0 && (
                                    <Box mt={3}>
                                        <TextField
                                            select
                                            fullWidth
                                            label="Paket Seçin"
                                            value={selectedPackage || ''}
                                            onChange={(e) => setSelectedPackage(Number(e.target.value))}
                                        >
                                            {myPackages.map((pkg: any) => (
                                                <MenuItem key={pkg.id} value={pkg.id}>
                                                    {pkg.servicePackage.name} ({pkg.totalSessions - pkg.usedSessions} seans kaldı)
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Box>
                                )}

                                {selectedSlot && myPackages.length === 0 && (
                                    <Box mt={3} textAlign="center">
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Randevu almak için aktif bir paketiniz olmalıdır.
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            href="/client/packages"
                                        >
                                            Paket Satın Al
                                        </Button>
                                    </Box>
                                )}

                                {selectedSlot && selectedPackage && (
                                    <Box mt={3} display="flex" gap={2}>
                                        <Button
                                            variant="outlined"
                                            onClick={() => {
                                                setSelectedSlot(null);
                                                setSelectedPackage(null);
                                            }}
                                        >
                                            İptal
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={handleCreateAppointment}
                                        >
                                            Randevu Oluştur
                                        </Button>
                                    </Box>
                                )}
                            </Paper>
                        </Box>
                    </Box>
                )}

                {!selectedExpert && experts.length === 0 && (
                    <Box textAlign="center" py={8}>
                        <Typography variant="h6" color="text.secondary">
                            Uzman bulunamadı
                        </Typography>
                    </Box>
                )}
            </Container>

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

