import React, { useState } from 'react';
import { TextField, Checkbox, FormControlLabel, Button, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import EmailInput from '../EmailInput';

const HealthForm = ({ onSubmit, isAuthenticated }) => {
  const [formData, setFormData] = useState({
    email: '',
    birthDate: '',
    passportNumber: '',
    snils: '',
    hasChronicDiseases: false,
    chronicDiseasesDetails: '',
    hasDisabilities: false,
    disabilitiesDetails: '',
    smokingStatus: false,
    coverDental: false,
    coverVision: false,
    coverMaternity: false,
    coverEmergency: true,
    preferredClinic: '',
    familyDoctorNeeded: false,
    coverageType: 'BASIC',
    coverageAmount: 1000000
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const endpoint = isAuthenticated ? '/api/insurance/health' : '/api/insurance/health/unauthorized';
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
            label="Дата рождения"
            type="date"
            value={formData.birthDate}
            onChange={(e) => handleChange('birthDate', e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Номер паспорта"
            value={formData.passportNumber}
            onChange={(e) => handleChange('passportNumber', e.target.value)}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="СНИЛС"
            value={formData.snils}
            onChange={(e) => handleChange('snils', e.target.value)}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hasChronicDiseases}
                onChange={(e) => handleChange('hasChronicDiseases', e.target.checked)}
              />
            }
            label="Наличие хронических заболеваний"
          />
        </Grid>

        {formData.hasChronicDiseases && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Детали хронических заболеваний"
              multiline
              rows={3}
              value={formData.chronicDiseasesDetails}
              onChange={(e) => handleChange('chronicDiseasesDetails', e.target.value)}
            />
          </Grid>
        )}

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hasDisabilities}
                onChange={(e) => handleChange('hasDisabilities', e.target.checked)}
              />
            }
            label="Наличие инвалидности"
          />
        </Grid>

        {formData.hasDisabilities && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Детали инвалидности"
              multiline
              rows={3}
              value={formData.disabilitiesDetails}
              onChange={(e) => handleChange('disabilitiesDetails', e.target.value)}
            />
          </Grid>
        )}

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.smokingStatus}
                onChange={(e) => handleChange('smokingStatus', e.target.checked)}
              />
            }
            label="Курение"
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.coverDental}
                onChange={(e) => handleChange('coverDental', e.target.checked)}
              />
            }
            label="Включить стоматологию"
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.coverVision}
                onChange={(e) => handleChange('coverVision', e.target.checked)}
              />
            }
            label="Включить офтальмологию"
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.coverMaternity}
                onChange={(e) => handleChange('coverMaternity', e.target.checked)}
              />
            }
            label="Включить родовспоможение"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Предпочитаемая клиника"
            value={formData.preferredClinic}
            onChange={(e) => handleChange('preferredClinic', e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.familyDoctorNeeded}
                onChange={(e) => handleChange('familyDoctorNeeded', e.target.checked)}
              />
            }
            label="Нужен семейный врач"
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Тип покрытия</InputLabel>
            <Select
              value={formData.coverageType}
              onChange={(e) => handleChange('coverageType', e.target.value)}
              label="Тип покрытия"
            >
              <MenuItem value="BASIC">Базовый</MenuItem>
              <MenuItem value="STANDARD">Стандарт</MenuItem>
              <MenuItem value="PREMIUM">Премиум</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Сумма покрытия"
            type="number"
            value={formData.coverageAmount}
            onChange={(e) => handleChange('coverageAmount', parseInt(e.target.value))}
            required
          />
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

export default HealthForm; 