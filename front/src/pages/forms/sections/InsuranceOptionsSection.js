import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

const InsuranceOptionsSection = ({ form, handleChange }) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>Параметры страхования</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Тип страхового покрытия</InputLabel>
            <Select
              name="coverageType"
              value={form.coverageType || 'standard'}
              label="Тип страхового покрытия"
              onChange={handleChange}
            >
              <MenuItem value="basic">Базовый</MenuItem>
              <MenuItem value="standard">Стандартный</MenuItem>
              <MenuItem value="premium">Премиум</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default InsuranceOptionsSection; 