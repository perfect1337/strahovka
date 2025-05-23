import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Typography,
    Box,
    Pagination
} from '@mui/material';
import { api } from '../utils/api';
import { formatDate } from '../utils/dateUtils';

const ApplicationsList = () => {
    const [applications, setApplications] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [processingData, setProcessingData] = useState({
        status: '',
        notes: '',
        calculatedAmount: ''
    });

    const fetchApplications = async () => {
        try {
            const params = new URLSearchParams({
                page: page,
                size: 10
            });
            if (selectedStatus) {
                params.append('status', selectedStatus);
            }
            const response = await api.get(`/api/insurance/applications?${params}`);
            setApplications(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, [page, selectedStatus]);

    const handleStatusChange = (event) => {
        setSelectedStatus(event.target.value);
        setPage(0);
    };

    const handlePageChange = (event, value) => {
        setPage(value - 1);
    };

    const handleOpenDialog = (application) => {
        setSelectedApplication(application);
        setProcessingData({
            status: application.status,
            notes: application.notes || '',
            calculatedAmount: application.calculatedAmount?.toString() || ''
        });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedApplication(null);
        setProcessingData({
            status: '',
            notes: '',
            calculatedAmount: ''
        });
    };

    const handleProcessApplication = async () => {
        try {
            await api.post(`/api/insurance/applications/${selectedApplication.id}/process`, processingData);
            fetchApplications();
            handleCloseDialog();
        } catch (error) {
            console.error('Error processing application:', error);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Заявки на страхование
            </Typography>

            <FormControl sx={{ mb: 3, minWidth: 200 }}>
                <InputLabel>Статус</InputLabel>
                <Select
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    label="Статус"
                >
                    <MenuItem value="">Все</MenuItem>
                    <MenuItem value="PENDING">Ожидает рассмотрения</MenuItem>
                    <MenuItem value="IN_REVIEW">На рассмотрении</MenuItem>
                    <MenuItem value="APPROVED">Одобрено</MenuItem>
                    <MenuItem value="REJECTED">Отклонено</MenuItem>
                    <MenuItem value="NEED_INFO">Требуется информация</MenuItem>
                </Select>
            </FormControl>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Пользователь</TableCell>
                            <TableCell>Страховой пакет</TableCell>
                            <TableCell>Дата подачи</TableCell>
                            <TableCell>Статус</TableCell>
                            <TableCell>Сумма</TableCell>
                            <TableCell>Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {applications.map((application) => (
                            <TableRow key={application.id}>
                                <TableCell>{application.id}</TableCell>
                                <TableCell>{application.user.email}</TableCell>
                                <TableCell>{application.insurancePackage.name}</TableCell>
                                <TableCell>{formatDate(application.applicationDate)}</TableCell>
                                <TableCell>{application.status}</TableCell>
                                <TableCell>
                                    {application.calculatedAmount 
                                        ? `${application.calculatedAmount} ₽`
                                        : '-'}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        onClick={() => handleOpenDialog(application)}
                                    >
                                        Обработать
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                    count={totalPages}
                    page={page + 1}
                    onChange={handlePageChange}
                    color="primary"
                />
            </Box>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Обработка заявки</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Статус</InputLabel>
                            <Select
                                value={processingData.status}
                                onChange={(e) => setProcessingData({
                                    ...processingData,
                                    status: e.target.value
                                })}
                                label="Статус"
                            >
                                <MenuItem value="PENDING">Ожидает рассмотрения</MenuItem>
                                <MenuItem value="IN_REVIEW">На рассмотрении</MenuItem>
                                <MenuItem value="APPROVED">Одобрено</MenuItem>
                                <MenuItem value="REJECTED">Отклонено</MenuItem>
                                <MenuItem value="NEED_INFO">Требуется информация</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Сумма страховки"
                            type="number"
                            value={processingData.calculatedAmount}
                            onChange={(e) => setProcessingData({
                                ...processingData,
                                calculatedAmount: e.target.value
                            })}
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            fullWidth
                            label="Примечания"
                            multiline
                            rows={4}
                            value={processingData.notes}
                            onChange={(e) => setProcessingData({
                                ...processingData,
                                notes: e.target.value
                            })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Отмена</Button>
                    <Button onClick={handleProcessApplication} variant="contained">
                        Сохранить
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ApplicationsList; 