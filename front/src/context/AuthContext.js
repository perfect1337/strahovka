import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

// Just after the AuthContext initialization and before the AuthProvider
// Add debug function
const debugAuthStorage = () => {
  try {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    console.log('Debug Auth Storage:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? `${token.substring(0, 20)}...` : null,
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
    // Debug auth storage on component mount
    debugAuthStorage();
    
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token) {
      if (storedUser) {
        try {
          // First try to use stored user data
          const userData = JSON.parse(storedUser);
          console.log('Using stored user data:', userData);
          setUser(userData);
          setLoading(false);
        } catch (e) {
          console.error('Error parsing stored user data:', e);
          // If stored data is invalid, fetch from API
          fetchUserData(token);
        }
      } else {
        // No stored user data, fetch from API
        fetchUserData(token);
      }
    } else {
      setLoading(false);
    }
  }, []);
  
  const fetchUserData = (token) => {
    console.log('Fetching user data with token:', token ? `${token.substring(0, 15)}...` : 'no token');
    api.get('/api/auth/me')
      .then(response => {
        console.log('User data from /me:', response.data);
        const userData = {
          ...response.data,
          role: response.data.role,
          name: `${response.data.firstName} ${response.data.lastName}`.trim()
        };
        console.log('Setting user with data:', userData);
        
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);

        // Try to refresh the token after a successful user fetch
        refreshToken(userData.email);
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Add token refresh function
  const refreshToken = async (email) => {
    if (!email) return;
    
    try {
      console.log('Attempting to refresh token for:', email);
      // Use the silent refresh endpoint if you have one, or simplify by re-authenticating
      // This is a simplified example - in production you would use a proper refresh token flow
      const response = await api.post('/api/auth/refresh-token', { email });
      
      if (response.data && response.data.token) {
        console.log('Token refreshed successfully');
        localStorage.setItem('token', response.data.token);
        debugAuthStorage();
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Don't logout on refresh error, just log it
    }
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

      console.log('Registration response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        setUser({
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          role: response.data.role
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Ошибка при регистрации';
      
      if (error.response) {
        console.log('Error response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });

        if (error.response.data) {
          try {
            const errorData = typeof error.response.data === 'string' 
              ? JSON.parse(error.response.data) 
              : error.response.data;
            
            if (errorData.message) {
              errorMessage = errorData.message;
            } else if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch (e) {
            console.log('Raw error response data:', error.response.data);
            if (typeof error.response.data === 'string') {
              errorMessage = error.response.data;
            }
          }
        }

        if (error.response.status === 403) {
          errorMessage = 'Пользователь с таким email уже существует';
        }
      }
      
      throw new Error(errorMessage);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Logging in user:', { email });
      
      const response = await api.post('/api/auth/login', {
        email,
        password
      });

      console.log('Login response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        const userData = {
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          role: response.data.role,
          name: `${response.data.firstName} ${response.data.lastName}`.trim()
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        
        console.log('User set after login:', userData);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Ошибка при входе';
      
      if (error.response) {
        console.log('Error response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });

        if (error.response.data) {
          try {
            const errorData = typeof error.response.data === 'string' 
              ? JSON.parse(error.response.data) 
              : error.response.data;
            
            if (errorData.message) {
              errorMessage = errorData.message;
            } else if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch (e) {
            console.log('Raw error response data:', error.response.data);
            if (typeof error.response.data === 'string') {
              errorMessage = error.response.data;
            }
          }
        }

        if (error.response.status === 403) {
          errorMessage = 'Неверный email или пароль';
        }
      }
      
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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