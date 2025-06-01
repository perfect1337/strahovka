import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  TextField
} from '@mui/material';

const OwnerInfoSection = ({ form, handleChange }) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>Информация о владельце</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField 
            label="ФИО владельца" 
            name="ownerFullName" 
            value={form.ownerFullName} 
            onChange={handleChange} 
            fullWidth 
            required 
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField 
            label="Серия и номер паспорта" 
            name="ownerPassport" 
            value={form.ownerPassport} 
            onChange={handleChange} 
            fullWidth 
            required 
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField 
            label="Телефон" 
            name="ownerPhone" 
            value={form.ownerPhone} 
            onChange={handleChange} 
            fullWidth 
            required 
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField 
            label="Email" 
            name="ownerEmail" 
            type="email"
            value={form.ownerEmail} 
            onChange={handleChange} 
            fullWidth 
            required 
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default OwnerInfoSection; 