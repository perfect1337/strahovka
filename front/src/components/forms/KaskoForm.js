import React, { useState } from 'react';
import { TextField, Checkbox, FormControlLabel, Button, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import EmailInput from '../EmailInput';

const KaskoForm = ({ onSubmit, isAuthenticated }) => {
  const [formData, setFormData] = useState({
    email: '',
    carMake: '',
    carModel: '',
    carYear: '',
    vinNumber: '',
    licensePlate: '',
    carValue: '',
    driverLicenseNumber: '',
    driverExperienceYears: '',
    hasAntiTheftSystem: false,
    garageParking: false,
    previousInsuranceNumber: '',
    duration: 12,
    startDate: new Date()
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const endpoint = isAuthenticated ? '/api/insurance/kasko' : '/api/insurance/kasko/unauthorized';
    onSubmit(formData, endpoint);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        {!isAuthenticated && (
          <Grid item xs={12}>
            <EmailInput
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </Grid>
        )}
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Марка автомобиля"
            value={formData.carMake}
            onChange={(e) => handleChange('carMake', e.target.value)}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Модель автомобиля"
            value={formData.carModel}
            onChange={(e) => handleChange('carModel', e.target.value)}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Год выпуска"
            type="number"
            value={formData.carYear}
            onChange={(e) => handleChange('carYear', parseInt(e.target.value))}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="VIN номер"
            value={formData.vinNumber}
            onChange={(e) => handleChange('vinNumber', e.target.value)}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Гос. номер"
            value={formData.licensePlate}
            onChange={(e) => handleChange('licensePlate', e.target.value)}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Стоимость автомобиля"
            type="number"
            value={formData.carValue}
            onChange={(e) => handleChange('carValue', e.target.value)}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Номер водительского удостоверения"
            value={formData.driverLicenseNumber}
            onChange={(e) => handleChange('driverLicenseNumber', e.target.value)}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Стаж вождения (лет)"
            type="number"
            value={formData.driverExperienceYears}
            onChange={(e) => handleChange('driverExperienceYears', parseInt(e.target.value))}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hasAntiTheftSystem}
                onChange={(e) => handleChange('hasAntiTheftSystem', e.target.checked)}
              />
            }
            label="Установлена противоугонная система"
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.garageParking}
                onChange={(e) => handleChange('garageParking', e.target.checked)}
              />
            }
            label="Гаражное хранение"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Номер предыдущего полиса КАСКО (если есть)"
            value={formData.previousInsuranceNumber}
            onChange={(e) => handleChange('previousInsuranceNumber', e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Срок страхования (месяцев)</InputLabel>
            <Select
              value={formData.duration}
              onChange={(e) => handleChange('duration', e.target.value)}
              label="Срок страхования (месяцев)"
            >
              <MenuItem value={1}>1 год</MenuItem>
              <MenuItem value={2}>2 года</MenuItem>
              <MenuItem value={3}>3 года</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Оформить полис
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default KaskoForm; 