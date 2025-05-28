import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Container, Typography, Box, Tabs, Tab, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Button, Dialog, 
  DialogTitle, DialogContent, DialogActions, TextField, Fab, Select, MenuItem, 
  FormControl, InputLabel, Grid, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import api from '../utils/api';
import { checkIfAdmin } from '../utils/roleUtils';
import InsurancePackages from './InsurancePackages';

const AdminPanel = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [moderators, setModerators] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [newModerator, setNewModerator] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  useEffect(() => {
    if (user && checkIfAdmin(user.role)) {
      fetchModerators();
    }
  }, [user]);

  const fetchModerators = async () => {
    try {
      const response = await api.get('/api/admin/moderators');
      setModerators(response.data);
    } catch (error) {
      console.error('Error fetching moderators:', error);
      setError('Ошибка при загрузке списка модераторов');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError('');
    setNewModerator({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
    });
  };

  const handleCreateModerator = async () => {
    try {
      await api.post('/api/admin/moderators', {
        ...newModerator,
        role: 'ROLE_MODERATOR',
      });
      fetchModerators();
      handleCloseDialog();
    } catch (error) {
      console.error('Error creating moderator:', error);
      setError('Ошибка при создании модератора. Проверьте введенные данные.');
    }
  };

  const handleRemoveModerator = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этого модератора?')) {
      try {
        await api.delete(`/api/admin/moderators/${id}`);
        fetchModerators();
      } catch (error) {
        console.error('Error removing moderator:', error);
        setError('Ошибка при удалении модератора');
      }
    }
  };

  const renderModeratorsTab = () => (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Управление модераторами</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleOpenDialog}
          startIcon={<AddIcon />}
        >
          Добавить модератора
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Имя</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {moderators.map((moderator) => (
              <TableRow key={moderator.id}>
                <TableCell>{moderator.id}</TableCell>
                <TableCell>{`${moderator.firstName} ${moderator.lastName}`}</TableCell>
                <TableCell>{moderator.email}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => handleRemoveModerator(moderator.id)}
                  >
                    Удалить
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );

  if (!user || !checkIfAdmin(user.role)) {
    return <Typography>Нет доступа</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Панель администратора
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Модераторы" />
          <Tab label="Страховые пакеты" />
          <Tab label="Заявки" />
        </Tabs>
      </Paper>

      {tabValue === 0 && renderModeratorsTab()}
      {tabValue === 1 && <InsurancePackages adminView />}
      {tabValue === 2 && <iframe src="/admin/claims" style={{ width: '100%', height: 'calc(100vh - 200px)', border: 'none' }} />}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Добавить модератора</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              fullWidth
              label="Email"
              value={newModerator.email}
              onChange={(e) => setNewModerator({ ...newModerator, email: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Пароль"
              type="password"
              value={newModerator.password}
              onChange={(e) => setNewModerator({ ...newModerator, password: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Имя"
              value={newModerator.firstName}
              onChange={(e) => setNewModerator({ ...newModerator, firstName: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Фамилия"
              value={newModerator.lastName}
              onChange={(e) => setNewModerator({ ...newModerator, lastName: e.target.value })}
              margin="normal"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button 
            onClick={handleCreateModerator} 
            variant="contained" 
            color="primary"
            disabled={!newModerator.email || !newModerator.password || !newModerator.firstName || !newModerator.lastName}
          >
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel;