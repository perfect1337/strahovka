import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const CoveragePeriodSection = ({ form, handleDateChange }) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>Период страхования</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <DatePicker
            label="Дата начала"
            value={form.startDate}
            onChange={(date) => handleDateChange('startDate', date)}
            renderInput={(params) => <TextField {...params} fullWidth required />}
            minDate={new Date()}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <DatePicker
            label="Дата окончания"
            value={form.endDate}
            onChange={(date) => handleDateChange('endDate', date)}
            renderInput={(params) => <TextField {...params} fullWidth required />}
            minDate={form.startDate || new Date()}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default CoveragePeriodSection; 