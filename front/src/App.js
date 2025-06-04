import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AuthProvider } from './context/AuthContext';
import 'antd/dist/reset.css';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import InsuranceCategories from './pages/InsuranceCategories';
import InsurancePackages from './pages/InsurancePackages';
import InsuranceClaims from './pages/InsuranceClaims';
import CreateClaim from './pages/CreateClaim';
import ChangePassword from './pages/ChangePassword';
import AdminPanel from './pages/AdminPanel';
import AdminClaims from './pages/AdminClaims';
import PrivateRoute from './components/PrivateRoute';
import ProtectedRoute from './components/ProtectedRoute';
import CreatePolicy from './pages/CreatePolicy';
import OsagoForm from './pages/forms/OsagoForm';
import KaskoForm from './pages/forms/KaskoForm';
import TravelForm from './pages/forms/TravelForm';
import HealthForm from './pages/forms/HealthForm';
import RealEstateForm from './pages/forms/RealEstateForm';
import ModeratorClaims from './pages/ModeratorClaims';
import ApplicationsList from './pages/ApplicationsList';
import InsuranceGuide from './pages/InsuranceGuide';
import AdminRoute from './components/AdminRoute';
import ClaimsManagement from './components/admin/ClaimsManagement';
import UnauthorizedPolicyForm from './pages/UnauthorizedPolicyForm';
import ApplicationSuccess from './pages/ApplicationSuccess';
import InsurancePackageForm from './pages/InsurancePackageForm';
import MyTestStepper from './pages/MyTestStepper';

const theme = createTheme({
  palette: {
    primary: {
      main: 'rgb(178, 32, 52)', // raspberry red
      light: 'rgb(213, 87, 103)',
      dark: 'rgb(124, 22, 36)',
    },
    secondary: {
      main: 'rgb(142, 26, 42)', // darker raspberry
      light: 'rgb(184, 77, 91)',
      dark: 'rgb(99, 18, 29)',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 500,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 500,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 500,
      fontSize: '1.75rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      color: 'rgba(0, 0, 0, 0.87)',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      fontSize: '1rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          padding: '12px 32px',
          fontSize: '1.1rem',
          fontWeight: 500,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          minHeight: '48px',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          '&:hover': {
            backgroundColor: 'rgb(213, 87, 103)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
        // Стили для маленьких кнопок
        sizeSmall: {
          padding: '8px 24px',
          fontSize: '0.95rem',
          minHeight: '36px',
        },
        // Стили для больших кнопок
        sizeLarge: {
          padding: '16px 40px',
          fontSize: '1.2rem',
          minHeight: '56px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiTreeItem: {
      styleOverrides: {
        root: {
          '&:focus > .MuiTreeItem-content': {
            backgroundColor: 'rgba(178, 32, 52, 0.08)',
          },
        },
        content: {
          padding: '4px 8px',
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: 'rgba(178, 32, 52, 0.04)',
          },
          '&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused': {
            backgroundColor: 'rgba(178, 32, 52, 0.12)',
          },
        },
        label: {
          padding: '4px 0',
        },
      },
    },
  },
});

function App() {
  // console.log('[App.js] App component rendering. ProtectedRoute imported as:', typeof ProtectedRoute, ProtectedRoute);
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/categories" element={<InsuranceCategories />} />
                <Route path="/insurance" element={<Navigate to="/insurance/packages" replace />} />
                <Route path="/insurance/packages" element={<InsurancePackages />} />
                <Route path="/insurance/packages/public" element={<InsurancePackages />} />
                <Route path="/insurance/apply" element={<UnauthorizedPolicyForm />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-policy"
                  element={
                    <ProtectedRoute>
                      <CreatePolicy />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/apply-package/:id"
                  element={
                    <ProtectedRoute>
                      <InsurancePackageForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/insurance/buy/:id"
                  element={
                    <ProtectedRoute>
                      <CreatePolicy />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/claims"
                  element={
                    <ProtectedRoute>
                      <InsuranceClaims />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-claim"
                  element={
                    <ProtectedRoute>
                      <CreateClaim />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminPanel />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/claims"
                  element={
                    <PrivateRoute roles={['ADMIN']}>
                      <ModeratorClaims />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/moderator/claims"
                  element={
                    <PrivateRoute roles={['MODERATOR', 'ADMIN']}>
                      <ModeratorClaims />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/change-password"
                  element={
                    <PrivateRoute>
                      <ChangePassword />
                    </PrivateRoute>
                  }
                />
                {/* Insurance Form Routes */}
                <Route
                  path="/insurance/osago"
                  element={<OsagoForm />}
                />
                <Route
                  path="/insurance/kasko"
                  element={<KaskoForm />}
                />
                <Route
                  path="/insurance/travel"
                  element={<TravelForm />}
                />
                <Route
                  path="/insurance/health"
                  element={<HealthForm />}
                />
                <Route
                  path="/insurance/realestate"
                  element={<RealEstateForm />}
                />
                <Route
                  path="/applications"
                  element={
                    <ProtectedRoute roles={['ROLE_ADMIN', 'ROLE_MODERATOR']}>
                      <ApplicationsList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/insurance-guide"
                  element={<InsuranceGuide />}
                />
                <Route
                  path="/admin/packages"
                  element={
                    <AdminRoute>
                      <InsurancePackages adminView={true} />
                    </AdminRoute>
                  }
                />
                <Route path="/applications/success" element={<ApplicationSuccess />} />
                <Route path="/insurance/packages/new" element={<InsurancePackageForm />} />
              </Route>
            </Routes>
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App; 