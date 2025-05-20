import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Container, Typography, Box, Tabs, Tab, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Button, Dialog, 
  DialogTitle, DialogContent, DialogActions, TextField, Fab, Select, MenuItem, 
  FormControl, InputLabel, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import api from '../api';
import { checkIfAdmin } from '../utils/roleUtils';

const AdminPanel = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [openPolicyDialog, setOpenPolicyDialog] = useState(false);
  const [policyStatus, setPolicyStatus] = useState('');
  const [policyComment, setPolicyComment] = useState('');
  const [openNewUserDialog, setOpenNewUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'USER', level: 'BRONZE' });

  useEffect(() => {
    if (user && checkIfAdmin(user.role)) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersResponse, policiesResponse] = await Promise.all([
        api.get('/api/admin/users'),
        api.get('/api/admin/policies')
      ]);
      setUsers(usersResponse.data);
      setPolicies(policiesResponse.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenUserDialog = (user) => {
    setSelectedUser(user);
    setOpenUserDialog(true);
  };

  const handleOpenPolicyDialog = (policy) => {
    setSelectedPolicy(policy);
    setPolicyStatus(policy.status || '');
    setPolicyComment(policy.adminComment || '');
    setOpenPolicyDialog(true);
  };

  const handleUpdateUserLevel = async () => {
    try {
      await api.put(`/api/admin/users/${selectedUser.id}`, { level: selectedUser.level });
      setOpenUserDialog(false);
      fetchData();
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Ошибка при обновлении пользователя');
    }
  };

  const handleUpdatePolicy = async () => {
    try {
      await api.put(`/api/admin/policies/${selectedPolicy.id}`, { 
        status: policyStatus,
        adminComment: policyComment 
      });
      setOpenPolicyDialog(false);
      fetchData();
    } catch (err) {
      console.error('Error updating policy:', err);
      setError('Ошибка при обновлении полиса');
    }
  };

  const handleUserLevelChange = (event) => {
    setSelectedUser({...selectedUser, level: event.target.value});
  };

  const handleNewUserChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async () => {
    try {
      await api.post('/api/admin/users', newUser);
      setOpenNewUserDialog(false);
      setNewUser({ email: '', password: '', role: 'USER', level: 'BRONZE' });
      fetchData();
    } catch (err) {
      console.error('Error creating user:', err);
      setError('Ошибка при создании пользователя');
    }
  };

  if (!user || !checkIfAdmin(user.role)) {
    return <Typography>Нет доступа</Typography>;
  }

  if (loading) {
    return <Typography>Загрузка...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Админ-панель
        </Typography>
        <Typography sx={{ mb: 2 }}>Добро пожаловать, {user.email}!</Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Пользователи" />
            <Tab label="Страховые заявки" />
          </Tabs>
        </Box>
        
        {tabValue === 0 && (
          <Box sx={{ mt: 2, position: 'relative' }}>
            <Fab 
              color="primary" 
              size="small" 
              sx={{ position: 'absolute', top: -20, right: 0 }}
              onClick={() => setOpenNewUserDialog(true)}
            >
              <AddIcon />
            </Fab>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Уровень</TableCell>
                    <TableCell>Роль</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.level}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          variant="contained"
                          onClick={() => handleOpenUserDialog(user)}
                        >
                          Изменить
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
        
        {tabValue === 1 && (
          <Box sx={{ mt: 2 }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Категория</TableCell>
                    <TableCell>Пользователь</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Дата окончания</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {policies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell>{policy.id}</TableCell>
                      <TableCell>{policy.categoryName}</TableCell>
                      <TableCell>{policy.userEmail}</TableCell>
                      <TableCell>{policy.status || 'Новая'}</TableCell>
                      <TableCell>{new Date(policy.endDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          variant="contained"
                          onClick={() => handleOpenPolicyDialog(policy)}
                        >
                          Обработать
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>

      {/* Диалог редактирования пользователя */}
      <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)}>
        <DialogTitle>Редактирование пользователя</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ mt: 2 }}>
              <Typography>Email: {selectedUser.email}</Typography>
              <TextField
                select
                label="Уровень"
                value={selectedUser.level}
                onChange={handleUserLevelChange}
                fullWidth
                margin="normal"
                SelectProps={{
                  native: true,
                }}
              >
                <option value="BRONZE">BRONZE</option>
                <option value="SILVER">SILVER</option>
                <option value="GOLD">GOLD</option>
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserDialog(false)}>Отмена</Button>
          <Button onClick={handleUpdateUserLevel} color="primary">Сохранить</Button>
        </DialogActions>
      </Dialog>
      
      {/* Диалог обработки заявки */}
      <Dialog open={openPolicyDialog} onClose={() => setOpenPolicyDialog(false)}>
        <DialogTitle>Обработка страховой заявки</DialogTitle>
        <DialogContent>
          {selectedPolicy && (
            <Box sx={{ mt: 2 }}>
              <Typography>ID: {selectedPolicy.id}</Typography>
              <Typography>Категория: {selectedPolicy.categoryName}</Typography>
              <Typography>Пользователь: {selectedPolicy.userEmail}</Typography>
              
              <TextField
                select
                label="Статус"
                value={policyStatus}
                onChange={(e) => setPolicyStatus(e.target.value)}
                fullWidth
                margin="normal"
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">Выберите статус</option>
                <option value="APPROVED">Одобрено</option>
                <option value="REJECTED">Отклонено</option>
                <option value="PENDING">На рассмотрении</option>
              </TextField>
              
              <TextField
                label="Комментарий"
                value={policyComment}
                onChange={(e) => setPolicyComment(e.target.value)}
                fullWidth
                margin="normal"
                multiline
                rows={4}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPolicyDialog(false)}>Отмена</Button>
          <Button onClick={handleUpdatePolicy} color="primary">Сохранить</Button>
        </DialogActions>
      </Dialog>

      {/* Диалог создания нового пользователя */}
      <Dialog 
        open={openNewUserDialog} 
        onClose={() => setOpenNewUserDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Создание нового пользователя</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Email"
                name="email"
                value={newUser.email}
                onChange={handleNewUserChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Пароль"
                name="password"
                type="password"
                value={newUser.password}
                onChange={handleNewUserChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Роль</InputLabel>
                <Select
                  name="role"
                  value={newUser.role}
                  onChange={handleNewUserChange}
                  label="Роль"
                >
                  <MenuItem value="USER">Пользователь</MenuItem>
                  <MenuItem value="ADMIN">Администратор</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Уровень</InputLabel>
                <Select
                  name="level"
                  value={newUser.level}
                  onChange={handleNewUserChange}
                  label="Уровень"
                >
                  <MenuItem value="BRONZE">BRONZE</MenuItem>
                  <MenuItem value="SILVER">SILVER</MenuItem>
                  <MenuItem value="GOLD">GOLD</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewUserDialog(false)}>Отмена</Button>
          <Button 
            onClick={handleCreateUser} 
            color="primary"
            disabled={!newUser.email || !newUser.password}
          >
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel;