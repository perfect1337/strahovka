import React from 'react';
import { Typography, Box } from '@mui/material';

console.log('[MyTestStepper.js] File loaded and parsed by browser');

const MyTestStepper = () => {
  console.log('[MyTestStepper] Component rendering STARTED');
  console.log('[MyTestStepper] Before returning JSX');
  return (
    <Box sx={{ p: 3, border: '2px solid red' }}>
      <Typography variant="h3" color="red">MyTestStepper RENDERED!</Typography>
      <Typography>If you see this, the renamed and simplified component is working.</Typography>
    </Box>
  );
};

export default MyTestStepper; 