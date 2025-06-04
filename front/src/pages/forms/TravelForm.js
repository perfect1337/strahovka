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

const TravelForm = ({ onSubmit, initialData = {}, isPartOfPackage = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || (user ? user.firstName : ''),
    lastName: initialData.lastName || (user ? user.lastName : ''),
    middleName: initialData.middleName || (user ? user.middleName : ''),
    birthDate: initialData.birthDate || null,
    passport: initialData.passport || '',
    internationalPassport: initialData.internationalPassport || '',
    passportExpiry: initialData.passportExpiry || null,
    phone: initialData.phone || (user ? user.phone : ''),
    email: initialData.email || (user ? user.email : ''),
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
    console.log('[TravelForm] Form submission triggered');
    console.log('[TravelForm] onSubmit prop type:', typeof onSubmit);
    console.log('[TravelForm] Initial Form data for submission:', JSON.parse(JSON.stringify(formData)));
    
    if (!formData.firstName || !formData.lastName || !formData.birthDate || 
        !formData.passport || !formData.internationalPassport || !formData.passportExpiry ||
        !formData.phone || !formData.email || !formData.startDate || 
        !formData.endDate || !formData.countries.length || !formData.coverageAmount ||
        !formData.purpose) {
      setError('Пожалуйста, заполните все обязательные поля, включая цель поездки и срок действия загранпаспорта.');
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
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError('Дата начала должна быть раньше даты окончания');
      return;
    }

    console.log('[TravelForm] Form data AFTER validation:', JSON.parse(JSON.stringify(formData)));

    if (!onSubmit) {
      if (isPartOfPackage) {
        const errMessage = 'Ошибка: функция onSubmit не определена, но форма является частью пакета.';
        console.error('[TravelForm]', errMessage, { isPartOfPackage, onSubmit });
        setError(errMessage);
        return;
      }
      
      console.log('[TravelForm] Автономный режим: попытка отправки данных формы:', formData);
      setIsSubmitting(true);
      try {
        const payload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleName: formData.middleName,
          birthDate: formData.birthDate,
          email: formData.email,
          phone: formData.phone,
          passportNumber: formData.internationalPassport,
          passportExpiry: formData.passportExpiry,
          destinationCountry: formData.countries.length > 0 ? formData.countries[0] : null,
          travelStartDate: formData.startDate,
          travelEndDate: formData.endDate,
          purposeOfTrip: formData.purpose,
          coverageAmount: formData.coverageAmount,
          hasChronicDiseases: formData.hasChronic,
          plannedSportsActivities: formData.needsSports ? formData.sportsType : null,
        };

        Object.keys(payload).forEach(key => (payload[key] == null) && delete payload[key]);

        console.log('[TravelForm] Autonomous submission payload:', payload);
        const apiResponse = await api.post('/api/insurance/applications/travel', payload);
        console.log('[TravelForm] Autonomous submission successful:', apiResponse.data);
        setSuccessMessage('Ваша заявка на страхование путешествий успешно отправлена!');
        
        navigate('/applications/success', { 
          state: { 
            applicationId: apiResponse.data.id, 
            calculatedAmount: apiResponse.data.calculatedAmount,
            message: 'Заявка на страхование путешествий успешно создана.',
            type: 'TRAVEL'
          } 
        });
      } catch (err) {
        console.error('[TravelForm] Autonomous submission error:', err);
        setError('Ошибка при отправке заявки: ' + (err.response?.data?.message || err.message || 'Неизвестная ошибка сервера'));
      } finally {
        setIsSubmitting(false);
      }
      return; 
    }

    if (typeof onSubmit !== 'function') {
      const errMessage = 'Ошибка: onSubmit не является функцией.';
      console.error('[TravelForm]', errMessage, { typeofOnSubmit: typeof onSubmit });
      setError(errMessage);
      return;
    }

    try {
      console.log('[TravelForm] Calling provided onSubmit with data:', formData);
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('[TravelForm] Error calling provided onSubmit:', error);
      setError('Произошла ошибка при обработке формы: ' + (error.message || 'Неизвестная ошибка'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={isPartOfPackage ? 0 : 3} sx={{ p: 3 }}>
      {!isPartOfPackage && (
        <Typography variant="h5" gutterBottom>
          Страхование для путешествий
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
            <TextField
              fullWidth
              label="Серия и номер паспорта РФ"
              value={formData.passport}
              onChange={handleChange('passport')}
              required
              disabled={isSubmitting}
            />
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

          <Grid item xs={12}>
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

          <Grid item xs={12}>
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