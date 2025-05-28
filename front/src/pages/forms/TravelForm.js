import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  Snackbar, 
  FormControl, 
  InputLabel, 
  MenuItem, 
  Select,
  Grid,
  Paper,
  Checkbox,
  FormControlLabel,
  FormGroup
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const TravelForm = () => {
  const [form, setForm] = useState({ 
    // Personal Information
    fullName: '', 
    birthDate: null,
    passport: '',
    email: '',
    phone: '',
    address: '',
    
    // Trip Information
    country: '', 
    cities: '',
    departure: null, 
    return: null, 
    purpose: 'tourism',
    
    // Insurance Options
    coverageMedical: true,
    coverageAccident: true,
    coverageLuggage: false,
    coverageCancellation: false,
    coverageSports: false,
    
    // Additional Info
    description: '' 
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const validateForm = () => {
    return (
      form.fullName &&
      form.birthDate &&
      form.passport &&
      form.email &&
      form.phone &&
      form.address &&
      form.country &&
      form.departure &&
      form.return
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Необходимо авторизоваться для отправки заявки');
      return;
    }

    if (!validateForm()) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const formData = {
        ...form,
        birthDate: form.birthDate?.toISOString().split('T')[0],
        departure: form.departure?.toISOString().split('T')[0],
        return: form.return?.toISOString().split('T')[0],
      };

      await api.post('/api/insurance/applications/travel', formData);
      setSuccess(true);
      
      // Reset form
      setForm({ 
        fullName: '', 
        birthDate: null,
        passport: '',
        email: '',
        phone: '',
        address: '',
        country: '', 
        cities: '',
        departure: null, 
        return: null, 
        purpose: 'tourism',
        coverageMedical: true,
        coverageAccident: true,
        coverageLuggage: false,
        coverageCancellation: false,
        coverageSports: false,
        description: '' 
      });
    } catch (err) {
      console.error('Error submitting travel insurance application:', err);
      setError('Ошибка при отправке заявки. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h5" gutterBottom>Страхование путешествий</Typography>
        
        {error && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>}
        
        {/* Personal Information Section */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Личная информация</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField 
                label="ФИО" 
                name="fullName" 
                value={form.fullName} 
                onChange={handleChange} 
                fullWidth 
                required 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Дата рождения"
                value={form.birthDate}
                onChange={(date) => handleChange({ target: { name: 'birthDate', value: date } })}
                renderInput={(params) => <TextField {...params} fullWidth required />}
                maxDate={new Date()}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Серия и номер загранпаспорта" 
                name="passport" 
                value={form.passport} 
                onChange={handleChange} 
                fullWidth 
                required 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Email" 
                name="email" 
                type="email"
                value={form.email} 
                onChange={handleChange} 
                fullWidth 
                required 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Телефон" 
                name="phone" 
                value={form.phone} 
                onChange={handleChange} 
                fullWidth 
                required 
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                label="Адрес проживания" 
                name="address" 
                value={form.address} 
                onChange={handleChange} 
                fullWidth 
                required 
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Trip Information Section */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Информация о поездке</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Страна поездки" 
                name="country" 
                value={form.country} 
                onChange={handleChange} 
                fullWidth 
                required 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Города посещения" 
                name="cities" 
                value={form.cities} 
                onChange={handleChange} 
                fullWidth 
                placeholder="Через запятую"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Дата отъезда"
                value={form.departure}
                onChange={(date) => handleChange({ target: { name: 'departure', value: date } })}
                renderInput={(params) => <TextField {...params} fullWidth required />}
                minDate={new Date()}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Дата возвращения"
                value={form.return}
                onChange={(date) => handleChange({ target: { name: 'return', value: date } })}
                renderInput={(params) => <TextField {...params} fullWidth required />}
                minDate={form.departure || new Date()}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Цель поездки</InputLabel>
                <Select
                  name="purpose"
                  value={form.purpose}
                  label="Цель поездки"
                  onChange={handleChange}
                >
                  <MenuItem value="tourism">Туризм</MenuItem>
                  <MenuItem value="business">Деловая поездка</MenuItem>
                  <MenuItem value="study">Учеба</MenuItem>
                  <MenuItem value="sport">Спорт</MenuItem>
                  <MenuItem value="other">Другое</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Insurance Options Section */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Страховое покрытие</Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.coverageMedical}
                  onChange={handleCheckboxChange}
                  name="coverageMedical"
                />
              }
              label="Медицинские расходы"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.coverageAccident}
                  onChange={handleCheckboxChange}
                  name="coverageAccident"
                />
              }
              label="Несчастные случаи"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.coverageLuggage}
                  onChange={handleCheckboxChange}
                  name="coverageLuggage"
                />
              }
              label="Страхование багажа"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.coverageCancellation}
                  onChange={handleCheckboxChange}
                  name="coverageCancellation"
                />
              }
              label="Отмена поездки"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.coverageSports}
                  onChange={handleCheckboxChange}
                  name="coverageSports"
                />
              }
              label="Спортивные мероприятия"
            />
          </FormGroup>
        </Paper>

        {/* Additional Information */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Дополнительная информация</Typography>
          <TextField 
            label="Примечания" 
            name="description" 
            value={form.description} 
            onChange={handleChange} 
            fullWidth 
            multiline 
            rows={3} 
          />
        </Paper>

        <Button 
          type="submit" 
          variant="contained" 
          size="large"
          fullWidth
          sx={{ mt: 2 }} 
          disabled={loading}
        >
          {loading ? 'Отправка...' : 'Отправить заявку'}
        </Button>

        <Snackbar
          open={success}
          autoHideDuration={6000}
          onClose={() => setSuccess(false)}
          message="Заявка на страхование путешествия успешно отправлена!"
        />
      </Box>
    </LocalizationProvider>
  );
};

export default TravelForm; 