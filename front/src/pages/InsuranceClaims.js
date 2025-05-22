import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  Grid,
  Alert,
  Fab,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const InsuranceClaims = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchId, setSearchId] = useState('');
  const [totalClaims, setTotalClaims] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [policies, setPolicies] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [newClaim, setNewClaim] = useState({
    policyId: '',
    description: '',
    documents: []
  });

  const fetchClaims = async () => {
    try {
      const response = await api.get('/api/claims/user', {
        params: {
          page,
          size: rowsPerPage,
          searchId: searchId || undefined,
        },
      });
      setClaims(response.data.content || response.data);
      setTotalClaims(response.data.totalElements || response.data.length);
    } catch (error) {
      console.error('Error fetching claims:', error);
      setError('Ошибка при загрузке страховых случаев');
    }
  };

  const fetchPolicies = async () => {
    try {
      const response = await api.get('/api/policies/user');
      setPolicies(response.data.filter(policy => policy.status === 'ACTIVE'));
    } catch (error) {
      console.error('Error fetching policies:', error);
    }
  };

  useEffect(() => {
    fetchClaims();
    fetchPolicies();
  }, [page, rowsPerPage, searchId]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchId(event.target.value);
    setPage(0);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewClaim({
      policyId: '',
      description: '',
      documents: []
    });
    setSelectedFiles([]);
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(prevFiles => [...prevFiles, ...files]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmitClaim = async () => {
    try {
      const formData = new FormData();
      formData.append('policyId', newClaim.policyId);
      formData.append('description', newClaim.description);
      selectedFiles.forEach(file => {
        formData.append('documents', file);
      });

      await api.post('/api/claims', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess(true);
      handleCloseDialog();
      fetchClaims();
    } catch (error) {
      console.error('Error submitting claim:', error);
      setError('Ошибка при подаче заявки');
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Страховые случаи
        </Typography>
        <Fab
          color="primary"
          variant="extended"
          onClick={handleOpenDialog}
          sx={{ borderRadius: 2 }}
        >
          <AddIcon sx={{ mr: 1 }} />
          Подать заявку
        </Fab>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Поиск заявки
              </Typography>
              <TextField
                fullWidth
                label="Поиск по ID заявки"
                value={searchId}
                onChange={handleSearch}
                variant="outlined"
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Дата создания</TableCell>
                  <TableCell>Полис</TableCell>
                  <TableCell>Описание</TableCell>
                  <TableCell>Статус</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {claims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell>{claim.id}</TableCell>
                    <TableCell>{new Date(claim.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={claim.policyId}
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
              rowsPerPageOptions={[5, 10, 25]}
            />
          </TableContainer>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Подать заявку на страховой случай</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Полис</InputLabel>
              <Select
                value={newClaim.policyId}
                onChange={(e) => setNewClaim({ ...newClaim, policyId: e.target.value })}
                label="Полис"
              >
                {policies.map((policy) => (
                  <MenuItem key={policy.id} value={policy.id}>
                    {policy.type} - {policy.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Описание страхового случая"
              value={newClaim.description}
              onChange={(e) => setNewClaim({ ...newClaim, description: e.target.value })}
              multiline
              rows={4}
              sx={{ mb: 2 }}
            />
            <Box sx={{ mb: 2 }}>
              <input
                accept="image/*,.pdf,.doc,.docx"
                style={{ display: 'none' }}
                id="upload-file"
                type="file"
                multiple
                onChange={handleFileSelect}
              />
              <label htmlFor="upload-file">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                >
                  Загрузить документы
                </Button>
              </label>
            </Box>
            {selectedFiles.length > 0 && (
              <List>
                {selectedFiles.map((file, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={file.name} secondary={`${(file.size / 1024).toFixed(2)} KB`} />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => handleRemoveFile(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button
            onClick={handleSubmitClaim}
            variant="contained"
            color="primary"
            disabled={!newClaim.policyId || !newClaim.description}
          >
            Отправить
          </Button>
        </DialogActions>
      </Dialog>

      <Alert
        severity="success"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: success ? 'flex' : 'none',
        }}
        onClose={() => setSuccess(false)}
      >
        Заявка успешно отправлена
      </Alert>
    </Container>
  );
};

export default InsuranceClaims; 