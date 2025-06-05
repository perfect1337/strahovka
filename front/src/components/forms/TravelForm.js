import React, { useState } from 'react';
import { TextField, Checkbox, FormControlLabel, Button, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import EmailInput from '../EmailInput';

const TravelForm = ({ onSubmit, isAuthenticated }) => {
  const [formData, setFormData] = useState({
    email: '',
    passportNumber: '',
    passportExpiry: '',
    destinationCountry: '',
    travelStartDate: '',
    travelEndDate: '',
    purposeOfTrip: 'TOURISM',
    coverMedicalExpenses: true,
    coverAccidents: true,
    coverLuggage: false,
    coverTripCancellation: false,
    coverSportsActivities: false,
    hasChronicDiseases: false,
    plannedSportsActivities: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const endpoint = isAuthenticated ? '/api/insurance/travel' : '/api/insurance/travel/unauthorized';
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
            label="Номер загранпаспорта"
            value={formData.passportNumber}
            onChange={(e) => handleChange('passportNumber', e.target.value)}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Срок действия загранпаспорта"
            type="date"
            value={formData.passportExpiry}
            onChange={(e) => handleChange('passportExpiry', e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Страна назначения"
            value={formData.destinationCountry}
            onChange={(e) => handleChange('destinationCountry', e.target.value)}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Дата начала поездки"
            type="date"
            value={formData.travelStartDate}
            onChange={(e) => handleChange('travelStartDate', e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Дата окончания поездки"
            type="date"
            value={formData.travelEndDate}
            onChange={(e) => handleChange('travelEndDate', e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Цель поездки</InputLabel>
            <Select
              value={formData.purposeOfTrip}
              onChange={(e) => handleChange('purposeOfTrip', e.target.value)}
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
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.coverMedicalExpenses}
                onChange={(e) => handleChange('coverMedicalExpenses', e.target.checked)}
              />
            }
            label="Медицинские расходы"
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.coverAccidents}
                onChange={(e) => handleChange('coverAccidents', e.target.checked)}
              />
            }
            label="Несчастные случаи"
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.coverLuggage}
                onChange={(e) => handleChange('coverLuggage', e.target.checked)}
              />
            }
            label="Страхование багажа"
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.coverTripCancellation}
                onChange={(e) => handleChange('coverTripCancellation', e.target.checked)}
              />
            }
            label="Отмена поездки"
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.coverSportsActivities}
                onChange={(e) => handleChange('coverSportsActivities', e.target.checked)}
              />
            }
            label="Спортивные активности"
          />
        </Grid>

        {formData.coverSportsActivities && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Планируемые спортивные активности"
              multiline
              rows={3}
              value={formData.plannedSportsActivities}
              onChange={(e) => handleChange('plannedSportsActivities', e.target.value)}
            />
          </Grid>
        )}

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

        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Оформить полис
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default TravelForm; 