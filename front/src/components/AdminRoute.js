import React from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { checkIfAdmin } from '../utils/roleUtils';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="50vh"
      >
        <CircularProgress />
        <Typography variant="body1" mt={2}>
          Проверка прав доступа...
        </Typography>
      </Box>
    );
  }

  if (!user) {
    // Store the current location to redirect back after login
    const currentLocation = window.location.pathname;
    localStorage.setItem('redirectAfterLogin', currentLocation);
    return <Navigate to="/login" />;
  }

  const isAdmin = checkIfAdmin(user.role);
  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute; 