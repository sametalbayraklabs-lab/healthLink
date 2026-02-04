'use client';

import { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Tabs,
    Tab,
    Paper,
} from '@mui/material';
import DiscountCodeTable from '@/components/admin/DiscountCodeTable';
import SpecializationTable from '@/components/admin/SpecializationTable';
import ServicePackageTable from '@/components/admin/ServicePackageTable';
import SystemSettingsTable from '@/components/admin/SystemSettingsTable';

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
            id={`admin-tabpanel-${index}`}
            aria-labelledby={`admin-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function AdminParametersPage() {
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight={600} gutterBottom>
                Parametre Yönetimi
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Sistem parametrelerini buradan yönetebilirsiniz
            </Typography>

            <Paper sx={{ mt: 3 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin parameters tabs">
                        <Tab label="İndirim Kodları" />
                        <Tab label="Uzmanlık Alanları" />
                        <Tab label="Hizmet Paketleri" />
                        <Tab label="Sistem Ayarları" />
                    </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                    <DiscountCodeTable />
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <SpecializationTable />
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    <ServicePackageTable />
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                    <SystemSettingsTable />
                </TabPanel>
            </Paper>
        </Container>
    );
}
