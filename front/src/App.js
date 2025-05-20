import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import InsuranceCategories from './pages/InsuranceCategories';
import CreateClaim from './pages/CreateClaim';
import ChangePassword from './pages/ChangePassword';
import AdminPanel from './pages/AdminPanel';
import AdminClaims from './pages/AdminClaims';
import PrivateRoute from './components/PrivateRoute';
import AuthDebugger from './components/AuthDebugger';

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="insurance" element={<InsuranceCategories />} />
                <Route
                  path="profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="admin"
                  element={
                    <PrivateRoute requiredRole="ADMIN">
                      <AdminPanel />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="admin/claims"
                  element={
                    <PrivateRoute requiredRole="ADMIN">
                      <AdminClaims />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="create-claim"
                  element={
                    <PrivateRoute>
                      <CreateClaim />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="change-password"
                  element={
                    <PrivateRoute>
                      <ChangePassword />
                    </PrivateRoute>
                  }
                />
              </Route>
            </Routes>
            {isDevelopment && <AuthDebugger />}
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App; 