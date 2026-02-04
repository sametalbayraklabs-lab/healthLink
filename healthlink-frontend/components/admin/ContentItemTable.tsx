'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Typography,
    CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107';

interface ContentItem {
    id: number;
    title: string;
    slug: string;
    type: string;
    category?: string;
    status: string;
    authorName?: string;
    publishedAt?: string;
    createdAt: string;
}

export default function ContentItemTable() {
    const [items, setItems] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await fetch(`${API_URL}/api/admin/content-items`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setItems(data);
            }
        } catch (error) {
            console.error('Error fetching content items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bu içeriği silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/admin/content-items/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                fetchItems();
            } else {
                alert('Silme işlemi başarısız');
            }
        } catch (error) {
            console.error('Error deleting content item:', error);
            alert('Bir hata oluştu');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Published': return 'success';
            case 'Draft': return 'warning';
            case 'Archived': return 'default';
            default: return 'default';
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">İçerik Yönetimi</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => alert('Ekleme formu yakında eklenecek')}
                >
                    Yeni İçerik Ekle
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Başlık</TableCell>
                            <TableCell>Slug</TableCell>
                            <TableCell>Tip</TableCell>
                            <TableCell>Kategori</TableCell>
                            <TableCell>Yazar</TableCell>
                            <TableCell>Durum</TableCell>
                            <TableCell>Tarih</TableCell>
                            <TableCell align="right">İşlemler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    <Typography variant="body2" color="text.secondary">
                                        Henüz içerik eklenmemiş
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={600}>
                                            {item.title}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" fontFamily="monospace">
                                            {item.slug}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={item.type} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell>{item.category || '-'}</TableCell>
                                    <TableCell>{item.authorName || '-'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={item.status}
                                            color={getStatusColor(item.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption">
                                            {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={() => alert('Düzenleme formu yakında eklenecek')}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
