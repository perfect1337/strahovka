import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  TextField
} from '@mui/material';

const PropertyValueSection = ({ form, handleChange }) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>Стоимость и дополнительная информация</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField 
            label="Оценочная стоимость (₽)" 
            name="propertyValue" 
            type="number"
            value={form.propertyValue} 
            onChange={handleChange} 
            fullWidth 
            required 
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField 
            label="Примечания" 
            name="description" 
            value={form.description} 
            onChange={handleChange} 
            fullWidth 
            multiline 
            rows={3} 
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PropertyValueSection; 