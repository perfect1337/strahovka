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
import { DatePicker } from '@mui/x-date-pickers';
import { useNavigate } from 'react-router-dom';
import InsuranceFormWrapper from '../../components/InsuranceFormWrapper';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const steps = ['Данные владельца', 'Данные автомобиля', 'Период страхования', 'Данные водителей'];

const OsagoFormContent = ({ isAuthenticated, onSubmit: onSubmitFromWrapper }) => {
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
    notes: '',
  });

  const handleChange = (field) => (eventOrValue) => {
    let valueToSet;
    const target = eventOrValue.target;

    if (field === 'isUnlimitedDrivers' || field === 'hasAccidentsLastYear') {
      valueToSet = target.checked; // Напрямую из event.target.checked для чекбоксов
    } else if (target && typeof target.value !== 'undefined') {
      valueToSet = target.value; // Для стандартных инпутов
    } else {
      valueToSet = eventOrValue; // Для компонентов типа DatePicker, которые передают значение напрямую
    }
    
    setFormData(prev => ({ ...prev, [field]: valueToSet }));
  };

  const handleDriverChange = (index, field) => (eventOrValue) => {
    let valueToSet;
    const target = eventOrValue.target;
    if (target && typeof target.value !== 'undefined') {
      valueToSet = target.value;
    } else {
      valueToSet = eventOrValue;
    }
    const newDrivers = [...formData.drivers];
    newDrivers[index] = { ...newDrivers[index], [field]: valueToSet };
    setFormData(prev => ({ ...prev, drivers: newDrivers }));
  };

  const addDriver = () => {
    setFormData(prev => ({
      ...prev,
      drivers: [...prev.drivers, {
        lastName: '', firstName: '', middleName: '', birthDate: null,
        drivingExperience: '', licenseNumber: '', licenseDate: null,
      }]
    }));
  };

  const removeDriver = (index) => {
    const newDrivers = [...formData.drivers];
    newDrivers.splice(index, 1);
    setFormData(prev => ({ ...prev, drivers: newDrivers }));
  };

  const validateStep = () => {
    // TODO: Добавить более строгую валидацию, если необходимо
    // Например, для VIN, дат и т.д.
    if (activeStep === 1 && formData.vinNumber && formData.vinNumber.length !== 17) {
        setFormError('VIN номер должен состоять из 17 символов.');
        return false;
    }
    setFormError(null);
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => setActiveStep(prev => prev - 1);

  const formatDateForApi = (date) => {
    if (!date) return null;
    if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) return date;
    try {
      const d = new Date(date);
      // Проверка на валидность даты, т.к. new Date('невалидная строка') дает Invalid Date
      if (isNaN(d.getTime())) {
          console.warn("Invalid date object for formatting: ", date);
          return null;
      }
      return d.toISOString().split('T')[0];
    } catch (e) {
      console.warn("Error formatting date: ", date, e);
      return null;
    }
  };

  // Эта функция вызывается при нажатии на кнопку "Оформить полис"
  const handleSubmitClick = async () => {
    if (!validateStep()) return;

    setLoading(true);
    setApiError(null);
    setFormError(null);

    // 1. Подготовка данных, специфичных для ОСАГО (включая owner* если нужны для неавторизованного)
    // InsuranceFormWrapper ожидает поля ownerFirstName, ownerLastName, ownerMiddleName в объекте,
    // который ему передается, чтобы использовать их для регистрации нового пользователя.
    const applicationDataForWrapper = {
      // Данные владельца/пользователя (эти поля прочитает InsuranceFormWrapper)
      ownerFirstName: formData.ownerFirstName,
      ownerLastName: formData.ownerLastName,
      ownerMiddleName: formData.ownerMiddleName,
      
      // Остальные данные ОСАГО
      ownerBirthDate: formatDateForApi(formData.ownerBirthDate),
      ownerPassportSeries: formData.ownerPassportSeries,
      ownerPassportNumber: formData.ownerPassportNumber,
      ownerAddress: formData.ownerAddress,

      carMake: formData.carMake,
      carModel: formData.carModel,
      carYear: formData.carYear ? parseInt(formData.carYear, 10) : null,
      vinNumber: formData.vinNumber, // VIN должен быть 17 символов, валидация выше
      licensePlate: formData.licensePlate,
      registrationCertificate: formData.registrationCertificate,
      registrationDate: formatDateForApi(formData.registrationDate),
      enginePower: formData.enginePower ? parseInt(formData.enginePower, 10) : null,
      regionRegistration: formData.regionRegistration,
      startDate: formatDateForApi(formData.startDate),
      endDate: formatDateForApi(formData.endDate),
      duration: formData.duration ? parseInt(formData.duration, 10) : 12,
      isUnlimitedDrivers: Boolean(formData.isUnlimitedDrivers), // Убедимся, что это boolean
      drivers: formData.isUnlimitedDrivers ? [] : formData.drivers.map(d => ({
        ...d,
        birthDate: formatDateForApi(d.birthDate),
        drivingExperience: d.drivingExperience ? parseInt(d.drivingExperience, 10) : 0,
        licenseDate: formatDateForApi(d.licenseDate),
      })),
      hasAccidentsLastYear: Boolean(formData.hasAccidentsLastYear), // Убедимся, что это boolean
      previousPolicyNumber: formData.previousPolicyNumber,
      notes: formData.notes,
    };

    try {
      // 2. Вызываем onSubmitFromWrapper (это handleFormSubmit из InsuranceFormWrapper)
      // Он подготовит данные для API (добавит email/password если нужно) и вызовет 
      // handleSubmitFromWrapper из OsagoForm (верхнеуровневый), который сделает POST.
      // Теперь InsuranceFormWrapper.handleFormSubmit ВОЗВРАЩАЕТ промис от вызова API.
      console.log('[OsagoFormContent] Calling onSubmitFromWrapper with:', JSON.stringify(applicationDataForWrapper));
      const response = await onSubmitFromWrapper(applicationDataForWrapper);

      // 3. Обрабатываем успешный ответ
      if (response?.data) {
        if (!isAuthenticated && response.data.accessToken) {
          // Пользователь был создан, логиним его
          localStorage.setItem('token', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          await auth.validateAndGetUser(); // Обновляем AuthContext
        }
        navigate('/applications/success', {
          state: {
            applicationId: response.data.id,
            calculatedAmount: response.data.calculatedAmount,
            isNewUser: !isAuthenticated && !!response.data.accessToken,
            email: response.data.email, // email из ответа сервера
          }
        });
      } else {
        // Этот случай маловероятен, если API вернуло 2xx, но без data, или если response сам по себе undefined
        setApiError("Не удалось получить ожидаемые данные от сервера.");
      }
    } catch (error) {
      // Ошибки от API (включая ошибки валидации с бэкенда или сетевые)
      // InsuranceFormWrapper уже мог установить свою ошибку, но мы можем ее переопределить/дополнить
      console.error('OSAGO application error (OsagoFormContent):', error);
      const errorData = error.response?.data;
      let errorMessage = 'Ошибка при создании заявки ОСАГО. Пожалуйста, попробуйте снова.';
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData && (errorData.error || errorData.message)) {
        errorMessage = errorData.error || errorData.message;
      } else if (Array.isArray(errorData)) {
        errorMessage = errorData.join(', ');
      } else if (error.message) { // Ошибка из InsuranceFormWrapper или другая JS ошибка
        errorMessage = error.message;
      }
      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const renderOwnerForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={4}>
        <TextField fullWidth label="Фамилия владельца" name="ownerLastName" value={formData.ownerLastName} onChange={handleChange('ownerLastName')} required={!isAuthenticated} />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField fullWidth label="Имя владельца" name="ownerFirstName" value={formData.ownerFirstName} onChange={handleChange('ownerFirstName')} required={!isAuthenticated} />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField fullWidth label="Отчество владельца" name="ownerMiddleName" value={formData.ownerMiddleName} onChange={handleChange('ownerMiddleName')} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <DatePicker label="Дата рождения владельца" value={formData.ownerBirthDate} onChange={handleChange('ownerBirthDate')} slotProps={{ textField: { fullWidth: true, required: !isAuthenticated } }} />
      </Grid>
      <Grid item xs={12} sm={3}>
        <TextField fullWidth label="Серия паспорта" name="ownerPassportSeries" value={formData.ownerPassportSeries} onChange={handleChange('ownerPassportSeries')} required={!isAuthenticated}/>
      </Grid>
      <Grid item xs={12} sm={3}>
        <TextField fullWidth label="Номер паспорта" name="ownerPassportNumber" value={formData.ownerPassportNumber} onChange={handleChange('ownerPassportNumber')} required={!isAuthenticated}/>
      </Grid>
      <Grid item xs={12}>
        <TextField fullWidth label="Адрес регистрации владельца" name="ownerAddress" value={formData.ownerAddress} onChange={handleChange('ownerAddress')} required={!isAuthenticated}/>
      </Grid>
    </Grid>
  );

  const renderCarForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}><TextField fullWidth label="Марка" name="carMake" value={formData.carMake} onChange={handleChange('carMake')} required /></Grid>
      <Grid item xs={12} sm={6}><TextField fullWidth label="Модель" name="carModel" value={formData.carModel} onChange={handleChange('carModel')} required /></Grid>
      <Grid item xs={12} sm={6}><TextField fullWidth label="Год выпуска" name="carYear" type="number" value={formData.carYear} onChange={handleChange('carYear')} required /></Grid>
      <Grid item xs={12} sm={6}><TextField fullWidth label="VIN (17 символов)" name="vinNumber" value={formData.vinNumber} onChange={handleChange('vinNumber')} required inputProps={{ maxLength: 17 }} /></Grid>
      <Grid item xs={12} sm={6}><TextField fullWidth label="Гос. номер" name="licensePlate" value={formData.licensePlate} onChange={handleChange('licensePlate')} required /></Grid>
      <Grid item xs={12} sm={6}><TextField fullWidth label="СТС" name="registrationCertificate" value={formData.registrationCertificate} onChange={handleChange('registrationCertificate')} required /></Grid>
      <Grid item xs={12} sm={6}><DatePicker label="Дата выдачи СТС" value={formData.registrationDate} onChange={handleChange('registrationDate')} slotProps={{ textField: { fullWidth: true, required: true } }}/></Grid>
      <Grid item xs={12} sm={6}><TextField fullWidth label="Мощность (л.с.)" name="enginePower" type="number" value={formData.enginePower} onChange={handleChange('enginePower')} required /></Grid>
      <Grid item xs={12}><TextField fullWidth label="Регион регистрации авто" name="regionRegistration" value={formData.regionRegistration} onChange={handleChange('regionRegistration')} required /></Grid>
    </Grid>
  );

  const renderInsurancePeriodForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <DatePicker label="Дата начала" value={formData.startDate} onChange={handleChange('startDate')} slotProps={{ textField: { fullWidth: true, required: true } }}/>
      </Grid>
      <Grid item xs={12} md={4}>
        <DatePicker label="Дата окончания" value={formData.endDate} onChange={handleChange('endDate')} slotProps={{ textField: { fullWidth: true, required: true } }}/>
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField fullWidth label="Срок (мес.)" type="number" name="duration" value={formData.duration} onChange={handleChange('duration')} helperText="Обычно 12 месяцев" />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel 
            control={<Checkbox checked={Boolean(formData.hasAccidentsLastYear)} onChange={handleChange('hasAccidentsLastYear')} name="hasAccidentsLastYear" />} 
            label="Были ДТП за последний год?" 
        />
      </Grid>
      <Grid item xs={12}><TextField fullWidth label="Номер предыдущего полиса (если есть)" name="previousPolicyNumber" value={formData.previousPolicyNumber} onChange={handleChange('previousPolicyNumber')} /></Grid>
      <Grid item xs={12}><TextField fullWidth label="Примечания" name="notes" value={formData.notes} onChange={handleChange('notes')} multiline rows={2} /></Grid>
    </Grid>
  );

 const renderDriversForm = () => (
    <>
      <FormControlLabel
        control={<Checkbox checked={Boolean(formData.isUnlimitedDrivers)} onChange={handleChange('isUnlimitedDrivers')} name="isUnlimitedDrivers" />}
        label="Неограниченное количество водителей"
      />
      {!Boolean(formData.isUnlimitedDrivers) && formData.drivers.map((driver, index) => (
        <Paper key={index} sx={{ p: 2, mb: 2, mt: index > 0 ? 2 : 0, border: '1px solid #eee' }}>
          <Typography variant="subtitle1" gutterBottom>Водитель {index + 1}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}><TextField fullWidth label="Фамилия" name={`drivers[${index}].lastName`} value={driver.lastName} onChange={handleDriverChange(index, 'lastName')} required /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth label="Имя" name={`drivers[${index}].firstName`} value={driver.firstName} onChange={handleDriverChange(index, 'firstName')} required /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth label="Отчество" name={`drivers[${index}].middleName`} value={driver.middleName} onChange={handleDriverChange(index, 'middleName')} /></Grid>
            <Grid item xs={12} sm={6}><DatePicker label="Дата рождения" value={driver.birthDate} onChange={handleDriverChange(index, 'birthDate')} slotProps={{ textField: { fullWidth: true, required: true } }} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Стаж (лет)" name={`drivers[${index}].drivingExperience`} type="number" value={driver.drivingExperience} onChange={handleDriverChange(index, 'drivingExperience')} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="ВУ номер" name={`drivers[${index}].licenseNumber`} value={driver.licenseNumber} onChange={handleDriverChange(index, 'licenseNumber')} required /></Grid>
            <Grid item xs={12} sm={6}><DatePicker label="Дата выдачи ВУ" value={driver.licenseDate} onChange={handleDriverChange(index, 'licenseDate')} slotProps={{ textField: { fullWidth: true, required: true } }} /></Grid>
          </Grid>
          {formData.drivers.length > 1 && <Button onClick={() => removeDriver(index)} sx={{ mt: 1 }}>Удалить водителя</Button>}
        </Paper>
      ))}
      {!Boolean(formData.isUnlimitedDrivers) && <Button onClick={addDriver} sx={{ mt: 1 }}>Добавить водителя</Button>}
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

  return (
    <Paper elevation={0} sx={{ p: isAuthenticated ? 0 : 3, mt: isAuthenticated ? 0 : 3 }}>
      <Typography variant="h5" gutterBottom component="div" sx={{ mb: 3 }}>
        Оформление полиса ОСАГО
      </Typography>
      {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}
      {formError && <Alert severity="warning" sx={{ mb: 2 }}>{formError}</Alert>}
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>
      
      <Box sx={{ mb: 3 }}>{renderStepContent(activeStep)}</Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button onClick={handleBack} disabled={activeStep === 0}>Назад</Button>
        {activeStep === steps.length - 1 ? (
          <Button variant="contained" color="primary" onClick={handleSubmitClick} disabled={loading}>
            {loading ? 'Отправка...' : 'Оформить полис'}
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext}>Далее</Button>
        )}
      </Box>
    </Paper>
  );
};

