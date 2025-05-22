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
      hasUser: !!user,
      user: user ? JSON.parse(user) : null
    });
  } catch (e) {
    console.error('Error debugging auth storage:', e);
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("Initializing auth state");
        
        const userFromStorage = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');
        
        // Debug auth storage
        debugAuthStorage();
        
        if (!userFromStorage || !token || !refreshToken) {
          console.log("Missing auth data, clearing state");
          clearAuthData();
          return;
        }

        const userData = JSON.parse(userFromStorage);
        console.log("Found user in storage:", userData.email);
        setUser(userData);
        
        // Validate the token with a quick API call
        try {
          console.log("Validating token...");
          const response = await api.get('/api/auth/validate');
          console.log("Token validation response:", response.data);
          
          // Update user data if it has changed
          if (response.data && response.data.user) {
            console.log("Updating user data from validation response");
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
          console.log("Token is valid");
        } catch (error) {
          console.log("Token validation failed, attempting refresh", error);
          
          if (!refreshToken) {
            console.log("No refresh token available, clearing auth state");
            clearAuthData();
            return;
          }
          
          try {
            // Attempt token refresh
            console.log("Attempting token refresh with refreshToken");
            const refreshResponse = await api.post('/api/auth/refresh-token', { 
              refreshToken: refreshToken 
            });
            
            if (refreshResponse.data?.token) {
              console.log("Token refresh successful");
              localStorage.setItem('token', refreshResponse.data.token);
              
              if (refreshResponse.data.refreshToken) {
                localStorage.setItem('refreshToken', refreshResponse.data.refreshToken);
              }
              
              if (refreshResponse.data.user) {
                setUser(refreshResponse.data.user);
                localStorage.setItem('user', JSON.stringify(refreshResponse.data.user));
              }
            } else {
              console.log("No token in refresh response");
              clearAuthData();
            }
          } catch (refreshError) {
            console.log("Token refresh failed, clearing auth state", refreshError);
            clearAuthData();
          }
        }
      } catch (error) {
        console.error("Error initializing auth state:", error);
        clearAuthData();
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    // Helper function to clear auth data
    const clearAuthData = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      setLoading(false);
      setInitialized(true);
    };
    
    initializeAuth();
  }, []);
  
  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      const response = await api.post('/api/auth/login', { email, password });
      
      console.log('Login response received:', response.status);
      console.log('Response data structure:', Object.keys(response.data));
      
      // Extract token, refreshToken and user data from response
      const { token, refreshToken, user } = response.data;
      
      // Better validation with detailed logging
      if (!token) {
        console.error('No token in response');
        throw new Error('Invalid response: missing token');
      }
      
      if (!refreshToken) {
        console.error('No refresh token in response');
        throw new Error('Invalid response: missing refresh token');
      }
      
      if (!user) {
        console.error('No user object in response');
        throw new Error('Invalid response: missing user data');
      }
      
      console.log('Token length:', token.length);
      console.log('Refresh token length:', refreshToken.length);
      console.log('User data received:', user.email);
      
      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log("Login successful:", user.email);
      debugAuthStorage();
      
      // Update state
      setUser(user);
      
      return user;
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      throw error;
    }
  };
  
  const logout = async () => {
    try {
      // Call logout endpoint if token exists
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await api.post('/api/auth/logout');
          console.log("Logout API call successful");
        } catch (error) {
          console.log("Error calling logout API:", error);
          // Continue with local logout even if API fails
        }
      }
    } finally {
      // Clear local storage and state regardless of API response
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      console.log("Local logout complete");
      debugAuthStorage();
    }
  };
  
  const register = async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  };
  
  const updateUserState = (userData) => {
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        initialized,
        login,
        logout,
        register,
        updateUserState
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext; 