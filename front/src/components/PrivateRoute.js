import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasRole } from '../utils/roleUtils';

const PrivateRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check if role check is required
  if (requiredRole) {
    // Debug role checking
    console.log('Role check:', {
      userRole: user.role,
      requiredRole: requiredRole,
      hasRequiredRole: hasRole(user.role, requiredRole)
    });
    
    if (!hasRole(user.role, requiredRole)) {
      console.log(`Access denied: User role ${user.role} does not match required role ${requiredRole}`);
      return <Navigate to="/" />;
    }
  }

  return children;
};

export default PrivateRoute; 