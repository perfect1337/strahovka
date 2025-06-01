import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  Alert,
  Container,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

// Import forms
import KaskoForm from '../components/forms/KaskoForm';
import OsagoForm from '../pages/forms/OsagoForm';

const InsurancePackageForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [packageId, setPackageId] = useState(null);
  const [packageType, setPackageType] = useState('KASKO_OSAGO');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [kaskoCompleted, setKaskoCompleted] = useState(false);
  const [osagoCompleted, setOsagoCompleted] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const steps = ['Выбор пакета', 'Оформление страховок', 'Подтверждение'];

  const handleCreatePackage = async () => {
    try {
      const response = await api.post('/api/insurance/packages', packageType);
      setPackageId(response.data.id);
      setActiveStep(1);
    } catch (err) {
      setError('Ошибка при создании пакета');
      console.error(err);
    }
  };

  const handleKaskoSubmit = async (kaskoData) => {
    try {
      if (!packageId) {
        setError('ID пакета не найден. Пожалуйста, начните заново.');
        return;
      }
      
      await api.post(`/api/insurance/packages/${packageId}/applications/kasko`, {
        ...kaskoData,
        packageId: packageId
      });
      setKaskoCompleted(true);
      
      // Если ОСАГО тоже заполнено, переходим к подтверждению
      if (osagoCompleted) {
        setActiveStep(2);
      }
    } catch (err) {
      setError('Ошибка при отправке формы КАСКО');
      console.error(err);
    }
  };

  const handleOsagoSubmit = async (osagoData) => {
    try {
      if (!packageId) {
        setError('ID пакета не найден. Пожалуйста, начните заново.');
        return;
      }

      await api.post(`/api/insurance/packages/${packageId}/applications/osago`, {
        ...osagoData,
        packageId: packageId
      });
      setOsagoCompleted(true);
      
      // Если КАСКО тоже заполнено, переходим к подтверждению
      if (kaskoCompleted) {
        setActiveStep(2);
      }
    } catch (err) {
      setError('Ошибка при отправке формы ОСАГО');
      console.error(err);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Выберите тип страхового пакета
            </Typography>
            <Typography paragraph>
              КАСКО + ОСАГО со скидкой 15% на общую стоимость
            </Typography>
            <Button
              variant="contained"
              onClick={handleCreatePackage}
              fullWidth
            >
              Создать пакет КАСКО + ОСАГО
            </Button>
          </Paper>
        );
      case 1:
        return (
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Шаг 1: КАСКО {kaskoCompleted && '✓'}
                </Typography>
                <KaskoForm 
                  onSubmit={handleKaskoSubmit}
                  isPartOfPackage={true}
                  packageId={packageId}
                />
              </Paper>

              <Divider />

              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Шаг 2: ОСАГО {osagoCompleted && '✓'}
                </Typography>
                <OsagoForm 
                  onSubmit={handleOsagoSubmit}
                  isPartOfPackage={true}
                  packageId={packageId}
                />
              </Paper>
            </Box>
          </Container>
        );
      case 2:
        return (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Подтверждение
            </Typography>
            <Typography paragraph>
              Ваш страховой пакет успешно создан. Вы будете перенаправлены в личный кабинет через 3 секунды.
            </Typography>
            {success && setTimeout(() => navigate('/profile'), 3000)}
          </Paper>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%', mt: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Страховой пакет успешно оформлен!
        </Alert>
      )}

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderStepContent(activeStep)}

      {activeStep > 0 && activeStep < 2 && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
          <Button onClick={handleBack}>
            Назад
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default InsurancePackageForm; 