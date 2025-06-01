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
import api from '../../utils/api';

const HealthForm = () => {
  const [form, setForm] = useState({
    birthDate: null,
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
      form.birthDate &&
      form.passportNumber &&
      form.snils
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
      setForm({
        birthDate: null,
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
        notes: ''
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
      <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Страхование здоровья
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            {/* Required Fields */}
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Дата рождения *"
                value={form.birthDate}
                onChange={(newValue) => setForm(prev => ({ ...prev, birthDate: newValue }))}
                renderInput={(params) => <TextField {...params} required fullWidth />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Номер паспорта"
                name="passportNumber"
                value={form.passportNumber}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="СНИЛС"
                name="snils"
                value={form.snils}
                onChange={handleChange}
              />
            </Grid>

            {/* Health Information */}
            <Grid item xs={12}>
              <FormGroup>
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
              </FormGroup>
              {form.hasChronicDiseases && (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Детали хронических заболеваний"
                  name="chronicDiseasesDetails"
                  value={form.chronicDiseasesDetails}
                  onChange={handleChange}
                  sx={{ mt: 2 }}
                />
              )}
            </Grid>

            <Grid item xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.hasDisabilities}
                      onChange={handleCheckboxChange}
                      name="hasDisabilities"
                    />
                  }
                  label="Наличие инвалидности"
                />
              </FormGroup>
              {form.hasDisabilities && (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Детали инвалидности"
                  name="disabilitiesDetails"
                  value={form.disabilitiesDetails}
                  onChange={handleChange}
                  sx={{ mt: 2 }}
                />
              )}
            </Grid>

            <Grid item xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.smokingStatus}
                      onChange={handleCheckboxChange}
                      name="smokingStatus"
                    />
                  }
                  label="Курение"
                />
              </FormGroup>
            </Grid>

            {/* Coverage Options */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Дополнительное покрытие
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.coverDental}
                      onChange={handleCheckboxChange}
                      name="coverDental"
                    />
                  }
                  label="Стоматология"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.coverVision}
                      onChange={handleCheckboxChange}
                      name="coverVision"
                    />
                  }
                  label="Офтальмология"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.coverMaternity}
                      onChange={handleCheckboxChange}
                      name="coverMaternity"
                    />
                  }
                  label="Ведение беременности"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.coverEmergency}
                      onChange={handleCheckboxChange}
                      name="coverEmergency"
                    />
                  }
                  label="Экстренная помощь"
                />
              </FormGroup>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Предпочитаемая клиника"
                name="preferredClinic"
                value={form.preferredClinic}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.familyDoctorNeeded}
                      onChange={handleCheckboxChange}
                      name="familyDoctorNeeded"
                    />
                  }
                  label="Нужен семейный врач"
                />
              </FormGroup>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Дополнительные заметки"
                name="notes"
                value={form.notes}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                fullWidth
              >
                {loading ? 'Отправка...' : 'Отправить заявку'}
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={success}
          autoHideDuration={6000}
          onClose={() => setSuccess(false)}
        >
          <Alert severity="success" onClose={() => setSuccess(false)}>
            Заявка успешно отправлена
          </Alert>
        </Snackbar>
      </Paper>
    </LocalizationProvider>
  );
};

export default HealthForm; 