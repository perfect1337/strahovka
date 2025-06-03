import React, { useState, useEffect } from 'react';
// import { useSearchParams, useNavigate } from 'react-router-dom'; // Старый импорт
import { useParams, useNavigate } from 'react-router-dom'; // Новый импорт
import { Container, Typography, Box, Stepper, Step, StepLabel, Button, Paper, CircularProgress, Alert } from '@mui/material';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

// Импорты форм будут добавлены позже
import KaskoForm from '../components/forms/KaskoForm';
import OsagoForm from '../components/policy-forms/OsagoForm';
// import HealthForm from '../components/forms/HealthForm'; // Предполагаемый путь, если существует
// import TravelForm from '../components/forms/TravelForm'; // Предполагаемый путь, если существует
// import PropertyForm from '../components/forms/PropertyForm'; // Предполагаемый путь, если существует

const PackageApplicationStepper = () => {
  // const [searchParams] = useSearchParams(); // Убираем
  const navigate = useNavigate();
  const { id: packageId } = useParams(); // Используем useParams
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [packageDetails, setPackageDetails] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [applicationData, setApplicationData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!packageId) {
      setError('ID пакета не найден в URL.');
      setLoading(false);
      return;
    }

    const fetchPackageDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/insurance/packages/${packageId}`);
        setPackageDetails(response.data);
        // Создаем шаги на основе категорий пакета
        if (response.data && response.data.categories) {
          const packageSteps = response.data.categories.map(category => ({
            label: category.name,
            type: category.type,
            id: category.id
          }));
          setSteps(packageSteps);
        }
        setError('');
      } catch (err) {
        console.error("Ошибка загрузки деталей пакета:", err);
        setError('Не удалось загрузить детали пакета. ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchPackageDetails();
  }, [packageId]);
  
  useEffect(() => {
    if (packageDetails && packageDetails.categories) {
      const packageSteps = packageDetails.categories.map(category => ({
        label: category.name, // Будет использоваться как название шага
        type: category.type,   // Технический тип для определения какую форму рендерить
        id: category.id
      }));
      setSteps(packageSteps);
    }
  }, [packageDetails]);


  const handleNext = async (formDataFromChild) => {
    console.log(`[PackageApplicationStepper] handleNext for step ${activeStep}, received formData:`, JSON.stringify(formDataFromChild, null, 2));

    const newApplicationData = {
      ...applicationData,
      [activeStep]: formDataFromChild
    };

    setApplicationData(newApplicationData);
    console.log("[PackageApplicationStepper] applicationData after current step's data saved (synchronous view before re-render):", JSON.stringify(newApplicationData, null, 2));

    if (activeStep === steps.length - 1) {
      // Last step - submit all data, passing the most recent state directly
      await handleSubmitAll(newApplicationData); 
    } else {
      setActiveStep(prevStep => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setApplicationData({});
  };
  
  const handleSubmitAll = async (currentData) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError('');

    const dataToUse = currentData || applicationData; // Use currentData if passed (for final step), otherwise fallback to state

    console.log("[PackageApplicationStepper] handleSubmitAll called. Current activeStep (at time of call, might be last step index):", activeStep);
    console.log("[PackageApplicationStepper] handleSubmitAll: Effective applicationData being used for mapping:", JSON.stringify(dataToUse, null, 2));

    steps.forEach((step, index) => {
      console.log(`[PackageApplicationStepper] handleSubmitAll: Data for step ${index} ('${step.label}') from dataToUse:`, JSON.stringify(dataToUse[index], null, 2));
    });

    try {
      const applications = steps.map((step, index) => {
        const stepData = dataToUse[index] || {}; 
        console.log(`[PackageApplicationStepper] handleSubmitAll: Mapping step ${index} ('${step.label}'). Data being used from stepData:`, JSON.stringify(stepData, null, 2));
        return {
          type: step.type,
          label: step.label,
          data: {
            ...stepData, // Data from the specific form step
            // User details are merged here, potentially overwriting if keys conflict (e.g. email)
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            middleName: user.middleName,
            phone: user.phone
          }
        };
      });

      console.log("[PackageApplicationStepper] Data being sent to /apply endpoint:", JSON.stringify(applications, null, 2));

      await api.post(`/api/insurance/packages/${packageId}/apply`, {
        applications
      });

      navigate('/profile', { 
        state: { 
          success: true,
          message: 'Страховой пакет успешно оформлен и отправлен на обработку!' 
        } 
      });
    } catch (err) {
      console.error("Ошибка оформления пакета:", err);
      let errorMessage = 'Не удалось оформить пакет.';
      if (err.response?.data?.message) {
        errorMessage += ' ' + err.response.data.message;
      } else if (err.message) {
        errorMessage += ' ' + err.message;
      }
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const renderStepContent = (stepIndex) => {
    if (!steps[stepIndex]) return null;
    
    const currentStep = steps[stepIndex];
    const commonProps = {
      onSubmit: handleNext,
      initialData: applicationData[stepIndex],
      isPartOfPackage: true,
      packageId
    };

    switch (currentStep.type.toUpperCase()) {
      case 'AUTO':
        if (currentStep.label.toUpperCase().includes('КАСКО')) {
          return <KaskoForm {...commonProps} />;
        }
        if (currentStep.label.toUpperCase().includes('ОСАГО')) {
          return <OsagoForm {...commonProps} />;
        }
        return <Typography>Неподдерживаемый тип авто-страхования: {currentStep.label}</Typography>;
      case 'TRAVEL':
        return <Typography>Форма для Путешествий ({currentStep.label}). Нажмите "Далее", чтобы симулировать заполнение.</Typography>;
      case 'HEALTH':
        return <Typography>Форма для Здоровья ({currentStep.label}). Нажмите "Далее", чтобы симулировать заполнение.</Typography>;
      case 'PROPERTY':
        return <Typography>Форма для Недвижимости ({currentStep.label}). Нажмите "Далее", чтобы симулировать заполнение.</Typography>;
      default:
        return <Typography>Неподдерживаемый тип страхования: {currentStep.type}</Typography>;
    }
  };

  if (loading) {
    return <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Container>;
  }

  if (error) {
    return <Container><Alert severity="error" sx={{ mt: 2 }}>{error}</Alert></Container>;
  }
  
  if (!packageDetails) {
     return <Container><Alert severity="warning" sx={{ mt: 2 }}>Детали пакета не загружены.</Alert></Container>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          Оформление пакета: {packageDetails.name}
        </Typography>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((step, index) => (
            <Step key={step.label + index}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box>
          {renderStepContent(activeStep)}
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, mt: 3, borderTop: '1px solid lightgray' }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Назад
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default PackageApplicationStepper; 