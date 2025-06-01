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
import { useNavigate } from 'react-router-dom';

const ApartmentForm = () => {
  const [form, setForm] = useState({
    // Property Information
    address: '',
    totalArea: '',
    livingArea: '',
    yearBuilt: '',
    floor: '',
    totalFloors: '',
    cadastralNumber: '',
    apartmentNumber: '',
    
    // Owner Information
    ownerFullName: '',
    ownerPassport: '',
    ownerPhone: '',
    ownerEmail: '',
    
    // Property Details
    apartmentType: 'standard',
    constructionType: '', // brick, panel, monolithic, etc.
    propertyCondition: '', // excellent, good, needs repair
    hasBalcony: false,
    hasParking: false,
    hasSecurity: false,
    hasIntercom: false,
    
    // Insurance Options
    coverageType: 'standard', // basic, standard, premium
    includeFinishings: true,
    includeUtilities: true,
    includeThirdPartyLiability: false,
    includeFurniture: false,
    includeValuables: false,
    
    // Coverage Period
    startDate: null,
    endDate: null,
    
    // Additional Info
    propertyValue: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [calculatedAmount, setCalculatedAmount] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

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
      form.address &&
      form.totalArea &&
      form.yearBuilt &&
      form.floor &&
      form.totalFloors &&
      form.cadastralNumber &&
      form.apartmentNumber &&
      form.ownerFullName &&
      form.ownerPassport &&
      form.ownerPhone &&
      form.ownerEmail &&
      form.apartmentType &&
      form.constructionType &&
      form.propertyCondition &&
      form.propertyValue &&
      form.startDate &&
      form.endDate
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
        propertyType: 'apartment',
        address: form.address,
        propertyArea: form.totalArea,
        yearBuilt: parseInt(form.yearBuilt),
        constructionType: form.constructionType,
        propertyValue: form.propertyValue,
        hasSecuritySystem: form.hasSecurity,
        hasFireAlarm: true,
        coverNaturalDisasters: true,
        coverTheft: true,
        coverThirdPartyLiability: form.includeThirdPartyLiability,
        ownershipDocumentNumber: form.ownerPassport,
        cadastralNumber: form.cadastralNumber,
        hasMortgage: false,
        mortgageBank: null,
        startDate: form.startDate?.toISOString().split('T')[0],
        endDate: form.endDate?.toISOString().split('T')[0]
      };

      const response = await api.post('/api/insurance/property', formData);
      setCalculatedAmount(response.data.calculatedAmount);
      setSuccess(true);
      
      // Navigate to profile page after 3 seconds
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
      
      // Reset form
      setForm({
        address: '',
        totalArea: '',
        livingArea: '',
        yearBuilt: '',
        floor: '',
        totalFloors: '',
        cadastralNumber: '',
        apartmentNumber: '',
        ownerFullName: '',
        ownerPassport: '',
        ownerPhone: '',
        ownerEmail: '',
        apartmentType: 'standard',
        constructionType: '',
        propertyCondition: '',
        hasBalcony: false,
        hasParking: false,
        hasSecurity: false,
        hasIntercom: false,
        coverageType: 'standard',
        includeFinishings: true,
        includeUtilities: true,
        includeThirdPartyLiability: false,
        includeFurniture: false,
        includeValuables: false,
        startDate: null,
        endDate: null,
        propertyValue: '',
        description: ''
      });
    } catch (err) {
      console.error('Error submitting apartment insurance application:', err);
      setError('Ошибка при отправке заявки. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h5" gutterBottom>Страхование квартиры</Typography>
        
        {error && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>}
        
        {success && (
          <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
            Заявка успешно отправлена! Рассчитанная сумма страхования: {Number(calculatedAmount).toLocaleString('ru-RU')} ₽
            <br />
            Через 3 секунды вы будете перенаправлены в личный кабинет.
          </Alert>
        )}
        
        {/* Property Information Section */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Информация о квартире</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField 
                label="Адрес" 
                name="address" 
                value={form.address} 
                onChange={handleChange} 
                fullWidth 
                required 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Общая площадь (м²)" 
                name="totalArea" 
                type="number"
                value={form.totalArea} 
                onChange={handleChange} 
                fullWidth 
                required 
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Жилая площадь (м²)" 
                name="livingArea" 
                type="number"
                value={form.livingArea} 
                onChange={handleChange} 
                fullWidth 
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Год постройки" 
                name="yearBuilt" 
                type="number"
                value={form.yearBuilt} 
                onChange={handleChange} 
                fullWidth 
                required 
                InputProps={{ inputProps: { min: 1800, max: new Date().getFullYear() } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Этаж" 
                name="floor" 
                type="number"
                value={form.floor} 
                onChange={handleChange} 
                fullWidth 
                required 
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Всего этажей" 
                name="totalFloors" 
                type="number"
                value={form.totalFloors} 
                onChange={handleChange} 
                fullWidth 
                required 
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Номер квартиры" 
                name="apartmentNumber" 
                value={form.apartmentNumber} 
                onChange={handleChange} 
                fullWidth 
                required 
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                label="Кадастровый номер" 
                name="cadastralNumber" 
                value={form.cadastralNumber} 
                onChange={handleChange} 
                fullWidth 
                required 
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Owner Information Section */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Информация о владельце</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField 
                label="ФИО владельца" 
                name="ownerFullName" 
                value={form.ownerFullName} 
                onChange={handleChange} 
                fullWidth 
                required 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Серия и номер паспорта" 
                name="ownerPassport" 
                value={form.ownerPassport} 
                onChange={handleChange} 
                fullWidth 
                required 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Телефон" 
                name="ownerPhone" 
                value={form.ownerPhone} 
                onChange={handleChange} 
                fullWidth 
                required 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Email" 
                name="ownerEmail" 
                type="email"
                value={form.ownerEmail} 
                onChange={handleChange} 
                fullWidth 
                required 
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Property Details Section */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Характеристики квартиры</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Тип квартиры</InputLabel>
                <Select
                  name="apartmentType"
                  value={form.apartmentType}
                  label="Тип квартиры"
                  onChange={handleChange}
                >
                  <MenuItem value="standard">Стандартная</MenuItem>
                  <MenuItem value="improved">Улучшенной планировки</MenuItem>
                  <MenuItem value="studio">Студия</MenuItem>
                  <MenuItem value="elite">Элитная</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Тип постройки</InputLabel>
                <Select
                  name="constructionType"
                  value={form.constructionType}
                  label="Тип постройки"
                  onChange={handleChange}
                >
                  <MenuItem value="brick">Кирпичный</MenuItem>
                  <MenuItem value="panel">Панельный</MenuItem>
                  <MenuItem value="monolithic">Монолитный</MenuItem>
                  <MenuItem value="other">Другое</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Состояние</InputLabel>
                <Select
                  name="propertyCondition"
                  value={form.propertyCondition}
                  label="Состояние"
                  onChange={handleChange}
                >
                  <MenuItem value="excellent">Отличное</MenuItem>
                  <MenuItem value="good">Хорошее</MenuItem>
                  <MenuItem value="needs_repair">Требует ремонта</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.hasBalcony}
                      onChange={handleCheckboxChange}
                      name="hasBalcony"
                    />
                  }
                  label="Балкон/лоджия"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.hasParking}
                      onChange={handleCheckboxChange}
                      name="hasParking"
                    />
                  }
                  label="Парковка"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.hasSecurity}
                      onChange={handleCheckboxChange}
                      name="hasSecurity"
                    />
                  }
                  label="Охрана"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.hasIntercom}
                      onChange={handleCheckboxChange}
                      name="hasIntercom"
                    />
                  }
                  label="Домофон"
                />
              </FormGroup>
            </Grid>
          </Grid>
        </Paper>

        {/* Insurance Options Section */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Параметры страхования</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Тип страхового покрытия</InputLabel>
                <Select
                  name="coverageType"
                  value={form.coverageType}
                  label="Тип страхового покрытия"
                  onChange={handleChange}
                >
                  <MenuItem value="basic">Базовый</MenuItem>
                  <MenuItem value="standard">Стандартный</MenuItem>
                  <MenuItem value="premium">Премиум</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.includeFinishings}
                      onChange={handleCheckboxChange}
                      name="includeFinishings"
                    />
                  }
                  label="Отделка помещений"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.includeUtilities}
                      onChange={handleCheckboxChange}
                      name="includeUtilities"
                    />
                  }
                  label="Инженерное оборудование"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.includeThirdPartyLiability}
                      onChange={handleCheckboxChange}
                      name="includeThirdPartyLiability"
                    />
                  }
                  label="Гражданская ответственность"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.includeFurniture}
                      onChange={handleCheckboxChange}
                      name="includeFurniture"
                    />
                  }
                  label="Мебель и бытовая техника"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.includeValuables}
                      onChange={handleCheckboxChange}
                      name="includeValuables"
                    />
                  }
                  label="Ценное имущество"
                />
              </FormGroup>
            </Grid>
          </Grid>
        </Paper>

        {/* Coverage Period Section */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Период страхования</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Дата начала"
                value={form.startDate}
                onChange={(date) => handleChange({ target: { name: 'startDate', value: date } })}
                renderInput={(params) => <TextField {...params} fullWidth required />}
                minDate={new Date()}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Дата окончания"
                value={form.endDate}
                onChange={(date) => handleChange({ target: { name: 'endDate', value: date } })}
                renderInput={(params) => <TextField {...params} fullWidth required />}
                minDate={form.startDate || new Date()}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Property Value and Additional Information */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Стоимость и дополнительная информация</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField 
                label="Оценочная стоимость (₽)" 
                name="propertyValue" 
                type="number"
                value={form.propertyValue} 
                onChange={handleChange} 
                fullWidth 
                required 
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                label="Примечания" 
                name="description" 
                value={form.description} 
                onChange={handleChange} 
                fullWidth 
                multiline 
                rows={3} 
              />
            </Grid>
          </Grid>
        </Paper>

        <Button 
          type="submit" 
          variant="contained" 
          size="large"
          fullWidth
          sx={{ mt: 2 }} 
          disabled={loading}
        >
          {loading ? 'Отправка...' : 'Отправить заявку'}
        </Button>

        <Snackbar
          open={success}
          autoHideDuration={6000}
          onClose={() => setSuccess(false)}
          message="Заявка на страхование квартиры успешно отправлена!"
        />
      </Box>
    </LocalizationProvider>
  );
};

export default ApartmentForm; 