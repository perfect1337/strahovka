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
  MenuItem
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

const KaskoForm = () => {
  const [form, setForm] = useState({
    // Car Information
    carModel: '',
    carYear: '',
    licensePlate: '',
    vin: '',
    enginePower: '',
    mileage: '',
    carValue: '',
    
    // Owner Information
    ownerFullName: '',
    ownerPassport: '',
    ownerRegistrationAddress: '',
    
    // Insurance Details
    insuranceType: 'full', // full or partial
    startDate: null,
    endDate: null,
    
    // Additional Options
    includeTheftProtection: true,
    includeNaturalDisasters: true,
    includeVandalismProtection: true,
    
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

  const validateForm = () => {
    return (
      form.carModel &&
      form.carYear &&
      form.licensePlate &&
      form.vin &&
      form.enginePower &&
      form.mileage &&
      form.carValue &&
      form.ownerFullName &&
      form.ownerPassport &&
      form.ownerRegistrationAddress &&
      form.startDate &&
      form.endDate
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
        startDate: form.startDate?.toISOString().split('T')[0],
        endDate: form.endDate?.toISOString().split('T')[0],
      };

      await api.post('/api/insurance/applications/kasko', formData);
      setSuccess(true);
      
      // Reset form
      setForm({
        carModel: '',
        carYear: '',
        licensePlate: '',
        vin: '',
        enginePower: '',
        mileage: '',
        carValue: '',
        ownerFullName: '',
        ownerPassport: '',
        ownerRegistrationAddress: '',
        insuranceType: 'full',
        startDate: null,
        endDate: null,
        includeTheftProtection: true,
        includeNaturalDisasters: true,
        includeVandalismProtection: true,
        description: ''
      });
    } catch (err) {
      console.error('Error submitting KASKO insurance application:', err);
      setError('Ошибка при отправке заявки. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h5" gutterBottom>КАСКО</Typography>
        
        {error && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>}
        
        {/* Car Information Section */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Информация об автомобиле</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Марка и модель автомобиля" 
                name="carModel" 
                value={form.carModel} 
                onChange={handleChange} 
                fullWidth 
                required 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Год выпуска" 
                name="carYear" 
                type="number"
                value={form.carYear} 
                onChange={handleChange} 
                fullWidth 
                required 
                InputProps={{ inputProps: { min: 1900, max: new Date().getFullYear() } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Гос. номер" 
                name="licensePlate" 
                value={form.licensePlate} 
                onChange={handleChange} 
                fullWidth 
                required 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="VIN номер" 
                name="vin" 
                value={form.vin} 
                onChange={handleChange} 
                fullWidth 
                required 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Мощность двигателя (л.с.)" 
                name="enginePower" 
                type="number"
                value={form.enginePower} 
                onChange={handleChange} 
                fullWidth 
                required 
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Пробег (км)" 
                name="mileage" 
                type="number"
                value={form.mileage} 
                onChange={handleChange} 
                fullWidth 
                required 
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                label="Стоимость автомобиля (₽)" 
                name="carValue" 
                type="number"
                value={form.carValue} 
                onChange={handleChange} 
                fullWidth 
                required 
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Owner Information Section */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Информация о владельце</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField 
                label="ФИО владельца" 
                name="ownerFullName" 
                value={form.ownerFullName} 
                onChange={handleChange} 
                fullWidth 
                required 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Серия и номер паспорта" 
                name="ownerPassport" 
                value={form.ownerPassport} 
                onChange={handleChange} 
                fullWidth 
                required 
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                label="Адрес регистрации" 
                name="ownerRegistrationAddress" 
                value={form.ownerRegistrationAddress} 
                onChange={handleChange} 
                fullWidth 
                required 
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Insurance Details Section */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Параметры страхования</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Тип страхования</InputLabel>
                <Select
                  name="insuranceType"
                  value={form.insuranceType}
                  label="Тип страхования"
                  onChange={handleChange}
                >
                  <MenuItem value="full">Полное КАСКО</MenuItem>
                  <MenuItem value="partial">Частичное КАСКО</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Дата начала"
                value={form.startDate}
                onChange={(date) => handleChange({ target: { name: 'startDate', value: date } })}
                renderInput={(params) => <TextField {...params} fullWidth required />}
                minDate={new Date()}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Дата окончания"
                value={form.endDate}
                onChange={(date) => handleChange({ target: { name: 'endDate', value: date } })}
                renderInput={(params) => <TextField {...params} fullWidth required />}
                minDate={form.startDate || new Date()}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Additional Options Section */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Дополнительные опции</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Защита от угона</InputLabel>
                <Select
                  name="includeTheftProtection"
                  value={form.includeTheftProtection}
                  label="Защита от угона"
                  onChange={handleChange}
                >
                  <MenuItem value={true}>Включить</MenuItem>
                  <MenuItem value={false}>Не включать</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Защита от стихийных бедствий</InputLabel>
                <Select
                  name="includeNaturalDisasters"
                  value={form.includeNaturalDisasters}
                  label="Защита от стихийных бедствий"
                  onChange={handleChange}
                >
                  <MenuItem value={true}>Включить</MenuItem>
                  <MenuItem value={false}>Не включать</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Защита от вандализма</InputLabel>
                <Select
                  name="includeVandalismProtection"
                  value={form.includeVandalismProtection}
                  label="Защита от вандализма"
                  onChange={handleChange}
                >
                  <MenuItem value={true}>Включить</MenuItem>
                  <MenuItem value={false}>Не включать</MenuItem>
                </Select>
              </FormControl>
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
          message="Заявка на КАСКО успешно отправлена!"
        />
      </Box>
    </LocalizationProvider>
  );
};

export default KaskoForm; 