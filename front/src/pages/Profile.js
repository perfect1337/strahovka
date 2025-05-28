import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Chip,
  Avatar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Assignment as AssignmentIcon,
  LocalHospital as ClaimIcon,
} from '@mui/icons-material';
import { formatDate } from '../utils/dateUtils';
import { processKaskoPayment } from '../api/insurance';
import { getKaskoApplications, getOsagoApplications, getTravelApplications, getHealthApplications, getPropertyApplications } from '../api/insurance';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [applications, setApplications] = useState({
    kasko: [],
    osago: [],
    travel: [],
    health: [],
    property: []
  });
  const [tabValue, setTabValue] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  useEffect(() => {
    fetchUserData();
    fetchPolicies();
    fetchAllApplications();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/api/users/profile');
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchPolicies = async () => {
    try {
      const response = await api.get('/api/insurance/policies/user');
      setPolicies(response.data);
    } catch (error) {
      console.error('Error fetching policies:', error);
    }
  };

  const fetchAllApplications = async () => {
    try {
      const [kasko, osago, travel, health, property] = await Promise.all([
        api.get('/api/insurance/applications/user/kasko'),
        api.get('/api/insurance/applications/user/osago'),
        api.get('/api/insurance/applications/user/travel'),
        api.get('/api/insurance/applications/user/health'),
        api.get('/api/insurance/applications/user/property')
      ]);

      setApplications({
        kasko: kasko.data,
        osago: osago.data,
        travel: travel.data,
        health: health.data,
        property: property.data
      });
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'Ожидает оплаты';
      case 'ACTIVE':
        return 'Активен';
      case 'INACTIVE':
        return 'Остановлен';
      case 'COMPLETED':
        return 'Завершен';
      case 'CANCELLED':
        return 'Отменен';
      case 'PENDING':
        return 'На рассмотрении';
      case 'APPROVED':
        return 'Одобрен';
      case 'REJECTED':
        return 'Отклонен';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'warning';
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'error';
      case 'COMPLETED':
        return 'info';
      case 'CANCELLED':
        return 'error';
      case 'PENDING':
        return 'warning';
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  const handlePayment = async (applicationId) => {
    try {
      setLoading(true);
      await processKaskoPayment(applicationId);
      setSuccess('Полис успешно оплачен');
      // Refresh data
      fetchPolicies();
      fetchAllApplications();
    } catch (error) {
      console.error('Error processing payment:', error);
      setError('Ошибка при обработке платежа: ' + (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPolicy = async (policy) => {
    setSelectedPolicy(policy);
    setCancelDialogOpen(true);
  };

  const confirmCancelPolicy = async () => {
    try {
      setLoading(true);
      const response = await api.post(`/api/insurance/policies/${selectedPolicy.id}/cancel`);
      const { refundAmount } = response.data;
      
      setSuccess(`Полис успешно остановлен. Сумма возврата: ${refundAmount.toLocaleString('ru-RU')} ₽`);
      // Принудительно обновляем данные
      await Promise.all([
        fetchPolicies(),
        fetchAllApplications()
      ]);
    } catch (error) {
      console.error('Error cancelling policy:', error);
      setError('Ошибка при отмене полиса: ' + (error.response?.data || error.message));
    } finally {
      setLoading(false);
      setCancelDialogOpen(false);
      setSelectedPolicy(null);
    }
  };

  const renderApplicationsTable = (applications, type) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Тип страхования</TableCell>
            <TableCell>Дата подачи</TableCell>
            <TableCell>Дата окончания</TableCell>
            <TableCell>Статус</TableCell>
            <TableCell>Сумма</TableCell>
            <TableCell>Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id}>
              <TableCell>{app.policy?.name || `${type.toUpperCase()}`}</TableCell>
              <TableCell>{formatDate(app.applicationDate)}</TableCell>
              <TableCell>{app.policy ? formatDate(app.policy.endDate) : '-'}</TableCell>
              <TableCell>
                <Chip
                  label={getStatusText(app.policy?.status || app.status)}
                  color={getStatusColor(app.policy?.status || app.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>{app.calculatedAmount?.toLocaleString('ru-RU')} ₽</TableCell>
              <TableCell>
                {app.status === 'PENDING' && app.policy?.status === 'PENDING_PAYMENT' && (
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handlePayment(app.id)}
                    disabled={loading}
                  >
                    Оплатить
                  </Button>
                )}
                {app.policy?.status === 'ACTIVE' && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleCancelPolicy(app.policy)}
                    disabled={loading}
                  >
                    Остановить
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          {applications.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center">
                Нет заявок
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (!userData) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Личный кабинет
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Paper sx={{ mb: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Профиль пользователя
          </Typography>
          {userData && (
            <>
              <Typography>Email: {userData.email}</Typography>
              <Typography>Имя: {userData.firstName}</Typography>
              <Typography>Фамилия: {userData.lastName}</Typography>
            </>
          )}
        </Paper>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="КАСКО" />
          <Tab label="ОСАГО" />
          <Tab label="Путешествия" />
          <Tab label="Здоровье" />
          <Tab label="Недвижимость" />
        </Tabs>
      </Box>

      {tabValue === 0 && renderApplicationsTable(applications.kasko, 'kasko')}
      {tabValue === 1 && renderApplicationsTable(applications.osago, 'osago')}
      {tabValue === 2 && renderApplicationsTable(applications.travel, 'travel')}
      {tabValue === 3 && renderApplicationsTable(applications.health, 'health')}
      {tabValue === 4 && renderApplicationsTable(applications.property, 'property')}

      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle>Подтверждение остановки полиса</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите остановить действие полиса? 
            Вам будет возвращена часть стоимости полиса пропорционально оставшемуся сроку действия.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            Отмена
          </Button>
          <Button onClick={confirmCancelPolicy} color="error" variant="contained">
            Остановить полис
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile; 