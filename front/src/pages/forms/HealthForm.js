import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Grid,
  Paper,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const formatDateForApi = (date) => {
  if (!date) return null;
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) { // Проверка на валидность даты
      return null; 
    }
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error formatting date:", date, error);
    return null; // или можно вернуть исходное значение или выбросить ошибку дальше
  }
};

const HealthForm = ({ onSubmit, initialData = {}, isPartOfPackage = false }) => {
  const { user, handleAuthenticationResponse } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || (user ? user.firstName : ''),
    lastName: initialData.lastName || (user ? user.lastName : ''),
    middleName: initialData.middleName || (user ? user.middleName : ''),
    birthDate: initialData.birthDate || null,
    gender: initialData.gender || '',
    passport: initialData.passport || '',
    snils: initialData.snils || '',
    address: initialData.address || '',
    phone: initialData.phone || (user ? user.phone : ''),
    email: initialData.email || (user ? user.email : ''),
    hasChronic: initialData.hasChronic || false,
    chronicDetails: initialData.chronicDetails || '',
    coverageAmount: initialData.coverageAmount || '1000000',
    startDate: initialData.startDate || null,
    endDate: initialData.endDate || null,
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
    setSuccessMessage('');
  };

  const handleDateChange = (field) => (date) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    console.log('[HealthForm] Form submission triggered. User authenticated:', !!user);

    const passportValue = formData.passport.trim().replace(/\s/g, '');
    const snilsValue = formData.snils.trim().replace(/[^\d]/g, '');
    
    if (!formData.firstName || !formData.lastName || !formData.birthDate || 
        !formData.gender || !passportValue || !snilsValue || 
        !formData.address || !formData.phone || !formData.email || 
        !formData.startDate || !formData.endDate) {
      setError('Пожалуйста, заполните все обязательные поля (ФИО, дата рождения, пол, паспорт, СНИЛС, адрес, телефон, email, даты страховки).');
      return;
    }
    if (formData.hasChronic && !formData.chronicDetails) {
      setError('Пожалуйста, укажите детали хронических заболеваний');
      return;
    }
    
    const formattedStartDate = formatDateForApi(formData.startDate);
    const formattedEndDate = formatDateForApi(formData.endDate);
    const formattedBirthDate = formatDateForApi(formData.birthDate);

    if (!formattedStartDate || !formattedEndDate || !formattedBirthDate) {
        setError('Пожалуйста, укажите корректные даты (дата рождения, начало и окончание страховки).');
        return;
    }

    if (new Date(formattedStartDate) >= new Date(formattedEndDate)) {
      setError('Дата начала должна быть раньше даты окончания');
      return;
    }
    
    if (!/^\d+$/.test(passportValue)) {
      setError('Неверный формат паспортных данных РФ. Ожидаются только цифры.');
      return;
    }
    if (!/^\d+$/.test(snilsValue)) {
      setError('Неверный формат СНИЛС. Ожидаются только цифры.');
      return;
    }

    if (onSubmit) {
      if (typeof onSubmit !== 'function') {
        setError('[HealthForm] Ошибка: onSubmit не является функцией для режима пакета.');
        return;
      }
      try {
        setIsSubmitting(true);
        await onSubmit({
          ...formData,
          passport: passportValue,
          snils: snilsValue,
          birthDate: formattedBirthDate,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        });
      } catch (error) {
        setError('Ошибка при обработке формы в составе пакета: ' + (error.message || 'Неизвестная ошибка'));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      let apiResponse;
      const commonPayloadFields = {
        birthDate: formattedBirthDate,
        gender: formData.gender,
        passportNumber: passportValue,
        snils: snilsValue,
        address: formData.address,
        hasChronicDiseases: formData.hasChronic,
        chronicDiseasesDetails: formData.hasChronic ? formData.chronicDetails : null,
        coverageAmount: formData.coverageAmount,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      };
      Object.keys(commonPayloadFields).forEach(key => (commonPayloadFields[key] == null || commonPayloadFields[key] === '') && delete commonPayloadFields[key]);

      if (!user) {
        console.log('[HealthForm] Unauthenticated user. Preparing payload for /unauthorized/health');
        const unauthorizedPayload = {
          ...commonPayloadFields,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleName: formData.middleName || null,
          phone: formData.phone,
        };
        Object.keys(unauthorizedPayload).forEach(key => (unauthorizedPayload[key] == null || unauthorizedPayload[key] === '') && delete unauthorizedPayload[key]);
        console.log('[HealthForm] Submitting to /unauthorized/health. Payload:', unauthorizedPayload);
        apiResponse = await api.post('/api/insurance/unauthorized/health', unauthorizedPayload);

        if (apiResponse.data && apiResponse.data.accessToken && apiResponse.data.user) {
          await handleAuthenticationResponse(apiResponse.data);
          setSuccessMessage('Заявка успешно создана! Вы были автоматически зарегистрированы.');
          navigate('/applications/success', {
            state: {
              applicationId: apiResponse.data.id,
              calculatedAmount: apiResponse.data.calculatedAmount,
              message: 'Заявка успешно создана! Вы зарегистрированы и вошли в систему. Ваш пароль совпадает с email.',
              type: 'HEALTH',
              isNewUser: true,
              email: apiResponse.data.email,
              password: apiResponse.data.email
            }
          });
        } else {
          throw new Error("Ответ от сервера не содержит всех необходимых данных для авторизации (токен или пользователь).");
        }
      } else {
        console.log('[HealthForm] Authenticated user. Submitting to /applications/health. Payload:', commonPayloadFields);
        apiResponse = await api.post('/api/insurance/applications/health', commonPayloadFields);
        setSuccessMessage('Ваша заявка на страхование здоровья успешно отправлена!');
        navigate('/applications/success', {
          state: {
            applicationId: apiResponse.data.id,
            calculatedAmount: apiResponse.data.calculatedAmount,
            message: 'Заявка на страхование здоровья успешно создана.',
            type: 'HEALTH'
          }
        });
      }
      console.log('[HealthForm] Submission successful:', apiResponse.data);
    } catch (err) {
      console.error('[HealthForm] Autonomous submission error:', err.response?.data || err.message || err);
      setError('Ошибка при отправке заявки: ' + (err.response?.data?.message || err.response?.data?.error || err.message || 'Неизвестная ошибка сервера'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={isPartOfPackage ? 0 : 3} sx={{ p: 3 }}>
      {!isPartOfPackage && (
        <Typography variant="h5" gutterBottom>
          Страхование здоровья {!user && "(Требуется указать Email для регистрации)"}
        </Typography>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {successMessage && !isPartOfPackage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Фамилия"
              value={formData.lastName}
              onChange={handleChange('lastName')}
              required
              disabled={isSubmitting || (!!user && !!user.lastName && !initialData.lastName)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Имя"
              value={formData.firstName}
              onChange={handleChange('firstName')}
              required
              disabled={isSubmitting || (!!user && !!user.firstName && !initialData.firstName)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Отчество"
              value={formData.middleName}
              onChange={handleChange('middleName')}
              disabled={isSubmitting || (!!user && !!user.middleName && !initialData.middleName)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <DatePicker
              label="Дата рождения"
              value={formData.birthDate ? new Date(formData.birthDate) : null}
              onChange={handleDateChange('birthDate')}
              slotProps={{ textField: { fullWidth: true, required: true, disabled: isSubmitting } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required disabled={isSubmitting}>
              <InputLabel>Пол</InputLabel>
              <Select
                value={formData.gender}
                onChange={handleChange('gender')}
                label="Пол"
              >
                <MenuItem value="MALE">Мужской</MenuItem>
                <MenuItem value="FEMALE">Женский</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Серия и номер паспорта РФ"
              value={formData.passport}
              onChange={handleChange('passport')}
              required
              helperText="Введите 10 цифр (серия и номер)"
              disabled={isSubmitting}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="СНИЛС"
              value={formData.snils}
              onChange={handleChange('snils')}
              required
              helperText="Введите 11 цифр (например, XXX-XXX-XXX XX)"
              disabled={isSubmitting}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              required
              disabled={isSubmitting || (!!user && !!user.email && !initialData.email)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Телефон"
              value={formData.phone}
              onChange={handleChange('phone')}
              required
              disabled={isSubmitting || (!!user && !!user.phone && !initialData.phone)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Адрес регистрации"
              value={formData.address}
              onChange={handleChange('address')}
              required
              disabled={isSubmitting}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.hasChronic}
                  onChange={handleChange('hasChronic')}
                  disabled={isSubmitting}
                />
              }
              label="Есть хронические заболевания"
            />
          </Grid>

          {formData.hasChronic && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Опишите хронические заболевания"
                multiline
                rows={3}
                value={formData.chronicDetails}
                onChange={handleChange('chronicDetails')}
                required={formData.hasChronic}
                disabled={isSubmitting}
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <FormControl fullWidth required disabled={isSubmitting}>
              <InputLabel>Сумма покрытия</InputLabel>
              <Select
                value={formData.coverageAmount}
                onChange={handleChange('coverageAmount')}
                label="Сумма покрытия"
              >
                <MenuItem value="500000">500 000 ₽</MenuItem>
                <MenuItem value="1000000">1 000 000 ₽</MenuItem>
                <MenuItem value="2000000">2 000 000 ₽</MenuItem>
                <MenuItem value="3000000">3 000 000 ₽</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <DatePicker
              label="Дата начала"
              value={formData.startDate ? new Date(formData.startDate) : null}
              onChange={handleDateChange('startDate')}
              slotProps={{ textField: { fullWidth: true, required: true, disabled: isSubmitting } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <DatePicker
              label="Дата окончания"
              value={formData.endDate ? new Date(formData.endDate) : null}
              onChange={handleDateChange('endDate')}
              slotProps={{ textField: { fullWidth: true, required: true, disabled: isSubmitting } }}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Отправка...' : (isPartOfPackage ? 'Далее' : 'Оформить полис')}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

HealthForm.propTypes = {
  onSubmit: PropTypes.func,
  initialData: PropTypes.object,
  isPartOfPackage: PropTypes.bool
};

export default HealthForm; 