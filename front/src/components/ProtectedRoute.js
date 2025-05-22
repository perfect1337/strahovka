import React from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();

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
          Проверка авторизации...
        </Typography>
      </Box>
    );
  }

  if (!user) {
    console.log('ProtectedRoute: No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    console.log('ProtectedRoute: Admin access required but user is not admin');
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute; 