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
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [policiesResponse, claimsResponse] = await Promise.all([
          api.get(`/api/insurance/policies`),
          api.get(`/api/insurance/claims`)
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
      await api.post(`/api/insurance/policies/${renewalPolicy.id}/renew`, null, {
        params: {
          durationInYears: renewalDuration
        }
      });
      
      // Update the policies list with the renewed policy
      const updatedPolicies = await api.get(`/api/insurance/policies`);
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        {/* Информация о пользователе */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Профиль пользователя
            </Typography>
            <Typography variant="body1" paragraph>
              Имя: {user?.name}
            </Typography>
            <Typography variant="body1" paragraph>
              Email: {user?.email}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleChangePassword}
            >
              Сменить пароль
            </Button>
          </Paper>
        </Grid>

        {/* Активные полисы */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Активные страховые полисы
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <List>
              {policies.map((policy) => (
                <React.Fragment key={policy.id}>
                  <ListItem
                    secondaryAction={
                      <Button 
                        variant="outlined" 
                        color="primary"
                        onClick={() => handleOpenRenewalDialog(policy)}
                      >
                        Продлить
                      </Button>
                    }
                  >
                    <ListItemText
                      primary={policy.category.name}
                      secondary={`Статус: ${policy.status}, Действует до: ${new Date(policy.endDate).toLocaleDateString()}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
              {policies.length === 0 && (
                <Typography variant="body1" color="textSecondary">
                  У вас пока нет активных страховых полисов
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Заявки на страховые случаи */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Заявки на страховые случаи
            </Typography>
            <List>
              {claims.map((claim) => (
                <React.Fragment key={claim.id}>
                  <ListItem>
                    <ListItemText
                      primary={`Полис: ${claim.policy.category.name}`}
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            Статус: {claim.status}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2">
                            Дата: {new Date(claim.claimDate).toLocaleDateString()}
                          </Typography>
                          {claim.adminResponse && (
                            <>
                              <br />
                              <Typography component="span" variant="body2">
                                Ответ: {claim.adminResponse}
                              </Typography>
                            </>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
              {claims.length === 0 && (
                <Typography variant="body1" color="textSecondary">
                  У вас пока нет заявок на страховые случаи
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Диалог продления полиса */}
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
    </Container>
  );
};

export default Profile; 