import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  TextField,
  Button, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography, 
  Grid,
  Paper,
  FormControlLabel,
  Checkbox,
  Alert,
  FormGroup,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const formatDateForApi = (date) => {
  if (!date) return null;
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) { 
      return null; 
    }
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error formatting date:", date, error);
    return null;
  }
};

const RealEstateForm = ({ onSubmit, initialData = {}, isPartOfPackage = false }) => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || (user ? user.firstName : ''),
    lastName: initialData.lastName || (user ? user.lastName : ''),
    middleName: initialData.middleName || (user ? user.middleName : ''),
    birthDate: initialData.birthDate || null,
    passport: initialData.passport || '',
    phone: initialData.phone || (user ? user.phone : ''),
    email: initialData.email || (user ? user.email : ''),
    propertyType: initialData.propertyType || 'APARTMENT',
    propertyAddress: initialData.propertyAddress || '',
    propertyArea: initialData.propertyArea || '',
    constructionYear: initialData.constructionYear || '',
    constructionType: initialData.constructionType || 'BRICK',
    cadastralNumber: initialData.cadastralNumber || '',
    ownershipDocumentNumber: initialData.ownershipDocumentNumber || '',
    hasSecuritySystem: initialData.hasSecuritySystem || false,
    hasFireAlarm: initialData.hasFireAlarm || false,
    hasMortgage: initialData.hasMortgage || false,
    mortgageBank: initialData.mortgageBank || '',
    coverageAmount: initialData.coverageAmount || '1000000',
    startDate: initialData.startDate || null,
    endDate: initialData.endDate || null,
    additionalInfo: initialData.additionalInfo || '',
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
    setSuccessMessage('');
  };

  const handleDateChange = (field) => (date) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    console.log('[RealEstateForm] Form submission triggered. User authenticated:', !!user);
    
    if (!formData.firstName || !formData.lastName || !formData.birthDate || 
        !formData.phone || !formData.email || 
        !formData.propertyType || !formData.propertyAddress || !formData.propertyArea || 
        !formData.constructionYear || !formData.constructionType ||
        !formData.cadastralNumber || !formData.ownershipDocumentNumber ||
        !formData.coverageAmount || !formData.startDate || !formData.endDate) {
      setError('Пожалуйста, заполните все обязательные поля.');
      return;
    }

    const cleanedPassport = formData.passport.trim().replace(/\s/g, '');
    if (cleanedPassport && !/^\d+$/.test(cleanedPassport)) { 
        setError('Неверный формат паспортных данных РФ. Ожидаются только цифры, если поле заполнено.');
        return;
    }

    const formattedStartDate = formatDateForApi(formData.startDate);
    const formattedEndDate = formatDateForApi(formData.endDate);
    const formattedBirthDate = formatDateForApi(formData.birthDate); // Для неавторизованной отправки

    if (!formattedBirthDate || !formattedStartDate || !formattedEndDate) {
        setError('Пожалуйста, укажите корректные даты (дата рождения, начало и окончание страховки).');
        return;
    }

    if (formData.hasMortgage && !formData.mortgageBank) {
      setError('Пожалуйста, укажите банк, если недвижимость в ипотеке.');
      return;
    }
    const year = parseInt(formData.constructionYear);
    if (isNaN(year) || year < 1800 || year > new Date().getFullYear() + 1) {
        setError('Пожалуйста, укажите корректный год постройки (1800 - текущий год + 1).');
        return;
    }
    if (new Date(formattedStartDate) >= new Date(formattedEndDate)) {
      setError('Дата начала должна быть раньше даты окончания.');
      return;
    }
    const area = parseFloat(formData.propertyArea);
    if (isNaN(area) || area <= 0) {
      setError('Пожалуйста, укажите корректную площадь.');
      return;
    }
    const propertyValue = parseFloat(formData.coverageAmount);
    if (isNaN(propertyValue) || propertyValue <= 0) {
      setError('Пожалуйста, укажите корректную сумму покрытия (стоимость имущества).');
      return;
      }

    if (onSubmit) {
      if (typeof onSubmit !== 'function') {
        setError('[RealEstateForm] Ошибка: onSubmit не является функцией для режима пакета.');
        return;
      }
      try {
        setIsSubmitting(true);
        const processedFormDataForPackage = {
          ...formData,
          passport: cleanedPassport,
          propertyArea: area,
          constructionYear: year,
          coverageAmount: propertyValue,
          mortgageBank: formData.hasMortgage ? formData.mortgageBank : '',
          birthDate: formattedBirthDate,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        };
        await onSubmit(processedFormDataForPackage);
      } catch (error) {
        setError('Ошибка при обработке формы в составе пакета: ' + (error.message || 'Неизвестная ошибка'));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      let apiResponse;
      const commonPropertyPayload = {
        propertyType: formData.propertyType,
        address: formData.propertyAddress,
        propertyArea: area,
        yearBuilt: year,
        constructionType: formData.constructionType,
        propertyValue: propertyValue,
        hasSecuritySystem: formData.hasSecuritySystem,
        hasFireAlarm: formData.hasFireAlarm,
        ownershipDocumentNumber: formData.ownershipDocumentNumber,
        cadastralNumber: formData.cadastralNumber,
        hasMortgage: formData.hasMortgage,
        mortgageBank: formData.hasMortgage ? formData.mortgageBank : null,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      };
      Object.keys(commonPropertyPayload).forEach(key => (commonPropertyPayload[key] === null || commonPropertyPayload[key] === undefined || commonPropertyPayload[key] === '') && delete commonPropertyPayload[key]);

      if (!user) {
        console.log('[RealEstateForm] Unauthenticated user. Preparing payload for /unauthorized/property');
        const unauthorizedPayload = {
          ...commonPropertyPayload,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleName: formData.middleName || null,
          phone: formData.phone,
          birthDate: formattedBirthDate,
        };
        Object.keys(unauthorizedPayload).forEach(key => (unauthorizedPayload[key] === null || unauthorizedPayload[key] === undefined || unauthorizedPayload[key] === '') && delete unauthorizedPayload[key]);
        console.log('[RealEstateForm] Submitting to /unauthorized/property. Payload:', unauthorizedPayload);
        apiResponse = await api.post('/api/insurance/unauthorized/property', unauthorizedPayload);

        if (apiResponse.data && apiResponse.data.accessToken) {
          login(apiResponse.data.user, apiResponse.data.accessToken, apiResponse.data.refreshToken);
          setSuccessMessage('Заявка успешно создана! Вы были автоматически зарегистрированы.');
          navigate('/applications/success', { 
            state: { 
              applicationId: apiResponse.data.id, 
              calculatedAmount: apiResponse.data.calculatedAmount,
              message: 'Заявка успешно создана! Вы зарегистрированы и вошли в систему. Ваш пароль совпадает с email.',
              type: 'PROPERTY',
              isNewUser: true,
              email: apiResponse.data.email,
              password: apiResponse.data.email
            } 
          });
        } else {
          throw new Error("Ответ от сервера не содержит данных для авторизации.");
        }
      } else {
        console.log('[RealEstateForm] Authenticated user. Submitting to /applications/property. Payload:', commonPropertyPayload);
        apiResponse = await api.post('/api/insurance/applications/property', commonPropertyPayload);
        setSuccessMessage('Ваша заявка на страхование недвижимости успешно отправлена!');
        navigate('/applications/success', { 
          state: { 
            applicationId: apiResponse.data.id, 
            calculatedAmount: apiResponse.data.calculatedAmount, 
            message: 'Заявка на страхование недвижимости успешно создана.',
            type: 'PROPERTY'
          } 
        });
      }
      console.log('[RealEstateForm] Submission successful:', apiResponse.data);
    } catch (err) {
      console.error('[RealEstateForm] Autonomous submission error:', err.response?.data || err.message || err);
      setError('Ошибка при отправке заявки: ' + (err.response?.data?.message || err.response?.data?.error || err.message || 'Неизвестная ошибка сервера'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={isPartOfPackage ? 0 : 3} sx={{ p: 3 }}>
      {!isPartOfPackage && (
        <Typography variant="h5" gutterBottom>
          Страхование недвижимости {!user && "(Требуется указать Email для регистрации)"}
        </Typography>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {successMessage && !isPartOfPackage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

      <form onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Фамилия" value={formData.lastName} onChange={handleChange('lastName')} required disabled={isSubmitting || (!!user && !!user.lastName && !initialData.lastName)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Имя" value={formData.firstName} onChange={handleChange('firstName')} required disabled={isSubmitting || (!!user && !!user.firstName && !initialData.firstName)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Отчество" value={formData.middleName} onChange={handleChange('middleName')} disabled={isSubmitting || (!!user && !!user.middleName && !initialData.middleName)} />
          </Grid>
          <Grid item xs={12} md={6}>
            <DatePicker label="Дата рождения" value={formData.birthDate ? new Date(formData.birthDate) : null} onChange={handleDateChange('birthDate')} slotProps={{ textField: { fullWidth: true, required: true, disabled: isSubmitting } }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Серия и номер паспорта РФ" 
              value={formData.passport}
              onChange={handleChange('passport')}
              helperText="10 цифр. Для этого типа заявки не отправляется на сервер, но может быть нужен для пакета."
              disabled={isSubmitting} 
              required={false}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Email" type="email" value={formData.email} onChange={handleChange('email')} required disabled={isSubmitting || (!!user && !!user.email && !initialData.email)} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Телефон" value={formData.phone} onChange={handleChange('phone')} required disabled={isSubmitting || (!!user && !!user.phone && !initialData.phone)} />
          </Grid>

          <Grid item xs={12} md={6}> 
            <FormControl fullWidth required disabled={isSubmitting}>
              <InputLabel>Тип недвижимости</InputLabel>
              <Select value={formData.propertyType} onChange={handleChange('propertyType')} label="Тип недвижимости">
                <MenuItem value="APARTMENT">Квартира</MenuItem>
                <MenuItem value="HOUSE">Частный дом</MenuItem>
                <MenuItem value="TOWNHOUSE">Таунхаус</MenuItem>
                <MenuItem value="COMMERCIAL">Коммерческая недвижимость</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required disabled={isSubmitting}>
              <InputLabel>Материал стен/Тип конструкции</InputLabel>
              <Select value={formData.constructionType} onChange={handleChange('constructionType')} label="Материал стен/Тип конструкции">
                <MenuItem value="BRICK">Кирпич</MenuItem>
                <MenuItem value="CONCRETE_PANEL">Ж/Б Панель</MenuItem>
                <MenuItem value="MONOLITHIC">Монолит</MenuItem>
                <MenuItem value="WOOD">Дерево</MenuItem>
                <MenuItem value="BLOCK">Блочный</MenuItem>
                <MenuItem value="OTHER">Другое</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField fullWidth label="Адрес недвижимости" value={formData.propertyAddress} onChange={handleChange('propertyAddress')} required disabled={isSubmitting} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Площадь (м²)" type="number" value={formData.propertyArea} onChange={handleChange('propertyArea')} required InputProps={{ inputProps: { min: 0.1, step: 0.1 } }} disabled={isSubmitting} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Год постройки" type="number" value={formData.constructionYear} onChange={handleChange('constructionYear')} required InputProps={{ inputProps: { min: 1800, max: new Date().getFullYear() + 1 } }} disabled={isSubmitting} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Сумма покрытия (Стоимость)" type="number" value={formData.coverageAmount} onChange={handleChange('coverageAmount')} required InputProps={{ inputProps: { min: 1, step: 1000 } }} helperText="Оценочная стоимость недвижимости" disabled={isSubmitting}/>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Кадастровый номер" value={formData.cadastralNumber} onChange={handleChange('cadastralNumber')} required disabled={isSubmitting} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Номер документа о собственности" value={formData.ownershipDocumentNumber} onChange={handleChange('ownershipDocumentNumber')} required disabled={isSubmitting} />
          </Grid>

          <Grid item xs={12}>
            <FormGroup row>
              <FormControlLabel control={<Checkbox checked={formData.hasSecuritySystem} onChange={handleChange('hasSecuritySystem')} disabled={isSubmitting} />} label="Охранная система" />
              <FormControlLabel control={<Checkbox checked={formData.hasFireAlarm} onChange={handleChange('hasFireAlarm')} disabled={isSubmitting} />} label="Пожарная сигнализация" />
              <FormControlLabel control={<Checkbox checked={formData.hasMortgage} onChange={handleChange('hasMortgage')} disabled={isSubmitting} />} label="В ипотеке" />
            </FormGroup>
          </Grid>

          {formData.hasMortgage && (
          <Grid item xs={12}>
              <TextField fullWidth label="Банк, выдавший ипотеку" value={formData.mortgageBank} onChange={handleChange('mortgageBank')} required={formData.hasMortgage} disabled={isSubmitting} />
          </Grid>
          )}

          <Grid item xs={12} md={6}>
            <DatePicker label="Дата начала" value={formData.startDate ? new Date(formData.startDate) : null} onChange={handleDateChange('startDate')} slotProps={{ textField: { fullWidth: true, required: true, disabled: isSubmitting } }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <DatePicker label="Дата окончания" value={formData.endDate ? new Date(formData.endDate) : null} onChange={handleDateChange('endDate')} slotProps={{ textField: { fullWidth: true, required: true, disabled: isSubmitting } }} />
          </Grid>

          <Grid item xs={12}>
            <TextField fullWidth label="Дополнительная информация" multiline rows={3} value={formData.additionalInfo} onChange={handleChange('additionalInfo')} disabled={isSubmitting} />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" variant="contained" color="primary" size="large" disabled={isSubmitting}>
            {isSubmitting ? 'Отправка...' : (isPartOfPackage ? 'Далее' : 'Оформить полис')}
        </Button>
        </Box>
      </form>
      </Paper>
  );
};

RealEstateForm.propTypes = {
  onSubmit: PropTypes.func,
  initialData: PropTypes.object,
  isPartOfPackage: PropTypes.bool
};

export default RealEstateForm; 