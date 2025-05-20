import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, Snackbar, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

const ApartmentForm = () => {
  const [form, setForm] = useState({ 
    address: '', 
    area: '', 
    yearBuilt: '', 
    floorNumber: '', 
    totalFloors: '', 
    apartmentType: 'standard',
    securitySystem: false,
    description: '' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Необходимо авторизоваться для отправки заявки');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await api.post('/api/insurance/applications/apartment', form);
      setSuccess(true);
      setForm({ 
        address: '', 
        area: '', 
        yearBuilt: '', 
        floorNumber: '', 
        totalFloors: '', 
        apartmentType: 'standard',
        securitySystem: false,
        description: '' 
      });
    } catch (err) {
      console.error('Error submitting apartment insurance application:', err);
      setError('Ошибка при отправке заявки. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6">Страхование квартиры</Typography>
      
      {error && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>}
      
      <TextField 
        label="Полный адрес" 
        name="address" 
        value={form.address} 
        onChange={handleChange} 
        fullWidth 
        margin="normal" 
        required 
      />
      <TextField 
        label="Площадь (м²)" 
        name="area" 
        type="number" 
        value={form.area} 
        onChange={handleChange} 
        fullWidth 
        margin="normal" 
        required 
        InputProps={{ inputProps: { min: 1 } }}
      />
      <TextField 
        label="Год постройки" 
        name="yearBuilt" 
        type="number" 
        value={form.yearBuilt} 
        onChange={handleChange} 
        fullWidth 
        margin="normal" 
        required 
      />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField 
          label="Этаж" 
          name="floorNumber" 
          type="number" 
          value={form.floorNumber} 
          onChange={handleChange} 
          fullWidth 
          margin="normal" 
          required 
          InputProps={{ inputProps: { min: 1 } }}
        />
        <TextField 
          label="Всего этажей в доме" 
          name="totalFloors" 
          type="number" 
          value={form.totalFloors} 
          onChange={handleChange} 
          fullWidth 
          margin="normal" 
          required 
          InputProps={{ inputProps: { min: 1 } }}
        />
      </Box>
      <FormControl fullWidth margin="normal" required>
        <InputLabel>Тип квартиры</InputLabel>
        <Select
          name="apartmentType"
          value={form.apartmentType}
          onChange={handleChange}
          label="Тип квартиры"
        >
          <MenuItem value="standard">Стандартная</MenuItem>
          <MenuItem value="improved">Улучшенной планировки</MenuItem>
          <MenuItem value="studio">Студия</MenuItem>
          <MenuItem value="elite">Элитная</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal" required>
        <InputLabel>Наличие охранной системы</InputLabel>
        <Select
          name="securitySystem"
          value={form.securitySystem}
          onChange={handleChange}
          label="Наличие охранной системы"
        >
          <MenuItem value={true}>Есть</MenuItem>
          <MenuItem value={false}>Нет</MenuItem>
        </Select>
      </FormControl>
      <TextField 
        label="Дополнительная информация" 
        name="description" 
        value={form.description} 
        onChange={handleChange} 
        fullWidth 
        margin="normal" 
        multiline 
        rows={3} 
      />
      <Button 
        type="submit" 
        variant="contained" 
        sx={{ mt: 2 }} 
        disabled={loading}
      >
        {loading ? 'Отправка...' : 'Отправить'}
      </Button>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        message="Заявка на страхование квартиры успешно отправлена!"
      />
    </Box>
  );
};

export default ApartmentForm; 