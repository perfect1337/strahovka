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
  LinearProgress,
  Stack,
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
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { formatDate } from '../utils/dateUtils';
import { processKaskoPayment, processTravelPayment, processPropertyPayment, processOsagoPayment, processHealthPayment } from '../api/insurance';
import { getKaskoApplications, getOsagoApplications, getTravelApplications, getHealthApplications, getPropertyApplications } from '../api/insurance';

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
                  primary={`Приоритетное рассмотрение страховых случаев`}
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
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [openSnackbar, setOpenSnackbar] = useState(false);

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
      const response = await api.get('/api/insurance/policies');
      setPolicies(response.data);
    } catch (error) {
      console.error('Error fetching policies:', error);
    }
  };

  const fetchAllApplications = async () => {
    try {
      const [kasko, osago, travel, health, property] = await Promise.all([
        api.get('/api/insurance/applications/kasko'),
        api.get('/api/insurance/applications/osago'),
        api.get('/api/insurance/applications/travel'),
        api.get('/api/insurance/applications/health'),
        api.get('/api/insurance/applications/property')
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
      case 'PENDING':
        return 'Ожидает оплаты';
      case 'ACTIVE':
      case 'APPROVED':
      case 'PAID':
        return 'Активен';
      case 'INACTIVE':
        return 'Остановлен';
      case 'COMPLETED':
        return 'Завершен';
      case 'CANCELLED':
        return 'Отменен';
      case 'REJECTED':
        return 'Отклонен';
      case 'IN_REVIEW':
        return 'На рассмотрении';
      case 'NEED_INFO':
        return 'Требуется информация';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING_PAYMENT':
      case 'PENDING':
        return 'warning';
      case 'ACTIVE':
      case 'APPROVED':
      case 'PAID':
        return 'success';
      case 'INACTIVE':
      case 'CANCELLED':
      case 'REJECTED':
        return 'error';
      case 'COMPLETED':
        return 'info';
      case 'IN_REVIEW':
        return 'info';
      case 'NEED_INFO':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handlePayment = async (applicationId, type) => {
    try {
      setLoading(true);
      let response;
      const upperCaseType = type.toUpperCase();
      
      if (upperCaseType === 'KASKO') {
        response = await processKaskoPayment(applicationId);
      } else if (upperCaseType === 'TRAVEL') {
        response = await processTravelPayment(applicationId);
      } else if (upperCaseType === 'PROPERTY') {
        response = await processPropertyPayment(applicationId);
      } else if (upperCaseType === 'OSAGO') {
        response = await processOsagoPayment(applicationId);
      } else if (upperCaseType === 'HEALTH') {
        response = await processHealthPayment(applicationId);
      } else {
        console.error('Unsupported application type in handlePayment:', type);
        setSnackbarMessage(`Неподдерживаемый тип заявки: ${type}`);
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
        setLoading(false);
        return;
      }
      
      // Refresh applications after payment
      await fetchAllApplications();
      
      setSnackbarMessage('Оплата успешно проведена');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Payment error:', error);
      let errorMessage = 'Ошибка при проведении оплаты';
      
      if (error) {
        if (typeof error === 'string') {
          errorMessage = error;
        } else if (error.message && typeof error.message === 'string') {
          errorMessage = error.message;
        } else if (error.response) {
          if (error.response.data) {
            if (typeof error.response.data === 'string') {
              errorMessage = error.response.data;
            } else if (error.response.data.message) {
              errorMessage = error.response.data.message;
            } else if (error.response.data.error) {
              errorMessage = error.response.data.error;
            }
          }
        }
      }
      
      // Ensure we're setting a string
      setSnackbarMessage(String(errorMessage));
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPolicy = async (app) => {
    // Get the policy ID from either the policy object or the application ID
    const policyId = app.policy?.id || app.id;
    const status = app.policy?.status || app.status;
    
    // Check if policy can be cancelled
    if (status !== 'ACTIVE') {
      setError(`Полис не может быть отменен. Текущий статус: ${getStatusText(status)}. Для отмены полис должен быть активен.`);
      return;
    }
    
    setSelectedPolicy({
      ...app,
      id: policyId,
      type: app.policy?.category?.name || app.type,
      startDate: app.policy?.startDate || app.applicationDate,
      endDate: app.policy?.endDate || app.endDate,
      calculatedAmount: app.policy?.price || app.calculatedAmount,
      status: status
    });
    setCancelDialogOpen(true);
  };

  const confirmCancelPolicy = async () => {
    try {
      setLoading(true);
      const response = await api.post(`/api/insurance/policies/${selectedPolicy.id}/cancel`, {
        reason: 'Отменено по запросу клиента'
      });
      
      const { refundAmount, message } = response.data;
      setSuccess(message || `Полис успешно остановлен. Сумма возврата: ${refundAmount.toLocaleString('ru-RU')} ₽`);
      
      // Refresh data
      await Promise.all([
        fetchPolicies(),
        fetchAllApplications()
      ]);
    } catch (error) {
      console.error('Error cancelling policy:', error);
      let errorMessage = 'Ошибка при отмене полиса';
      if (error) {
        if (typeof error === 'string') {
          errorMessage = error;
        } else if (error.message && typeof error.message === 'string') {
          errorMessage = error.message;
        } else if (error.response) {
          if (error.response.data) {
            if (typeof error.response.data === 'string') {
              errorMessage = error.response.data;
            } else if (error.response.data.message && typeof error.response.data.message === 'string') {
              errorMessage = error.response.data.message;
            } else if (error.response.data.error && typeof error.response.data.error === 'string') {
              errorMessage = error.response.data.error;
            } else if (Array.isArray(error.response.data) && error.response.data.length > 0 && typeof error.response.data[0] === 'string') {
              errorMessage = error.response.data[0];
            } else if (typeof error.response.data === 'object') {
                // Attempt to stringify the object if it's not too complex
                try {
                    const errStr = JSON.stringify(error.response.data);
                    if (errStr !== '{}') { // Avoid empty object strings
                        errorMessage = errStr;
                    } else if (error.response.statusText) {
                        errorMessage = error.response.statusText;
                    }
                } catch (e) {
                    // Fallback if stringification fails or is empty
                    if (error.response.statusText) {
                        errorMessage = error.response.statusText;
                    }
                }
            } else if (error.response.statusText) {
                errorMessage = error.response.statusText;
            }
          }
        } 
      }
      setError(String(errorMessage)); // Ensure error is always a string
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
            <TableCell>Номер полиса</TableCell>
            <TableCell>Дата подачи</TableCell>
            <TableCell>Дата окончания</TableCell>
            <TableCell>Статус</TableCell>
            <TableCell>Сумма</TableCell>
            <TableCell sx={{ minWidth: 250 }}>Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {applications.map((app) => {
            // Get status from either the application or its policy
            const status = app.policy?.status || app.status;
            const amount = app.policy?.price || app.calculatedAmount;
            
            // Determine which button to show based on status
            const showPayButton = ['PENDING', 'PENDING_PAYMENT'].includes(status);
            const showCancelButton = ['ACTIVE', 'APPROVED', 'PAID'].includes(status);

            // Get application-specific display info
            let displayName = type.toUpperCase();
            if (type === 'kasko') {
              displayName += ` - ${app.carMake || ''} ${app.carModel || ''}`;
            } else if (type === 'travel') {
              displayName += ` - ${app.destinationCountry || ''}`;
            }

            return (
              <TableRow key={app.id}>
                <TableCell>{displayName}</TableCell>
                <TableCell>{app.policy ? app.policy.id : '-'}</TableCell>
                <TableCell>{formatDate(app.applicationDate)}</TableCell>
                <TableCell>
                  {type === 'travel' 
                    ? formatDate(app.travelEndDate)
                    : formatDate(app.endDate || app.policy?.endDate)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(status)}
                    color={getStatusColor(status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{amount ? `${Number(amount).toLocaleString('ru-RU')} ₽` : '-'}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} sx={{ minWidth: 250 }}>
                    {showPayButton && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handlePayment(app.id, type)}
                        disabled={loading || !amount}
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        Оплатить
                      </Button>
                    )}
                    {showCancelButton && (
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleCancelPolicy(app)}
                        disabled={loading}
                        sx={{ 
                          whiteSpace: 'nowrap',
                          '&:hover': {
                            backgroundColor: '#d32f2f',
                            boxShadow: '0 2px 4px rgba(211, 47, 47, 0.25)'
                          }
                        }}
                      >
                        Прекратить
                      </Button>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
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

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
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
            <UserLevelInfo level={userData?.level} policyCount={userData?.policyCount} />
          </Grid>

          <Grid item xs={12} md={8}>
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
          </Grid>
        </Grid>
      </Box>

      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Подтверждение прекращения полиса</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите прекратить действие полиса?
          </DialogContentText>
          
          <Box sx={{ mt: 3, mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Условия возврата страховой премии:
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
              • В течение первых 14 дней: возврат 100% стоимости полиса
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              • После 14 дней: пропорциональный возврат за неиспользованный период минус 20% (административные расходы)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Возврат средств будет произведен в течение 10 рабочих дней на карту, с которой была произведена оплата.
            </Typography>
          </Box>

          {selectedPolicy && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Информация о полисе:
              </Typography>
              <Typography variant="body2" gutterBottom>
                Тип страхования: {selectedPolicy.type?.toUpperCase()}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Дата начала: {formatDate(selectedPolicy.startDate)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Дата окончания: {formatDate(selectedPolicy.endDate)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Стоимость полиса: {selectedPolicy.calculatedAmount?.toLocaleString('ru-RU')} ₽
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} disabled={loading}>
            Отмена
          </Button>
          <Button 
            onClick={confirmCancelPolicy} 
            color="error" 
            variant="contained"
            disabled={loading}
            sx={{
              '&:hover': {
                backgroundColor: '#d32f2f',
              }
            }}
          >
            {loading ? 'Обработка...' : 'Прекратить полис'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile; 