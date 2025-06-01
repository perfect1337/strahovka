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
    passportNumber: '',
    passportExpiry: null,
    destinationCountry: '',
    travelStartDate: null,
    travelEndDate: null,
    purposeOfTrip: 'TOURISM',
    coverMedicalExpenses: true,
    coverAccidents: true,
    coverLuggage: false,
    coverTripCancellation: false,
    coverSportsActivities: false,
    hasChronicDiseases: false,
    plannedSportsActivities: '',
    notes: ''
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
      form.passportNumber &&
      form.passportExpiry &&
      form.destinationCountry &&
      form.travelStartDate &&
      form.travelEndDate &&
      form.purposeOfTrip
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
        passportExpiry: form.passportExpiry?.toISOString().split('T')[0],
        travelStartDate: form.travelStartDate?.toISOString().split('T')[0],
        travelEndDate: form.travelEndDate?.toISOString().split('T')[0],
      };

      await api.post('/api/insurance/applications/travel', formData);
      setSuccess(true);
      
      // Reset form
      setForm({ 
        passportNumber: '',
        passportExpiry: null,
        destinationCountry: '',
        travelStartDate: null,
        travelEndDate: null,
        purposeOfTrip: 'TOURISM',
        coverMedicalExpenses: true,
        coverAccidents: true,
        coverLuggage: false,
        coverTripCancellation: false,
        coverSportsActivities: false,
        hasChronicDiseases: false,
        plannedSportsActivities: '',
        notes: ''
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
      <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Страхование для путешествий
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Passport Information */}
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Номер паспорта"
                name="passportNumber"
                value={form.passportNumber}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Срок действия паспорта"
                value={form.passportExpiry}
                onChange={(newValue) => setForm(prev => ({ ...prev, passportExpiry: newValue }))}
                renderInput={(params) => <TextField {...params} required fullWidth />}
              />
            </Grid>

            {/* Trip Information */}
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Страна назначения"
                name="destinationCountry"
                value={form.destinationCountry}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Дата начала поездки"
                value={form.travelStartDate}
                onChange={(newValue) => setForm(prev => ({ ...prev, travelStartDate: newValue }))}
                renderInput={(params) => <TextField {...params} required fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Дата окончания поездки"
                value={form.travelEndDate}
                onChange={(newValue) => setForm(prev => ({ ...prev, travelEndDate: newValue }))}
                renderInput={(params) => <TextField {...params} required fullWidth />}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Цель поездки</InputLabel>
                <Select
                  name="purposeOfTrip"
                  value={form.purposeOfTrip}
                  onChange={handleChange}
                  label="Цель поездки"
                >
                  <MenuItem value="TOURISM">Туризм</MenuItem>
                  <MenuItem value="BUSINESS">Бизнес</MenuItem>
                  <MenuItem value="EDUCATION">Образование</MenuItem>
                  <MenuItem value="SPORTS">Спорт</MenuItem>
                  <MenuItem value="OTHER">Другое</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Insurance Coverage Options */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Страховое покрытие
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.coverMedicalExpenses}
                      onChange={handleCheckboxChange}
                      name="coverMedicalExpenses"
                    />
                  }
                  label="Медицинские расходы"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.coverAccidents}
                      onChange={handleCheckboxChange}
                      name="coverAccidents"
                    />
                  }
                  label="Несчастные случаи"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.coverLuggage}
                      onChange={handleCheckboxChange}
                      name="coverLuggage"
                    />
                  }
                  label="Багаж"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.coverTripCancellation}
                      onChange={handleCheckboxChange}
                      name="coverTripCancellation"
                    />
                  }
                  label="Отмена поездки"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.coverSportsActivities}
                      onChange={handleCheckboxChange}
                      name="coverSportsActivities"
                    />
                  }
                  label="Спортивные мероприятия"
                />
              </FormGroup>
            </Grid>

            {/* Additional Information */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.hasChronicDiseases}
                    onChange={handleCheckboxChange}
                    name="hasChronicDiseases"
                  />
                }
                label="Наличие хронических заболеваний"
              />
            </Grid>

            {form.hasChronicDiseases && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Детали хронических заболеваний"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                />
              </Grid>
            )}

            {form.coverSportsActivities && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Планируемые спортивные активности"
                  name="plannedSportsActivities"
                  value={form.plannedSportsActivities}
                  onChange={handleChange}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Отправка...' : 'Отправить заявку'}
              </Button>
            </Grid>
          </Grid>
        </form>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert onClose={() => setError(null)} severity="error">
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={success}
          autoHideDuration={6000}
          onClose={() => setSuccess(false)}
        >
          <Alert onClose={() => setSuccess(false)} severity="success">
            Заявка успешно отправлена!
          </Alert>
        </Snackbar>
      </Paper>
    </LocalizationProvider>
  );
};

export default TravelForm; 