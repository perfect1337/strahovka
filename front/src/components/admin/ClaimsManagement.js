import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    FormControl,
    Select,
    MenuItem,
    Typography,
    Box,
    Button,
    Stack
} from '@mui/material';
import axios from 'axios';
import ClaimChatButton from './ClaimChatButton';

const ClaimsManagement = () => {
    const [claims, setClaims] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [status, setStatus] = useState('ALL');
    const [loading, setLoading] = useState(false);

    const fetchClaims = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/insurance/claims/all?page=${page}&size=${rowsPerPage}&status=${status}`);
            setClaims(response.data.content);
        } catch (error) {
            console.error('Error fetching claims:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClaims();
    }, [page, rowsPerPage, status]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleStatusChange = (event) => {
        setStatus(event.target.value);
        setPage(0);
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'PENDING':
                return 'Требуется информация';
            case 'APPROVED':
                return 'Одобрено';
            case 'REJECTED':
                return 'Отклонено';
            default:
                return status;
        }
    };

    const handleProcess = (id) => {
        // Implementation of handleProcess function
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
                Управление страховыми случаями
            </Typography>

            <Box sx={{ mb: 2 }}>
                <FormControl size="small">
                    <Select
                        value={status}
                        onChange={handleStatusChange}
                        displayEmpty
                    >
                        <MenuItem value="ALL">Все</MenuItem>
                        <MenuItem value="PENDING">Требуется информация</MenuItem>
                        <MenuItem value="APPROVED">Одобрено</MenuItem>
                        <MenuItem value="REJECTED">Отклонено</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Дата создания</TableCell>
                            <TableCell>Клиент</TableCell>
                            <TableCell>Тип страховки</TableCell>
                            <TableCell>Описание</TableCell>
                            <TableCell>Статус</TableCell>
                            <TableCell align="right">Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">Загрузка...</TableCell>
                            </TableRow>
                        ) : claims.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">Нет страховых случаев</TableCell>
                            </TableRow>
                        ) : (
                            claims.map((claim) => (
                                <TableRow key={claim.id}>
                                    <TableCell>{claim.id}</TableCell>
                                    <TableCell>
                                        {new Date(claim.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        {claim.policy.user.email}
                                    </TableCell>
                                    <TableCell>
                                        {claim.policy.category.name}
                                    </TableCell>
                                    <TableCell>{claim.description}</TableCell>
                                    <TableCell>
                                        <Box
                                            sx={{
                                                backgroundColor: 
                                                    claim.status === 'APPROVED' ? '#e8f5e9' :
                                                    claim.status === 'REJECTED' ? '#ffebee' :
                                                    '#fff3e0',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                display: 'inline-block'
                                            }}
                                        >
                                            {getStatusLabel(claim.status)}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                onClick={() => handleProcess(claim.id)}
                                            >
                                                ОБРАБОТАТЬ
                                            </Button>
                                            <ClaimChatButton 
                                                claimId={claim.id}
                                                claimDescription={claim.description}
                                            />
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={-1}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
                labelRowsPerPage="Строк на странице:"
            />
        </Box>
    );
};

export default ClaimsManagement; 