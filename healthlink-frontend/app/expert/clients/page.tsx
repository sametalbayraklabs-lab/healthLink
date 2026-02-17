'use client';

import { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Card,
    CardContent,
    Box,
    CircularProgress,
    TextField,
    InputAdornment,
    Chip,
    Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MessageIcon from '@mui/icons-material/Message';
import api from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { useChat } from '@/contexts/ChatContext';

interface ExpertClient {
    clientId: number;
    fullName: string;
    email?: string;
    totalAppointments: number;
    completedAppointments: number;
    lastAppointmentDate?: string;
}

export default function ExpertClientsPage() {
    const [clients, setClients] = useState<ExpertClient[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { openChatWithClient } = useChat();

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await api.get('/api/expert/clients');
            setClients(response.data || []);
        } catch (error) {
            console.error('Failed to fetch clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredClients = clients.filter((c) =>
        c.fullName.toLowerCase().includes(search.toLowerCase()) ||
        (c.email ?? '').toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom fontWeight={600}>
                Danışanlarım
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Randevu aldığınız danışanlar
            </Typography>

            <Box sx={{ mb: 3 }}>
                <TextField
                    size="small"
                    placeholder="Danışan Ara..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ minWidth: 300 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {filteredClients.map((client) => (
                    <Card key={client.clientId}>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="h6" fontWeight={600}>
                                        {client.fullName}
                                    </Typography>
                                    {client.email && (
                                        <Typography variant="body2" color="text.secondary">
                                            {client.email}
                                        </Typography>
                                    )}
                                    {client.lastAppointmentDate && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                            <strong>Son Randevu:</strong> {formatDateTime(client.lastAppointmentDate)}
                                        </Typography>
                                    )}
                                </Box>
                                <Box display="flex" gap={1} alignItems="center">
                                    <Chip
                                        label={`${client.totalAppointments} Randevu`}
                                        color="primary"
                                        variant="outlined"
                                        size="small"
                                    />
                                    <Chip
                                        label={`${client.completedAppointments} Tamamlandı`}
                                        color="success"
                                        variant="outlined"
                                        size="small"
                                    />
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<MessageIcon />}
                                        onClick={() => openChatWithClient(client.clientId)}
                                    >
                                        Mesaj Gönder
                                    </Button>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {filteredClients.length === 0 && (
                <Box textAlign="center" py={8}>
                    <Typography variant="h6" color="text.secondary">
                        {clients.length === 0
                            ? 'Henüz danışanınız bulunmamaktadır'
                            : 'Aramanıza uygun danışan bulunamadı'}
                    </Typography>
                </Box>
            )}
        </Container>
    );
}
