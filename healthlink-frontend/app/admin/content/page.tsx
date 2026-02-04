'use client';

import { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    CircularProgress,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    Pagination,
    TextField,
    Tooltip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArticleIcon from '@mui/icons-material/Article';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5107';

interface ContentItem {
    id: number;
    title: string;
    subTitle: string | null;
    slug: string;
    type: string;
    category: string | null;
    status: string;
    authorName: string;
    publishedAt: string | null;
    createdAt: string;
    viewCount: number;
    likeCount: number;
    dislikeCount: number;
}

interface ContentDetail extends ContentItem {
    coverImageUrl: string | null;
    bodyHtml: string;
    seoTitle: string | null;
    seoDescription: string | null;
    authorUserId: number;
    updatedAt: string | null;
}

const emptyForm = {
    title: '',
    subTitle: '',
    slug: '',
    type: 'Blog',
    category: '',
    coverImageUrl: '',
    bodyHtml: '',
    seoTitle: '',
    seoDescription: '',
};

export default function AdminContentPage() {
    const [contents, setContents] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [filterType, setFilterType] = useState<string>('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedContent, setSelectedContent] = useState<ContentDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [formData, setFormData] = useState(emptyForm);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    useEffect(() => {
        fetchContents();
    }, [filterStatus, filterType, page]);

    const fetchContents = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (filterStatus) params.append('status', filterStatus);
            if (filterType) params.append('type', filterType);
            if (search) params.append('search', search);
            params.append('page', page.toString());
            params.append('pageSize', '20');

            const response = await fetch(`${API_URL}/api/admin/content?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) throw new Error('Failed to fetch content');
            setContents(await response.json());
        } catch (error) {
            console.error('Error fetching content:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchContentDetails = async (id: number) => {
        try {
            setDetailLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/content/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) throw new Error('Failed to fetch content details');
            setSelectedContent(await response.json());
            setDetailDialogOpen(true);
        } catch (error) {
            console.error('Error fetching content details:', error);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCreate = () => {
        setFormData(emptyForm);
        setEditingId(null);
        setFormDialogOpen(true);
    };

    const handleEdit = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/admin/content/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setFormData({
                title: data.title,
                subTitle: data.subTitle || '',
                slug: data.slug,
                type: data.type,
                category: data.category || '',
                coverImageUrl: data.coverImageUrl || '',
                bodyHtml: data.bodyHtml,
                seoTitle: data.seoTitle || '',
                seoDescription: data.seoDescription || '',
            });
            setEditingId(id);
            setFormDialogOpen(true);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleFormSubmit = async () => {
        try {
            setFormLoading(true);
            const token = localStorage.getItem('token');
            const url = editingId
                ? `${API_URL}/api/admin/content/${editingId}`
                : `${API_URL}/api/admin/content`;
            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.text();
                alert(error);
                return;
            }

            setFormDialogOpen(false);
            fetchContents();
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setFormLoading(false);
        }
    };

    const handleStatusChange = async (id: number, status: string) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/api/admin/content/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });
            fetchContents();
            if (selectedContent?.id === id) {
                fetchContentDetails(id);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/api/admin/content/${deleteId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setDeleteDialogOpen(false);
            setDeleteId(null);
            fetchContents();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'Draft': return 'Taslak';
            case 'PendingApproval': return 'Onay Bekliyor';
            case 'Published': return 'Yayında';
            case 'Archived': return 'Arşivlenmiş';
            default: return status;
        }
    };

    const getStatusColor = (status: string): "default" | "success" | "warning" | "info" => {
        switch (status) {
            case 'Draft': return 'default';
            case 'PendingApproval': return 'warning';
            case 'Published': return 'success';
            case 'Archived': return 'info';
            default: return 'default';
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'Blog': return 'Blog';
            case 'Recipe': return 'Tarif';
            case 'Announcement': return 'Duyuru';
            default: return type;
        }
    };

    if (loading && contents.length === 0) {
        return (
            <Container maxWidth="xl">
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                    <Typography variant="h4" fontWeight={600}>İçerik Yönetimi</Typography>
                    <Typography variant="body1" color="text.secondary">
                        Blog, tarif ve duyuru içeriklerini yönetin
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
                    Yeni İçerik
                </Button>
            </Box>

            <Box display="flex" gap={2} mb={3}>
                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Durum</InputLabel>
                    <Select
                        value={filterStatus}
                        label="Durum"
                        onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                    >
                        <MenuItem value="">Tümü</MenuItem>
                        <MenuItem value="Draft">Taslak</MenuItem>
                        <MenuItem value="PendingApproval">Onay Bekliyor</MenuItem>
                        <MenuItem value="Published">Yayında</MenuItem>
                        <MenuItem value="Archived">Arşivlenmiş</MenuItem>
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Tip</InputLabel>
                    <Select
                        value={filterType}
                        label="Tip"
                        onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
                    >
                        <MenuItem value="">Tümü</MenuItem>
                        <MenuItem value="Blog">Blog</MenuItem>
                        <MenuItem value="Recipe">Tarif</MenuItem>
                        <MenuItem value="Announcement">Duyuru</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    label="Ara"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchContents()}
                    size="small"
                    sx={{ width: 200 }}
                />
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Başlık</TableCell>
                            <TableCell>Tip</TableCell>
                            <TableCell>Durum</TableCell>
                            <TableCell align="center">
                                <Tooltip title="Görüntülenme"><RemoveRedEyeIcon fontSize="small" /></Tooltip>
                            </TableCell>
                            <TableCell align="center">
                                <Tooltip title="Beğeni"><ThumbUpIcon fontSize="small" /></Tooltip>
                            </TableCell>
                            <TableCell align="center">
                                <Tooltip title="Beğenmeme"><ThumbDownIcon fontSize="small" /></Tooltip>
                            </TableCell>
                            <TableCell>Tarih</TableCell>
                            <TableCell align="right">İşlemler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {contents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    <Typography color="text.secondary">İçerik bulunamadı</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            contents.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <Typography fontWeight="medium">{item.title}</Typography>
                                        <Typography variant="caption" color="text.secondary">/{item.slug}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={getTypeLabel(item.type)} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={getStatusLabel(item.status)} color={getStatusColor(item.status)} size="small" />
                                    </TableCell>
                                    <TableCell align="center">{item.viewCount}</TableCell>
                                    <TableCell align="center" sx={{ color: 'success.main' }}>{item.likeCount}</TableCell>
                                    <TableCell align="center" sx={{ color: 'error.main' }}>{item.dislikeCount}</TableCell>
                                    <TableCell>
                                        {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" onClick={() => fetchContentDetails(item.id)}>
                                            <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleEdit(item.id)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => { setDeleteId(item.id); setDeleteDialogOpen(true); }}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box display="flex" justifyContent="center" mt={3}>
                <Pagination count={10} page={page} onChange={(e, value) => setPage(value)} color="primary" />
            </Box>

            {/* Detail Dialog */}
            <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <ArticleIcon />
                        İçerik Detayları
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {detailLoading ? (
                        <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
                    ) : selectedContent && (
                        <Box mt={2}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="h6">{selectedContent.title}</Typography>
                                    {selectedContent.subTitle && (
                                        <Typography variant="subtitle1" color="text.secondary">{selectedContent.subTitle}</Typography>
                                    )}
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <Typography variant="subtitle2" color="text.secondary">Tip</Typography>
                                    <Typography>{getTypeLabel(selectedContent.type)}</Typography>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <Typography variant="subtitle2" color="text.secondary">Durum</Typography>
                                    <Chip label={getStatusLabel(selectedContent.status)} color={getStatusColor(selectedContent.status)} size="small" />
                                </Grid>
                                <Grid item xs={4} md={2}>
                                    <Typography variant="subtitle2" color="text.secondary">Görüntülenme</Typography>
                                    <Typography fontWeight="bold">{selectedContent.viewCount}</Typography>
                                </Grid>
                                <Grid item xs={4} md={2}>
                                    <Typography variant="subtitle2" color="text.secondary">Beğeni</Typography>
                                    <Typography fontWeight="bold" color="success.main">{selectedContent.likeCount}</Typography>
                                </Grid>
                                <Grid item xs={4} md={2}>
                                    <Typography variant="subtitle2" color="text.secondary">Beğenmeme</Typography>
                                    <Typography fontWeight="bold" color="error.main">{selectedContent.dislikeCount}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">İçerik</Typography>
                                    <Paper sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
                                        <div dangerouslySetInnerHTML={{ __html: selectedContent.bodyHtml }} />
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailDialogOpen(false)}>Kapat</Button>
                    {selectedContent && selectedContent.status !== 'Published' && (
                        <Button color="success" variant="contained" onClick={() => handleStatusChange(selectedContent.id, 'Published')}>
                            Yayınla
                        </Button>
                    )}
                    {selectedContent && selectedContent.status === 'Published' && (
                        <Button color="warning" variant="outlined" onClick={() => handleStatusChange(selectedContent.id, 'Archived')}>
                            Arşivle
                        </Button>
                    )}
                    {selectedContent && selectedContent.status === 'Archived' && (
                        <Button color="info" variant="outlined" onClick={() => handleStatusChange(selectedContent.id, 'Draft')}>
                            Taslağa Al
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Form Dialog */}
            <Dialog open={formDialogOpen} onClose={() => setFormDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>{editingId ? 'İçerik Düzenle' : 'Yeni İçerik'}</DialogTitle>
                <DialogContent>
                    <Box mt={2}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={8}>
                                <TextField fullWidth label="Başlık" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField fullWidth label="Slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Alt Başlık" value={formData.subTitle} onChange={(e) => setFormData({ ...formData, subTitle: e.target.value })} />
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Tip</InputLabel>
                                    <Select value={formData.type} label="Tip" onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                                        <MenuItem value="Blog">Blog</MenuItem>
                                        <MenuItem value="Recipe">Tarif</MenuItem>
                                        <MenuItem value="Announcement">Duyuru</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <TextField fullWidth label="Kategori" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Kapak Resmi URL" value={formData.coverImageUrl} onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth multiline rows={6} label="İçerik (HTML)" value={formData.bodyHtml} onChange={(e) => setFormData({ ...formData, bodyHtml: e.target.value })} required />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField fullWidth label="SEO Başlık" value={formData.seoTitle} onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField fullWidth label="SEO Açıklama" value={formData.seoDescription} onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })} />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFormDialogOpen(false)}>İptal</Button>
                    <Button variant="contained" onClick={handleFormSubmit} disabled={formLoading}>
                        {formLoading ? <CircularProgress size={20} /> : (editingId ? 'Güncelle' : 'Oluştur')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>İçerik Sil</DialogTitle>
                <DialogContent>
                    <Typography>Bu içeriği silmek istediğinizden emin misiniz?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
                    <Button color="error" variant="contained" onClick={handleDelete}>Sil</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
