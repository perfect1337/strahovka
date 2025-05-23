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
import api from '../api';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Assignment as AssignmentIcon,
  LocalHospital as ClaimIcon,
} from '@mui/icons-material';
import { formatDate } from '../utils/dateUtils';

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'IN_REVIEW':
        return 'info';
      default:
        return 'default';
    }
  };

  const renderApplicationsTable = (applications, type) => {
    const getSpecificFields = (app) => {
      switch (type) {
        case 'kasko':
          return (
            <>
              <TableCell>{app.carMake} {app.carModel}</TableCell>
              <TableCell>{app.vinNumber}</TableCell>
            </>
          );
        case 'osago':
          return (
            <>
              <TableCell>{app.carMake} {app.carModel}</TableCell>
              <TableCell>{app.licensePlate}</TableCell>
            </>
          );
        case 'travel':
          return (
            <>
              <TableCell>{app.destinationCountry}</TableCell>
              <TableCell>{formatDate(app.travelStartDate)} - {formatDate(app.travelEndDate)}</TableCell>
            </>
          );
        case 'health':
          return (
            <>
              <TableCell>{app.snils}</TableCell>
              <TableCell>{app.preferredClinic || 'Не указана'}</TableCell>
            </>
          );
        case 'property':
          return (
            <>
              <TableCell>{app.propertyType}</TableCell>
              <TableCell>{app.address}</TableCell>
            </>
          );
        default:
          return null;
      }
    };

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Дата подачи</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Сумма</TableCell>
              {type === 'kasko' && (
                <>
                  <TableCell>Автомобиль</TableCell>
                  <TableCell>VIN</TableCell>
                </>
              )}
              {type === 'osago' && (
                <>
                  <TableCell>Автомобиль</TableCell>
                  <TableCell>Гос. номер</TableCell>
                </>
              )}
              {type === 'travel' && (
                <>
                  <TableCell>Страна</TableCell>
                  <TableCell>Период поездки</TableCell>
                </>
              )}
              {type === 'health' && (
                <>
                  <TableCell>СНИЛС</TableCell>
                  <TableCell>Клиника</TableCell>
                </>
              )}
              {type === 'property' && (
                <>
                  <TableCell>Тип недвижимости</TableCell>
                  <TableCell>Адрес</TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app.id}>
                <TableCell>{formatDate(app.applicationDate)}</TableCell>
                <TableCell>
                  <Chip
                    label={app.status}
                    color={getStatusColor(app.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {app.calculatedAmount 
                    ? `${app.calculatedAmount} ₽`
                    : 'Ожидает расчета'}
                </TableCell>
                {getSpecificFields(app)}
              </TableRow>
            ))}
            {applications.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Нет заявок
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (!userData) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Профиль пользователя
        </Typography>
        <Typography>Email: {userData.email}</Typography>
        <Typography>Имя: {userData.firstName}</Typography>
        <Typography>Фамилия: {userData.lastName}</Typography>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Активные полисы" />
          <Tab label="КАСКО" />
          <Tab label="ОСАГО" />
          <Tab label="Путешествия" />
          <Tab label="Здоровье" />
          <Tab label="Недвижимость" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Тип страхования</TableCell>
                <TableCell>Дата начала</TableCell>
                <TableCell>Дата окончания</TableCell>
                <TableCell>Статус</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell>{policy.name}</TableCell>
                  <TableCell>{formatDate(policy.startDate)}</TableCell>
                  <TableCell>{formatDate(policy.endDate)}</TableCell>
                  <TableCell>
                    <Chip
                      label={policy.status}
                      color={policy.status === 'ACTIVE' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
              {policies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Нет активных полисов
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {tabValue === 1 && renderApplicationsTable(applications.kasko, 'kasko')}
      {tabValue === 2 && renderApplicationsTable(applications.osago, 'osago')}
      {tabValue === 3 && renderApplicationsTable(applications.travel, 'travel')}
      {tabValue === 4 && renderApplicationsTable(applications.health, 'health')}
      {tabValue === 5 && renderApplicationsTable(applications.property, 'property')}
    </Container>
  );
};

export default Profile; 