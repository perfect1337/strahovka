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

const Profile = () => {
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [error, setError] = useState('');
  const [renewalPolicy, setRenewalPolicy] = useState(null);
  const [renewalDuration, setRenewalDuration] = useState(1);
  const [openRenewalDialog, setOpenRenewalDialog] = useState(false);
  const [renewalSuccess, setRenewalSuccess] = useState(false);
  const [renewalError, setRenewalError] = useState('');
  const [isRenewing, setIsRenewing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [activePolicies, setActivePolicies] = useState([]);
  const [completedPolicies, setCompletedPolicies] = useState([]);
  const [activeClaims, setActiveClaims] = useState([]);
  const [completedClaims, setCompletedClaims] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [policiesResponse, claimsResponse] = await Promise.all([
          api.get('/insurance/policies/user'),
          api.get('/insurance/claims/user')
        ]);
        setPolicies(policiesResponse.data);
        setClaims(claimsResponse.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Ошибка при загрузке данных');
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  useEffect(() => {
    fetchPolicies();
    fetchClaims();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await api.get('/insurance/policies/user');
      setActivePolicies(response.data.filter(policy => policy.status === 'ACTIVE'));
      setCompletedPolicies(response.data.filter(policy => policy.status === 'COMPLETED'));
    } catch (error) {
      console.error('Error fetching policies:', error);
    }
  };

  const fetchClaims = async () => {
    try {
      const response = await api.get('/insurance/claims/user');
      setActiveClaims(response.data.filter(claim => 
        ['PENDING', 'IN_PROGRESS', 'NEED_INFO'].includes(claim.status)
      ));
      setCompletedClaims(response.data.filter(claim => 
        ['APPROVED', 'REJECTED'].includes(claim.status)
      ));
    } catch (error) {
      console.error('Error fetching claims:', error);
    }
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  const handleOpenRenewalDialog = (policy) => {
    setRenewalPolicy(policy);
    setRenewalDuration(1);
    setRenewalError('');
    setOpenRenewalDialog(true);
  };

  const handleCloseRenewalDialog = () => {
    setOpenRenewalDialog(false);
    setRenewalPolicy(null);
  };

  const handleRenewalDurationChange = (event) => {
    setRenewalDuration(event.target.value);
  };

  const handleRenewPolicy = async () => {
    if (!renewalPolicy) return;
    
    setIsRenewing(true);
    setRenewalError('');
    
    try {
      await api.post(`/insurance/policies/${renewalPolicy.id}/renew`, null, {
        params: {
          durationInYears: renewalDuration
        }
      });
      
      // Update the policies list with the renewed policy
      const updatedPolicies = await api.get(`/insurance/policies`);
      setPolicies(updatedPolicies.data);
      
      setRenewalSuccess(true);
      handleCloseRenewalDialog();
    } catch (error) {
      console.error('Error renewing policy:', error);
      setRenewalError('Ошибка при продлении полиса. Пожалуйста, попробуйте позже.');
    } finally {
      setIsRenewing(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleTerminateClick = (policy) => {
    setSelectedPolicy(policy);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPolicy(null);
  };

  const handleTerminateConfirm = async () => {
    try {
      await api.post(`/insurance/policies/${selectedPolicy.id}/terminate`);
      fetchPolicies();
      handleCloseDialog();
    } catch (error) {
      console.error('Error terminating policy:', error);
    }
  };

  const renderUserInfo = () => (
    <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'primary.main',
              fontSize: '2rem',
              mr: 2
            }}
          >
            {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h5" gutterBottom>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body1" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
            <Chip
              label={user?.level || 'BRONZE'}
              color="primary"
              variant="outlined"
              size="small"
            />
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<SecurityIcon />}
          onClick={handleChangePassword}
          sx={{ mt: 2 }}
        >
          Сменить пароль
        </Button>
      </CardContent>
    </Card>
  );

  const renderPoliciesTab = () => (
    <Box sx={{ mt: 3 }}>
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <AssignmentIcon sx={{ mr: 1 }} />
          Активные полисы
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Тип</TableCell>
                <TableCell>Дата начала</TableCell>
                <TableCell>Дата окончания</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activePolicies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell>{policy.id}</TableCell>
                  <TableCell>
                    <Chip
                      label={policy.type}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{new Date(policy.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(policy.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleTerminateClick(policy)}
                      sx={{ borderRadius: 2 }}
                    >
                      Прервать
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <AssignmentIcon sx={{ mr: 1 }} />
          Завершенные полисы
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Тип</TableCell>
                <TableCell>Дата начала</TableCell>
                <TableCell>Дата окончания</TableCell>
                <TableCell>Статус</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {completedPolicies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell>{policy.id}</TableCell>
                  <TableCell>
                    <Chip
                      label={policy.type}
                      size="small"
                      color="default"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{new Date(policy.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(policy.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={policy.status}
                      size="small"
                      color={policy.status === 'COMPLETED' ? 'success' : 'default'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );

  const renderClaimsTab = () => (
    <Box sx={{ mt: 3 }}>
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <ClaimIcon sx={{ mr: 1 }} />
          Активные страховые случаи
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Дата создания</TableCell>
                <TableCell>Тип страховки</TableCell>
                <TableCell>Описание</TableCell>
                <TableCell>Статус</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeClaims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell>{claim.id}</TableCell>
                  <TableCell>{new Date(claim.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={claim.insuranceType}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{claim.description}</TableCell>
                  <TableCell>
                    <Chip
                      label={claim.status}
                      size="small"
                      color={
                        claim.status === 'IN_PROGRESS' ? 'warning' :
                        claim.status === 'NEED_INFO' ? 'info' : 'default'
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <ClaimIcon sx={{ mr: 1 }} />
          Завершенные страховые случаи
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Дата создания</TableCell>
                <TableCell>Тип страховки</TableCell>
                <TableCell>Описание</TableCell>
                <TableCell>Статус</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {completedClaims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell>{claim.id}</TableCell>
                  <TableCell>{new Date(claim.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={claim.insuranceType}
                      size="small"
                      color="default"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{claim.description}</TableCell>
                  <TableCell>
                    <Chip
                      label={claim.status}
                      size="small"
                      color={
                        claim.status === 'APPROVED' ? 'success' :
                        claim.status === 'REJECTED' ? 'error' : 'default'
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {renderUserInfo()}

      <Paper sx={{ borderRadius: 2, boxShadow: 3, mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 64,
            }
          }}
        >
          <Tab
            label="Мои полисы"
            icon={<AssignmentIcon />}
            iconPosition="start"
          />
          <Tab
            label="Страховые случаи"
            icon={<ClaimIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {tabValue === 0 ? renderPoliciesTab() : renderClaimsTab()}

      <Dialog open={openRenewalDialog} onClose={handleCloseRenewalDialog}>
        <DialogTitle>Продление полиса</DialogTitle>
        <DialogContent>
          {renewalError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {renewalError}
            </Alert>
          )}
          <Typography variant="body1" gutterBottom>
            Полис: {renewalPolicy?.category?.name}
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Действует до: {renewalPolicy ? new Date(renewalPolicy.endDate).toLocaleDateString() : ''}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Срок продления</InputLabel>
              <Select
                value={renewalDuration}
                onChange={handleRenewalDurationChange}
                label="Срок продления"
              >
                <MenuItem value={1}>1 год</MenuItem>
                <MenuItem value={2}>2 года</MenuItem>
                <MenuItem value={3}>3 года</MenuItem>
                <MenuItem value={5}>5 лет</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRenewalDialog}>Отмена</Button>
          <Button 
            onClick={handleRenewPolicy} 
            color="primary" 
            variant="contained" 
            disabled={isRenewing}
          >
            {isRenewing ? 'Обработка...' : 'Продлить'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Уведомление об успешном продлении */}
      <Snackbar
        open={renewalSuccess}
        autoHideDuration={6000}
        onClose={() => setRenewalSuccess(false)}
        message="Полис успешно продлен!"
      />

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Подтверждение прерывания</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите прервать действие этого полиса? Это действие нельзя отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleTerminateConfirm} color="error" variant="contained">
            Прервать
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile; 