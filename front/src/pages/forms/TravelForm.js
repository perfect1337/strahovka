import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, Snackbar, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

const TravelForm = () => {
  const [form, setForm] = useState({ 
    fio: '', 
    birthDate: '', 
    country: '', 
    departure: '', 
    return: '', 
    purpose: 'tourism', 
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
      await api.post('/api/insurance/applications/travel', form);
      setSuccess(true);
      setForm({ 
        fio: '', 
        birthDate: '', 
        country: '', 
        departure: '', 
        return: '', 
        purpose: 'tourism', 
        description: '' 
      });
    } catch (err) {
      console.error('Error submitting travel insurance application:', err);
      setError('Ошибка при отправке заявки. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6">Страхование путешествий</Typography>
      
      {error && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>}
      
      <TextField 
        label="ФИО" 
        name="fio" 
        value={form.fio} 
        onChange={handleChange} 
        fullWidth 
        margin="normal" 
        required 
      />
      <TextField 
        label="Дата рождения" 
        name="birthDate" 
        type="date" 
        value={form.birthDate} 
        onChange={handleChange} 
        fullWidth 
        margin="normal" 
        InputLabelProps={{ shrink: true }} 
        required 
      />
      <TextField 
        label="Страна поездки" 
        name="country" 
        value={form.country} 
        onChange={handleChange} 
        fullWidth 
        margin="normal" 
        required 
      />
      <TextField 
        label="Дата отъезда" 
        name="departure" 
        type="date" 
        value={form.departure} 
        onChange={handleChange} 
        fullWidth 
        margin="normal" 
        InputLabelProps={{ shrink: true }} 
        required 
      />
      <TextField 
        label="Дата возвращения" 
        name="return" 
        type="date" 
        value={form.return} 
        onChange={handleChange} 
        fullWidth 
        margin="normal" 
        InputLabelProps={{ shrink: true }} 
        required 
      />
      <FormControl fullWidth margin="normal" required>
        <InputLabel>Цель поездки</InputLabel>
        <Select
          name="purpose"
          value={form.purpose}
          onChange={handleChange}
          label="Цель поездки"
        >
          <MenuItem value="tourism">Туризм</MenuItem>
          <MenuItem value="business">Деловая поездка</MenuItem>
          <MenuItem value="study">Учеба</MenuItem>
          <MenuItem value="sport">Спорт</MenuItem>
          <MenuItem value="other">Другое</MenuItem>
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
        message="Заявка на страхование путешествия успешно отправлена!"
      />
    </Box>
  );
};

export default TravelForm; 