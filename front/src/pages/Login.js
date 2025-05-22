import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Box, Container, Paper, Alert, Divider, CircularProgress } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugResult, setDebugResult] = useState(null);
  const [debugLoading, setDebugLoading] = useState(false);
  
  const navigate = useNavigate();
  const { user, login } = useAuth();
  
  // If user is already logged in, redirect to profile
  useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Пожалуйста, заполните все поля.');
      return;
    }
    
    try {
      setError('');
      setIsSubmitting(true);
      
      // Log auth state before login
      console.log('Auth state before login:', {
        hasToken: !!localStorage.getItem('token'),
        hasUser: !!localStorage.getItem('user')
      });
      
      const success = await login(email, password);
      
      if (success) {
        // Log auth state after login
        console.log('Auth state after login:', {
          hasToken: !!localStorage.getItem('token'),
          hasUser: !!localStorage.getItem('user')
        });
        
        console.log('Login successful, redirecting to profile');
        navigate('/profile');
      } else {
        setError('Ошибка входа. Пожалуйста, попробуйте снова.');
      }
    } catch (err) {
      console.error('Login error:', err);
      // Use the enhanced error message provided by AuthContext
      setError(err.message || 'Ошибка входа. Пожалуйста, попробуйте снова.');
      
      // Log the original error details for debugging
      if (err.originalError) {
        console.error('Original error:', err.originalError);
        console.error('Response:', err.originalError.response?.data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const createTestUser = async () => {
    try {
      setDebugLoading(true);
      const response = await api.post('/api/auth/create-test-user');
      setDebugResult(response.data);
      setEmail('test@example.com');
      setPassword('password123');
    } catch (error) {
      console.error('Error creating test user:', error);
      setDebugResult({ error: 'Failed to create test user' });
    } finally {
      setDebugLoading(false);
    }
  };

  const debugLogin = async () => {
    try {
      setDebugLoading(true);
      const response = await api.post('/api/auth/debug-login', { 
        email, 
        password 
      });
      setDebugResult(response.data);
    } catch (error) {
      console.error('Debug login error:', error);
      setDebugResult({ 
        error: 'Debug API call failed',
        message: error.message,
        status: error.response?.status
      });
    } finally {
      setDebugLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Вход в систему
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Пароль"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Входим...' : 'Войти'}
          </Button>
          
          <Box mt={2} textAlign="center">
            <Typography variant="body2">
              Нет аккаунта?{' '}
              <Link to="/register" style={{ textDecoration: 'none' }}>
                Зарегистрироваться
              </Link>
            </Typography>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" align="center" gutterBottom>
            Диагностика
          </Typography>
          
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={createTestUser}
              disabled={debugLoading}
            >
              Создать тестового пользователя
            </Button>
            
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={debugLogin}
              disabled={debugLoading || !email || !password}
            >
              Проверить данные
            </Button>
          </Box>
          
          {debugLoading && (
            <Box display="flex" justifyContent="center" mt={2}>
              <CircularProgress size={24} />
            </Box>
          )}
          
          {debugResult && (
            <Box mt={2} p={2} bgcolor="#f5f5f5" borderRadius={1}>
              <Typography variant="subtitle2" gutterBottom>
                Результат диагностики:
              </Typography>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}>
                {JSON.stringify(debugResult, null, 2)}
              </pre>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Login; 