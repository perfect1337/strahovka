import React from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { checkIfAdmin, checkIfModerator } from '../utils/roleUtils';

const ProtectedRoute = ({ children, adminOnly = false, moderatorOnly = false }) => {
  const { user, loading, error: authError } = useAuth(); // Добавим authError для диагностики

  console.log('[ProtectedRoute] Rendering. Loading:', loading, 'User:', !!user, 'AdminOnly:', adminOnly, 'ModeratorOnly:', moderatorOnly);
  if(user) {
    console.log('[ProtectedRoute] User role:', user.role);
  }
  if(authError) {
    console.warn('[ProtectedRoute] AuthContext error:', authError);
  }

  if (loading) {
    console.log('[ProtectedRoute] Auth context is loading. Displaying spinner.');
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
    console.log('[ProtectedRoute] No user found (auth complete), redirecting to /login.');
    return <Navigate to="/login" replace />;
  }

  // Если пользователь есть, можно залогировать его роль для проверки прав
  console.log('[ProtectedRoute] User found:', user);
  console.log('[ProtectedRoute] Checking access conditions...');

  if (adminOnly && !checkIfAdmin(user.role)) {
    console.log(`[ProtectedRoute] Admin access required. User role: ${user.role}. Redirecting to /.`);
    return <Navigate to="/" replace />;
  }

  if (moderatorOnly && !checkIfModerator(user.role) && !checkIfAdmin(user.role)) {
    console.log(`[ProtectedRoute] Moderator or Admin access required. User role: ${user.role}. Redirecting to /.`);
    return <Navigate to="/" replace />;
  }

  console.log('[ProtectedRoute] Access GRANTED. Rendering children.');
  return children;
};

export default ProtectedRoute; 