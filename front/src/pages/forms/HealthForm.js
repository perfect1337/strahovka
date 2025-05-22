import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  Snackbar,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

const HealthForm = () => {
  const [form, setForm] = useState({
    // Personal Information
    fullName: '',
    birthDate: null,
    gender: '',
    passport: '',
    snils: '',
    address: '',
    phone: '',
    email: '',
    
    // Health Information
    height: '',
    weight: '',
    bloodType: '',
    chronicDiseases: '',
    allergies: '',
    medications: '',
    
    // Insurance Options
    coverageType: 'basic', // basic, standard, premium
    includeTelemedicine: true,
    includeDentalCare: false,
    includeVision: false,
    includePregnancy: false,
    includeRehabilitation: false,
    
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
      form.gender &&
      form.passport &&
      form.snils &&
      form.address &&
      form.phone &&
      form.email
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
      };

      await api.post('/api/insurance/applications/health', formData);
      setSuccess(true);
      
      // Reset form
      setForm({
        fullName: '',
        birthDate: null,
        gender: '',
        passport: '',
        snils: '',
        address: '',
        phone: '',
        email: '',
        height: '',
        weight: '',
        bloodType: '',
        chronicDiseases: '',
        allergies: '',
        medications: '',
        coverageType: 'basic',
        includeTelemedicine: true,
        includeDentalCare: false,
        includeVision: false,
        includePregnancy: false,
        includeRehabilitation: false,
        description: ''
      });
    } catch (err) {
      console.error('Error submitting health insurance application:', err);
      setError('Ошибка при отправке заявки. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h5" gutterBottom>Страхование здоровья</Typography>
        
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
              <FormControl fullWidth required>
                <InputLabel>Пол</InputLabel>
                <Select
                  name="gender"
                  value={form.gender}
                  label="Пол"
                  onChange={handleChange}
                >
                  <MenuItem value="male">Мужской</MenuItem>
                  <MenuItem value="female">Женский</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Серия и номер паспорта" 
                name="passport" 
                value={form.passport} 
                onChange={handleChange} 
                fullWidth 
                required 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="СНИЛС" 
                name="snils" 
                value={form.snils} 
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
          </Grid>
        </Paper>

        {/* Health Information Section */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Информация о здоровье</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Рост (см)" 
                name="height" 
                type="number"
                value={form.height} 
                onChange={handleChange} 
                fullWidth 
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Вес (кг)" 
                name="weight" 
                type="number"
                value={form.weight} 
                onChange={handleChange} 
                fullWidth 
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Группа крови</InputLabel>
                <Select
                  name="bloodType"
                  value={form.bloodType}
                  label="Группа крови"
                  onChange={handleChange}
                >
                  <MenuItem value="O+">O+</MenuItem>
                  <MenuItem value="O-">O-</MenuItem>
                  <MenuItem value="A+">A+</MenuItem>
                  <MenuItem value="A-">A-</MenuItem>
                  <MenuItem value="B+">B+</MenuItem>
                  <MenuItem value="B-">B-</MenuItem>
                  <MenuItem value="AB+">AB+</MenuItem>
                  <MenuItem value="AB-">AB-</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField 
                label="Хронические заболевания" 
                name="chronicDiseases" 
                value={form.chronicDiseases} 
                onChange={handleChange} 
                fullWidth 
                multiline
                rows={2}
                placeholder="Перечислите через запятую"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                label="Аллергии" 
                name="allergies" 
                value={form.allergies} 
                onChange={handleChange} 
                fullWidth 
                multiline
                rows={2}
                placeholder="Перечислите через запятую"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                label="Принимаемые медикаменты" 
                name="medications" 
                value={form.medications} 
                onChange={handleChange} 
                fullWidth 
                multiline
                rows={2}
                placeholder="Перечислите через запятую"
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Insurance Options Section */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Параметры страхования</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Тип страхового покрытия</InputLabel>
                <Select
                  name="coverageType"
                  value={form.coverageType}
                  label="Тип страхового покрытия"
                  onChange={handleChange}
                >
                  <MenuItem value="basic">Базовый</MenuItem>
                  <MenuItem value="standard">Стандартный</MenuItem>
                  <MenuItem value="premium">Премиум</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.includeTelemedicine}
                      onChange={handleCheckboxChange}
                      name="includeTelemedicine"
                    />
                  }
                  label="Телемедицина"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.includeDentalCare}
                      onChange={handleCheckboxChange}
                      name="includeDentalCare"
                    />
                  }
                  label="Стоматология"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.includeVision}
                      onChange={handleCheckboxChange}
                      name="includeVision"
                    />
                  }
                  label="Офтальмология"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.includePregnancy}
                      onChange={handleCheckboxChange}
                      name="includePregnancy"
                    />
                  }
                  label="Ведение беременности"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.includeRehabilitation}
                      onChange={handleCheckboxChange}
                      name="includeRehabilitation"
                    />
                  }
                  label="Реабилитация"
                />
              </FormGroup>
            </Grid>
          </Grid>
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
          message="Заявка на страхование здоровья успешно отправлена!"
        />
      </Box>
    </LocalizationProvider>
  );
};

export default HealthForm; 