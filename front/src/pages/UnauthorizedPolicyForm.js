import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const UnauthorizedPolicyForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [defaultPackage, setDefaultPackage] = useState(null);
  const [packageError, setPackageError] = useState('');

  const [personalData, setPersonalData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [policyData, setPolicyData] = useState({
    address: '',
    passportNumber: '',
    passportIssuedBy: '',
    passportIssuedDate: '',
    birthDate: '',
    additionalInfo: ''
  });

  const steps = ['Личные данные', 'Данные для страховки', 'Подтверждение'];

  useEffect(() => {
    const validateAndFetchPackage = async () => {
      const type = new URLSearchParams(location.search).get('type');
      const id = new URLSearchParams(location.search).get('id');

      // Prevent multiple validations if already validated
      if (defaultPackage) {
        return;
      }

      try {
        if (type === 'package' && id) {
          // Если выбран конкретный пакет, проверяем его
          const response = await api.get('/api/insurance/packages/public');
          const selectedPackage = response.data.find(pkg => pkg.id === parseInt(id) && pkg.active);
          if (!selectedPackage) {
            setPackageError('Выбранный страховой пакет недоступен. Пожалуйста, выберите другой пакет.');
            navigate('/insurance/packages/public');
            return;
          }
          setDefaultPackage(selectedPackage);
        } else if (type && type !== 'package') {
          // Если выбран тип страховки, ищем подходящий активный пакет
          const response = await api.get('/api/insurance/packages/public');
          console.log('Searching for packages with type:', type);
          console.log('Available packages:', response.data);
          
          // Проверяем наличие пакетов
          if (!response.data || response.data.length === 0) {
            console.log('No packages found, creating default package');
            const defaultPackage = {
              id: 1,
              name: `${type} Стандарт`,
              description: `Стандартный пакет ${type}`,
              basePrice: 5000.00,
              discount: 0,
              active: true,
              categories: [{
                id: 1,
                name: type,
                type: type,
                description: `Стандартный пакет ${type}`,
                basePrice: 5000.00
              }]
            };
            setDefaultPackage(defaultPackage);
            return;
          }

          // Ищем пакет с подходящей категорией
          const availablePackage = response.data.find(pkg => {
            console.log('Checking package:', pkg.name, 'Categories:', pkg.categories);
            
            // Если у пакета нет категорий, добавляем категорию текущего типа
            if (!pkg.categories || pkg.categories.length === 0) {
              console.log('Package has no categories, adding current type category');
              pkg.categories = [{
                id: 1,
                name: type,
                type: type,
                description: `Стандартный пакет ${type}`,
                basePrice: pkg.basePrice || 5000.00
              }];
              return true;
            }
            
            return pkg.active && pkg.categories.some(category => {
              const normalizedCategoryType = (category.type || '').toLowerCase().trim();
              const normalizedSearchType = type.toLowerCase().trim();
              console.log('Comparing types:', normalizedCategoryType, normalizedSearchType);
              return normalizedCategoryType === normalizedSearchType;
            });
          });

          if (!availablePackage) {
            console.error('No available package found for type:', type);
            // Используем первый активный пакет и добавляем к нему нужную категорию
            const firstActivePackage = response.data.find(pkg => pkg.active);
            if (firstActivePackage) {
              console.log('Using first active package with new category');
              firstActivePackage.categories = [{
                id: 1,
                name: type,
                type: type,
                description: `Стандартный пакет ${type}`,
                basePrice: firstActivePackage.basePrice || 5000.00
              }];
              setDefaultPackage(firstActivePackage);
              return;
            }
            
            setPackageError('Нет доступных страховых пакетов для выбранного типа страхования.');
            navigate('/insurance/packages/public');
            return;
          }
          setDefaultPackage(availablePackage);
        } else {
          setPackageError('Не указан тип страхования.');
          navigate('/insurance/packages/public');
          return;
        }
      } catch (error) {
        console.error('Error fetching package:', error);
        setPackageError('Ошибка при проверке страхового пакета. Пожалуйста, попробуйте позже.');
        navigate('/insurance/packages/public');
      }
    };

    validateAndFetchPackage();
  }, [location.search, navigate]);

  const handlePersonalDataChange = (e) => {
    const { name, value } = e.target;
    setPersonalData(prevData => {
      const newData = {
        ...prevData,
        [name]: value
      };

      // Automatically set password and confirmPassword when email changes
      if (name === 'email') {
        newData.password = value;
        newData.confirmPassword = value;
      }

      return newData;
    });
  };

  const handlePolicyDataChange = (e) => {
    setPolicyData({
      ...policyData,
      [e.target.name]: e.target.value
    });
  };

  const validatePersonalData = () => {
    if (!personalData.email || !personalData.password || !personalData.firstName || 
        !personalData.lastName || !personalData.phone) {
      setError('Пожалуйста, заполните все обязательные поля');
      return false;
    }
    if (personalData.password !== personalData.confirmPassword) {
      setError('Пароли не совпадают');
      return false;
    }
    if (personalData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return false;
    }
    return true;
  };

  const validatePolicyData = () => {
    if (!policyData.passportNumber || !policyData.passportIssuedBy || 
        !policyData.passportIssuedDate || !policyData.birthDate) {
      setError('Пожалуйста, заполните все обязательные поля');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (activeStep === 0 && !validatePersonalData()) {
      return;
    }
    if (activeStep === 1 && !validatePolicyData()) {
      return;
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const handleSubmit = async () => {
    try {
      if (!defaultPackage) {
        setError('Страховой пакет не выбран или недоступен');
        return;
      }

      setLoading(true);
      setError('');

      const type = new URLSearchParams(location.search).get('type');

      // Отправляем заявку
      const response = await api.post('/api/insurance/unauthorized/apply', {
        email: personalData.email,
        password: personalData.email, // Используем email как пароль
        firstName: personalData.firstName,
        lastName: personalData.lastName,
        middleName: personalData.middleName,
        phone: personalData.phone,
        type: type,
        packageId: defaultPackage.id,
        ...policyData
      });

      // Сохраняем токены и данные пользователя
      const { accessToken, refreshToken, user } = response.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      setSuccess('Заявка успешно создана! Перенаправление в личный кабинет...');
      setTimeout(() => {
        navigate('/profile');
      }, 2000);

    } catch (err) {
      console.error('Error submitting application:', err);
      setError(err.response?.data?.message || 'Произошла ошибка при отправке заявки');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Имя"
                name="firstName"
                value={personalData.firstName}
                onChange={handlePersonalDataChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Фамилия"
                name="lastName"
                value={personalData.lastName}
                onChange={handlePersonalDataChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Отчество"
                name="middleName"
                value={personalData.middleName}
                onChange={handlePersonalDataChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Телефон"
                name="phone"
                value={personalData.phone}
                onChange={handlePersonalDataChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={personalData.email}
                onChange={handlePersonalDataChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Пароль"
                name="password"
                type="password"
                value={personalData.password}
                onChange={handlePersonalDataChange}
                required
                InputProps={{
                  readOnly: true,
                }}
                helperText="Пароль будет совпадать с email"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Подтверждение пароля"
                name="confirmPassword"
                type="password"
                value={personalData.confirmPassword}
                onChange={handlePersonalDataChange}
                required
                InputProps={{
                  readOnly: true,
                }}
                helperText="Пароль будет совпадать с email"
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Адрес"
                name="address"
                value={policyData.address}
                onChange={handlePolicyDataChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Номер паспорта"
                name="passportNumber"
                value={policyData.passportNumber}
                onChange={handlePolicyDataChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Кем выдан"
                name="passportIssuedBy"
                value={policyData.passportIssuedBy}
                onChange={handlePolicyDataChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Дата выдачи"
                name="passportIssuedDate"
                type="date"
                value={policyData.passportIssuedDate}
                onChange={handlePolicyDataChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Дата рождения"
                name="birthDate"
                type="date"
                value={policyData.birthDate}
                onChange={handlePolicyDataChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Дополнительная информация"
                name="additionalInfo"
                multiline
                rows={4}
                value={policyData.additionalInfo}
                onChange={handlePolicyDataChange}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Проверьте введенные данные
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Личные данные:
            </Typography>
            <Typography>
              {personalData.lastName} {personalData.firstName} {personalData.middleName}
            </Typography>
            <Typography>Email: {personalData.email}</Typography>
            <Typography>Телефон: {personalData.phone}</Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Данные для страховки:
            </Typography>
            <Typography>Адрес: {policyData.address}</Typography>
            <Typography>Паспорт: {policyData.passportNumber}</Typography>
            <Typography>Кем выдан: {policyData.passportIssuedBy}</Typography>
            <Typography>Дата выдачи: {policyData.passportIssuedDate}</Typography>
            <Typography>Дата рождения: {policyData.birthDate}</Typography>
            {policyData.additionalInfo && (
              <Typography>
                Дополнительная информация: {policyData.additionalInfo}
              </Typography>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom align="center">
          Оформление страховки
        </Typography>

        {packageError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {packageError}
          </Alert>
        ) : (
          <>
            <Stepper activeStep={activeStep} sx={{ my: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            {renderStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                disabled={activeStep === 0 || loading}
                onClick={handleBack}
              >
                Назад
              </Button>
              <Box>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Отправить заявку'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    disabled={loading}
                  >
                    Далее
                  </Button>
                )}
              </Box>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default UnauthorizedPolicyForm; 