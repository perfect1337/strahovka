import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Alert, 
  Snackbar,
  Grid,
  Paper
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Decimal from 'decimal.js';

// Form section components
import PropertyInfoSection from './sections/PropertyInfoSection';
import OwnerInfoSection from './sections/OwnerInfoSection';
import PropertyDetailsSection from './sections/PropertyDetailsSection';
import InsuranceOptionsSection from './sections/InsuranceOptionsSection';
import CoveragePeriodSection from './sections/CoveragePeriodSection';
import PropertyValueSection from './sections/PropertyValueSection';

const initialFormState = {
  propertyType: '',
  address: '',
  totalArea: '',
  yearBuilt: '',
  cadastralNumber: '',
  ownershipDocumentNumber: '',
  ownerFullName: '',
  ownerPassport: '',
  ownerPhone: '',
  ownerEmail: '',
  constructionType: '',
  hasSecuritySystem: false,
  hasFireAlarm: false,
  hasMortgage: false,
  mortgageBank: '',
  startDate: null,
  endDate: null,
  propertyValue: '',
  description: ''
};

const RealEstateForm = () => {
  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [calculatedAmount, setCalculatedAmount] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

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
      'propertyType',
      'address',
      'totalArea',
      'yearBuilt',
      'cadastralNumber',
      'ownershipDocumentNumber',
      'ownerFullName',
      'ownerPassport',
      'ownerPhone',
      'ownerEmail',
      'constructionType',
      'propertyValue',
      'startDate',
      'endDate'
    ];

    return requiredFields.every(field => form[field]);
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
        hasSecuritySystem: form.hasSecuritySystem,
        hasFireAlarm: form.hasFireAlarm,
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

      const response = await api.post('/api/insurance/property', formData);
      setCalculatedAmount(response.data.calculatedAmount);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
      
      setForm(initialFormState);
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
        
        {success && (
          <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
            Заявка успешно отправлена! Рассчитанная сумма страхования: {Number(calculatedAmount).toLocaleString('ru-RU')} ₽
            <br />
            Через 3 секунды вы будете перенаправлены в личный кабинет.
          </Alert>
        )}
        
        <PropertyInfoSection form={form} handleChange={handleChange} />
        <OwnerInfoSection form={form} handleChange={handleChange} />
        <PropertyDetailsSection form={form} handleChange={handleChange} />
        <InsuranceOptionsSection form={form} handleChange={handleChange} />
        <CoveragePeriodSection form={form} handleDateChange={handleDateChange} />
        <PropertyValueSection form={form} handleChange={handleChange} />

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