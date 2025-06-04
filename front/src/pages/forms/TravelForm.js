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
  FormGroup,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const formatDateForApi = (date) => {
  if (!date) return null;
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) { 
      return null; 
    }
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error formatting date:", date, error);
    return null;
  }
};

const TravelForm = ({ onSubmit, initialData = {}, isPartOfPackage = false }) => {
  const { user, handleAuthenticationResponse } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || (user ? user.firstName : ''),
    lastName: initialData.lastName || (user ? user.lastName : ''),
    middleName: initialData.middleName || (user ? user.middleName : ''),
    birthDate: initialData.birthDate || null,
    email: initialData.email || (user ? user.email : ''),
    phone: initialData.phone || (user ? user.phone : ''),
    passport: initialData.passport || '',
    internationalPassport: initialData.internationalPassport || '',
    passportExpiry: initialData.passportExpiry || null,
    countries: initialData.countries || [],
    startDate: initialData.startDate || null,
    endDate: initialData.endDate || null,
    purpose: initialData.purpose || 'TOURISM',
    coverageAmount: initialData.coverageAmount || '30000',
    hasChronic: initialData.hasChronic || false,
    chronicDetails: initialData.chronicDetails || '',
    needsSports: initialData.needsSports || false,
    sportsType: initialData.sportsType || '',
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
    console.log('[TravelForm] Form submission triggered. User authenticated:', !!user);
    
    if (!formData.firstName || !formData.lastName || !formData.birthDate ||
        !formData.internationalPassport || !formData.passportExpiry ||
        !formData.phone || !formData.email ||
        !formData.startDate || !formData.endDate || !formData.countries.length ||
        !formData.coverageAmount || !formData.purpose) {
      setError('Пожалуйста, заполните все обязательные поля.');
      return;
    }

    const formattedStartDate = formatDateForApi(formData.startDate);
    const formattedEndDate = formatDateForApi(formData.endDate);
    const formattedPassportExpiry = formatDateForApi(formData.passportExpiry);
    const formattedBirthDate = formatDateForApi(formData.birthDate);

    if (!formattedBirthDate || !formattedPassportExpiry || !formattedStartDate || !formattedEndDate) {
        setError('Пожалуйста, укажите корректные даты (дата рождения, срок действия паспорта, начало и окончание поездки).');
        return;
    }

    if (new Date(formattedStartDate) >= new Date(formattedEndDate)) {
      setError('Дата начала должна быть раньше даты окончания');
      return;
    }
    if (formData.hasChronic && !formData.chronicDetails) {
      setError('Пожалуйста, укажите детали хронических заболеваний');
      return;
    }
    if (formData.needsSports && !formData.sportsType) {
      setError('Пожалуйста, укажите вид спорта');
      return;
    }

    console.log('[TravelForm] Form data AFTER basic validation and date formatting.');

    if (onSubmit) {
      if (typeof onSubmit !== 'function') {
        const errMessage = 'Ошибка: onSubmit не является функцией.';
        console.error('[TravelForm]', errMessage, { typeofOnSubmit: typeof onSubmit });
        setError(errMessage);
        return;
      }
      try {
        console.log('[TravelForm] Calling provided onSubmit (package mode) with data...');
        setIsSubmitting(true);
        await onSubmit({
          ...formData,
          birthDate: formattedBirthDate,
          passportExpiry: formattedPassportExpiry,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        });
      } catch (error) {
        console.error('[TravelForm] Error calling provided onSubmit (package mode):', error);
        setError('Произошла ошибка при обработке формы в составе пакета: ' + (error.message || 'Неизвестная ошибка'));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      let apiResponse;
      const basePayload = {
        passportNumber: formData.internationalPassport,
        passportExpiry: formattedPassportExpiry,
        destinationCountry: formData.countries.length > 0 ? formData.countries[0] : null,
        travelStartDate: formattedStartDate,
        travelEndDate: formattedEndDate,
        purposeOfTrip: formData.purpose,
        coverageAmount: formData.coverageAmount,
        hasChronicDiseases: formData.hasChronic,
        coverSportsActivities: formData.needsSports,
        plannedSportsActivities: formData.needsSports ? formData.sportsType : null,
      };
      
      Object.keys(basePayload).forEach(key => (basePayload[key] == null || basePayload[key] === '') && delete basePayload[key]);

      if (!user) {
        console.log('[TravelForm] Unauthenticated user. Preparing payload for /unauthorized/travel');
        const unauthorizedPayload = {
          ...basePayload,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleName: formData.middleName || null,
          phone: formData.phone,
          birthDate: formattedBirthDate,
        };
        Object.keys(unauthorizedPayload).forEach(key => (unauthorizedPayload[key] == null || unauthorizedPayload[key] === '') && delete unauthorizedPayload[key]);
        console.log('[TravelForm] Submitting to /unauthorized/travel. Payload:', unauthorizedPayload);
        apiResponse = await api.post('/api/insurance/unauthorized/travel', unauthorizedPayload);
        
        if (apiResponse.data && apiResponse.data.accessToken && apiResponse.data.user) {
          await handleAuthenticationResponse(apiResponse.data);
          setSuccessMessage('Заявка успешно создана! Вы были автоматически зарегистрированы.');
          navigate('/applications/success', { 
            state: { 
              applicationId: apiResponse.data.id, 
              calculatedAmount: apiResponse.data.calculatedAmount,
              message: 'Заявка успешно создана! Вы были автоматически зарегистрированы и вошли в систему. Ваш пароль совпадает с email.',
              type: 'TRAVEL',
              isNewUser: true,
              email: apiResponse.data.email,
              password: apiResponse.data.email
            } 
          });
        } else {
           throw new Error("Ответ от сервера не содержит всех необходимых данных для авторизации (токен или пользователь).");
        }

      } else {
        console.log('[TravelForm] Authenticated user. Preparing payload for /applications/travel');
        const authorizedPayload = { ...basePayload };
        console.log('[TravelForm] Submitting to /applications/travel. Payload:', authorizedPayload);
        apiResponse = await api.post('/api/insurance/applications/travel', authorizedPayload);
        setSuccessMessage('Ваша заявка на страхование путешествий успешно отправлена!');
        navigate('/applications/success', { 
          state: { 
            applicationId: apiResponse.data.id, 
            calculatedAmount: apiResponse.data.calculatedAmount,
            message: 'Заявка на страхование путешествий успешно создана.',
            type: 'TRAVEL'
          } 
        });
      }
      console.log('[TravelForm] Submission successful:', apiResponse.data);

    } catch (err) {
      console.error('[TravelForm] Autonomous submission error:', err.response?.data || err.message || err);
      setError('Ошибка при отправке заявки: ' + (err.response?.data?.message || err.response?.data?.error || err.message || 'Неизвестная ошибка сервера'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={isPartOfPackage ? 0 : 3} sx={{ p: 3 }}>
      {!isPartOfPackage && (
        <Typography variant="h5" gutterBottom>
          Страхование для путешествий {!user && "(Требуется указать Email для регистрации)"}
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
          
          <Grid item xs={12} md={6}>
             { (user || initialData.passport) && (
                <TextField
                  fullWidth
                  label="Серия и номер паспорта РФ"
                  value={formData.passport}
                  onChange={handleChange('passport')}
                  required={!!user}
                  disabled={isSubmitting}
                  helperText={!user ? "Для неавторизованной подачи не используется" : "Обязательно для оформления"}
                />
              )}
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Серия и номер загранпаспорта"
              value={formData.internationalPassport}
              onChange={handleChange('internationalPassport')}
              required
              disabled={isSubmitting}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <DatePicker
              label="Срок действия загранпаспорта"
              value={formData.passportExpiry ? new Date(formData.passportExpiry) : null}
              onChange={handleDateChange('passportExpiry')}
              slotProps={{ textField: { fullWidth: true, required: true, disabled: isSubmitting } }}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth required disabled={isSubmitting}>
              <InputLabel>Страны посещения</InputLabel>
              <Select
                multiple
                value={formData.countries}
                onChange={handleChange('countries')}
                label="Страны посещения"
              >
                <MenuItem value="USA">США</MenuItem>
                <MenuItem value="SCHENGEN">Шенген</MenuItem>
                <MenuItem value="ASIA">Азия</MenuItem>
                <MenuItem value="OTHER">Другие страны</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <DatePicker
              label="Дата начала поездки"
              value={formData.startDate ? new Date(formData.startDate) : null}
              onChange={handleDateChange('startDate')}
              slotProps={{ textField: { fullWidth: true, required: true, disabled: isSubmitting } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <DatePicker
              label="Дата окончания поездки"
              value={formData.endDate ? new Date(formData.endDate) : null}
              onChange={handleDateChange('endDate')}
              slotProps={{ textField: { fullWidth: true, required: true, disabled: isSubmitting } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required disabled={isSubmitting}>
              <InputLabel>Цель поездки</InputLabel>
              <Select
                value={formData.purpose}
                onChange={handleChange('purpose')}
                label="Цель поездки"
              >
                <MenuItem value="TOURISM">Туризм</MenuItem>
                <MenuItem value="BUSINESS">Бизнес</MenuItem>
                <MenuItem value="STUDY">Учеба</MenuItem>
                <MenuItem value="SPORT">Спорт</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Сумма покрытия"
              type="number"
              value={formData.coverageAmount}
              onChange={handleChange('coverageAmount')}
              required
              disabled={isSubmitting}
            />
          </Grid>

          <Grid item xs={12}>
            <FormGroup>
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
            </FormGroup>
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
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.needsSports}
                    onChange={handleChange('needsSports')}
                    disabled={isSubmitting}
                  />
                }
                label="Планирую заниматься спортом"
              />
            </FormGroup>
          </Grid>

          {formData.needsSports && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Укажите вид спорта"
                value={formData.sportsType}
                onChange={handleChange('sportsType')}
                required={formData.needsSports}
                disabled={isSubmitting}
              />
            </Grid>
          )}
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

TravelForm.propTypes = {
  onSubmit: PropTypes.func,
  initialData: PropTypes.object,
  isPartOfPackage: PropTypes.bool
};

export default TravelForm; 