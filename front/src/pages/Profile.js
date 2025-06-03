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
  LinearProgress,
  Stack,
  Collapse,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { ChevronRight as ChevronRightIcon } from '@mui/icons-material';
import { formatDate } from '../utils/dateUtils';
import { processKaskoPayment, processTravelPayment, processPropertyPayment, processOsagoPayment, processHealthPayment } from '../api/insurance';

const UserLevelInfo = ({ level, policyCount }) => {
  const levels = [
    { name: 'WOODEN', displayName: 'Деревянный', color: '#8B4513', minPolicies: 0, discount: 2, icon: '🌳' },
    { name: 'BRONZE', displayName: 'Бронзовый', color: '#CD7F32', minPolicies: 1, discount: 5, icon: '🥉' },
    { name: 'SILVER', displayName: 'Серебряный', color: '#C0C0C0', minPolicies: 3, discount: 10, icon: '🥈' },
    { name: 'GOLD', displayName: 'Золотой', color: '#FFD700', minPolicies: 5, discount: 15, icon: '🥇' },
  ];

  const currentLevelIndex = levels.findIndex(l => l.name === level) || 0;
  const currentLevel = levels[currentLevelIndex];
  const nextLevel = levels[currentLevelIndex + 1];

  const getProgress = () => {
    if (!nextLevel) return 100;
    const policiesForNextLevel = nextLevel.minPolicies - currentLevel.minPolicies;
    const progress = ((policyCount - currentLevel.minPolicies) / policiesForNextLevel) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  return (
    <Card sx={{ mb: 4, position: 'relative', overflow: 'visible' }}>
      <CardContent>
        <Box sx={{ position: 'absolute', top: -20, right: 20, 
          width: 40, height: 40, 
          borderRadius: '50%', 
          backgroundColor: currentLevel.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          boxShadow: 3 }}>
          {currentLevel.icon}
        </Box>

        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Уровень пользователя
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ mr: 2 }}>
                {currentLevel.displayName} уровень
              </Typography>
              <Chip 
                label={`${currentLevel.discount}% скидка`}
                color="primary"
                size="small"
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Активных страховок: {policyCount || 0}
            </Typography>
            {nextLevel && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <Box sx={{ flexGrow: 1, mr: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={getProgress()}
                      sx={{ 
                        height: 8, 
                        borderRadius: 5,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: nextLevel.color,
                        }
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {policyCount}/{nextLevel.minPolicies}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  До {nextLevel.displayName.toLowerCase()} уровня: {nextLevel.minPolicies - policyCount} полис(ов)
                </Typography>
              </>
            )}
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
              Доступные привилегии:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary={`${currentLevel.discount}% скидка на все новые страховые полисы`}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={"Приоритетное рассмотрение страховых случаев"}
                />
              </ListItem>
              {currentLevelIndex >= 3 && (
                <ListItem>
                  <ListItemText 
                    primary="VIP обслуживание"
                  />
                </ListItem>
              )}
            </List>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [packages, setPackages] = useState([]);
  const [applications, setApplications] = useState({
    kasko: [], osago: [], travel: [], health: [], property: []
  });
  const [tabValue, setTabValue] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const getInsuranceTypeDisplay = (type) => {
    switch (type?.toUpperCase()) {
      case 'KASKO': return 'КАСКО';
      case 'OSAGO': return 'ОСАГО';
      case 'TRAVEL': return 'Путешествия';
      case 'PROPERTY': return 'Имущество';
      case 'HEALTH': return 'Здоровье';
      case 'UNKNOWN': return 'Неизвестный тип';
      default: return type || 'Неизвестный тип';
    }
  };

  const getPackageStatusDisplay = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING_PACKAGE': return 'Формируется';
      case 'PENDING_PAYMENT': return 'Ожидает оплаты';
      case 'PENDING': return 'В обработке';
      case 'PAID': return 'Оплачен';
      case 'ACTIVE': return 'Активен';
      case 'CANCELLED': return 'Отменён';
      default: return status || 'Неизвестный статус';
    }
  };

  const getPackageStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING_PACKAGE': return 'info';
      case 'PENDING_PAYMENT': return 'warning';
      case 'PENDING': return 'info';
      case 'PAID': case 'ACTIVE': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING_PAYMENT': return 'Ожидает оплаты';
      case 'PENDING_PACKAGE': return 'Формируется';
      case 'PENDING': return 'В обработке';
      case 'ACTIVE': case 'APPROVED': case 'PAID': return 'Активен';
      case 'INACTIVE': return 'Остановлен';
      case 'COMPLETED': return 'Завершен';
      case 'CANCELLED': return 'Отменен';
      case 'REJECTED': return 'Отклонен';
      case 'IN_REVIEW': return 'На рассмотрении';
      case 'NEED_INFO': return 'Требуется информация';
      default: return status || 'Неизвестный';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING_PAYMENT': case 'PENDING_PACKAGE': case 'PENDING': case 'NEED_INFO': return 'warning';
      case 'ACTIVE': case 'APPROVED': case 'PAID': return 'success';
      case 'INACTIVE': case 'CANCELLED': case 'REJECTED': return 'error';
      case 'COMPLETED': case 'IN_REVIEW': return 'info';
      default: return 'default';
    }
  };

  const canPayPackage = (pkg) => {
    const status = pkg?.status?.toUpperCase();
    return status === 'PENDING_PAYMENT' || status === 'PENDING';
  };

  const canPayApplication = (appStatus) => {
    const status = appStatus?.toUpperCase();
    // Добавьте другие статусы, если необходимо
    return status === 'PENDING' || status === 'PENDING_PAYMENT'; 
  };

  const fetchPolicies = async () => {
    try {
      const response = await api.get('/api/insurance/policies');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching policies:', error);
      setError('Ошибка загрузки полисов: ' + (error.response?.data?.message || error.message));
      return [];
    }
  };

  const fetchPackages = async () => {
    try {
      const response = await api.get('/api/insurance/packages/user/details');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching packages:', error);
      setError('Ошибка загрузки пакетов: ' + (error.response?.data?.message || error.message));
      return [];
    }
  };

  const fetchAllApplications = async () => {
    try {
      const [kasko, osago, travel, health, property] = await Promise.all([
        api.get('/api/insurance/applications/kasko').then(res => res.data).catch(() => []),
        api.get('/api/insurance/applications/osago').then(res => res.data).catch(() => []),
        api.get('/api/insurance/applications/travel').then(res => res.data).catch(() => []),
        api.get('/api/insurance/applications/health').then(res => res.data).catch(() => []),
        api.get('/api/insurance/applications/property').then(res => res.data).catch(() => [])
      ]);
      return { kasko, osago, travel, health, property };
    } catch (error) {
      console.error('Error fetching all applications:', error);
      setError('Ошибка загрузки заявок: ' + (error.response?.data?.message || error.message));
      return { kasko: [], osago: [], travel: [], health: [], property: [] };
    }
  };
  
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      setError('');
      setSuccess('');
      console.log('Initializing Profile component...');
      try {
        const [userDataRes, policiesRes, packagesRes, applicationsRes] = await Promise.all([
          api.get('/api/users/profile'),
          fetchPolicies(),
          fetchPackages(),
          fetchAllApplications()
        ]);

        console.log('User data response:', userDataRes.data);
        setUserData(userDataRes.data);

        console.log('Fetched Policies:', policiesRes);
        setPolicies(policiesRes);

        console.log('Fetched Packages:', packagesRes);
        if (Array.isArray(packagesRes)) {
            packagesRes.forEach(pkg => {
                console.log(`Package ID: ${pkg.id}, Name: ${pkg.name}, Discount: ${pkg.discount}, Status: ${pkg.status}, applicationsInPackage:`, pkg.applicationsInPackage);
                if (!Array.isArray(pkg.applicationsInPackage)) {
                    console.warn(`Package ID: ${pkg.id} has non-array applicationsInPackage. Correcting.`);
                    pkg.applicationsInPackage = [];
                }
            });
            setPackages(packagesRes);
        } else {
            console.warn('Fetched packages is not an array:', packagesRes);
            setPackages([]);
        }
        
        console.log('Fetched All Applications:', applicationsRes);
        setApplications(applicationsRes);

      } catch (err) {
        console.error('Error initializing profile:', err);
        setError('Ошибка при загрузке данных профиля: ' + (err.message || 'Неизвестная ошибка'));
      } finally {
        setLoading(false);
      }
    };
    initializeData();
  }, [user]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handlePayment = async (applicationId, type) => {
    if (!applicationId || !type) {
      console.error('handlePayment called without applicationId or type');
      setSnackbarMessage('Ошибка: Не указан ID заявки или тип для оплаты.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }
    setLoading(true);
    try {
      let response;
      const upperCaseType = type.toUpperCase();
      
      if (upperCaseType === 'KASKO') response = await processKaskoPayment(applicationId);
      else if (upperCaseType === 'TRAVEL') response = await processTravelPayment(applicationId);
      else if (upperCaseType === 'PROPERTY') response = await processPropertyPayment(applicationId);
      else if (upperCaseType === 'OSAGO') response = await processOsagoPayment(applicationId);
      else if (upperCaseType === 'HEALTH') response = await processHealthPayment(applicationId);
      else {
        console.error('Unsupported application type in handlePayment:', type);
        setSnackbarMessage(`Неподдерживаемый тип заявки для оплаты: ${type}`);
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
        setLoading(false);
        return;
      }
      
      console.log('Payment response (single policy):', response);
      setSnackbarMessage('Оплата успешно проведена (отдельный полис)');
      setSnackbarSeverity('success');
      const [newPolicies, newApplications] = await Promise.all([fetchPolicies(), fetchAllApplications()]);
      setPolicies(newPolicies);
      setApplications(newApplications);
      console.log('Updated policies state after payment:', JSON.parse(JSON.stringify(newPolicies)));
      console.log('Updated applications state after payment:', JSON.parse(JSON.stringify(newApplications)));

    } catch (e) {
      console.error('Payment error (single policy):', e);
      const errorMessage = e.response?.data?.message || e.response?.data?.error || e.message || 'Неизвестная ошибка оплаты';
      setSnackbarMessage(`Ошибка при оплате полиса (${type}): ${errorMessage}`);
      setSnackbarSeverity('error');
    } finally {
      setLoading(false);
      setOpenSnackbar(true);
    }
  };

  const handleCancelPolicy = async (appToCancel) => {
    const policyId = appToCancel.policy?.id || appToCancel.id;
    const status = appToCancel.policy?.status || appToCancel.status;
    
    if (status?.toUpperCase() !== 'ACTIVE') {
      setError(`Полис не может быть отменен. Текущий статус: ${getStatusText(status)}. Для отмены полис должен быть активен.`);
      setSnackbarMessage(`Полис не может быть отменен. Статус: ${getStatusText(status)}`);
      setSnackbarSeverity('warning');
      setOpenSnackbar(true);
      return;
    }
    
    setSelectedPolicy({
      ...appToCancel,
      id: policyId,
      type: appToCancel.policy?.category?.name || appToCancel.type,
      startDate: appToCancel.policy?.startDate || appToCancel.applicationDate,
      endDate: appToCancel.policy?.endDate || appToCancel.endDate,
      calculatedAmount: appToCancel.policy?.price || appToCancel.calculatedAmount || appToCancel.amount,
      status: status
    });
    setCancelDialogOpen(true);
  };

  const confirmCancelPolicy = async () => {
    if (!selectedPolicy) return;
    try {
      setLoading(true);
      const response = await api.post(`/api/insurance/policies/${selectedPolicy.id}/cancel`, {
        reason: 'Отменено по запросу клиента'
      });
      
      const { refundAmount, message } = response.data;
      setSuccess(message || `Полис успешно остановлен. Сумма возврата: ${refundAmount?.toLocaleString('ru-RU') || 0} ₽`);
      setSnackbarMessage(message || `Полис успешно остановлен. Сумма возврата: ${refundAmount?.toLocaleString('ru-RU') || 0} ₽`);
      setSnackbarSeverity('success');
      
      const [newPolicies, newApplications] = await Promise.all([fetchPolicies(), fetchAllApplications()]);
      setPolicies(newPolicies);
      setApplications(newApplications);
    } catch (e) {
      console.error('Error cancelling policy:', e);
      const apiErrorMessage = e.response?.data?.message || e.response?.data?.error || e.message;
      setError('Ошибка при отмене полиса: ' + apiErrorMessage);
      setSnackbarMessage('Ошибка при отмене полиса: ' + apiErrorMessage);
      setSnackbarSeverity('error');
    } finally {
      setLoading(false);
      setCancelDialogOpen(false);
      setSelectedPolicy(null);
      setOpenSnackbar(true);
    }
  };

  const handlePayPackage = async (packageId) => {
    try {
      setLoading(true);
      setError(''); 
      setSuccess('');
      await api.post(`/api/insurance/packages/${packageId}/process-payment`);
      setSuccess('Пакет успешно оплачен');
      setSnackbarMessage('Пакет успешно оплачен');
      setSnackbarSeverity('success');
      
      const [newPackages, newPolicies, newApps] = await Promise.all([fetchPackages(), fetchPolicies(), fetchAllApplications()]);
      setPackages(newPackages);
      setPolicies(newPolicies);
      setApplications(newApps);
    } catch (e) {
      console.error('Error paying for package:', e);
      const apiErrorMessage = e.response?.data?.message || e.response?.data?.error || e.message;
      setError('Ошибка при оплате пакета: ' + apiErrorMessage);
      setSnackbarMessage('Ошибка при оплате пакета: ' + apiErrorMessage);
      setSnackbarSeverity('error');
    } finally {
      setLoading(false);
      setOpenSnackbar(true);
    }
  };

  const handleCancelPackage = async (packageId) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await api.post(`/api/insurance/packages/${packageId}/cancel`);
      setSuccess('Пакет успешно отменен');
      setSnackbarMessage('Пакет успешно отменен');
      setSnackbarSeverity('success');
      
      const [newPackages, newPolicies, newApps] = await Promise.all([fetchPackages(), fetchPolicies(), fetchAllApplications()]);
      setPackages(newPackages);
      setPolicies(newPolicies);
      setApplications(newApps);
    } catch (e) {
      console.error('Error cancelling package:', e);
      const apiErrorMessage = e.response?.data?.message || e.response?.data?.error || e.message;
      setError('Ошибка при отмене пакета: ' + apiErrorMessage);
      setSnackbarMessage('Ошибка при отмене пакета: ' + apiErrorMessage);
      setSnackbarSeverity('error');
    } finally {
      setLoading(false);
      setOpenSnackbar(true);
    }
  };

  const handleViewPolicy = (policy) => {
    console.log("View policy details:", policy);
    setSelectedPolicy(policy);
    setSnackbarMessage(`Детали полиса ${policy.id} (тип: ${getInsuranceTypeDisplay(policy.type || policy.category?.name)}) загружены для просмотра.`);
    setSnackbarSeverity('info');
    setOpenSnackbar(true);
    setCancelDialogOpen(true);
  };
  
  const PackageItem = ({ pkg, onPayment, onCancel }) => {
    const [expanded, setExpandedItem] = useState(false);
    const [itemLoading, setItemLoading] = useState(false);
  
    const handleItemPayment = async () => {
      setItemLoading(true);
      try {
        await onPayment(pkg.id);
      } finally {
        setItemLoading(false);
      }
    };
  
    const handleItemCancel = async () => {
      setItemLoading(true);
      try {
        await onCancel(pkg.id);
      } finally {
        setItemLoading(false);
      }
    };
  
    const calculateTotalAmount = () => {
      if (!pkg.applicationsInPackage || !Array.isArray(pkg.applicationsInPackage) || pkg.applicationsInPackage.length === 0) {
        return 0;
      }
      return pkg.applicationsInPackage.reduce((sum, app) => {
        const amount = parseFloat(app.amount || app.calculatedAmount || 0);
        return sum + amount;
      }, 0);
    };
  
    const calculateDiscountedAmount = () => {
      const total = calculateTotalAmount();
      if (total === 0) return 0;
      return total * (1 - (parseFloat(pkg.discount || 0)) / 100);
    };
  
    const totalAmount = calculateTotalAmount();
    const discountedAmount = pkg.finalAmount ? parseFloat(pkg.finalAmount) : calculateDiscountedAmount();
    const applications = Array.isArray(pkg.applicationsInPackage) ? pkg.applicationsInPackage : [];
  
    return (
      <Box sx={{ mb: 2 }}>
        <Paper sx={{ p: 2, '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
          <Box onClick={() => setExpandedItem(!expanded)} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <IconButton size="small" sx={{ mr: 1, transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
              <ChevronRightIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1">
                {pkg.name || 'Пакет без имени'} {pkg.discount > 0 && `(скидка ${pkg.discount}%)`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {applications.map(app => getInsuranceTypeDisplay(app.applicationType)).filter(Boolean).join(', ') || 'Полисы не указаны'}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={getPackageStatusDisplay(pkg.status)}
                color={getPackageStatusColor(pkg.status)}
                size="small"
              />
              <Typography variant="body2" color="text.secondary">
                {discountedAmount > 0 ? `${discountedAmount.toLocaleString('ru-RU')} ₽` : (totalAmount > 0 ? 'Расчёт скидки...' : 'Расчёт...')}
              </Typography>
            </Stack>
          </Box>
  
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>Информация о пакете:</Typography>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Общая стоимость: {totalAmount > 0 ? `${totalAmount.toLocaleString('ru-RU')} ₽` : 'Расчёт...'}</Typography>
                  <Typography variant="body2" color="text.secondary">Стоимость со скидкой: {discountedAmount > 0 ? `${discountedAmount.toLocaleString('ru-RU')} ₽` : 'Расчёт...'}</Typography>
                  <Typography variant="body2" color="text.secondary">Экономия: {(totalAmount > 0 && discountedAmount > 0 && totalAmount > discountedAmount) ? `${(totalAmount - discountedAmount).toLocaleString('ru-RU')} ₽` : '0 ₽'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Всего полисов: {applications.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Статус: {getPackageStatusDisplay(pkg.status)}</Typography>
                  <Typography variant="body2" color="text.secondary">Дата создания: {formatDate(pkg.createdAt)}</Typography>
                </Grid>
              </Grid>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>Полисы в пакете ({applications.length}):</Typography>
            <Grid container spacing={2}>
              {applications.map((app, index) => (
                <Grid item xs={12} key={`pkg-app-${pkg.id}-${app.id || index}`}>
                  <Card variant="outlined">
                    <CardContent>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body1" component="div" gutterBottom>{getInsuranceTypeDisplay(app.applicationType) || 'Неизвестный тип'}</Typography>
                          <Typography variant="body2" color="text.secondary">Номер заявки: {app.id || 'N/A'}</Typography>
                          <Typography variant="body2" color="text.secondary">Статус: {getStatusText(app.status) || 'Неизвестно'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                           <Typography variant="subtitle2" gutterBottom>Сроки</Typography>
                           <Typography variant="body2" color="text.secondary">Начало: {formatDate(app.startDate)}</Typography>
                           <Typography variant="body2" color="text.secondary">Окончание: {formatDate(app.endDate)}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="subtitle2" gutterBottom>Стоимость</Typography>
                          <Typography variant="body2" color="text.secondary">Базовая: {app.amount ? `${Number(app.amount).toLocaleString('ru-RU')} ₽` : (app.calculatedAmount ? `${Number(app.calculatedAmount).toLocaleString('ru-RU')} ₽` : 'Расчёт...')}</Typography>
                          <Typography variant="body2" color="text.secondary">Со скидкой: {(app.amount || app.calculatedAmount) ? `${(Number(app.amount || app.calculatedAmount) * (1 - (parseFloat(pkg.discount || 0)) / 100)).toLocaleString('ru-RU')} ₽` : 'Расчёт...'}</Typography>
                        </Grid>
                        {app.additionalInfo && <Grid item xs={12}><Typography variant="body2" color="text.secondary">Доп. инфо: {app.additionalInfo}</Typography></Grid>}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              {canPayPackage(pkg) && (
                <Button variant="contained" color="primary" onClick={handleItemPayment} disabled={itemLoading || totalAmount === 0 || loading}>
                  {itemLoading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                  Оплатить пакет
                </Button>
              )}
              {pkg.status?.toUpperCase() === 'ACTIVE' && (
                <Button variant="outlined" color="error" onClick={handleItemCancel} disabled={itemLoading || loading}>
                  {itemLoading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                  Отменить пакет
                </Button>
              )}
            </Box>
          </Collapse>
        </Paper>
      </Box>
    );
  };

  const PackagesView = ({ packages, onPayPackage, onCancelPackage }) => {
    if (!Array.isArray(packages) || packages.length === 0) {
      return <Typography variant="body1" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>У вас пока нет страховых пакетов</Typography>;
    }
    return (
      <Box sx={{ mt: 2 }}>
        {packages.map((pkg) => (
          <PackageItem key={`package-list-${pkg.id}`} pkg={pkg} onPayment={onPayPackage} onCancel={onCancelPackage} />
        ))}
      </Box>
    );
  };
  
  const renderPoliciesTableBody = () => {
    const combinedPolicies = [
      ...(Array.isArray(policies) ? policies.map(p => ({ ...p, source: 'policy', uniqueKey: `policy-tbl-${p.id}` })) : []),
      ...Object.entries(applications || {}).flatMap(([typeKey, appsArray]) => 
        Array.isArray(appsArray) ? appsArray.map(app => ({ 
          ...app, 
          source: 'application', 
          applicationType_from_key: typeKey.toUpperCase(),
          uniqueKey: `app-tbl-${typeKey}-${app.id}` 
        })) : []
      )
    ];
    
    // Filter to show actual policies, or applications that are still payable
    const standalonePolicies = combinedPolicies.filter(p => 
      p.source === 'policy' || 
      (p.source === 'application' && canPayApplication(p.status))
    );

    if (standalonePolicies.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} align="center">
            <Typography variant="body1" color="text.secondary">У вас пока нет оформленных полисов</Typography>
          </TableCell>
        </TableRow>
      );
    }

    return standalonePolicies.map((policy) => {
      // console.log('Policy object in renderPoliciesTableBody:', JSON.parse(JSON.stringify(policy))); // Оставляем для отладки, если нужно
      const policyTypeForPayment = policy.applicationType_from_key || policy.applicationType || policy.type || policy.category?.name;
      return (
        <TableRow key={policy.uniqueKey}>
          <TableCell>{getInsuranceTypeDisplay(policyTypeForPayment)}</TableCell>
          <TableCell>{policy.id}</TableCell>
          <TableCell>{formatDate(policy.startDate || policy.applicationDate)}</TableCell>
          <TableCell>{formatDate(policy.endDate)}</TableCell>
          <TableCell>
            <Chip label={getStatusText(policy.status)} color={getStatusColor(policy.status)} size="small" />
          </TableCell>
          <TableCell>
            {policy.amount || policy.price || policy.calculatedAmount ?
              `${Number(policy.amount || policy.price || policy.calculatedAmount).toLocaleString('ru-RU')} ₽`
              : 'Расчёт...'}
          </TableCell>
          <TableCell>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" color="primary" size="small" onClick={() => handleViewPolicy(policy)} disabled={loading}>Подробнее</Button>
              {policy.status?.toUpperCase() === 'ACTIVE' && (
                <Button variant="outlined" color="error" size="small" onClick={() => handleCancelPolicy(policy)} disabled={loading}>Отменить</Button>
              )}
              {canPayApplication(policy.status) && (
                <Button 
                  variant="contained" 
                  color="success" 
                  size="small" 
                  onClick={() => handlePayment(policy.id, policyTypeForPayment)} 
                  disabled={loading || !policyTypeForPayment}
                >
                  Оплатить
                </Button>
              )}
            </Stack>
          </TableCell>
        </TableRow>
      );
    });
  };

  if (loading && !userData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (!userData && !loading) {
      return (
          <Container maxWidth="lg" sx={{ mt: 4 }}>
              <Alert severity="warning">Не удалось загрузить данные пользователя. Пожалуйста, попробуйте обновить страницу или войдите снова.</Alert>
          </Container>
      );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, position: 'relative' }}>
      {loading && (
        <Box sx={{ position: 'absolute', top: 5, right: 5, zIndex: 1300 }}>
          <CircularProgress size={20} />
        </Box>
      )}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>Личный кабинет</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ mb: 3, p: 2 }}>
              <Typography variant="h6" gutterBottom>Профиль пользователя</Typography>
              {userData && (
                <>
                  <Typography>Email: {userData.email}</Typography>
                  <Typography>Имя: {userData.firstName}</Typography>
                  <Typography>Фамилия: {userData.lastName}</Typography>
                </>
              )}
            </Paper>
            {userData && <UserLevelInfo level={userData.level} policyCount={userData.policyCount} />}
          </Grid>

          <Grid item xs={12} md={8}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Мои пакеты" />
                <Tab label="Все полисы" />
              </Tabs>
            </Box>

            {tabValue === 0 && (
              <PackagesView packages={packages} onPayPackage={handlePayPackage} onCancelPackage={handleCancelPackage} />
            )}
            {tabValue === 1 && (
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Тип страхования</TableCell>
                      <TableCell>Номер полиса</TableCell>
                      <TableCell>Дата начала</TableCell>
                      <TableCell>Дата окончания</TableCell>
                      <TableCell>Статус</TableCell>
                      <TableCell>Сумма</TableCell>
                      <TableCell>Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>{renderPoliciesTableBody()}</TableBody>
                </Table>
              </TableContainer>
            )}
          </Grid>
        </Grid>
      </Box>

      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedPolicy && selectedPolicy.status?.toUpperCase() === 'ACTIVE' ? 'Подтверждение прекращения полиса' : 'Информация о полисе'}
        </DialogTitle>
        <DialogContent>
          {selectedPolicy && selectedPolicy.status?.toUpperCase() === 'ACTIVE' && (
            <DialogContentText>Вы уверены, что хотите прекратить действие полиса?</DialogContentText>
          )}
          
          <Box sx={{ mt: selectedPolicy && selectedPolicy.status?.toUpperCase() === 'ACTIVE' ? 2 : 0, mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>Условия возврата страховой премии (если применимо):</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 1 }}>• В течение первых 14 дней: возврат 100% стоимости полиса</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>• После 14 дней: пропорциональный возврат за неиспользованный период минус 20% (административные расходы)</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Возврат средств будет произведен в течение 10 рабочих дней на карту, с которой была произведена оплата.</Typography>
          </Box>

          {selectedPolicy && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>Информация о полисе:</Typography>
              <Typography variant="body2" gutterBottom>Тип: {getInsuranceTypeDisplay(selectedPolicy.type || selectedPolicy.category?.name)}</Typography>
              <Typography variant="body2" gutterBottom>Номер: {selectedPolicy.id}</Typography>
              <Typography variant="body2" gutterBottom>Статус: {getStatusText(selectedPolicy.status)}</Typography>
              <Typography variant="body2" gutterBottom>Дата начала: {formatDate(selectedPolicy.startDate)}</Typography>
              <Typography variant="body2" gutterBottom>Дата окончания: {formatDate(selectedPolicy.endDate)}</Typography>
              <Typography variant="body2" gutterBottom>Стоимость: {selectedPolicy.calculatedAmount ? `${Number(selectedPolicy.calculatedAmount).toLocaleString('ru-RU')} ₽` : 'N/A'}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} disabled={loading}>Закрыть</Button>
          {selectedPolicy && selectedPolicy.status?.toUpperCase() === 'ACTIVE' && (
            <Button onClick={confirmCancelPolicy} color="error" variant="contained" disabled={loading} sx={{ '&:hover': { backgroundColor: '#d32f2f' } }}>
              {loading ? 'Обработка...' : 'Прекратить полис'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile; 