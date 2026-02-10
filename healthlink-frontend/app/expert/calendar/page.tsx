'use client';

import { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Tabs,
    Tab,
    CircularProgress,
    Alert
} from '@mui/material';
import RecurringScheduleSettings from './components/RecurringScheduleSettings';
import TimeOffManager from './components/TimeOffManager';
import CalendarView from './components/CalendarView';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107';

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
            {...other}
        >
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

export default function ExpertCalendarPage() {
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setError(null);
        setSuccess(null);
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom fontWeight={600}>
                    Takvim Yönetimi
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Çalışma saatlerinizi ve müsaitliğinizi yönetin
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            <Paper elevation={2}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="calendar tabs"
                    sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
                >
                    <Tab label="Takvim Görünümü" />
                    <Tab label="Haftalık Çalışma Saatleri" />
                    <Tab label="İzin Günleri" />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                    <CalendarView
                        onError={setError}
                        onSuccess={setSuccess}
                    />
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <RecurringScheduleSettings
                        onError={setError}
                        onSuccess={setSuccess}
                    />
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    <TimeOffManager
                        onError={setError}
                        onSuccess={setSuccess}
                    />
                </TabPanel>
            </Paper>
        </Container>
    );
}
