'use client';

import { useState } from 'react';
import {
    Typography,
    Box,
    Paper,
    Tabs,
    Tab,
    Alert
} from '@mui/material';
import RecurringScheduleSettings from './components/RecurringScheduleSettings';
import TimeOffManager from './components/TimeOffManager';
import CalendarView from './components/CalendarView';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`calendar-tabpanel-${index}`}
            aria-labelledby={`calendar-tab-${index}`}
            style={{ flex: 1, display: value === index ? 'flex' : 'none', flexDirection: 'column', overflow: 'hidden' }}
            {...other}
        >
            {value === index && <Box sx={{ flex: 1, overflow: 'hidden', pt: 1 }}>{children}</Box>}
        </div>
    );
}

export default function ExpertCalendarPage() {
    const [tabValue, setTabValue] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setError(null);
        setSuccess(null);
    };

    return (
        <Box sx={{
            height: '100%',
            display: 'flex', flexDirection: 'column',
            bgcolor: '#F8FAFC', overflow: 'hidden',
            px: { xs: 2, md: 3 }, py: 2,
        }}>
            {/* Header */}
            <Box sx={{ mb: 2, flexShrink: 0 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
                    <Box sx={{
                        width: 40, height: 40, borderRadius: '12px',
                        bgcolor: 'primary.main', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', color: 'white',
                    }}>
                        <CalendarMonthIcon />
                    </Box>
                    <Box>
                        <Typography variant="h5" fontWeight={700} sx={{ color: '#0F172A' }}>
                            Takvim Yönetimi
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Çalışma saatlerinizi ve müsaitliğinizi yönetin
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Alerts */}
            {error && (
                <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2, flexShrink: 0 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 1.5, borderRadius: 2, flexShrink: 0 }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            {/* Content area — fills remaining height */}
            <Paper
                elevation={0}
                sx={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    borderRadius: '16px', overflow: 'hidden',
                    border: '1px solid', borderColor: 'divider',
                }}
            >
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="calendar tabs"
                    sx={{
                        borderBottom: 1, borderColor: 'divider', px: 2, flexShrink: 0,
                        '& .MuiTab-root': {
                            textTransform: 'none', fontWeight: 600,
                            fontSize: '0.9rem', minHeight: 48,
                        },
                    }}
                >
                    <Tab label="Takvim Görünümü" />
                    <Tab label="Haftalık Çalışma Saatleri" />
                    <Tab label="İzin Günleri" />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                    <CalendarView onError={setError} onSuccess={setSuccess} />
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                    <RecurringScheduleSettings onError={setError} onSuccess={setSuccess} />
                </TabPanel>
                <TabPanel value={tabValue} index={2}>
                    <TimeOffManager onError={setError} onSuccess={setSuccess} />
                </TabPanel>
            </Paper>
        </Box>
    );
}
