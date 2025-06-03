import React, { useState, useEffect } from 'react';
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

const TravelFormContent = ({ isAuthenticated, onSubmit: onSubmitFromWrapper }) => {
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
    const requiredFields = [
      'passportNumber',
      'passportExpiry',
      'destinationCountry',
      'travelStartDate',
      'travelEndDate',
      'purposeOfTrip'
    ];
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
      passportNumber: form.passportNumber,
      passportExpiry: formatDateForApi(form.passportExpiry),
      destinationCountry: form.destinationCountry,
      travelStartDate: formatDateForApi(form.travelStartDate),
      travelEndDate: formatDateForApi(form.travelEndDate),
      purposeOfTrip: form.purposeOfTrip,
      coverMedicalExpenses: form.coverMedicalExpenses,
      coverAccidents: form.coverAccidents,
      coverLuggage: form.coverLuggage,
      coverTripCancellation: form.coverTripCancellation,
      coverSportsActivities: form.coverSportsActivities,
      hasChronicDiseases: form.hasChronicDiseases,
      plannedSportsActivities: form.plannedSportsActivities,
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
        setSuccessInfo(`Заявка на страхование путешествий успешно отправлена! ID: ${response.data.id || 'N/A'}. Вы будете перенаправлены через 3 секунды.`);
        
        setTimeout(() => {
          navigate('/profile'); 
        }, 3000);
      } else {
        setApiError("Не удалось получить ожидаемые данные от сервера.");
      }
    } catch (error) {
      console.error('Travel application error (TravelFormContent):', error);
      const errorData = error.response?.data;
      let errorMessage = 'Ошибка при создании заявки на страхование путешествий.';
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
          Страхование для путешествий
        </Typography>

        {apiError && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{apiError}</Alert>}
        {formError && <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>{formError}</Alert>}
        {successInfo && <Alert severity="success" sx={{ mt: 2, mb: 2 }}>{successInfo}</Alert>}
        
          <Grid container spacing={3}>
          {!isAuthenticated && (
            <>
              <Grid item xs={12} md={4}>
                <TextField required fullWidth label="Имя" name="firstName" value={form.firstName} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField required fullWidth label="Фамилия" name="lastName" value={form.lastName} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Отчество (если есть)" name="middleName" value={form.middleName} onChange={handleChange} />
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

            <Grid item xs={12} sm={6}>
            <TextField required fullWidth label="Номер загранпаспорта" name="passportNumber" value={form.passportNumber} onChange={handleChange}/>
            </Grid>
            <Grid item xs={12} sm={6}>
            <DatePicker label="Срок действия загранпаспорта *" value={form.passportExpiry} onChange={(newValue) => handleDateChange('passportExpiry', newValue)} renderInput={(params) => <TextField {...params} required fullWidth />} />
            </Grid>

            <Grid item xs={12}>
            <TextField required fullWidth label="Страна назначения" name="destinationCountry" value={form.destinationCountry} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
            <DatePicker label="Дата начала поездки *" value={form.travelStartDate} onChange={(newValue) => handleDateChange('travelStartDate', newValue)} renderInput={(params) => <TextField {...params} required fullWidth />} />
            </Grid>
            <Grid item xs={12} sm={6}>
            <DatePicker label="Дата окончания поездки *" value={form.travelEndDate} onChange={(newValue) => handleDateChange('travelEndDate', newValue)} renderInput={(params) => <TextField {...params} required fullWidth />} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Цель поездки</InputLabel>
              <Select name="purposeOfTrip" value={form.purposeOfTrip} onChange={handleChange} label="Цель поездки">
                  <MenuItem value="TOURISM">Туризм</MenuItem>
                  <MenuItem value="BUSINESS">Бизнес</MenuItem>
                  <MenuItem value="EDUCATION">Образование</MenuItem>
                  <MenuItem value="SPORTS">Спорт</MenuItem>
                  <MenuItem value="OTHER">Другое</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Страховое покрытие</Typography>
              <FormGroup>
              <FormControlLabel control={<Checkbox checked={form.coverMedicalExpenses} onChange={handleChange} name="coverMedicalExpenses" />} label="Медицинские расходы" />
              <FormControlLabel control={<Checkbox checked={form.coverAccidents} onChange={handleChange} name="coverAccidents" />} label="Несчастные случаи" />
              <FormControlLabel control={<Checkbox checked={form.coverLuggage} onChange={handleChange} name="coverLuggage" />} label="Багаж" />
              <FormControlLabel control={<Checkbox checked={form.coverTripCancellation} onChange={handleChange} name="coverTripCancellation" />} label="Отмена поездки" />
              <FormControlLabel control={<Checkbox checked={form.coverSportsActivities} onChange={handleChange} name="coverSportsActivities" />} label="Занятия спортом (включая активный отдых)" />
              </FormGroup>
            </Grid>

          {form.coverSportsActivities && (
            <Grid item xs={12}>
              <TextField fullWidth label="Укажите планируемые виды спорта" name="plannedSportsActivities" value={form.plannedSportsActivities} onChange={handleChange} multiline rows={2} />
              </Grid>
            )}

              <Grid item xs={12}>
            <FormGroup>
                <FormControlLabel control={<Checkbox checked={form.hasChronicDiseases} onChange={handleChange} name="hasChronicDiseases" />} label="Наличие хронических заболеваний (важно для оценки риска)" />
            </FormGroup>
              </Grid>

            <Grid item xs={12}>
            <TextField fullWidth label="Дополнительные примечания" name="notes" value={form.notes} onChange={handleChange} multiline rows={3} sx={{mt:1}} />
          </Grid>
        </Grid>

        <Button variant="contained" size="large" fullWidth sx={{ mt: 3 }} disabled={loading} onClick={handleSubmitClick}>
          {loading ? 'Отправка...' : 'Отправить заявку'}
        </Button>
      </Paper>
    </LocalizationProvider>
  );
};

const TravelForm = () => {
  const auth = useAuth();
  
  const handleSubmitFromWrapper = async (dataFromWrapper) => {
    let url;
    if (!auth.user && dataFromWrapper.email) { 
      url = '/api/insurance/unauthorized/travel';
    } else { 
      url = '/api/insurance/applications/travel';
    }
    console.log(`[TravelForm] Submitting to URL: ${url} with payload:`, JSON.stringify(dataFromWrapper));
    return api.post(url, dataFromWrapper); 
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <InsuranceFormWrapper onSubmit={handleSubmitFromWrapper}>
        <TravelFormContent />
      </InsuranceFormWrapper>
    </Container>
  );
};

export default TravelForm; 