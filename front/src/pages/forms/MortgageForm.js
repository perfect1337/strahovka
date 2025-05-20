import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, Snackbar, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

const MortgageForm = () => {
  const [form, setForm] = useState({ 
    propertyAddress: '', 
    propertyValue: '', 
    loanAmount: '', 
    loanTerm: '', 
    bankName: '',
    propertyType: 'apartment',
    yearBuilt: '',
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
      await api.post('/api/insurance/applications/mortgage', form);
      setSuccess(true);
      setForm({ 
        propertyAddress: '', 
        propertyValue: '', 
        loanAmount: '', 
        loanTerm: '', 
        bankName: '',
        propertyType: 'apartment',
        yearBuilt: '',
        description: '' 
      });
    } catch (err) {
      console.error('Error submitting mortgage insurance application:', err);
      setError('Ошибка при отправке заявки. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6">Ипотечное страхование</Typography>
      
      {error && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>}
      
      <TextField 
        label="Адрес недвижимости" 
        name="propertyAddress" 
        value={form.propertyAddress} 
        onChange={handleChange} 
        fullWidth 
        margin="normal" 
        required 
      />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField 
          label="Стоимость недвижимости (₽)" 
          name="propertyValue" 
          type="number" 
          value={form.propertyValue} 
          onChange={handleChange} 
          fullWidth 
          margin="normal" 
          required 
          InputProps={{ inputProps: { min: 1 } }}
        />
        <TextField 
          label="Сумма кредита (₽)" 
          name="loanAmount" 
          type="number" 
          value={form.loanAmount} 
          onChange={handleChange} 
          fullWidth 
          margin="normal" 
          required 
          InputProps={{ inputProps: { min: 1 } }}
        />
      </Box>
      <TextField 
        label="Срок кредита (лет)" 
        name="loanTerm" 
        type="number" 
        value={form.loanTerm} 
        onChange={handleChange} 
        fullWidth 
        margin="normal" 
        required 
        InputProps={{ inputProps: { min: 1, max: 30 } }}
      />
      <TextField 
        label="Название банка" 
        name="bankName" 
        value={form.bankName} 
        onChange={handleChange} 
        fullWidth 
        margin="normal" 
        required 
      />
      <FormControl fullWidth margin="normal" required>
        <InputLabel>Тип недвижимости</InputLabel>
        <Select
          name="propertyType"
          value={form.propertyType}
          onChange={handleChange}
          label="Тип недвижимости"
        >
          <MenuItem value="apartment">Квартира</MenuItem>
          <MenuItem value="house">Дом</MenuItem>
          <MenuItem value="townhouse">Таунхаус</MenuItem>
          <MenuItem value="commercial">Коммерческая недвижимость</MenuItem>
        </Select>
      </FormControl>
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
        message="Заявка на ипотечное страхование успешно отправлена!"
      />
    </Box>
  );
};

export default MortgageForm; 