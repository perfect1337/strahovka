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

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Logging in user:', { email });
      
      const response = await api.post('/api/auth/login', {
        email,
        password
      });

      const { accessToken, refreshToken, ...userData } = response.data;
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUserInfo = (newInfo) => {
    const updatedUser = { ...user, ...newInfo };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const register = async (email, password, firstName, lastName) => {
    try {
      console.log('Registering user:', { email, firstName, lastName });
      
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
      
      setUser(userData);
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUserInfo, register }}>
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