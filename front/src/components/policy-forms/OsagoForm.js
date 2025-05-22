import React, { useState } from 'react';
import {
  Box,
  TextField,
  Grid,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';

const OsagoForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    carModel: '',
    carYear: '',
    licensePlate: '',
    vin: '',
    enginePower: '',
    ownerFullName: '',
    ownerPassport: '',
    registrationAddress: '',
    startDate: null,
    driversCount: '1',
    drivers: [{
      fullName: '',
      driverLicense: '',
      experience: '',
    }],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDriverChange = (index, field, value) => {
    const newDrivers = [...formData.drivers];
    newDrivers[index] = {
      ...newDrivers[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      drivers: newDrivers
    }));
  };

  const handleDriversCountChange = (e) => {
    const count = parseInt(e.target.value);
    const drivers = [...formData.drivers];
    
    // Add or remove drivers based on the new count
    if (count > drivers.length) {
      while (drivers.length < count) {
        drivers.push({ fullName: '', driverLicense: '', experience: '' });
      }
    } else if (count < drivers.length) {
      drivers.splice(count);
    }

    setFormData(prev => ({
      ...prev,
      driversCount: e.target.value,
      drivers
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Оформление полиса ОСАГО
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Car Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Информация об автомобиле
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Марка и модель автомобиля"
              name="carModel"
              value={formData.carModel}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Год выпуска"
              name="carYear"
              type="number"
              value={formData.carYear}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Государственный номер"
              name="licensePlate"
              value={formData.licensePlate}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="VIN номер"
              name="vin"
              value={formData.vin}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Мощность двигателя (л.с.)"
              name="enginePower"
              type="number"
              value={formData.enginePower}
              onChange={handleChange}
              required
            />
          </Grid>

          {/* Owner Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Информация о владельце
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="ФИО владельца"
              name="ownerFullName"
              value={formData.ownerFullName}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Серия и номер паспорта"
              name="ownerPassport"
              value={formData.ownerPassport}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Адрес регистрации"
              name="registrationAddress"
              value={formData.registrationAddress}
              onChange={handleChange}
              required
            />
          </Grid>

          {/* Insurance Period */}
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Дата начала страхования"
              value={formData.startDate}
              onChange={(newValue) => {
                setFormData(prev => ({
                  ...prev,
                  startDate: newValue
                }));
              }}
              renderInput={(params) => <TextField {...params} fullWidth required />}
            />
          </Grid>

          {/* Drivers Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Информация о водителях
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Количество водителей</InputLabel>
              <Select
                value={formData.driversCount}
                label="Количество водителей"
                onChange={handleDriversCountChange}
              >
                <MenuItem value="1">1 водитель</MenuItem>
                <MenuItem value="2">2 водителя</MenuItem>
                <MenuItem value="3">3 водителя</MenuItem>
                <MenuItem value="4">4 водителя</MenuItem>
                <MenuItem value="5">5 водителей</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {formData.drivers.map((driver, index) => (
            <Grid item xs={12} key={index} container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2">
                  Водитель {index + 1}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ФИО водителя"
                  value={driver.fullName}
                  onChange={(e) => handleDriverChange(index, 'fullName', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Номер водительского удостоверения"
                  value={driver.driverLicense}
                  onChange={(e) => handleDriverChange(index, 'driverLicense', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Стаж вождения (лет)"
                  type="number"
                  value={driver.experience}
                  onChange={(e) => handleDriverChange(index, 'experience', e.target.value)}
                  required
                />
              </Grid>
            </Grid>
          ))}

          <Grid item xs={12}>
            <Box sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
              >
                Рассчитать стоимость
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default OsagoForm; 