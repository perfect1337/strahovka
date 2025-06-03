import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Alert, 
  Snackbar,
  Grid,
  Paper,
  Container
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import InsuranceFormWrapper from '../../components/InsuranceFormWrapper';
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

// Helper to format date
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

const RealEstateFormContent = ({ isAuthenticated, onSubmit: onSubmitFromWrapper }) => {
  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);
  const [calculatedAmount, setCalculatedAmount] = useState(null);
  
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    if (isAuthenticated && auth.user) {
      setForm(prev => ({
        ...prev,
        ownerFullName: `${auth.user.firstName || ''} ${auth.user.lastName || ''} ${auth.user.middleName || ''}`.trim(),
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
    const requiredFieldsBase = [
      'propertyType',
      'address',
      'totalArea',
      'yearBuilt',
      'cadastralNumber',
      'ownershipDocumentNumber',
      'constructionType',
      'propertyValue',
      'startDate',
      'endDate'
    ];
    
    const requiredOwnerFields = isAuthenticated ? ['ownerFullName', 'ownerPassport', 'ownerPhone'] : ['ownerFullName', 'ownerPassport', 'ownerPhone'];
    
    const allRequired = [...requiredFieldsBase, ...requiredOwnerFields];

    for (const field of allRequired) {
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

    const nameParts = form.ownerFullName.trim().split(' ');
    const ownerFirstName = nameParts[0] || '';
    const ownerLastName = nameParts.length > 1 ? nameParts[1] : '';
    const ownerMiddleName = nameParts.length > 2 ? nameParts.slice(2).join(' ') : '';

    const applicationDataForWrapper = {
      ownerFirstName: ownerFirstName,
      ownerLastName: ownerLastName,
      ownerMiddleName: ownerMiddleName,
      propertyType: form.propertyType,
      address: form.address,
      propertyArea: form.totalArea ? new Decimal(form.totalArea).toString() : null,
      yearBuilt: form.yearBuilt ? parseInt(form.yearBuilt, 10) : null,
      constructionType: form.constructionType,
      propertyValue: form.propertyValue ? new Decimal(form.propertyValue).toString() : null,
      hasSecuritySystem: form.hasSecuritySystem,
      hasFireAlarm: form.hasFireAlarm,
      ownershipDocumentNumber: form.ownershipDocumentNumber,
      cadastralNumber: form.cadastralNumber,
      hasMortgage: form.hasMortgage,
      mortgageBank: form.mortgageBank,
      passportSeries: form.ownerPassport.substring(0, 4),
      passportNumber: form.ownerPassport.substring(4),
      phone: form.ownerPhone,
      startDate: formatDateForApi(form.startDate),
      endDate: formatDateForApi(form.endDate),
      notes: form.description
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
        setCalculatedAmount(response.data.calculatedAmount);
        setSuccessInfo(`Заявка успешно отправлена! ID: ${response.data.id}. Рассчитанная сумма: ${Number(response.data.calculatedAmount || 0).toLocaleString('ru-RU')} ₽. Вы будете перенаправлены через 3 секунды.`);
        
        setTimeout(() => {
          navigate('/profile');
        }, 3000);
      } else {
        setApiError("Не удалось получить ожидаемые данные от сервера.");
      }
    } catch (error) {
      console.error('Property application error (RealEstateFormContent):', error);
      const errorData = error.response?.data;
      let errorMessage = 'Ошибка при создании заявки на страхование недвижимости.';
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
          Страхование недвижимости
        </Typography>
        
        {apiError && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{apiError}</Alert>}
        {formError && <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>{formError}</Alert>}
        
        {successInfo && (
          <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
            {successInfo}
          </Alert>
        )}
        
        <PropertyInfoSection form={form} handleChange={handleChange} />
        <OwnerInfoSection form={form} handleChange={handleChange} isAuthenticated={isAuthenticated} />
        <PropertyDetailsSection form={form} handleChange={handleChange} />
        <InsuranceOptionsSection form={form} handleChange={handleChange} />
        <CoveragePeriodSection form={form} handleDateChange={handleDateChange} />
        <PropertyValueSection form={form} handleChange={handleChange} />

        <Button 
          variant="contained" 
          size="large"
          fullWidth
          sx={{ mt: 2 }} 
          disabled={loading}
          onClick={handleSubmitClick}
        >
          {loading ? 'Отправка...' : 'Отправить заявку'}
        </Button>
      </Paper>
    </LocalizationProvider>
  );
};

const RealEstateForm = () => {
  const auth = useAuth();

  const handleSubmitFromWrapper = async (dataFromWrapper) => {
    let url;
    if (!auth.user && dataFromWrapper.email) {
      url = '/api/insurance/unauthorized/property';
    } else {
      url = '/api/insurance/applications/property';
    }
    console.log(`[RealEstateForm] Submitting to URL: ${url} with payload:`, JSON.stringify(dataFromWrapper));
    return api.post(url, dataFromWrapper); 
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <InsuranceFormWrapper onSubmit={handleSubmitFromWrapper}>
        <RealEstateFormContent />
      </InsuranceFormWrapper>
    </Container>
  );
};

export default RealEstateForm; 