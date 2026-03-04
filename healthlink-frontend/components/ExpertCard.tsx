'use client';

import { Card, CardContent, Stack, Box, Typography, Chip, Button, Avatar } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PsychologyIcon from '@mui/icons-material/Psychology';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import StarIcon from '@mui/icons-material/Star';
import WorkIcon from '@mui/icons-material/Work';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import CircleIcon from '@mui/icons-material/Circle';
import ChatIcon from '@mui/icons-material/Chat';

export interface ExpertCardData {
    id: number;
    displayName?: string;
    expertType: string;
    city?: string;
    averageRating?: number;
    totalReviewCount?: number;
    experienceYears?: number;
    profileDescription?: string;
    profilePhotoUrl?: string;
    specializations?: string[];
    isOnline?: boolean;
}

export const getExpertTypeLabel = (type: string) => {
    switch (type) {
        case 'All': return 'Tümü';
        case 'Dietitian': return 'Diyetisyen';
        case 'Psychologist': return 'Psikolog';
        case 'SportsCoach': return 'Spor Koçu';
        default: return type;
    }
};

export const getExpertIcon = (type: string) => {
    switch (type) {
        case 'Dietitian': return <LocalHospitalIcon />;
        case 'Psychologist': return <PsychologyIcon />;
        case 'SportsCoach': return <FitnessCenterIcon />;
        default: return <PersonIcon />;
    }
};

interface ExpertCardProps {
    expert: ExpertCardData;
    onProfileClick?: (expert: ExpertCardData) => void;
    onAppointmentClick?: (expert: ExpertCardData) => void;
    onMessageClick?: (expert: ExpertCardData) => void;
    profileHref?: string;
}

export default function ExpertCard({ expert, onProfileClick, onAppointmentClick, onMessageClick, profileHref }: ExpertCardProps) {
    return (
        <Card sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '18px',
            border: '1px solid',
            borderColor: 'rgba(226, 232, 240, 0.6)',
            boxShadow: '0 1px 4px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.04)',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            '&:hover': {
                transform: 'translateY(-6px) scale(1.02)',
                boxShadow: '0 12px 40px rgba(15, 23, 42, 0.1), 0 4px 12px rgba(30, 143, 138, 0.08)',
            }
        }}>
            <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                <Stack direction="row" spacing={2} alignItems="center" mb={2.5}>
                    {expert.profilePhotoUrl ? (
                        <Avatar
                            src={`${typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107') : ''}${expert.profilePhotoUrl}`}
                            sx={{
                                width: 56,
                                height: 56,
                                borderRadius: '16px',
                            }}
                            variant="rounded"
                        />
                    ) : (
                        <Box sx={{
                            width: 56,
                            height: 56,
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, rgba(14,165,164,0.1), rgba(99,102,241,0.1))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'primary.main',
                        }}>
                            {getExpertIcon(expert.expertType)}
                        </Box>
                    )}
                    <Box>
                        <Typography variant="h6" component="div" fontWeight={600} sx={{ lineHeight: 1.3 }}>
                            {expert.displayName || 'İsimsiz Uzman'}
                        </Typography>
                        <Chip
                            label={getExpertTypeLabel(expert.expertType)}
                            size="small"
                            sx={{
                                mt: 0.5,
                                bgcolor: 'rgba(30, 143, 138, 0.1)',
                                color: 'primary.main',
                                fontWeight: 500,
                                borderRadius: '8px',
                                height: 24,
                                fontSize: '0.75rem',
                            }}
                        />
                        {expert.isOnline && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                <CircleIcon sx={{ fontSize: 8, color: '#4caf50' }} />
                                <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 600 }}>
                                    Çevrimiçi
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Stack>

                <Stack spacing={0.75} mb={2}>
                    {expert.city && (
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.85rem' }}>
                            📍 {expert.city}
                        </Typography>
                    )}

                    {expert.experienceYears && (
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.85rem' }}>
                            <WorkIcon sx={{ fontSize: 16, color: 'text.secondary' }} /> {expert.experienceYears}+ yıl deneyim
                        </Typography>
                    )}

                    {expert.averageRating ? (
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.85rem', color: 'text.secondary' }}>
                            <StarIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
                            <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                {expert.averageRating.toFixed(1)}
                            </Box>
                        </Typography>
                    ) : null}
                </Stack>

                {/* Short Description */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, minHeight: 40, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6 }}>
                    {expert.profileDescription || 'Deneyimli uzman. Detaylı bilgi için profili ziyaret edin.'}
                </Typography>

                {/* Buttons */}
                <Stack direction="row" spacing={0.75} mt="auto" flexWrap="wrap">
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<PersonIcon sx={{ fontSize: '14px !important' }} />}
                        sx={{
                            flex: 1,
                            minWidth: 60,
                            borderRadius: '10px',
                            borderColor: '#E2E8F0',
                            color: 'text.primary',
                            fontWeight: 500,
                            fontSize: '0.75rem',
                            py: 0.5,
                            '&:hover': {
                                borderColor: 'primary.main',
                                bgcolor: 'rgba(30, 143, 138, 0.04)',
                            },
                        }}
                        href={profileHref || `/experts/${expert.id}`}
                        onClick={onProfileClick ? () => onProfileClick(expert) : undefined}
                    >
                        Profil
                    </Button>
                    {onMessageClick && (
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ChatIcon sx={{ fontSize: '14px !important' }} />}
                            sx={{
                                flex: 1,
                                minWidth: 60,
                                borderRadius: '10px',
                                borderColor: '#90CAF9',
                                color: '#1976d2',
                                fontWeight: 500,
                                fontSize: '0.75rem',
                                py: 0.5,
                                '&:hover': {
                                    borderColor: '#1976d2',
                                    bgcolor: 'rgba(25, 118, 210, 0.04)',
                                },
                            }}
                            onClick={() => onMessageClick(expert)}
                        >
                            Mesaj
                        </Button>
                    )}
                    <Button
                        size="small"
                        variant="contained"
                        startIcon={<CalendarMonthIcon sx={{ fontSize: '14px !important' }} />}
                        sx={{
                            flex: 1,
                            minWidth: 60,
                            borderRadius: '10px',
                            fontWeight: 500,
                            fontSize: '0.75rem',
                            py: 0.5,
                            boxShadow: '0 2px 8px rgba(30, 143, 138, 0.2)',
                            '&:hover': {
                                boxShadow: '0 4px 16px rgba(30, 143, 138, 0.3)',
                            },
                        }}
                        onClick={onAppointmentClick ? () => onAppointmentClick(expert) : undefined}
                    >
                        Randevu Al
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}
