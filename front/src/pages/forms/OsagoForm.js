import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, Snackbar } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

const OsagoForm = () => {
  const [form, setForm] = useState({ carModel: '', vin: '', driverExp: '', description: '' });
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
      await api.post('/api/insurance/applications/osago', form);
      setSuccess(true);
      setForm({ carModel: '', vin: '', driverExp: '', description: '' });
    } catch (err) {
      console.error('Error submitting OSAGO insurance application:', err);
      setError('Ошибка при отправке заявки. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6">ОСАГО</Typography>
      
      {error && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>}
      
      <TextField 
        label="Модель авто" 
        name="carModel" 
        value={form.carModel} 
        onChange={handleChange} 
        fullWidth 
        margin="normal" 
        required 
      />
      <TextField 
        label="VIN" 
        name="vin" 
        value={form.vin} 
        onChange={handleChange} 
        fullWidth 
        margin="normal" 
        required 
      />
      <TextField 
        label="Стаж водителя (лет)" 
        name="driverExp" 
        value={form.driverExp} 
        onChange={handleChange} 
        fullWidth 
        margin="normal" 
        required 
        type="number"
        InputProps={{ inputProps: { min: 0 } }}
      />
      <TextField 
        label="Описание" 
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
        message="Заявка на ОСАГО успешно отправлена!"
      />
    </Box>
  );
};

export default OsagoForm; 