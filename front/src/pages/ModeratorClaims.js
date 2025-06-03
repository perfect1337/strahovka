import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Stack,
  InputAdornment,
} from '@mui/material';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ClaimChatButton from '../components/admin/ClaimChatButton';
import styled from '@emotion/styled';

const ModeratorClaims = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalClaims, setTotalClaims] = useState(0);
  const [filter, setFilter] = useState('PENDING');
  const [amount, setAmount] = useState('0');

  useEffect(() => {
    fetchClaims();
  }, [page, rowsPerPage, filter]);

  const fetchClaims = async () => {
    try {
      const response = await api.get('/api/claims', {
        params: {
          page,
          size: rowsPerPage,
          status: filter !== 'ALL' ? filter : undefined,
        },
      });
      setClaims(response.data.content);
      setTotalClaims(response.data.totalElements);
    } catch (err) {
      console.error('Error fetching claims:', err);
      setError('Ошибка при загрузке заявок');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (claim) => {
    setSelectedClaim(claim);
    setStatus(claim.status != null ? String(claim.status) : '');
    setResponse(claim.response || '');
    setAmount(claim.amountApproved != null ? String(claim.amountApproved) : '0');
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClaim(null);
    setStatus('');
    setResponse('');
    setError('');
  };

  const handleProcessClaim = async () => {
    try {
      await api.post(`/api/claims/${selectedClaim.id}/process`, {
        status,
        response,
        amount: amount ? parseFloat(amount) : null
      });
      setSuccess('Заявка успешно обработана');
      handleCloseDialog();
      fetchClaims();
    } catch (err) {
      console.error('Error processing claim:', err);
      setError('Ошибка при обработке заявки');
    }
  };

  const handleDownloadAttachment = async (attachmentId) => {
    try {
      const response = await api.get(`/api/insurance/claims/attachments/${attachmentId}`, {
        responseType: 'blob'
      });
      
      // Get filename from Content-Disposition header or use a default name
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'download';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading attachment:', err);
      setError('Ошибка при скачивании файла');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'IN_PROGRESS':
        return 'info';
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'NEED_INFO':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'На рассмотрении';
      case 'IN_PROGRESS':
        return 'В обработке';
      case 'APPROVED':
        return 'Одобрено';
      case 'REJECTED':
        return 'Отклонено';
      case 'NEED_INFO':
        return 'Требуется информация';
      default:
        return status;
    }
  };

  const DialogContentStyled = styled(DialogContent)(({ theme }) => ({
    paddingTop: theme.spacing(2),
  }));

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Управление страховыми случаями
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <FormControl sx={{ mb: 3, minWidth: 200 }}>
          <InputLabel>Статус</InputLabel>
          <Select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(0);
            }}
            label="Статус"
          >
            <MenuItem value="ALL">Все</MenuItem>
            <MenuItem value="PENDING">На рассмотрении</MenuItem>
            <MenuItem value="IN_PROGRESS">В обработке</MenuItem>
            <MenuItem value="NEED_INFO">Требуется информация</MenuItem>
            <MenuItem value="APPROVED">Одобренные</MenuItem>
            <MenuItem value="REJECTED">Отклоненные</MenuItem>
          </Select>
        </FormControl>

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
                <TableCell>Сумма выплаты</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {claims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell>{claim.id}</TableCell>
                  <TableCell>{new Date(claim.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{claim.user.firstName} {claim.user.lastName}</TableCell>
                  <TableCell>
                    <Chip
                      label={claim.policy.category.name}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{claim.description}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(claim.status)}
                      color={getStatusColor(claim.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {claim.amountApproved && claim.amountApproved > 0
                      ? `${claim.amountApproved.toLocaleString()} руб.`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpenDialog(claim)}
                      >
                        Обработать
                      </Button>
                      <ClaimChatButton 
                        claimId={claim.id}
                        claimDescription={claim.description}
                      />
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={totalClaims}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </TableContainer>
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Обработка страхового случая #{selectedClaim?.id}
        </DialogTitle>
        <DialogContentStyled>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Информация о заявке:
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Клиент
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedClaim?.policy?.user?.firstName} {selectedClaim?.policy?.user?.lastName}
                  <br />
                  {selectedClaim?.policy?.user?.email}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Тип страховки
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedClaim?.policy?.category?.name}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Дата создания
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedClaim?.createdAt && new Date(selectedClaim.createdAt).toLocaleString()}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Номер полиса
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedClaim?.policy?.id}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Срок действия полиса
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedClaim?.policy?.startDate && new Date(selectedClaim.policy.startDate).toLocaleDateString()} - 
                  {selectedClaim?.policy?.endDate && new Date(selectedClaim.policy.endDate).toLocaleDateString()}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Сумма страхового полиса
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedClaim?.policy?.price?.toLocaleString('ru-RU')} ₽
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Описание страхового случая
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedClaim?.description}
                </Typography>

                {selectedClaim?.attachments?.length > 0 && (
                  <>
                    <Typography variant="subtitle2" color="text.secondary">
                      Прикрепленные файлы
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {selectedClaim.attachments.map((attachment) => (
                        <Chip
                          key={attachment.id}
                          label={attachment.fileName}
                          onClick={() => handleDownloadAttachment(attachment.id)}
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  </>
                )}
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Обработка заявки
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Статус</InputLabel>
                  <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    label="Статус"
                  >
                    <MenuItem value="IN_PROGRESS">В обработке</MenuItem>
                    <MenuItem value="NEED_INFO">Требуется информация</MenuItem>
                    <MenuItem value="APPROVED">Одобрено</MenuItem>
                    <MenuItem value="REJECTED">Отклонено</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  margin="dense"
                  label="Сумма выплаты (если применимо)"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">руб.</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ответ"
                  multiline
                  rows={4}
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContentStyled>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button 
            onClick={handleProcessClaim} 
            variant="contained" 
            color="primary"
            disabled={!status || !response}
          >
            Обработать
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ModeratorClaims; 