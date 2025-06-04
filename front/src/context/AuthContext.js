import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

// Debug function for auth storage
const debugAuthStorage = () => {
  try {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const user = localStorage.getItem('user');
    console.log('Debug Auth Storage:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? `${token.substring(0, 20)}...` : null,
      hasRefreshToken: !!refreshToken,
      refreshTokenLength: refreshToken ? refreshToken.length : 0,
      refreshTokenPreview: refreshToken ? `${refreshToken.substring(0, 20)}...` : null,
      hasUser: !!user,
      user: user ? JSON.parse(user) : null
    });
  } catch (e) {
    console.error('Error debugging auth storage:', e);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to validate token and get user info
  const validateAndGetUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      // Configure request with token
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/api/auth/validate');
      
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.warn('Token validation failed or no token:', error.message);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      return false;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (token) {
          await validateAndGetUser();
        } else if (storedUser) {
          console.warn("User in localStorage without token, clearing.");
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleAuthenticationResponse = async (authData) => {
    if (!authData || !authData.accessToken || !authData.user) {
      console.error('handleAuthenticationResponse: Invalid authData received', authData);
      throw new Error('Invalid authentication data received from server.');
    }
    const { user: userData, accessToken, refreshToken } = authData;

    localStorage.setItem('token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    localStorage.setItem('user', JSON.stringify(userData));
    
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    setUser(userData);
    console.log("Authentication state updated with new tokens/user data.");
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', {
        email,
        password
      });

      const { accessToken, refreshToken, ...userData } = response.data;
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      setUser(userData);
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      delete api.defaults.headers.common['Authorization'];
      
      if (token) {
        await api.post('/api/auth/signout'); 
        console.log("User logged out successfully (backend notified).");
      } else {
        console.log("User logged out (no active session to notify backend).");
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUserInfo = (newInfo) => {
    const updatedUser = { ...user, ...newInfo };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const register = async (email, password, firstName, lastName) => {
    try {
      const response = await api.post('/api/auth/register', {
        email,
        password,
        firstName,
        lastName
      });

      const { accessToken, refreshToken, ...userData } = response.data;
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      setUser(userData);
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading, 
      updateUserInfo, 
      register,
      validateAndGetUser,
      handleAuthenticationResponse
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 