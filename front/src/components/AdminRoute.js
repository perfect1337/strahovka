import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { checkIfAdmin } from '../utils/roleUtils';

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  const isAdmin = user && checkIfAdmin(user.role);

  if (!user) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    // Logged in but not admin, redirect to home page
    return <Navigate to="/" />;
  }

  // Authorized, render component
  return children;
};

export default AdminRoute; 