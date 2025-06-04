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
  Alert,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { message } from 'antd';
import { DatePicker } from '@mui/x-date-pickers';
import { useNavigate } from 'react-router-dom';
import InsuranceFormWrapper from '../../components/InsuranceFormWrapper';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const steps = ['Данные владельца', 'Данные автомобиля', 'Период страхования', 'Данные водителей'];

const OsagoFormContent = ({ isAuthenticated, onSubmit: onSubmitFromWrapper, isPartOfPackage }) => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [apiError, setApiError] = useState(null);

  const [formData, setFormData] = useState({
    ownerLastName: '',
    ownerFirstName: '',
    ownerMiddleName: '',
    ownerBirthDate: null,
    ownerPassportSeries: '',
    ownerPassportNumber: '',
    ownerAddress: '',
    carMake: '',
    carModel: '',
    carYear: '',
    vinNumber: '',
    licensePlate: '',
    registrationCertificate: '',
    registrationDate: null,
    enginePower: '',
    regionRegistration: '',
    startDate: null,
    endDate: null,
    duration: 12,
    isUnlimitedDrivers: false,
    drivers: [{
      lastName: '',
      firstName: '',
      middleName: '',
      birthDate: null,
      drivingExperience: '',
      licenseNumber: '',
      licenseDate: null,
    }],
    hasAccidentsLastYear: false,
    previousPolicyNumber: '',
    notes: ''
  });

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
    setFormError(null);
    setApiError(null);
  };

  const handleDateChange = (field) => (date) => {
    setFormData({
      ...formData,
      [field]: date
    });
    setFormError(null);
    setApiError(null);
  };

  const handleDriverChange = (index, field) => (event) => {
    const newDrivers = [...formData.drivers];
    newDrivers[index] = {
      ...newDrivers[index],
      [field]: event.target.value
    };
    setFormData({
      ...formData,
      drivers: newDrivers
    });
    setFormError(null);
    setApiError(null);
  };

  const handleDriverDateChange = (index, field) => (date) => {
    const newDrivers = [...formData.drivers];
    newDrivers[index] = {
      ...newDrivers[index],
      [field]: date
    };
    setFormData({
      ...formData,
      drivers: newDrivers
    });
    setFormError(null);
    setApiError(null);
  };

  const addDriver = () => {
    if (!formData.isUnlimitedDrivers) {
      setFormData({
        ...formData,
        drivers: [
          ...formData.drivers,
          {
            lastName: '',
            firstName: '',
            middleName: '',
            birthDate: null,
            drivingExperience: '',
            licenseNumber: '',
            licenseDate: null,
          }
        ]
      });
    }
  };

  const removeDriver = (index) => {
    const newDrivers = formData.drivers.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      drivers: newDrivers
    });
  };

  const validateStep = () => {
    switch (activeStep) {
      case 0:
        if (!formData.ownerLastName || !formData.ownerFirstName || !formData.ownerBirthDate ||
            !formData.ownerPassportSeries || !formData.ownerPassportNumber || !formData.ownerAddress) {
          setFormError('Пожалуйста, заполните все обязательные поля');
          return false;
        }
        break;
      case 1:
        if (!formData.carMake || !formData.carModel || !formData.carYear || !formData.vinNumber ||
            !formData.licensePlate || !formData.registrationCertificate || !formData.registrationDate ||
            !formData.enginePower || !formData.regionRegistration) {
          setFormError('Пожалуйста, заполните все обязательные поля');
          return false;
        }
        break;
      case 2:
        if (!formData.startDate || !formData.endDate) {
          setFormError('Пожалуйста, укажите период страхования');
          return false;
        }
        break;
      case 3:
        if (!formData.drivers.length || !formData.drivers[0] || !formData.drivers[0].licenseNumber) {
          setFormError('Необходимо указать хотя бы одного водителя с номером водительского удостоверения');
          return false;
        }
        
        if (!formData.isUnlimitedDrivers && formData.drivers.some(driver => 
          !driver.lastName || !driver.firstName || !driver.birthDate ||
          !driver.drivingExperience || !driver.licenseNumber || !driver.licenseDate
        )) {
          setFormError('Пожалуйста, заполните данные всех водителей');
          return false;
        }
        break;
      default:
        return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevStep) => prevStep + 1);
      setFormError(null);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setFormError(null);
    setApiError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateStep()) {
      return;
    }

    try {
      setLoading(true);
      setApiError(null);

      // Подготовка данных для отправки
      const submissionData = {
        ...formData,
        // Если неограниченное количество водителей, используем данные владельца
        driverLicenseNumber: formData.isUnlimitedDrivers 
          ? formData.drivers[0]?.licenseNumber // Если есть водители, берем номер ВУ первого
          : formData.drivers[0]?.licenseNumber, // Если нет, все равно нужен хотя бы один водитель
        // Преобразование дат в строки ISO
        ownerBirthDate: formData.ownerBirthDate?.toISOString(),
        registrationDate: formData.registrationDate?.toISOString(),
        startDate: formData.startDate?.toISOString(),
        endDate: formData.endDate?.toISOString(),
        // Добавляем опыт вождения из данных первого водителя
        driverExperienceYears: parseInt(formData.drivers[0]?.drivingExperience) || 0
      };

      // Если форма является частью пакета, используем onSubmit из props
      if (isPartOfPackage) {
        await onSubmitFromWrapper(submissionData);
        return;
      }

      // Стандартная логика для отдельной формы ОСАГО
      const response = await api.post('/api/insurance/applications/osago', submissionData);
      
      if (response.data) {
        message.success('Заявка на ОСАГО успешно отправлена');
        navigate('/profile');
      }
    } catch (error) {
      console.error('Error submitting OSAGO form:', error);
      setApiError(error.response?.data?.message || 'Ошибка при отправке формы');
      throw error; // Пробрасываем ошибку дальше для обработки в родительском компоненте
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Фамилия"
                value={formData.ownerLastName}
                onChange={handleInputChange('ownerLastName')}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Имя"
                value={formData.ownerFirstName}
                onChange={handleInputChange('ownerFirstName')}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Отчество"
                value={formData.ownerMiddleName}
                onChange={handleInputChange('ownerMiddleName')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Дата рождения"
                value={formData.ownerBirthDate}
                onChange={handleDateChange('ownerBirthDate')}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Серия паспорта"
                value={formData.ownerPassportSeries}
                onChange={handleInputChange('ownerPassportSeries')}
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Номер паспорта"
                value={formData.ownerPassportNumber}
                onChange={handleInputChange('ownerPassportNumber')}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Адрес регистрации"
                value={formData.ownerAddress}
                onChange={handleInputChange('ownerAddress')}
                required
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Марка автомобиля"
                value={formData.carMake}
                onChange={handleInputChange('carMake')}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Модель автомобиля"
                value={formData.carModel}
                onChange={handleInputChange('carModel')}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Год выпуска"
                type="number"
                value={formData.carYear}
                onChange={handleInputChange('carYear')}
                required
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="VIN номер"
                value={formData.vinNumber}
                onChange={handleInputChange('vinNumber')}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Гос. номер"
                value={formData.licensePlate}
                onChange={handleInputChange('licensePlate')}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="СТС"
                value={formData.registrationCertificate}
                onChange={handleInputChange('registrationCertificate')}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <DatePicker
                label="Дата регистрации"
                value={formData.registrationDate}
                onChange={handleDateChange('registrationDate')}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Мощность двигателя (л.с.)"
                type="number"
                value={formData.enginePower}
                onChange={handleInputChange('enginePower')}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Регион регистрации"
                value={formData.regionRegistration}
                onChange={handleInputChange('regionRegistration')}
                required
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Дата начала"
                value={formData.startDate}
                onChange={handleDateChange('startDate')}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Дата окончания"
                value={formData.endDate}
                onChange={handleDateChange('endDate')}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isUnlimitedDrivers}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      isUnlimitedDrivers: e.target.checked,
                      drivers: e.target.checked ? [] : formData.drivers
                    });
                  }}
                />
              }
              label="Неограниченное количество водителей"
            />
            {!formData.isUnlimitedDrivers && (
              <>
                {formData.drivers.map((driver, index) => (
                  <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="h6">
                          Водитель {index + 1}
                          {index > 0 && (
                            <Button
                              color="error"
                              onClick={() => removeDriver(index)}
                              sx={{ float: 'right' }}
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
                      <Grid item xs={12} md={4}>
                        <DatePicker
                          label="Дата рождения"
                          value={driver.birthDate}
                          onChange={handleDriverDateChange(index, 'birthDate')}
                          renderInput={(params) => <TextField {...params} fullWidth required />}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Стаж вождения"
                          type="number"
                          value={driver.drivingExperience}
                          onChange={handleDriverChange(index, 'drivingExperience')}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Номер ВУ"
                          value={driver.licenseNumber}
                          onChange={handleDriverChange(index, 'licenseNumber')}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <DatePicker
                          label="Дата выдачи ВУ"
                          value={driver.licenseDate}
                          onChange={handleDriverDateChange(index, 'licenseDate')}
                          renderInput={(params) => <TextField {...params} fullWidth required />}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ))}
                <Button onClick={addDriver} variant="outlined" fullWidth>
                  Добавить водителя
                </Button>
              </>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Оформление ОСАГО
      </Typography>

      <Stepper activeStep={activeStep} sx={{ my: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <form onSubmit={handleSubmit}>
        {formError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        )}

        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}

        {renderStepContent(activeStep)}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0 || loading}
          >
            Назад
          </Button>
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Отправка...' : (isPartOfPackage ? 'Далее' : 'Оформить полис')}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading}
              >
                Далее
              </Button>
            )}
          </Box>
        </Box>
      </form>
    </Paper>
  );
};

const OsagoForm = ({ isPartOfPackage, packageId, onSubmit: parentOnSubmit }) => {
  const handleSubmit = async (data) => {
    try {
      if (isPartOfPackage && packageId) {
        // Если форма является частью пакета, используем parentOnSubmit
        return await parentOnSubmit(data);
      }

      // Стандартная логика для отдельной формы ОСАГО
      const response = await api.post('/api/insurance/applications/osago', data);
      return response;
    } catch (error) {
      console.error('Error in OsagoForm handleSubmit:', error);
      throw error;
    }
  };

  return (
    <InsuranceFormWrapper onSubmit={handleSubmit}>
      <OsagoFormContent isPartOfPackage={isPartOfPackage} />
    </InsuranceFormWrapper>
  );
};

export default OsagoForm; 