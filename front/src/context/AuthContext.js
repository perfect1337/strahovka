import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

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

  const validateToken = async (token) => {
    if (!token) {
      return { valid: false, userData: null };
    }

    try {
      const response = await api.get('/auth/me');
      return { valid: true, userData: response.data };
    } catch (error) {
      console.error('Token validation error:', error);
      return { valid: false, userData: null };
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      const storedUser = localStorage.getItem('user');

      if (!token || !refreshToken || !storedUser) {
        setLoading(false);
        return;
      }

      try {
        const { valid, userData } = await validateToken(token);
        
        if (valid && userData) {
          console.log('Token is valid, setting user state', userData);
          const formattedUser = {
            ...userData,
            level: userData.level,
            policyCount: userData.policyCount,
            name: `${userData.firstName} ${userData.lastName}`.trim()
          };
          
          setUser(formattedUser);
          localStorage.setItem('user', JSON.stringify(formattedUser));
        } else {
          // Token is invalid, try to refresh
          try {
            const response = await api.post('/auth/refresh-token', {
              email: JSON.parse(storedUser).email,
              refreshToken: refreshToken
            });

            if (response.data && response.data.token && response.data.refreshToken) {
              localStorage.setItem('token', response.data.token);
              localStorage.setItem('refreshToken', response.data.refreshToken);
              
              const updatedUser = {
                email: response.data.email,
                firstName: response.data.firstName,
                lastName: response.data.lastName,
                role: response.data.role,
                level: response.data.level,
                policyCount: response.data.policyCount,
                name: `${response.data.firstName} ${response.data.lastName}`.trim()
              };
              
              localStorage.setItem('user', JSON.stringify(updatedUser));
              setUser(updatedUser);
            } else {
              throw new Error('Invalid refresh token response');
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error during auth initialization:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Logging in user:', { email });
      
      const response = await api.post('/auth/login', {
        email,
        password
      });

      console.log('Login response:', response.data);
      
      if (response.data.token && response.data.refreshToken) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        
        const userData = {
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          role: response.data.role,
          level: response.data.level,
          policyCount: response.data.policyCount,
          name: `${response.data.firstName} ${response.data.lastName}`.trim()
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email, password, firstName, lastName) => {
    try {
      console.log('Registering user:', { email, firstName, lastName });
      
      const response = await api.post('/auth/register', {
        email,
        password,
        firstName,
        lastName
      });

      console.log('Register response:', response.data);
      
      if (response.data.token && response.data.refreshToken) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        
        const userData = {
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          role: response.data.role,
          level: response.data.level,
          policyCount: response.data.policyCount,
          name: `${response.data.firstName} ${response.data.lastName}`.trim()
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    debugAuthStorage();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        isAdmin: user?.role === 'ROLE_ADMIN',
      }}
    >
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