const OsagoForm = ({ isPartOfPackage, packageId }) => {
  const auth = useAuth();

  const handleSubmitFromWrapper = async (dataFromWrapper) => {
    console.log('[OsagoForm] handleSubmitFromWrapper received data:', dataFromWrapper);
    
    let url;
    if (!auth.user && dataFromWrapper.email) {
      url = '/api/insurance/unauthorized/osago';
    } else {
      url = '/api/insurance/applications/osago';
      // Для авторизованного запроса, бэкенд сам возьмет пользователя из Authentication.
      // Можно было бы удалить email/password/firstName/etc. из dataFromWrapper здесь,
      // но бэкенд их просто проигнорирует, если они не нужны для OsagoApplication.
    }
    console.log(`[OsagoForm] Submitting to URL: ${url} with payload:`, JSON.stringify(dataFromWrapper));
    // Этот POST запрос теперь вернет промис с ответом или ошибкой,
    // который будет обработан в InsuranceFormWrapper, а затем в OsagoFormContent.
    return api.post(url, dataFromWrapper); 
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* onSubmitFromWrapper передается в InsuranceFormWrapper */}
      {/* InsuranceFormWrapper передаст свой внутренний handleFormSubmit в OsagoFormContent */}
      {/* OsagoFormContent вызовет этот handleFormSubmit, который в итоге вызовет handleSubmitFromWrapper */}
      <InsuranceFormWrapper onSubmit={handleSubmitFromWrapper}>
        <OsagoFormContent isAuthenticated={!!auth.user} />
      </InsuranceFormWrapper>
    </Container>
  );
};

export default OsagoForm; 