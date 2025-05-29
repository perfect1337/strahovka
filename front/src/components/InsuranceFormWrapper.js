import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Typography,
  Divider,
  Alert,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const InsuranceFormWrapper = ({ children, onSubmit }) => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');

  const handleFormSubmit = async (data) => {
    try {
      if (!user) {
        // Если пользователь не авторизован, добавляем email и генерируем пароль
        const userData = {
          ...data,
          email: email,
          password: email, // Пароль соответствует email
        };
        await onSubmit(userData);
      } else {
        await onSubmit(data);
      }
    } catch (err) {
      setError(err.message || 'Произошла ошибка при отправке формы');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!user && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Данные для регистрации
          </Typography>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2 }}
            helperText="Этот email будет использован для входа в личный кабинет"
          />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Пароль для входа будет автоматически создан на основе вашего email
          </Typography>
          <Divider sx={{ my: 2 }} />
        </Box>
      )}

      {React.cloneElement(children, {
        onSubmit: handleFormSubmit,
        isAuthenticated: !!user,
      })}
    </Paper>
  );
};

export default InsuranceFormWrapper; 