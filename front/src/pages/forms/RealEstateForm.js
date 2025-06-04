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

const RealEstateForm = ({ onSubmit, initialData = {}, isPartOfPackage = false }) => {
  console.log('RealEstateForm rendered with props:', { onSubmit: !!onSubmit, initialData, isPartOfPackage });
  
  const { user } = useAuth();
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

  useEffect(() => {
    console.log('Current form data:', formData);
  }, [formData]);

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
    console.log('[RealEstateForm] Form submission triggered');
    
    // Валидация
    if (!formData.firstName || !formData.lastName || !formData.birthDate || 
        !formData.passport || !formData.propertyAddress || !formData.propertyArea || 
        !formData.constructionYear || !formData.constructionType ||
        !formData.cadastralNumber || !formData.ownershipDocumentNumber ||
        !formData.phone || !formData.email || !formData.startDate || 
        !formData.endDate) {
      setError('Пожалуйста, заполните все обязательные поля, включая данные о конструкции и документах.');
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

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError('Дата начала должна быть раньше даты окончания');
      return;
    }

    const area = parseFloat(formData.propertyArea);
    if (isNaN(area) || area <= 0) {
      setError('Пожалуйста, укажите корректную площадь');
      return;
    }
    const propertyValue = parseFloat(formData.coverageAmount);
    if (isNaN(propertyValue) || propertyValue <= 0) {
      setError('Пожалуйста, укажите корректную сумму покрытия (стоимость имущества).');
      return;
    }

    const cleanedPassport = formData.passport.trim().replace(/\s/g, '');
    if (!/^\d{10}$/.test(cleanedPassport)) {
        setError('Неверный формат паспортных данных. Ожидается 10 цифр (серия и номер).');
        return;
    }

    if (!onSubmit) {
      if (isPartOfPackage) {
        const errMessage = 'Ошибка: функция onSubmit не определена, но форма является частью пакета.';
        console.error('[RealEstateForm]', errMessage, { isPartOfPackage, onSubmit });
        setError(errMessage);
        return;
      }
      
      console.log('[RealEstateForm] Автономный режим: попытка отправки данных.');
      setIsSubmitting(true);
      try {
        const payload = {
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
          startDate: formData.startDate,
          endDate: formData.endDate,
        };
        
        Object.keys(payload).forEach(key => (payload[key] === null || payload[key] === undefined) && delete payload[key]);
        console.log('[RealEstateForm] Autonomous submission payload:', payload);

        const apiResponse = await api.post('/api/insurance/applications/property', payload);
        console.log('[RealEstateForm] Autonomous submission successful:', apiResponse.data);
        setSuccessMessage('Ваша заявка на страхование недвижимости успешно отправлена!');
        
        navigate('/applications/success', { 
          state: { 
            applicationId: apiResponse.data.id, 
            calculatedAmount: apiResponse.data.calculatedAmount, 
            message: 'Заявка на страхование недвижимости успешно создана.',
            type: 'PROPERTY'
          } 
        });

      } catch (err) {
        console.error('[RealEstateForm] Autonomous submission error:', err);
        setError('Ошибка при отправке заявки: ' + (err.response?.data?.message || err.message || 'Неизвестная ошибка сервера'));
      } finally {
        setIsSubmitting(false);
      }
      return; 
    }

    if (typeof onSubmit !== 'function') {
      const errMessage = 'Ошибка: onSubmit не является функцией.';
      console.error('[RealEstateForm]', errMessage, { typeofOnSubmit: typeof onSubmit });
      setError(errMessage);
      return;
    }

    try {
      console.log('[RealEstateForm] Calling provided onSubmit with data...');
      setIsSubmitting(true);
      const processedFormData = {
        ...formData,
        passport: cleanedPassport,
        propertyArea: area,
        constructionYear: year,
        coverageAmount: propertyValue,
        mortgageBank: formData.hasMortgage ? formData.mortgageBank : '',
      };
      await onSubmit(processedFormData);
    } catch (error) {
      console.error('[RealEstateForm] Error calling provided onSubmit:', error);
      setError('Произошла ошибка при отправке формы: ' + (error.message || 'Неизвестная ошибка'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={isPartOfPackage ? 0 : 3} sx={{ p: 3 }}>
      {!isPartOfPackage && (
        <Typography variant="h5" gutterBottom>
          Страхование недвижимости
        </Typography>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {successMessage && !isPartOfPackage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

      <form onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Фамилия"
              value={formData.lastName}
              onChange={handleChange('lastName')}
              required
              disabled={isSubmitting}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Имя"
              value={formData.firstName}
              onChange={handleChange('firstName')}
              required
              disabled={isSubmitting}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Отчество"
              value={formData.middleName}
              onChange={handleChange('middleName')}
              disabled={isSubmitting}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <DatePicker
              label="Дата рождения"
              value={formData.birthDate ? new Date(formData.birthDate) : null}
              onChange={handleDateChange('birthDate')}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  disabled: isSubmitting
                }
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Серия и номер паспорта"
              value={formData.passport}
              onChange={handleChange('passport')}
              required
              helperText="10 цифр без пробелов"
              disabled={isSubmitting}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Телефон"
              value={formData.phone}
              onChange={handleChange('phone')}
              required
              disabled={isSubmitting}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              required
              disabled={isSubmitting}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth required disabled={isSubmitting}>
              <InputLabel>Тип недвижимости</InputLabel>
              <Select
                value={formData.propertyType}
                onChange={handleChange('propertyType')}
                label="Тип недвижимости"
              >
                <MenuItem value="APARTMENT">Квартира</MenuItem>
                <MenuItem value="HOUSE">Частный дом</MenuItem>
                <MenuItem value="TOWNHOUSE">Таунхаус</MenuItem>
                <MenuItem value="COMMERCIAL">Коммерческая недвижимость</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Адрес недвижимости"
              value={formData.propertyAddress}
              onChange={handleChange('propertyAddress')}
              required
              disabled={isSubmitting}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Площадь (м²)"
              type="number"
              value={formData.propertyArea}
              onChange={handleChange('propertyArea')}
              required
              InputProps={{
                inputProps: { min: 0, step: 0.1 }
              }}
              disabled={isSubmitting}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Год постройки"
              type="number"
              value={formData.constructionYear}
              onChange={handleChange('constructionYear')}
              InputProps={{
                inputProps: { min: 1800, max: new Date().getFullYear() + 1 }
              }}
              disabled={isSubmitting}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Кадастровый номер"
              value={formData.cadastralNumber}
              onChange={handleChange('cadastralNumber')}
              required
              disabled={isSubmitting}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Номер документа о собственности"
              value={formData.ownershipDocumentNumber}
              onChange={handleChange('ownershipDocumentNumber')}
              required
              disabled={isSubmitting}
            />
          </Grid>

          <Grid item xs={12}>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.hasSecuritySystem}
                    onChange={handleChange('hasSecuritySystem')}
                    disabled={isSubmitting}
                  />
                }
                label="Охранная система"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.hasFireAlarm}
                    onChange={handleChange('hasFireAlarm')}
                    disabled={isSubmitting}
                  />
                }
                label="Пожарная сигнализация"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.hasMortgage}
                    onChange={handleChange('hasMortgage')}
                    disabled={isSubmitting}
                  />
                }
                label="В ипотеке"
              />
            </FormGroup>
          </Grid>

          {formData.hasMortgage && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Банк, выдавший ипотеку"
                value={formData.mortgageBank}
                onChange={handleChange('mortgageBank')}
                required={formData.hasMortgage}
                disabled={isSubmitting}
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <FormControl fullWidth required disabled={isSubmitting}>
              <InputLabel>Сумма покрытия</InputLabel>
              <Select
                value={formData.coverageAmount}
                onChange={handleChange('coverageAmount')}
                label="Сумма покрытия"
              >
                <MenuItem value="1000000">1 000 000 ₽</MenuItem>
                <MenuItem value="3000000">3 000 000 ₽</MenuItem>
                <MenuItem value="5000000">5 000 000 ₽</MenuItem>
                <MenuItem value="10000000">10 000 000 ₽</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <DatePicker
              label="Дата начала"
              value={formData.startDate ? new Date(formData.startDate) : null}
              onChange={handleDateChange('startDate')}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  disabled: isSubmitting
                }
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <DatePicker
              label="Дата окончания"
              value={formData.endDate ? new Date(formData.endDate) : null}
              onChange={handleDateChange('endDate')}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  disabled: isSubmitting
                }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Дополнительная информация"
              multiline
              rows={3}
              value={formData.additionalInfo}
              onChange={handleChange('additionalInfo')}
              disabled={isSubmitting}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
            type="submit"
          variant="contained" 
            color="primary"
          size="large"
          disabled={isSubmitting}
        >
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