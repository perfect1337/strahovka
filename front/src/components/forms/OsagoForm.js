import React, { useState } from 'react';
import { TextField, Checkbox, FormControlLabel, Button, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import EmailInput from '../EmailInput';

const OsagoForm = ({ onSubmit, isAuthenticated }) => {
  const [formData, setFormData] = useState({
    email: '',
    carMake: '',
    carModel: '',
    carYear: '',
    vinNumber: '',
    licensePlate: '',
    registrationCertificate: '',
    driverLicenseNumber: '',
    driverExperienceYears: '',
    enginePower: '',
    regionRegistration: '',
    hasAccidentsLastYear: false,
    previousPolicyNumber: '',
    isUnlimitedDrivers: false,
    duration: 12
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const endpoint = isAuthenticated ? '/api/insurance/osago' : '/api/insurance/osago/unauthorized';
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
            label="Номер СТС"
            value={formData.registrationCertificate}
            onChange={(e) => handleChange('registrationCertificate', e.target.value)}
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
          <TextField
            fullWidth
            label="Мощность двигателя (л.с.)"
            type="number"
            value={formData.enginePower}
            onChange={(e) => handleChange('enginePower', parseInt(e.target.value))}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Регион регистрации"
            value={formData.regionRegistration}
            onChange={(e) => handleChange('regionRegistration', e.target.value)}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hasAccidentsLastYear}
                onChange={(e) => handleChange('hasAccidentsLastYear', e.target.checked)}
              />
            }
            label="Были ли ДТП за последний год"
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isUnlimitedDrivers}
                onChange={(e) => handleChange('isUnlimitedDrivers', e.target.checked)}
              />
            }
            label="Неограниченное количество водителей"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Номер предыдущего полиса ОСАГО (если есть)"
            value={formData.previousPolicyNumber}
            onChange={(e) => handleChange('previousPolicyNumber', e.target.value)}
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
              <MenuItem value={3}>3 месяца</MenuItem>
              <MenuItem value={6}>6 месяцев</MenuItem>
              <MenuItem value={12}>1 год</MenuItem>
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

export default OsagoForm; 