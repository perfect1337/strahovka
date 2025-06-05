import React, { useState, useEffect, useRef } from 'react';
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
import { useNavigate, useLocation } from 'react-router-dom';
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
    { name: 'PLATINUM', displayName: 'Платиновый', color: '#E5E4E2', minPolicies: 10, discount: 20, icon: '💎' }
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

const canPayPackage = (pkg) => {
  const status = pkg?.status?.toUpperCase();
  return status === 'PENDING_PAYMENT' || status === 'PENDING';
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

const PackageItem = ({ pkg, onPayment, onCancel, autoExpand, onContinue }) => {
  const [expanded, setExpandedItem] = useState(autoExpand);
  const [itemLoading, setItemLoading] = useState(false);
  const itemRef = useRef(null);

  useEffect(() => {
    if (autoExpand && itemRef.current) {
      itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [autoExpand]);

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

  const applications = pkg.applications || pkg.applicationsInPackage || [];
  const validApplications = applications.filter(app => app && (app.id || app.applicationId));
  const hasApplications = validApplications.length > 0;

  if (process.env.NODE_ENV === 'development') {
    console.log(`Package ${pkg.id}: ${pkg.name}, status: ${pkg.status}, applications: ${validApplications.length}`);
  }

  const calculateTotalAmount = () => {
    if (!hasApplications) return 0;
    return validApplications.reduce((sum, app) => {
      const amount = parseFloat(
        app.calculatedAmount || 
        app.amount || 
        app.price || 
        app.totalAmount || 
        0
      );
      return sum + amount;
    }, 0);
  };

  const calculateDiscountedAmount = () => {
    const total = calculateTotalAmount();
    const discount = pkg.discount || 0;
    return total * (1 - discount / 100);
  };

  const getApplicationType = (app) => {
    if (app.displayName && typeof app.displayName === 'string') {
      const colonIndex = app.displayName.indexOf(':');
      if (colonIndex > 0) {
        return app.displayName.substring(0, colonIndex).trim();
      }
    }
    
    const type = app.applicationType || 
           app.type || 
           app.insuranceType || 
           app.category?.name || 
           app.categoryName;
           
    if (type) {
      return type;
    }
    
    if (app.vehicleInfo || app.carModel) {
      return app.vehiclePurpose === 'personal' ? 'KASKO' : 'OSAGO';
    }
    if (app.destinationCountry || app.travelDates) {
      return 'TRAVEL';
    }
    if (app.propertyType || app.propertyValue) {
      return 'PROPERTY';
    }
    if (app.healthConditions || app.coverageType) {
      return 'HEALTH';
    }
    
    return 'Неизвестный тип';
  };

  const getApplicationAmount = (app) => {
    const amount = parseFloat(
      app.calculatedAmount || 
      app.amount || 
      app.price || 
      app.totalAmount || 
      0
    );
    return amount.toLocaleString('ru-RU');
  };

  const getApplicationId = (app) => {
    return app.id || app.applicationId;
  };

  return (
    <Card ref={itemRef} sx={{ mb: 2, position: 'relative' }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <Typography variant="h6" component="div">
              {pkg.name || 'Без названия'}
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              ID пакета: {pkg.id}
            </Typography>
            {pkg.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {pkg.description}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
            <Chip
              label={getPackageStatusDisplay(pkg.status)}
              color={getPackageStatusColor(pkg.status)}
              sx={{ mb: 1 }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="body2" gutterBottom>
              Информация о пакете:
            </Typography>
            <Box component="div" sx={{ ml: 2 }}>
              {hasApplications ? (
                <>
                  <Typography variant="body2">
                    Общая стоимость: {calculateTotalAmount().toLocaleString('ru-RU')} ₽
                  </Typography>
                  <Typography variant="body2">
                    Скидка: {pkg.discount || 0}%
                  </Typography>
                  <Typography variant="body2">
                    Стоимость со скидкой: {calculateDiscountedAmount().toLocaleString('ru-RU')} ₽
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Скидка на все полисы в пакете: {pkg.discount || 0}%
                </Typography>
              )}
              <Typography variant="body2">
                Дата создания: {formatDate(pkg.createdAt)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2">
                Полисы в пакете ({validApplications.length}):
              </Typography>
              {hasApplications && (
                <IconButton
                  size="small"
                  onClick={() => setExpandedItem(!expanded)}
                  sx={{ ml: 1 }}
                >
                  <ChevronRightIcon sx={{
                    transform: expanded ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.3s'
                  }} />
                </IconButton>
              )}
            </Box>
            
            {hasApplications ? (
              <Collapse in={expanded}>
                <List dense>
                  {validApplications.map((app) => (
                    <ListItem key={getApplicationId(app)}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography>{getInsuranceTypeDisplay(getApplicationType(app))}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              (ID: {getApplicationId(app)})
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2" component="span">
                              Стоимость: {getApplicationAmount(app)} ₽
                            </Typography>
                            {app.status && (
                              <Chip
                                size="small"
                                label={getStatusText(app.status)}
                                color={getStatusColor(app.status)}
                              />
                            )}
                          </Stack>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                В пакете пока нет полисов. Добавьте полисы, чтобы получить скидку.
              </Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              {pkg.status === 'PENDING_PACKAGE' && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => onContinue(pkg.id)}
                >
                  Продолжить оформление
                </Button>
              )}
              {canPayPackage(pkg) && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleItemPayment}
                  disabled={itemLoading || !hasApplications}
                >
                  {itemLoading ? 'Обработка...' : 'Оплатить'}
                </Button>
              )}
              <Button
                variant="outlined"
                color="error"
                onClick={handleItemCancel}
                disabled={itemLoading}
              >
                Отменить
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
      {itemLoading && (
        <LinearProgress sx={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} />
      )}
    </Card>
  );
};

const PackagesView = ({ packages, onPayPackage, onCancelPackage, focusedPackageId, onContinuePackage }) => {
  if (process.env.NODE_ENV === 'development' && packages?.length > 0) {
    console.log(`Rendering ${packages.length} packages. Focused package: ${focusedPackageId || 'none'}`);
  }
  
  if (!packages || !Array.isArray(packages)) {
    console.warn('PackagesView: packages is not an array:', packages);
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Ошибка загрузки пакетов. Пожалуйста, обновите страницу.
      </Alert>
    );
  }

  if (packages.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
        У вас пока нет страховых пакетов
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      {packages.map((pkg) => {
        if (!pkg || !pkg.id) {
          console.warn('Invalid package object:', pkg);
          return null;
        }
        return (
          <PackageItem 
            key={`package-${pkg.id}`} 
            pkg={pkg} 
            onPayment={onPayPackage} 
            onCancel={onCancelPackage}
            onContinue={onContinuePackage}
            autoExpand={pkg.id === focusedPackageId}
          />
        );
      })}
    </Box>
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
  const location = useLocation();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [focusedPackageId, setFocusedPackageId] = useState(null);

  const canPayApplication = (appStatus) => {
    const status = appStatus?.toUpperCase();
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
      const userPackagesListResponse = await api.get('/api/insurance/packages/user/details');
      console.log('User packages list response (initial):', JSON.stringify(userPackagesListResponse.data, null, 2));

      if (!Array.isArray(userPackagesListResponse.data)) {
        console.warn('User packages list response is not an array:', userPackagesListResponse.data);
        return [];
      }

      if (userPackagesListResponse.data.length === 0) {
        console.log('User has no packages.');
        return [];
      }

      const processedPackages = await Promise.all(
        userPackagesListResponse.data.map(async (basicPackageInfo) => {
          if (!basicPackageInfo || typeof basicPackageInfo.id === 'undefined') {
            console.warn('Invalid basic package info (missing or undefined ID):', basicPackageInfo);
            return { id: basicPackageInfo?.id || null, name: 'Invalid Package Data', applications: [], applicationsInPackage: [], status: 'ERROR' };
          }
          const packageId = basicPackageInfo.id;
          let applicationsList = [];

          if (basicPackageInfo.applicationsInPackage && Array.isArray(basicPackageInfo.applicationsInPackage) && basicPackageInfo.applicationsInPackage.length > 0) {
            applicationsList = basicPackageInfo.applicationsInPackage;
            console.log(`Package ${packageId} - Using applicationsInPackage from initial list response (${applicationsList.length} items).`);
          } else {
            console.log(`Package ${packageId} - No applicationsInPackage in initial list response or it's empty.`);
          }

          try {
            const packageDetailsResponse = await api.get(`/api/insurance/packages/${packageId}`);
            const packageDetails = packageDetailsResponse.data;

            console.log(`--- Package ID: ${packageId} (Details Call) ---`);
            console.log('Raw packageDetails from API:', JSON.stringify(packageDetails, null, 2));
            console.log('Keys in packageDetails:', Object.keys(packageDetails));

            if (applicationsList.length === 0) {
              console.log(`Package ${packageId} - Attempting to find applications in detailed response as initial list was empty/lacked them.`);
              const potentialAppKeys = ['applications', 'applicationsInPackage', 'applicationList', 'applicationDTOs', 'packageApplications', 'items'];
              let foundKeyInDetails = null;

              for (const key of potentialAppKeys) {
                if (packageDetails[key] && Array.isArray(packageDetails[key])) {
                  applicationsList = packageDetails[key];
                  foundKeyInDetails = key;
                  console.log(`Package ${packageId} - Found application array in packageDetails.${key} with ${applicationsList.length} items.`);
                  break;
                }
              }
              if (applicationsList.length > 0) {
                console.log(`Package ${packageId} - Extracted applicationsList from detailed response (first item if exists):`, JSON.stringify(applicationsList[0], null, 2));
              } else if (foundKeyInDetails === null) {
                console.log(`Package ${packageId} - No direct application array found in detailed response either. Keys checked: ${potentialAppKeys.join(', ')}.`);
                if (packageDetails.applicationLinks && Array.isArray(packageDetails.applicationLinks) && packageDetails.applicationLinks.length > 0) {
                  console.log(`Package ${packageId} - Detailed response has applicationLinks:`, packageDetails.applicationLinks);
                  console.warn(`Package ${packageId} - Processing/fetching by applicationLinks is not implemented. Applications list will remain empty.`);
                } else if (packageDetails.applicationIds && Array.isArray(packageDetails.applicationIds) && packageDetails.applicationIds.length > 0) {
                  console.log(`Package ${packageId} - Detailed response has applicationIds:`, packageDetails.applicationIds);
                  console.warn(`Package ${packageId} - Processing/fetching by applicationIds is not implemented. Applications list will remain empty.`);
                }
              }
            } else {
               console.log(`Package ${packageId} - Already have applications from initial list, not re-checking detailed response for full application list.`);
            }
            
            const finalPackageData = {
              ...basicPackageInfo, 
              ...packageDetails,
              id: packageId,
              applications: applicationsList,
              applicationsInPackage: applicationsList,
            };
            console.log(`Package ${packageId} - Final merged data for state:`, JSON.stringify(finalPackageData, null, 2));
            return finalPackageData;

    } catch (error) {
            console.error(`Error fetching or processing details for package ${packageId}:`, error);
            return {
              ...basicPackageInfo,
              id: packageId,
              applications: (basicPackageInfo.applicationsInPackage && Array.isArray(basicPackageInfo.applicationsInPackage)) ? basicPackageInfo.applicationsInPackage : [],
              applicationsInPackage: (basicPackageInfo.applicationsInPackage && Array.isArray(basicPackageInfo.applicationsInPackage)) ? basicPackageInfo.applicationsInPackage : [],
              status: basicPackageInfo.status || 'ERROR_FETCHING_DETAILS',
              errorFetchingDetails: true
            };
          }
        })
      );

      const validProcessedPackages = processedPackages.filter(p => p && typeof p.id !== 'undefined' && p.id !== null);
      console.log('Final list of all processedPackages (to be set in state):', JSON.stringify(validProcessedPackages, null, 2));
      return validProcessedPackages;

    } catch (error) {
      console.error('Error in fetchPackages main try block (fetching user package list initial call):', error);
      setError('Ошибка загрузки списка пакетов: ' + (error.response?.data?.message || error.message));
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
      if (process.env.NODE_ENV === 'development') {
      console.log('Initializing Profile component...');
      }
      try {
        const [userDataRes, policiesRes, packagesRes, applicationsRes] = await Promise.all([
          api.get('/api/users/profile'),
          fetchPolicies(),
          fetchPackages(),
          fetchAllApplications()
        ]);

        if (process.env.NODE_ENV === 'development') {
          console.log('Profile data loaded successfully');
          if (packagesRes?.length > 0) {
            console.log(`Loaded ${packagesRes.length} packages`);
          }
        }

        setUserData(userDataRes.data);
        setPolicies(policiesRes);

        if (Array.isArray(packagesRes)) {
          const validPackages = packagesRes.filter(pkg => pkg && typeof pkg === 'object');
          setPackages(validPackages);
        } else {
          setPackages([]);
        }
        
        setApplications(applicationsRes);

        if (location.state?.success) {
          setSuccess(location.state.message || 'Операция выполнена успешно');
          setSnackbarMessage(location.state.message || 'Операция выполнена успешно');
          setSnackbarSeverity('success');
          
          if (location.state.packageId) {
            setFocusedPackageId(location.state.packageId);
            setTabValue(0);
          }
          
          navigate(location.pathname, { replace: true });
        }

      } catch (err) {
        console.error('Error initializing profile:', err);
        setError('Ошибка при загрузке данных профиля: ' + (err.message || 'Неизвестная ошибка'));
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [user, location.state?.shouldRefresh]);

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

  const handleContinuePackage = (packageId) => {
    navigate(`/packages/${packageId}/apply`);
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
              <PackagesView 
                packages={packages} 
                onPayPackage={handlePayPackage} 
                onCancelPackage={handleCancelPackage}
                onContinuePackage={handleContinuePackage}
                focusedPackageId={focusedPackageId}
              />
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