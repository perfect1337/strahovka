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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';

const OsagoForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Данные о владельце
    ownerLastName: '',
    ownerFirstName: '',
    ownerMiddleName: '',
    ownerBirthDate: null,
    ownerPassportSeries: '',
    ownerPassportNumber: '',
    ownerAddress: '',

    // Данные об автомобиле
    carMake: '',
    carModel: '',
    carYear: '',
    vinNumber: '',
    registrationNumber: '',
    registrationDocument: '',
    registrationDate: null,
    enginePower: '',

    // Период страхования
    startDate: null,
    endDate: null,

    // Водители
    driversLimit: 'limited', // или 'unlimited'
    drivers: [
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

  const steps = [
    'Данные владельца',
    'Данные автомобиля',
    'Период страхования',
    'Данные водителей'
  ];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Здесь будет логика отправки данных на сервер
    console.log(formData);
  };

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleDateChange = (field) => (date) => {
    setFormData({
      ...formData,
      [field]: date
    });
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
  };

  const addDriver = () => {
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
  };

  const removeDriver = (index) => {
    const newDrivers = formData.drivers.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      drivers: newDrivers
    });
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
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
          <Grid container spacing={3}>
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
                value={formData.carYear}
                onChange={handleInputChange('carYear')}
                required
                type="number"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="VIN номер"
                value={formData.vinNumber}
                onChange={handleInputChange('vinNumber')}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Гос. номер"
                value={formData.registrationNumber}
                onChange={handleInputChange('registrationNumber')}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="СТС/ПТС"
                value={formData.registrationDocument}
                onChange={handleInputChange('registrationDocument')}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Мощность двигателя (л.с.)"
                value={formData.enginePower}
                onChange={handleInputChange('enginePower')}
                required
                type="number"
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
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
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Ограничение по водителям</InputLabel>
              <Select
                value={formData.driversLimit}
                onChange={handleInputChange('driversLimit')}
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
                          onChange={handleDriverDateChange(index, 'birthDate')}
                          renderInput={(params) => <TextField {...params} fullWidth required />}
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
                          onChange={handleDriverDateChange(index, 'licenseDate')}
                          renderInput={(params) => <TextField {...params} fullWidth required />}
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

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, my: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          Оформление ОСАГО
        </Typography>

        <Stepper activeStep={activeStep} sx={{ py: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleSubmit}>
          <Box sx={{ mt: 3 }}>
            {renderStepContent(activeStep)}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            {activeStep > 0 && (
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Назад
              </Button>
            )}
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
            >
              {activeStep === steps.length - 1 ? 'Оформить' : 'Далее'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default OsagoForm; 