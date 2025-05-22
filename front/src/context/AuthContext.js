import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

// Debug function for auth storage
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

  // Function to validate token against backend
  const validateToken = async (token) => {
    try {
      const response = await api.get('/api/auth/me');
      return { valid: true, userData: response.data };
    } catch (error) {
      console.error('Token validation failed:', error);
      return { valid: false, error };
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      debugAuthStorage();
      
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (!token) {
        console.log('No token found - user is not logged in');
        setLoading(false);
        return;
      }
      
      // Always validate the token with the backend
      try {
        const { valid, userData } = await validateToken(token);
        
        if (valid && userData) {
          console.log('Token is valid, setting user state', userData);
          const formattedUser = {
            ...userData,
            name: `${userData.firstName} ${userData.lastName}`.trim()
          };
          
          setUser(formattedUser);
          
          // Update stored user data if it's different
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (JSON.stringify(parsedUser) !== JSON.stringify(formattedUser)) {
              localStorage.setItem('user', JSON.stringify(formattedUser));
            }
          } else {
            localStorage.setItem('user', JSON.stringify(formattedUser));
          }
        } else {
          // Token is invalid, clear storage
          console.warn('Token validation failed, clearing auth data');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
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
        debugAuthStorage();
        
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
      
      const response = await api.post('/api/auth/register', {
        email,
        password,
        firstName,
        lastName
      });

      console.log('Register response:', response.data);
      
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
        
        console.log('User set after registration:', userData);
        debugAuthStorage();
        
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