import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Box, Container, Paper, Alert } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
      setError(err.message || 'Ошибка входа. Пожалуйста, попробуйте снова.');
    } finally {
      setIsSubmitting(false);
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
          
          <Box mt={2} textAlign="center">
            <Typography variant="body2">
              <Link to="/debug" style={{ textDecoration: 'none' }}>
                Диагностика авторизации
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login; 