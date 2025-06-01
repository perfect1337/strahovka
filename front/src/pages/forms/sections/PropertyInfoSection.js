import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

const PropertyInfoSection = ({ form, handleChange }) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>Информация о недвижимости</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Тип недвижимости</InputLabel>
            <Select
              name="propertyType"
              value={form.propertyType}
              label="Тип недвижимости"
              onChange={handleChange}
            >
              <MenuItem value="apartment">Квартира</MenuItem>
              <MenuItem value="house">Дом</MenuItem>
              <MenuItem value="townhouse">Таунхаус</MenuItem>
              <MenuItem value="commercial">Коммерческая недвижимость</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField 
            label="Адрес" 
            name="address" 
            value={form.address} 
            onChange={handleChange} 
            fullWidth 
            required 
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField 
            label="Общая площадь (м²)" 
            name="totalArea" 
            type="number"
            value={form.totalArea} 
            onChange={handleChange} 
            fullWidth 
            required 
            InputProps={{ inputProps: { min: 1 } }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField 
            label="Год постройки" 
            name="yearBuilt" 
            type="number"
            value={form.yearBuilt} 
            onChange={handleChange} 
            fullWidth 
            required 
            InputProps={{ inputProps: { min: 1800, max: new Date().getFullYear() } }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField 
            label="Кадастровый номер" 
            name="cadastralNumber" 
            value={form.cadastralNumber} 
            onChange={handleChange} 
            fullWidth 
            required 
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField 
            label="Номер документа собственности" 
            name="ownershipDocumentNumber" 
            value={form.ownershipDocumentNumber} 
            onChange={handleChange} 
            fullWidth 
            required 
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PropertyInfoSection; 