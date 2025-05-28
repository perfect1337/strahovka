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
import Decimal from 'decimal.js';

const RealEstateForm = () => {
  const [form, setForm] = useState({
    // Property Information
    propertyType: '',
    address: '',
    totalArea: '',
    livingArea: '',
    yearBuilt: '',
    floor: '',
    totalFloors: '',
    cadastralNumber: '',
    ownershipDocumentNumber: '',
    
    // Owner Information
    ownerFullName: '',
    ownerPassport: '',
    ownerPhone: '',
    ownerEmail: '',
    
    // Property Details
    constructionType: '', // brick, panel, monolithic, etc.
    propertyCondition: '', // excellent, good, needs repair
    hasParking: false,
    hasSecurity: false,
    hasFireAlarm: false,
    hasMortgage: false,
    mortgageBank: '',
    
    // Insurance Options
    coverageType: 'standard', // basic, standard, premium
    includeFinishings: true,
    includeUtilities: true,
    includeThirdPartyLiability: false,
    includeFurniture: false,
    includeValuables: false,
    
    // Dates and Value
    startDate: null,
    endDate: null,
    propertyValue: '',
    description: ''
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
      form.propertyType &&
      form.address &&
      form.totalArea &&
      form.yearBuilt &&
      form.cadastralNumber &&
      form.ownershipDocumentNumber &&
      form.ownerFullName &&
      form.ownerPassport &&
      form.ownerPhone &&
      form.ownerEmail &&
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
        propertyType: form.propertyType,
        address: form.address,
        propertyArea: new Decimal(form.totalArea).toString(),
        yearBuilt: parseInt(form.yearBuilt),
        constructionType: form.constructionType,
        propertyValue: new Decimal(form.propertyValue).toString(),
        hasSecuritySystem: form.hasSecurity,
        hasFireAlarm: form.hasFireAlarm,
        coverNaturalDisasters: true,
        coverTheft: true,
        coverThirdPartyLiability: form.includeThirdPartyLiability,
        ownershipDocumentNumber: form.ownershipDocumentNumber,
        cadastralNumber: form.cadastralNumber,
        hasMortgage: form.hasMortgage,
        mortgageBank: form.mortgageBank,
        ownerFullName: form.ownerFullName,
        ownerPassport: form.ownerPassport,
        ownerPhone: form.ownerPhone,
        ownerEmail: form.ownerEmail,
        startDate: form.startDate?.toISOString().split('T')[0],
        endDate: form.endDate?.toISOString().split('T')[0],
        description: form.description
      };

      await api.post('/api/insurance/applications/property', formData);
      setSuccess(true);
      
      // Reset form
      setForm({
        propertyType: '',
        address: '',
        totalArea: '',
        livingArea: '',
        yearBuilt: '',
        floor: '',
        totalFloors: '',
        cadastralNumber: '',
        ownershipDocumentNumber: '',
        ownerFullName: '',
        ownerPassport: '',
        ownerPhone: '',
        ownerEmail: '',
        constructionType: '',
        propertyCondition: '',
        hasParking: false,
        hasSecurity: false,
        hasFireAlarm: false,
        hasMortgage: false,
        mortgageBank: '',
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
      console.error('Error submitting real estate insurance application:', err);
      setError('Ошибка при отправке заявки. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h5" gutterBottom>Страхование недвижимости</Typography>
        
        {error && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>}
        
        {/* Property Information Section */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Информация о недвижимости</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Тип недвижимости</InputLabel>
                <Select
                  name="propertyType"
                  value={form.propertyType}
                  label="Тип недвижимости"
                  onChange={handleChange}
                >
                  <MenuItem value="apartment">Квартира</MenuItem>
                  <MenuItem value="house">Дом</MenuItem>
                  <MenuItem value="townhouse">Таунхаус</MenuItem>
                  <MenuItem value="commercial">Коммерческая недвижимость</MenuItem>
                </Select>
              </FormControl>
            </Grid>
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
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Кадастровый номер" 
                name="cadastralNumber" 
                value={form.cadastralNumber} 
                onChange={handleChange} 
                fullWidth 
                required 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Номер документа собственности" 
                name="ownershipDocumentNumber" 
                value={form.ownershipDocumentNumber} 
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
          <Typography variant="h6" gutterBottom>Характеристики недвижимости</Typography>
          <Grid container spacing={2}>
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
                  <MenuItem value="wooden">Деревянный</MenuItem>
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
          message="Заявка на страхование недвижимости успешно отправлена!"
        />
      </Box>
    </LocalizationProvider>
  );
};

export default RealEstateForm; 