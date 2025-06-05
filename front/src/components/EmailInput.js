import React from 'react';
import { TextField } from '@mui/material';

const EmailInput = ({ value, onChange, error }) => {
  return (
    <TextField
      fullWidth
      label="Email"
      type="email"
      value={value}
      onChange={onChange}
      error={Boolean(error)}
      helperText={error || 'На этот email будет создан личный кабинет'}
      margin="normal"
      required
      sx={{ mb: 2 }}
    />
  );
};

export default EmailInput; 