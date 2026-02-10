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
import DiscountCodeFormDialog from './DiscountCodeFormDialog';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107';

interface DiscountCode {
    id: number;
    code: string;
    description?: string;
    discountType: string;
    discountValue: number;
    maxUsageCount?: number;
    usedCount: number;
    validFrom: string;
    validTo?: string;
    applicableExpertType: string;
    isActive: boolean;
}

export default function DiscountCodeTable() {
    const [codes, setCodes] = useState<DiscountCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedCode, setSelectedCode] = useState<DiscountCode | null>(null);

    useEffect(() => {
        fetchCodes();
    }, []);

    const fetchCodes = async () => {
        try {
            const response = await fetch(`${API_URL}/api/admin/discount-codes`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setCodes(data);
            }
        } catch (error) {
            console.error('Error fetching discount codes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bu indirim kodunu silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/admin/discount-codes/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            if (response.ok) {
                fetchCodes();
            } else {
                const error = await response.json();
                alert(error.message || 'Silme işlemi başarısız');
            }
        } catch (error) {
            console.error('Error deleting discount code:', error);
            alert('Bir hata oluştu');
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
                <Typography variant="h6">İndirim Kodları</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setSelectedCode(null);
                        setDialogOpen(true);
                    }}
                >
                    Yeni Kod Ekle
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Kod</TableCell>
                            <TableCell>Açıklama</TableCell>
                            <TableCell>Tip</TableCell>
                            <TableCell>Değer</TableCell>
                            <TableCell>Uzman Tipi</TableCell>
                            <TableCell>Kullanım</TableCell>
                            <TableCell>Geçerlilik</TableCell>
                            <TableCell>Durum</TableCell>
                            <TableCell align="right">İşlemler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {codes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
                                    <Typography variant="body2" color="text.secondary">
                                        Henüz indirim kodu eklenmemiş
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            codes.map((code) => (
                                <TableRow key={code.id}>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={600}>
                                            {code.code}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{code.description || '-'}</TableCell>
                                    <TableCell>{code.discountType}</TableCell>
                                    <TableCell>
                                        {code.discountType === 'Percentage'
                                            ? `%${code.discountValue}`
                                            : `₺${code.discountValue}`}
                                    </TableCell>
                                    <TableCell>
                                        {code.usedCount} / {code.maxUsageCount || '∞'}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={
                                                code.applicableExpertType === 'All' ? 'Tümü' :
                                                    code.applicableExpertType === 'Dietitian' ? 'Diyetisyen' :
                                                        code.applicableExpertType === 'Psychologist' ? 'Psikolog' :
                                                            code.applicableExpertType === 'SportsCoach' ? 'Spor Koçu' :
                                                                code.applicableExpertType
                                            }
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption">
                                            {new Date(code.validFrom).toLocaleDateString('tr-TR')}
                                            {code.validTo && ` - ${new Date(code.validTo).toLocaleDateString('tr-TR')}`}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={code.isActive ? 'Aktif' : 'Pasif'}
                                            color={code.isActive ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                setSelectedCode(code);
                                                setDialogOpen(true);
                                            }}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDelete(code.id)}
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

            <DiscountCodeFormDialog
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                    setSelectedCode(null);
                }}
                onSave={() => {
                    fetchCodes();
                }}
                discountCode={selectedCode}
            />
        </Box>
    );
}
