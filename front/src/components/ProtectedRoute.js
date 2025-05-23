import React from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { checkIfAdmin, checkIfModerator } from '../utils/roleUtils';

const ProtectedRoute = ({ children, adminOnly = false, moderatorOnly = false }) => {
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
          Проверка авторизации...
        </Typography>
      </Box>
    );
  }

  if (!user) {
    console.log('ProtectedRoute: No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !checkIfAdmin(user.role)) {
    console.log('ProtectedRoute: Admin access required but user is not admin');
    return <Navigate to="/" replace />;
  }

  if (moderatorOnly && !checkIfModerator(user.role) && !checkIfAdmin(user.role)) {
    console.log('ProtectedRoute: Moderator access required but user is not moderator or admin');
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute; 