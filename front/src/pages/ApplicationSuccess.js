import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  Divider,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useAuth } from '../context/AuthContext';

const ApplicationSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { applicationId, calculatedAmount, isNewUser, email, password } = location.state || {};

  const handleLogin = async () => {
    if (isNewUser && email && password) {
      try {
        // Сначала сохраняем токены из ответа сервера
        if (location.state?.accessToken && location.state?.refreshToken) {
          localStorage.setItem('token', location.state.accessToken);
          localStorage.setItem('refreshToken', location.state.refreshToken);
          navigate('/profile');
        } else {
          // Если токенов нет, пытаемся залогиниться
          await login(email, password);
          navigate('/profile');
        }
      } catch (error) {
        console.error('Error logging in:', error);
      }
    } else {
      navigate('/profile');
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4, textAlign: 'center' }}>
        <CheckCircleOutlineIcon
          color="success"
          sx={{ fontSize: 64, mb: 2 }}
        />
        
        <Typography variant="h4" gutterBottom>
          Заявка успешно отправлена!
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Номер вашей заявки: {applicationId}
        </Typography>

        {calculatedAmount && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Расчет стоимости полиса
            </Typography>
            <Typography variant="h4" color="primary" gutterBottom>
              {Number(calculatedAmount).toLocaleString('ru-RU')} ₽
            </Typography>
          </>
        )}

        {isNewUser && (
          <>
          <Alert severity="success" sx={{ mt: 2, mb: 3 }}>
              Для вас был создан личный кабинет. Используйте следующие данные для входа:
              <Box component="div" sx={{ mt: 1, textAlign: 'left' }}>
                <Typography variant="body2">Логин: {email}</Typography>
                <Typography variant="body2">Пароль: {email}</Typography>
              </Box>
          </Alert>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Рекомендуем сменить пароль после первого входа в личный кабинет.
            </Typography>
          </>
        )}

        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogin}
            sx={{ mr: 2 }}
          >
            {isNewUser ? 'Войти в личный кабинет' : 'Перейти в личный кабинет'}
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
          >
            На главную
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ApplicationSuccess; 