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
} from '@mui/material';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import ClaimChatButton from '../components/admin/ClaimChatButton';

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

  useEffect(() => {
    fetchClaims();
  }, [page, rowsPerPage, filter]);

  const fetchClaims = async () => {
    try {
      const response = await api.get('/api/insurance/claims/all', {
        params: {
          page,
          size: rowsPerPage,
          status: filter,
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
    setStatus(claim.status);
    setResponse(claim.response || '');
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
      await api.post(`/api/insurance/claims/${selectedClaim.id}/process`, {
        status,
        response,
      });
      setSuccess('Заявка успешно обработана');
      handleCloseDialog();
      fetchClaims();
    } catch (err) {
      console.error('Error processing claim:', err);
      setError('Ошибка при обработке заявки');
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
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {claims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell>{claim.id}</TableCell>
                  <TableCell>{new Date(claim.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{claim.policy.user.firstName} {claim.policy.user.lastName}</TableCell>
                  <TableCell>
                    <Chip
                      label={claim.policy.type}
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Обработка страхового случая #{selectedClaim?.id}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {selectedClaim && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Информация о заявке:
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Клиент:</strong> {selectedClaim.policy.user.firstName} {selectedClaim.policy.user.lastName}
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Тип страховки:</strong> {selectedClaim.policy.type}
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Описание:</strong> {selectedClaim.description}
              </Typography>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Статус</InputLabel>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  label="Статус"
                >
                  <MenuItem value="IN_PROGRESS">В обработке</MenuItem>
                  <MenuItem value="NEED_INFO">Требуется информация</MenuItem>
                  <MenuItem value="APPROVED">Одобрить</MenuItem>
                  <MenuItem value="REJECTED">Отклонить</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Ответ"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                margin="normal"
                required
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button
            onClick={handleProcessClaim}
            variant="contained"
            color="primary"
            disabled={!status || !response}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ModeratorClaims; 