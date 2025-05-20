import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const About = () => {
  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        About Us
      </Typography>
      <Typography variant="body1" paragraph>
        Strahovka is a modern insurance management platform designed to help you manage your insurance policies efficiently.
      </Typography>
      <Typography variant="body1" paragraph>
        Our mission is to simplify the insurance process and provide a seamless experience for our users.
      </Typography>
    </Paper>
  );
};

export default About; 