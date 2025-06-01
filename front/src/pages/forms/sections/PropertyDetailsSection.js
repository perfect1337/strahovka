import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox
} from '@mui/material';

const PropertyDetailsSection = ({ form, handleChange }) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>Характеристики недвижимости</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Тип постройки</InputLabel>
            <Select
              name="constructionType"
              value={form.constructionType}
              label="Тип постройки"
              onChange={handleChange}
            >
              <MenuItem value="brick">Кирпичный</MenuItem>
              <MenuItem value="panel">Панельный</MenuItem>
              <MenuItem value="monolithic">Монолитный</MenuItem>
              <MenuItem value="wooden">Деревянный</MenuItem>
              <MenuItem value="other">Другое</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.hasSecuritySystem}
                  onChange={handleChange}
                  name="hasSecuritySystem"
                />
              }
              label="Охранная система"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.hasFireAlarm}
                  onChange={handleChange}
                  name="hasFireAlarm"
                />
              }
              label="Пожарная сигнализация"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.hasMortgage}
                  onChange={handleChange}
                  name="hasMortgage"
                />
              }
              label="Недвижимость в ипотеке"
            />
          </FormGroup>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PropertyDetailsSection; 