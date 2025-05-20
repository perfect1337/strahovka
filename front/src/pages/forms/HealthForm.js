import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, Snackbar } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

const HealthForm = () => {
  const [form, setForm] = useState({ fio: '', birthDate: '', description: '' });
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
      await api.post('/api/insurance/applications/health', form);
      setSuccess(true);
      setForm({ fio: '', birthDate: '', description: '' });
    } catch (err) {
      console.error('Error submitting health insurance application:', err);
      setError('Ошибка при отправке заявки. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6">Страхование здоровья</Typography>
      
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
        label="Описание состояния" 
        name="description" 
        value={form.description} 
        onChange={handleChange} 
        fullWidth 
        margin="normal" 
        multiline 
        rows={3} 
        required 
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
        message="Заявка на страхование здоровья успешно отправлена!"
      />
    </Box>
  );
};

export default HealthForm; 