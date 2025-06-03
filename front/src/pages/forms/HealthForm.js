import React, { useState, useEffect } from 'react';
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
  FormGroup,
  Container
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import InsuranceFormWrapper from '../../components/InsuranceFormWrapper';

const initialFormState = {
  firstName: '',
  lastName: '',
  middleName: '',
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
};

const formatDateForApi = (date) => {
  if (!date) return null;
  if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) return date;
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0];
  } catch (e) {
    return null;
  }
};

const HealthFormContent = ({ isAuthenticated, onSubmit: onSubmitFromWrapper }) => {
  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);
  
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    if (isAuthenticated && auth.user) {
      setForm(prev => ({
        ...prev,
        firstName: auth.user.firstName || '',
        lastName: auth.user.lastName || '',
        middleName: auth.user.middleName || ''
      }));
    }
  }, [isAuthenticated, auth.user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateChange = (name, value) => {
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = ['birthDate', 'passportNumber', 'snils'];
    if (!isAuthenticated) {
      requiredFields.push('firstName', 'lastName');
    }

    for (const field of requiredFields) {
      if (!form[field]) {
        setFormError(`Поле "${field}" обязательно для заполнения.`);
        return false;
    }
    }
    setFormError(null);
    return true;
  };

  const handleSubmitClick = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setApiError(null);
    setFormError(null);
    setSuccessInfo(null);

    const applicationDataForWrapper = {
      firstName: form.firstName,
      lastName: form.lastName,
      middleName: form.middleName,
      birthDate: formatDateForApi(form.birthDate),
      passportSeries: form.passportNumber.substring(0, 4),
      passportNumber: form.passportNumber.substring(4),
      snils: form.snils,
      hasChronicDiseases: form.hasChronicDiseases,
      chronicDiseasesDetails: form.chronicDiseasesDetails,
      hasDisabilities: form.hasDisabilities,
      disabilitiesDetails: form.disabilitiesDetails,
      smokingStatus: form.smokingStatus,
      coverDental: form.coverDental,
      coverVision: form.coverVision,
      coverMaternity: form.coverMaternity,
      coverEmergency: form.coverEmergency,
      preferredClinic: form.preferredClinic,
      familyDoctorNeeded: form.familyDoctorNeeded,
      notes: form.notes
    };
    
    try {
      const response = await onSubmitFromWrapper(applicationDataForWrapper);

      if (response?.data) {
        if (!isAuthenticated && response.data.accessToken) {
          localStorage.setItem('token', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          await auth.validateAndGetUser();
        }
        setSuccessInfo(`Заявка на страхование здоровья успешно отправлена! ID: ${response.data.id || 'N/A'}. Вы будете перенаправлены через 3 секунды.`);
        
        setTimeout(() => {
          navigate('/profile'); 
        }, 3000);
      } else {
        setApiError("Не удалось получить ожидаемые данные от сервера.");
      }
    } catch (error) {
      console.error('Health application error (HealthFormContent):', error);
      const errorData = error.response?.data;
      let errorMessage = 'Ошибка при создании заявки на страхование здоровья.';
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData && (errorData.error || errorData.message)) {
        errorMessage = errorData.error || errorData.message;
      } else if (Array.isArray(errorData)) {
        errorMessage = errorData.join(', ');
      } else if (error.message) {
        errorMessage = error.message;
      }
      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={0} sx={{ p: isAuthenticated ? 0 : 3, mt: isAuthenticated ? 0 : 3 }}>
        <Typography variant="h5" gutterBottom component="div" sx={{ mb: 3 }}>
          Страхование здоровья
        </Typography>
        
        {apiError && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{apiError}</Alert>}
        {formError && <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>{formError}</Alert>}
        {successInfo && <Alert severity="success" sx={{ mt: 2, mb: 2 }}>{successInfo}</Alert>}
        
          <Grid container spacing={3}>
          {!isAuthenticated && (
            <>
              <Grid item xs={12} md={4}>
                <TextField
                  required
                  fullWidth
                  label="Имя"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  required
                  fullWidth
                  label="Фамилия"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Отчество (если есть)"
                  name="middleName"
                  value={form.middleName}
                  onChange={handleChange}
                />
              </Grid>
            </>
          )}
          {isAuthenticated && auth.user && (
             <Grid item xs={12}>
                <Typography variant="subtitle1">
                  Заявитель: {auth.user.firstName} {auth.user.lastName} {auth.user.middleName || ''}
                </Typography>
             </Grid>
          )}

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Дата рождения *"
                value={form.birthDate}
              onChange={(newValue) => handleDateChange('birthDate', newValue)}
                renderInput={(params) => <TextField {...params} required fullWidth />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
              label="Номер и серия паспорта"
                name="passportNumber"
                value={form.passportNumber}
                onChange={handleChange}
              inputProps={{ maxLength: 10 }}
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
              inputProps={{ maxLength: 14 }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.hasChronicDiseases}
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
                      name="smokingStatus"
                    />
                  }
                  label="Курение"
                />
              </FormGroup>
            </Grid>

            <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{mt: 2}}>
                Дополнительное покрытие
              </Typography>
              <FormGroup>
              <FormControlLabel control={<Checkbox checked={form.coverDental} onChange={handleChange} name="coverDental"/>} label="Стоматология"/>
              <FormControlLabel control={<Checkbox checked={form.coverVision} onChange={handleChange} name="coverVision"/>} label="Офтальмология"/>
              <FormControlLabel control={<Checkbox checked={form.coverMaternity} onChange={handleChange} name="coverMaternity"/>} label="Ведение беременности"/>
              <FormControlLabel control={<Checkbox checked={form.coverEmergency} onChange={handleChange} name="coverEmergency"/>} label="Экстренная помощь (включено по умолчанию)"/>
              </FormGroup>
            </Grid>

          <Grid item xs={12}>
              <TextField
                fullWidth
                label="Предпочитаемая клиника"
                name="preferredClinic"
                value={form.preferredClinic}
                onChange={handleChange}
              sx={{ mt: 1 }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.familyDoctorNeeded}
                    onChange={handleChange}
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
              rows={3}
              label="Дополнительные примечания"
                name="notes"
                value={form.notes}
                onChange={handleChange}
              sx={{ mt: 1 }}
              />
          </Grid>
            </Grid>

              <Button
                variant="contained"
          size="large"
          fullWidth
          sx={{ mt: 3 }} 
                disabled={loading}
          onClick={handleSubmitClick}
              >
                {loading ? 'Отправка...' : 'Отправить заявку'}
              </Button>
      </Paper>
    </LocalizationProvider>
  );
};

const HealthForm = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmitFromWrapper = async (dataFromWrapper) => {
    let url;
    if (!auth.user && dataFromWrapper.email) { 
      url = '/api/insurance/unauthorized/health';
    } else { 
      url = '/api/insurance/applications/health';
    }
    console.log(`[HealthForm] Submitting to URL: ${url} with payload:`, JSON.stringify(dataFromWrapper));
    return api.post(url, dataFromWrapper); 
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <InsuranceFormWrapper onSubmit={handleSubmitFromWrapper}>
        <HealthFormContent />
      </InsuranceFormWrapper>
    </Container>
  );
};

export default HealthForm; 