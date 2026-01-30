'use client';

import { useState, useEffect } from 'react';
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
    Grid,
    Card,
    CardContent,
    Chip,
    Avatar,
    Rating,
    Badge,
    Autocomplete,
} from '@mui/material';
import { LocalizationProvider, DateCalendar } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { Availability, TimeSlot } from '@/types/expert';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107';

interface ExpertListItem {
    id: number;
    displayName?: string;
    expertType: string;
    city?: string;
    averageRating?: number;
    totalReviewCount: number;
    specializations: string[];
}

interface Specialization {
    id: number;
    name: string;
    category: string;
}

export default function NewAppointmentPage() {
    const [experts, setExperts] = useState<ExpertListItem[]>([]);
    const [selectedExpert, setSelectedExpert] = useState<ExpertListItem | null>(null);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [availability, setAvailability] = useState<Availability | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [myPackages, setMyPackages] = useState<any[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<number | null>(null);

    // Filters
    const [onlyMyPackages, setOnlyMyPackages] = useState(false);
    const [expertType, setExpertType] = useState('');
    const [specializations, setSpecializations] = useState<Specialization[]>([]);
    const [selectedSpecializations, setSelectedSpecializations] = useState<Specialization[]>([]);

    useEffect(() => {
        fetchExperts();
        fetchMyPackages();
    }, [expertType, selectedSpecializations]);

    useEffect(() => {
        if (expertType) {
            fetchSpecializations();
        } else {
            setSpecializations([]);
            setSelectedSpecializations([]);
        }
    }, [expertType]);

    const fetchSpecializations = async () => {
        try {
            const params = new URLSearchParams();
            if (expertType) params.append('expertType', expertType);

            const response = await fetch(`${API_URL}/api/specializations?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setSpecializations(data);
            }
        } catch (error) {
            console.error('Error fetching specializations:', error);
        }
    };

    const fetchExperts = async () => {
        try {
            const params = new URLSearchParams();
            if (expertType) params.append('expertType', expertType);

            // Add specialization IDs to params
            selectedSpecializations.forEach(spec => {
                params.append('specializationId', spec.id.toString());
            });

            const response = await fetch(`${API_URL}/api/experts?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setMyPackages(data.filter((pkg: any) => pkg.status === 'Active'));
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
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setAvailability(data);
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
            const startDateTime = dayjs(`${selectedDate.format('YYYY-MM-DD')} ${selectedSlot.startTime}`).toISOString();
            const endDateTime = dayjs(`${selectedDate.format('YYYY-MM-DD')} ${selectedSlot.endTime}`).toISOString();

            const response = await fetch(`${API_URL}/api/appointments/${selectedPackage}/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    expertId: selectedExpert.id,
                    clientPackageId: selectedPackage,
                    serviceType: 'Online',
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
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight={600}>
                Uzmanlarımız
            </Typography>

            {/* Filters - Only show when no expert is selected */}
            {!selectedExpert && (
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={onlyMyPackages}
                                        onChange={(e) => setOnlyMyPackages(e.target.checked)}
                                    />
                                }
                                label="Sadece Paketime Uygun Uzmanlar"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                select
                                fullWidth
                                label="Uzman Türü"
                                value={expertType}
                                onChange={(e) => setExpertType(e.target.value)}
                                sx={{ minWidth: 200 }}
                            >
                                <MenuItem value="">Tümü</MenuItem>
                                <MenuItem value="Psychologist">Psikolog</MenuItem>
                                <MenuItem value="Dietitian">Diyetisyen</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6} md={6}>
                            <Autocomplete
                                multiple
                                options={specializations}
                                getOptionLabel={(option) => option.name}
                                value={selectedSpecializations}
                                onChange={(_, newValue) => setSelectedSpecializations(newValue)}
                                disabled={!expertType}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Uzmanlık Alanları"
                                        placeholder={expertType ? "Seçiniz..." : "Önce uzman türü seçin"}
                                    />
                                )}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            label={option.name}
                                            {...getTagProps({ index })}
                                            size="small"
                                        />
                                    ))
                                }
                            />
                        </Grid>
                    </Grid>
                </Paper>
            )}


            {/* Expert Grid or Selected Expert */}
            {!selectedExpert ? (
                <Grid container spacing={3}>
                    {experts.map((expert) => (
                        <Grid item xs={12} md={6} lg={4} key={expert.id}>
                            <Card sx={{ height: '100%', position: 'relative' }}>
                                {/* Online Badge */}
                                <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                                    <Chip
                                        label="ÇEVRİMİÇİ"
                                        size="small"
                                        sx={{
                                            bgcolor: '#e0f7f4',
                                            color: '#00a896',
                                            fontWeight: 600,
                                            fontSize: '0.7rem'
                                        }}
                                    />
                                </Box>

                                <CardContent sx={{ p: 3 }}>
                                    {/* Profile Section */}
                                    <Box display="flex" gap={2} mb={2}>
                                        <Badge
                                            overlap="circular"
                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                            badgeContent={
                                                <Box
                                                    sx={{
                                                        width: 14,
                                                        height: 14,
                                                        borderRadius: '50%',
                                                        bgcolor: '#4caf50',
                                                        border: '2px solid white',
                                                    }}
                                                />
                                            }
                                        >
                                            <Avatar
                                                sx={{
                                                    width: 80,
                                                    height: 80,
                                                    bgcolor: 'primary.main'
                                                }}
                                            >
                                                {expert.displayName?.[0] || 'U'}
                                            </Avatar>
                                        </Badge>

                                        <Box flex={1}>
                                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                                {expert.displayName || 'İsimsiz Uzman'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                {expert.expertType === 'Psychologist' ? 'Psikolog' : 'Diyetisyen'}
                                            </Typography>
                                            <Rating value={expert.averageRating || 0} readOnly size="small" />
                                        </Box>
                                    </Box>

                                    {/* Bio/Description */}
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 60 }}>
                                        {expert.specializations && expert.specializations.length > 0
                                            ? `Uzmanlık: ${expert.specializations.join(', ')}`
                                            : 'Deneyimli uzman. Randevu alarak detaylı bilgi alabilirsiniz.'}
                                    </Typography>

                                    {/* Specializations */}
                                    {expert.specializations && expert.specializations.length > 0 && (
                                        <Box mb={2}>
                                            <Box display="flex" flexWrap="wrap" gap={0.5}>
                                                {expert.specializations.slice(0, 3).map((s, idx) => (
                                                    <Chip
                                                        key={idx}
                                                        label={s}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Action Buttons */}
                                    <Box display="flex" gap={1} mt={2}>
                                        <Button
                                            variant="outlined"
                                            size="medium"
                                            sx={{ flex: 1 }}
                                            href={`/experts/${expert.id}`}
                                        >
                                            Profil
                                        </Button>
                                        <Button
                                            variant="contained"
                                            size="medium"
                                            sx={{ flex: 1 }}
                                            onClick={() => handleExpertSelect(expert)}
                                        >
                                            Randevu Al
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Grid container spacing={3}>
                    {/* Expert Profile */}
                    <Grid item xs={12} md={4}>
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
                                        <Avatar sx={{ width: 120, height: 120, mb: 2 }}>
                                            {selectedExpert.displayName?.[0] || 'U'}
                                        </Avatar>
                                    </Badge>
                                    <Typography variant="h5" fontWeight={600}>
                                        {selectedExpert.displayName || 'İsimsiz Uzman'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {selectedExpert.expertType === 'Psychologist' ? 'Psikolog' : 'Diyetisyen'}
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
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Calendar + Time Slots */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 3 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6">
                                    Tarih ve Saat Seçin
                                </Typography>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => setSelectedExpert(null)}
                                >
                                    Geri
                                </Button>
                            </Box>

                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateCalendar
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    minDate={dayjs()}
                                />
                            </LocalizationProvider>

                            {selectedDate && availability && (
                                <Box mt={3}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Müsait Saatler ({selectedDate.format('DD MMMM YYYY')}):
                                    </Typography>

                                    {availability.availableSlots.length === 0 ? (
                                        <Typography color="text.secondary">
                                            Bu tarihte müsait saat bulunmamaktadır.
                                        </Typography>
                                    ) : (
                                        <Grid container spacing={1}>
                                            {availability.availableSlots.map((slot, index) => (
                                                <Grid item key={index}>
                                                    <Button
                                                        variant={selectedSlot === slot ? 'contained' : 'outlined'}
                                                        onClick={() => setSelectedSlot(slot)}
                                                    >
                                                        {slot.startTime} - {slot.endTime}
                                                    </Button>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    )}
                                </Box>
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
                    </Grid>
                </Grid>
            )}

            {!selectedExpert && experts.length === 0 && (
                <Box textAlign="center" py={8}>
                    <Typography variant="h6" color="text.secondary">
                        Uzman bulunamadı
                    </Typography>
                </Box>
            )}
        </Container>
    );
}
