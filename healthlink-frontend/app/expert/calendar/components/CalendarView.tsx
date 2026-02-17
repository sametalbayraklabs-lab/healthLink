'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    Button,
    Stack,
    Divider,
    CircularProgress,
    Switch
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SaveIcon from '@mui/icons-material/Save';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107';

interface Props {
    onError: (message: string) => void;
    onSuccess: (message: string) => void;
}

enum SlotStatus {
    Available = 'Available',
    Booked = 'Booked',
    Closed = 'Closed',
    ExceptionClosed = 'ExceptionClosed'
}

interface TimeSlot {
    timeSlotTemplateId: number;
    startTime: string;   // "09:00"
    endTime: string;     // "09:30"
    status: SlotStatus;
}

export default function CalendarView({ onError, onSuccess }: Props) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const fetchAvailability = async (date: Date) => {
        try {
            setLoading(true);
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            const response = await fetch(`${API_URL}/api/expert/availability/daily?date=${dateStr}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    onError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
                    return;
                }
                throw new Error('Müsaitlik bilgisi alınamadı');
            }

            const slots = await response.json();

            const mapped: TimeSlot[] = slots.map((s: any) => ({
                timeSlotTemplateId: s.timeSlotTemplateId,
                startTime: s.startTime,
                endTime: s.endTime,
                status: s.status as SlotStatus
            }));

            setTimeSlots(mapped);
            setHasChanges(false);
        } catch (err) {
            onError(err instanceof Error ? err.message : 'Bir hata oluştu');
            setTimeSlots([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAvailability(selectedDate);
    }, [selectedDate]);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        let startDayOfWeek = firstDay.getDay() - 1;
        if (startDayOfWeek === -1) startDayOfWeek = 6;

        const days: (Date | null)[] = [];

        for (let i = 0; i < startDayOfWeek; i++) {
            days.push(null);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const handlePreviousMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setCurrentDate(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setCurrentDate(newDate);
    };

    const handleMonthChange = (event: any) => {
        const [year, month] = event.target.value.split('-');
        setCurrentDate(new Date(parseInt(year), parseInt(month), 1));
    };

    const getMonthYearValue = (date: Date) => {
        return `${date.getFullYear()}-${date.getMonth()}`;
    };

    const isToday = (date: Date | null) => {
        if (!date) return false;
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isSelected = (date: Date | null) => {
        if (!date) return false;
        return date.toDateString() === selectedDate.toDateString();
    };

    const handleDateClick = (date: Date | null) => {
        if (date) {
            setSelectedDate(date);
        }
    };

    const toggleTimeSlot = (index: number) => {
        setTimeSlots(prev => prev.map((slot, i) => {
            if (i !== index) return slot;

            // Don't allow changing booked or exception-closed slots
            if (slot.status === SlotStatus.Booked || slot.status === SlotStatus.ExceptionClosed) return slot;

            // Toggle: Closed <-> Available
            const newStatus = slot.status === SlotStatus.Closed
                ? SlotStatus.Available
                : SlotStatus.Closed;

            return { ...slot, status: newStatus };
        }));
        setHasChanges(true);
    };

    const handleSaveSlots = async () => {
        try {
            setSaving(true);

            const year = selectedDate.getFullYear();
            const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
            const day = selectedDate.getDate().toString().padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            // Send only Available and Closed slots (not Booked/ExceptionClosed)
            const payload = {
                date: dateStr,
                slots: timeSlots
                    .filter(s => s.status !== SlotStatus.Booked && s.status !== SlotStatus.ExceptionClosed)
                    .map(s => ({
                        timeSlotTemplateId: s.timeSlotTemplateId,
                        status: s.status
                    }))
            };

            const response = await fetch(`${API_URL}/api/expert/availability/daily`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || 'Kaydetme başarısız');
            }

            const updatedSlots = await response.json();

            const mapped: TimeSlot[] = updatedSlots.map((s: any) => ({
                timeSlotTemplateId: s.timeSlotTemplateId,
                startTime: s.startTime,
                endTime: s.endTime,
                status: s.status as SlotStatus
            }));

            setTimeSlots(mapped);
            setHasChanges(false);
            onSuccess('Saat aralıkları başarıyla kaydedildi');
        } catch (err) {
            onError(err instanceof Error ? err.message : 'Bir hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    const DAY_NAMES = ['P', 'S', 'Ç', 'P', 'C', 'C', 'P'];
    const MONTHS = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];

    const getMonthOptions = () => {
        const options = [];
        const currentYear = new Date().getFullYear();
        for (let year = currentYear - 1; year <= currentYear + 1; year++) {
            for (let month = 0; month < 12; month++) {
                options.push({
                    value: `${year}-${month}`,
                    label: `${MONTHS[month]} ${year}`
                });
            }
        }
        return options;
    };

    const getSlotColor = (status: SlotStatus) => {
        switch (status) {
            case SlotStatus.Available:
                return { border: 'success.main', bg: 'success.50', text: 'success.main', label: '✓ Müsait' };
            case SlotStatus.Booked:
                return { border: 'error.main', bg: 'error.50', text: 'error.main', label: '✗ Dolu' };
            case SlotStatus.ExceptionClosed:
                return { border: 'warning.main', bg: 'warning.50', text: 'warning.main', label: '⚠ İstisna' };
            default:
                return { border: 'divider', bg: 'grey.100', text: 'text.secondary', label: '— Kapalı' };
        }
    };

    const availableCount = timeSlots.filter(s => s.status === SlotStatus.Available).length;
    const bookedCount = timeSlots.filter(s => s.status === SlotStatus.Booked).length;
    const closedCount = timeSlots.filter(s => s.status === SlotStatus.Closed).length;
    const exceptionCount = timeSlots.filter(s => s.status === SlotStatus.ExceptionClosed).length;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mb: 1 }}>
                Müsaitlik Takvimi
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Bir güne tıklayarak o gün için müsait olduğunuz saatleri belirleyin
            </Typography>

            <Box sx={{ display: 'flex', gap: 3 }}>
                {/* Calendar Section */}
                <Box sx={{ flex: '0 0 65%' }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 2
                        }}
                    >
                        {/* Month Selector */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                            <FormControl size="small" sx={{ minWidth: 180 }}>
                                <Select
                                    value={getMonthYearValue(currentDate)}
                                    onChange={handleMonthChange}
                                    sx={{
                                        fontWeight: 600,
                                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                        '& .MuiSelect-select': { py: 0.5 }
                                    }}
                                >
                                    {getMonthOptions().map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Box>
                                <IconButton size="small" onClick={handlePreviousMonth}>
                                    <ChevronLeftIcon />
                                </IconButton>
                                <IconButton size="small" onClick={handleNextMonth}>
                                    <ChevronRightIcon />
                                </IconButton>
                            </Box>
                        </Box>

                        {/* Calendar Grid */}
                        <Box>
                            <Box sx={{ display: 'flex', mb: 1 }}>
                                {DAY_NAMES.map((day, index) => (
                                    <Box
                                        key={`day-${index}`}
                                        sx={{ flex: 1, textAlign: 'center' }}
                                    >
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            fontWeight={500}
                                        >
                                            {day}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {getDaysInMonth(currentDate).map((date, index) => (
                                    <Box
                                        key={`date-${index}`}
                                        sx={{
                                            width: 'calc(14.28% - 4px)',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}
                                    >
                                        {date ? (
                                            <Box
                                                onClick={() => handleDateClick(date)}
                                                sx={{
                                                    width: 50,
                                                    height: 50,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRadius: '50%',
                                                    cursor: 'pointer',
                                                    bgcolor: isToday(date)
                                                        ? 'primary.main'
                                                        : isSelected(date)
                                                            ? 'primary.light'
                                                            : 'transparent',
                                                    color: isToday(date)
                                                        ? 'white'
                                                        : isSelected(date)
                                                            ? 'primary.main'
                                                            : 'text.primary',
                                                    fontWeight: isToday(date) || isSelected(date) ? 600 : 400,
                                                    border: isSelected(date) && !isToday(date) ? 2 : 0,
                                                    borderColor: 'primary.main',
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        bgcolor: isToday(date)
                                                            ? 'primary.dark'
                                                            : 'action.hover',
                                                        transform: 'scale(1.05)'
                                                    }
                                                }}
                                            >
                                                <Typography variant="body2">
                                                    {date.getDate()}
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Box sx={{ width: 50, height: 50 }} />
                                        )}
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Paper>
                </Box>

                {/* Time Slots Panel */}
                <Box sx={{ flex: '0 0 35%' }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 2,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                            {selectedDate.toLocaleDateString('tr-TR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Müsait olduğunuz saat aralıklarını seçin
                        </Typography>

                        {/* Status summary */}
                        {timeSlots.length > 0 && (
                            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                                <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                                    ✓ Müsait: {availableCount}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600 }}>
                                    ✗ Dolu: {bookedCount}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    — Kapalı: {closedCount}
                                </Typography>
                                {exceptionCount > 0 && (
                                    <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 600 }}>
                                        ⚠ İstisna: {exceptionCount}
                                    </Typography>
                                )}
                            </Box>
                        )}

                        <Divider sx={{ mb: 2 }} />

                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : timeSlots.length === 0 ? (
                            <Box sx={{ py: 4, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Saat aralıkları yüklenemedi.
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gap: 0.75,
                                maxHeight: 450,
                                overflow: 'auto',
                                pr: 0.5
                            }}>
                                {timeSlots.map((slot, index) => {
                                    const colors = getSlotColor(slot.status);
                                    const isDisabled = slot.status === SlotStatus.Booked
                                        || slot.status === SlotStatus.ExceptionClosed;

                                    return (
                                        <Box
                                            key={slot.timeSlotTemplateId}
                                            onClick={() => toggleTimeSlot(index)}
                                            sx={{
                                                p: 0.75,
                                                borderRadius: 1,
                                                border: 1,
                                                borderColor: colors.border,
                                                bgcolor: colors.bg,
                                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                                textAlign: 'center',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                minHeight: 42,
                                                opacity: isDisabled ? 0.7 : 1,
                                                '&:hover': {
                                                    bgcolor: isDisabled
                                                        ? colors.bg
                                                        : slot.status === SlotStatus.Available
                                                            ? 'success.200'
                                                            : 'grey.200',
                                                    transform: isDisabled ? 'none' : 'scale(1.02)',
                                                    boxShadow: isDisabled ? 0 : 1
                                                }
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                fontWeight={slot.status === SlotStatus.Available ? 600 : 400}
                                                sx={{ fontSize: '0.8rem', lineHeight: 1.2 }}
                                            >
                                                {slot.startTime}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color={colors.text}
                                                sx={{ fontSize: '0.65rem', mt: 0.25 }}
                                            >
                                                {colors.label}
                                            </Typography>
                                        </Box>
                                    )
                                })}
                            </Box>
                        )}

                        {timeSlots.length > 0 && (
                            <Stack spacing={2} sx={{ mt: 3 }}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={handleSaveSlots}
                                    disabled={saving || !hasChanges}
                                    startIcon={saving ? <CircularProgress size={18} /> : <SaveIcon />}
                                >
                                    {saving ? 'Kaydediliyor...' : hasChanges ? 'Kaydet' : 'Kaydedildi'}
                                </Button>
                            </Stack>
                        )}
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
}
