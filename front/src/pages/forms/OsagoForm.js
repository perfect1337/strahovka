import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useNavigate } from 'react-router-dom';
import InsuranceFormWrapper from '../../components/InsuranceFormWrapper';
import api from '../../utils/api';

const steps = ['Данные владельца', 'Данные автомобиля', 'Период страхования', 'Данные водителей'];

const OsagoForm = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    ownerLastName: '',
    ownerFirstName: '',
    ownerMiddleName: '',
    ownerBirthDate: null,
    ownerPassportSeries: '',
    ownerPassportNumber: '',
    ownerAddress: '',
    ownerEmail: '',
    carMake: '',
    carModel: '',
    carYear: '',
    vinNumber: '',
    licensePlate: '',
    registrationCertificate: '',
    registrationDate: null,
    enginePower: '',
    startDate: null,
    endDate: null,
    driversLimit: 'limited',
    regionRegistration: '',
    drivers: [{
      lastName: '',
      firstName: '',
      middleName: '',
      birthDate: null,
      drivingExperience: '',
      licenseNumber: '',
      licenseDate: null,
    }]
  });

  const handleChange = (field) => (event) => {
    const value = event?.target?.value ?? event;
    setFormData(prev => ({...prev, [field]: value}));
  };

  const handleDriverChange = (index, field) => (event) => {
    const value = event?.target?.value ?? event;
    const newDrivers = [...formData.drivers];
    newDrivers[index] = {...newDrivers[index], [field]: value};
    setFormData(prev => ({...prev, drivers: newDrivers}));
  };

  const addDriver = () => {
    setFormData(prev => ({
      ...prev,
      drivers: [...prev.drivers, {
        lastName: '',
        firstName: '',
        middleName: '',
        birthDate: null,
        drivingExperience: '',
        licenseNumber: '',
        licenseDate: null
      }]
    }));
  };

  const removeDriver = (index) => {
    setFormData(prev => ({
      ...prev,
      drivers: prev.drivers.filter((_, i) => i !== index)
    }));
  };

  const renderOwnerForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Фамилия"
          value={formData.ownerLastName}
          onChange={handleChange('ownerLastName')}
          required
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Имя"
          value={formData.ownerFirstName}
          onChange={handleChange('ownerFirstName')}
          required
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Отчество"
          value={formData.ownerMiddleName}
          onChange={handleChange('ownerMiddleName')}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <DatePicker
          label="Дата рождения"
          value={formData.ownerBirthDate}
          onChange={handleChange('ownerBirthDate')}
          slotProps={{ textField: { fullWidth: true, required: true } }}
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          label="Серия паспорта"
          value={formData.ownerPassportSeries}
          onChange={handleChange('ownerPassportSeries')}
          required
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          label="Номер паспорта"
          value={formData.ownerPassportNumber}
          onChange={handleChange('ownerPassportNumber')}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Адрес регистрации"
          value={formData.ownerAddress}
          onChange={handleChange('ownerAddress')}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={formData.ownerEmail}
          onChange={handleChange('ownerEmail')}
          required
          helperText="Необходим для регистрации и отправки информации о полисе"
        />
      </Grid>
    </Grid>
  );

  const renderCarForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Марка"
          value={formData.carMake}
          onChange={handleChange('carMake')}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Модель"
          value={formData.carModel}
          onChange={handleChange('carModel')}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Год выпуска"
          type="number"
          value={formData.carYear}
          onChange={handleChange('carYear')}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="VIN номер"
          value={formData.vinNumber}
          onChange={handleChange('vinNumber')}
          required
          inputProps={{ maxLength: 17 }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Государственный номер"
          value={formData.licensePlate}
          onChange={handleChange('licensePlate')}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="СТС (серия и номер)"
          value={formData.registrationCertificate}
          onChange={handleChange('registrationCertificate')}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <DatePicker
          label="Дата выдачи СТС"
          value={formData.registrationDate}
          onChange={handleChange('registrationDate')}
          slotProps={{ textField: { fullWidth: true, required: true } }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Мощность двигателя (л.с.)"
          type="number"
          value={formData.enginePower}
          onChange={handleChange('enginePower')}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Регион регистрации"
          value={formData.regionRegistration}
          onChange={handleChange('regionRegistration')}
          required
          helperText="Укажите регион регистрации автомобиля"
        />
      </Grid>
    </Grid>
  );

  const renderInsurancePeriodForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <DatePicker
          label="Дата начала"
          value={formData.startDate}
          onChange={handleChange('startDate')}
          slotProps={{ textField: { fullWidth: true, required: true } }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <DatePicker
          label="Дата окончания"
          value={formData.endDate}
          onChange={handleChange('endDate')}
          slotProps={{ textField: { fullWidth: true, required: true } }}
        />
      </Grid>
    </Grid>
  );

  const renderDriversForm = () => (
    <>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Ограничение по водителям</InputLabel>
        <Select
          value={formData.driversLimit}
          onChange={handleChange('driversLimit')}
          label="Ограничение по водителям"
        >
          <MenuItem value="limited">С ограничением</MenuItem>
          <MenuItem value="unlimited">Без ограничений</MenuItem>
        </Select>
      </FormControl>

      {formData.driversLimit === 'limited' && (
        <>
          {formData.drivers.map((driver, index) => (
            <Paper key={index} sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6">
                    Водитель {index + 1}
                    {index > 0 && (
                      <Button
                        color="error"
                        onClick={() => removeDriver(index)}
                        sx={{ ml: 2 }}
                      >
                        Удалить
                      </Button>
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Фамилия"
                    value={driver.lastName}
                    onChange={handleDriverChange(index, 'lastName')}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Имя"
                    value={driver.firstName}
                    onChange={handleDriverChange(index, 'firstName')}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Отчество"
                    value={driver.middleName}
                    onChange={handleDriverChange(index, 'middleName')}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Дата рождения"
                    value={driver.birthDate}
                    onChange={(date) => handleDriverChange(index, 'birthDate')({ target: { value: date } })}
                    slotProps={{ textField: { fullWidth: true, required: true } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Стаж вождения (лет)"
                    value={driver.drivingExperience}
                    onChange={handleDriverChange(index, 'drivingExperience')}
                    required
                    type="number"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Номер водительского удостоверения"
                    value={driver.licenseNumber}
                    onChange={handleDriverChange(index, 'licenseNumber')}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Дата выдачи ВУ"
                    value={driver.licenseDate}
                    onChange={(date) => handleDriverChange(index, 'licenseDate')({ target: { value: date } })}
                    slotProps={{ textField: { fullWidth: true, required: true } }}
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}
          <Button
            variant="outlined"
            onClick={addDriver}
            sx={{ mt: 2 }}
          >
            Добавить водителя
          </Button>
        </>
      )}
    </>
  );

  const renderStepContent = (step) => {
    switch (step) {
      case 0: return renderOwnerForm();
      case 1: return renderCarForm();
      case 2: return renderInsurancePeriodForm();
      case 3: return renderDriversForm();
      default: return null;
    }
  };

  const validateOwnerStep = () => {
    if (!formData.ownerFirstName || !formData.ownerLastName || !formData.ownerEmail ||
        !formData.ownerBirthDate || !formData.ownerPassportSeries || 
        !formData.ownerPassportNumber || !formData.ownerAddress) {
      throw new Error('Пожалуйста, заполните все обязательные поля владельца');
    }
  };

  const validateCarStep = () => {
    if (!formData.carMake || !formData.carModel || !formData.carYear || !formData.vinNumber || 
        !formData.licensePlate || !formData.registrationCertificate || !formData.registrationDate || 
        !formData.enginePower || !formData.regionRegistration) {
      throw new Error('Пожалуйста, заполните все обязательные поля автомобиля');
    }
  };

  const validatePeriodStep = () => {
    if (!formData.startDate || !formData.endDate) {
      throw new Error('Пожалуйста, укажите период страхования');
    }
  };

  const validateDriversStep = () => {
    if (formData.driversLimit === 'limited') {
      const invalidDriver = formData.drivers.find(driver => 
        !driver.lastName || !driver.firstName || !driver.birthDate || 
        !driver.drivingExperience || !driver.licenseNumber || !driver.licenseDate
      );
      if (invalidDriver) {
        throw new Error('Пожалуйста, заполните все обязательные поля для каждого водителя');
      }
    }
  };

  const handleNext = () => {
    try {
      switch (activeStep) {
        case 0:
          validateOwnerStep();
          break;
        case 1:
          validateCarStep();
          break;
        case 2:
          validatePeriodStep();
          break;
        case 3:
          validateDriversStep();
          break;
      }
      setActiveStep(prev => prev + 1);
    } catch (error) {
      alert(error.message);
    }
  };

  const validateForm = () => {
    validateOwnerStep();
    validateCarStep();
    validatePeriodStep();
    validateDriversStep();
  };

  const handleSubmit = async (formDataToSubmit) => {
    try {
      // Validate form before submission
      validateForm();

      // Prepare the data for submission
      const firstDriver = formData.drivers[0] || {};
      const applicationData = {
        // Owner data
        ownerFirstName: formData.ownerFirstName,
        ownerLastName: formData.ownerLastName,
        ownerMiddleName: formData.ownerMiddleName,
        ownerBirthDate: formData.ownerBirthDate,
        ownerPassportSeries: formData.ownerPassportSeries,
        ownerPassportNumber: formData.ownerPassportNumber,
        ownerAddress: formData.ownerAddress,
        ownerEmail: formData.ownerEmail,

        // Car data
        carMake: formData.carMake,
        carModel: formData.carModel,
        carYear: parseInt(formData.carYear),
        vinNumber: formData.vinNumber,
        licensePlate: formData.licensePlate,
        registrationCertificate: formData.registrationCertificate,
        registrationDate: formData.registrationDate,
        enginePower: parseInt(formData.enginePower),
        regionRegistration: formData.regionRegistration,

        // Insurance period
        startDate: formData.startDate,
        endDate: formData.endDate,

        // Driver data
        driversLimit: formData.driversLimit,
        driverLicenseNumber: firstDriver.licenseNumber || '',
        driverExperienceYears: parseInt(firstDriver.drivingExperience) || 0,

        // Application metadata
        applicationType: 'OSAGO',
        status: 'PENDING'
      };

      // Send the OSAGO application
      const response = await api.post('/api/insurance/applications/osago', applicationData);
      
      if (!response.data) {
        throw new Error('Не удалось создать заявку на ОСАГО');
      }

      // Navigate to success page
      navigate('/applications/success', { 
        state: { 
          applicationId: response.data.id,
          calculatedAmount: response.data.calculatedAmount
        } 
      });
    } catch (error) {
      console.error("Error in handleSubmit:", {
        errorMessage: error.response?.data?.message || error.response?.data?.error || error.message || 'Ошибка при отправке заявки',
        errorDetails: error.response?.data || error,
        rawError: error
      });
      
      // Show error to user
      alert(error.response?.data?.message || error.message || 'Произошла ошибка при отправке заявки. Пожалуйста, попробуйте снова.');
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Оформление ОСАГО
      </Typography>
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(formData);
      }}>
        <Box>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {renderStepContent(activeStep)}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button onClick={() => setActiveStep(prev => prev - 1)} disabled={activeStep === 0}>
              Назад
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button variant="contained" color="primary" type="submit">
                Оформить
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext}>
                Далее
              </Button>
            )}
          </Box>
        </Box>
      </form>
    </Container>
  );
};

export default OsagoForm; 