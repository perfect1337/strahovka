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
import KaskoForm from './components/forms/KaskoForm';
import TravelForm from './pages/forms/TravelForm';
import HealthForm from './pages/forms/HealthForm';
import RealEstateForm from './pages/forms/RealEstateForm';
import ApartmentForm from './pages/forms/ApartmentForm';
import ModeratorClaims from './pages/ModeratorClaims';
import ApplicationsList from './pages/ApplicationsList';
import InsuranceGuide from './pages/InsuranceGuide';
import AdminRoute from './components/AdminRoute';
import ClaimsManagement from './components/admin/ClaimsManagement';
import UnauthorizedPolicyForm from './pages/UnauthorizedPolicyForm';

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
                    <PrivateRoute roles={['ROLE_ADMIN']}>
                      <ModeratorClaims />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/moderator/claims"
                  element={
                    <PrivateRoute roles={['ROLE_MODERATOR', 'ROLE_ADMIN']}>
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
                  element={
                    <ProtectedRoute>
                      <OsagoForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/insurance/kasko"
                  element={
                    <ProtectedRoute>
                      <KaskoForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/insurance/travel"
                  element={
                    <ProtectedRoute>
                      <TravelForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/insurance/health"
                  element={
                    <ProtectedRoute>
                      <HealthForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/insurance/realestate"
                  element={
                    <ProtectedRoute>
                      <RealEstateForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/insurance/apartment"
                  element={
                    <ProtectedRoute>
                      <ApartmentForm />
                    </ProtectedRoute>
                  }
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
                  element={
                    <ProtectedRoute>
                      <InsuranceGuide />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/packages"
                  element={
                    <AdminRoute>
                      <InsurancePackages adminView={true} />
                    </AdminRoute>
                  }
                />
              </Route>
            </Routes>
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App; 