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
  const [error, setError] = useState('');

  const handleFormSubmit = async (formDataFromKasko) => {
    try {
      if (!user) {
        const dataForApi = {};
        const trimmedEmail = email.trim();

        // 1. Копируем все поля, специфичные для страхования, из formDataFromKasko
        dataForApi.carMake = formDataFromKasko.carMake;
        dataForApi.carModel = formDataFromKasko.carModel;
        dataForApi.carYear = formDataFromKasko.carYear;
        dataForApi.vinNumber = formDataFromKasko.vinNumber;
        dataForApi.licensePlate = formDataFromKasko.licensePlate;
        dataForApi.carValue = formDataFromKasko.carValue;
        dataForApi.driverLicenseNumber = formDataFromKasko.driverLicenseNumber;
        dataForApi.driverExperienceYears = formDataFromKasko.driverExperienceYears;
        dataForApi.hasAntiTheftSystem = formDataFromKasko.hasAntiTheftSystem;
        dataForApi.garageParking = formDataFromKasko.garageParking;
        dataForApi.previousInsuranceNumber = formDataFromKasko.previousInsuranceNumber;
        dataForApi.duration = formDataFromKasko.duration;
        // Другие поля, которые KaskoFormContent может отправлять как часть деталей страхования

        // 2. Добавляем/перезаписываем email и password
        dataForApi.email = trimmedEmail;
        dataForApi.password = trimmedEmail;

        // 3. Преобразуем поля owner в поля пользователя
        dataForApi.firstName = formDataFromKasko.ownerFirstName ? formDataFromKasko.ownerFirstName.trim() : '';
        dataForApi.lastName = formDataFromKasko.ownerLastName ? formDataFromKasko.ownerLastName.trim() : '';
        dataForApi.middleName = formDataFromKasko.ownerMiddleName ? formDataFromKasko.ownerMiddleName.trim() : '';
        
        // Детальное логирование
        console.log('[InsuranceFormWrapper] Received formDataFromKasko:', JSON.stringify(formDataFromKasko));
        console.log('[InsuranceFormWrapper] Email for registration:', trimmedEmail);
        console.log('[InsuranceFormWrapper] Constructed dataForApi before sending:', JSON.stringify(dataForApi));

        await onSubmit(dataForApi);
      } else {
        // Для аутентифицированных пользователей передаем formDataFromKasko как есть
        console.log('[InsuranceFormWrapper] Authenticated user, sending formDataFromKasko as is:', JSON.stringify(formDataFromKasko));
        await onSubmit(formDataFromKasko);
      }
    } catch (err) {
      setError(err.message || 'Произошла ошибка при отправке формы');
      // Логируем ошибку вместе с данными, которые пытались отправить
      console.error('[InsuranceFormWrapper] Error during form submission:', err, 'Data attempted:', JSON.stringify(err.config?.data));
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
        isAuthenticated: !!user
        // parentEmail больше не передается, т.к. email обрабатывается здесь
      })}
    </Paper>
  );
};

export default InsuranceFormWrapper; 