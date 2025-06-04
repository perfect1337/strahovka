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

const HealthForm = ({ onSubmit, initialData = {}, isPartOfPackage = false }) => {
  const { user } = useAuth();
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
    console.log('[HealthForm] Form submission triggered');
    console.log('[HealthForm] Initial Form data for submission:', JSON.parse(JSON.stringify(formData)));

    const passportValue = formData.passport.trim().replace(/\s/g, '');
    const snilsValue = formData.snils.trim().replace(/[^\d]/g, '');
    
    // Валидация
    if (!formData.firstName || !formData.lastName || !formData.birthDate || 
        !formData.gender || !passportValue || !snilsValue ||
        !formData.address || !formData.phone || !formData.email || 
        !formData.startDate || !formData.endDate) {
      setError('Пожалуйста, заполните все обязательные поля, включая СНИЛС.');
      return;
    }
    if (formData.hasChronic && !formData.chronicDetails) {
      setError('Пожалуйста, укажите детали хронических заболеваний');
      return;
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError('Дата начала должна быть раньше даты окончания');
      return;
    }
    if (!/^\d{10}$/.test(passportValue)) {
      setError('Неверный формат паспортных данных. Ожидается 10 цифр (серия и номер).');
      return;
    }
    if (!/^\d{11}$/.test(snilsValue)) {
      setError('Неверный формат СНИЛС. Ожидается 11 цифр (например, XXX-XXX-XXX XX).');
      return;
    }

    console.log('[HealthForm] Form data AFTER validation:', JSON.parse(JSON.stringify(formData)));
    console.log('[HealthForm] Cleaned SNILS for submission:', snilsValue);

    if (!onSubmit) {
      if (isPartOfPackage) {
        const errMessage = '[HealthForm] Ошибка: onSubmit не определена, но форма часть пакета.';
        console.error(errMessage, { isPartOfPackage, onSubmit });
        setError(errMessage);
        return;
      }

      console.log('[HealthForm] Автономный режим: попытка отправки.');
      setIsSubmitting(true);
      try {
        const payload = {
          birthDate: formData.birthDate,
          gender: formData.gender,
          passportNumber: passportValue,
          snils: snilsValue,
          address: formData.address,
          hasChronicDiseases: formData.hasChronic,
          chronicDiseasesDetails: formData.hasChronic ? formData.chronicDetails : null,
          coverageAmount: formData.coverageAmount,
          startDate: formData.startDate,
          endDate: formData.endDate,
        };

        Object.keys(payload).forEach(key => (payload[key] == null) && delete payload[key]);
        console.log('[HealthForm] Autonomous submission payload:', payload);

        const apiResponse = await api.post('/api/insurance/applications/health', payload);
        console.log('[HealthForm] Autonomous submission successful:', apiResponse.data);
        setSuccessMessage('Ваша заявка на страхование здоровья успешно отправлена!');
        
        navigate('/applications/success', { 
          state: { 
            applicationId: apiResponse.data.id, 
            calculatedAmount: apiResponse.data.calculatedAmount, 
            message: 'Заявка на страхование здоровья успешно создана.',
            type: 'HEALTH'
          } 
        });
      } catch (err) {
        console.error('[HealthForm] Autonomous submission error:', err);
        setError('Ошибка при отправке заявки: ' + (err.response?.data?.message || err.message || 'Неизвестная ошибка сервера'));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (typeof onSubmit !== 'function') {
      const errMessage = '[HealthForm] Ошибка: onSubmit не является функцией.';
      console.error(errMessage, { typeofOnSubmit: typeof onSubmit });
      setError(errMessage);
      return;
    }

    try {
      console.log('[HealthForm] Calling provided onSubmit with data...');
      setIsSubmitting(true);
      await onSubmit({
        ...formData,
        passport: passportValue,
        snils: snilsValue
      });
    } catch (error) {
      console.error('[HealthForm] Error calling provided onSubmit:', error);
      setError('Произошла ошибка при обработке формы: ' + (error.message || 'Неизвестная ошибка'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={isPartOfPackage ? 0 : 3} sx={{ p: 3 }}>
      {!isPartOfPackage && (
        <Typography variant="h5" gutterBottom>
          Страхование здоровья
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
              disabled={isSubmitting}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Имя"
              value={formData.firstName}
              onChange={handleChange('firstName')}
              required
              disabled={isSubmitting}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Отчество"
              value={formData.middleName}
              onChange={handleChange('middleName')}
              disabled={isSubmitting}
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
              label="Серия и номер паспорта"
              value={formData.passport}
              onChange={handleChange('passport')}
              required
              helperText="Введите 10 цифр: серия и номер"
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
              helperText="Введите 11 цифр (например, XXX-XXX-XXX YY)"
              disabled={isSubmitting}
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

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Телефон"
              value={formData.phone}
              onChange={handleChange('phone')}
              required
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