import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Track if a token refresh is in progress
let isRefreshing = false;
let refreshPromise = null;
// Store requests that should be retried after token refresh
let failedQueue = [];

// Debug token state in local storage
const logTokenState = () => {
  try {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    console.log('Current token state:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      hasRefreshToken: !!refreshToken,
      refreshTokenLength: refreshToken ? refreshToken.length : 0,
    });
  } catch (e) {
    console.error('Error logging token state:', e);
  }
};

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    // Skip adding token for auth endpoints
    if (config.url && (
      config.url.includes('/api/auth/login') || 
      config.url.includes('/api/auth/refresh-token') || 
      config.url.includes('/api/auth/register')
    )) {
      console.log(`Auth endpoint detected, not adding token: ${config.url}`);
      return config;
    }
    
    const token = localStorage.getItem('token');
    
    if (token) {
      // Always include token for all requests except login and refresh
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log(`Adding auth header to ${config.url}, token length: ${token.length}`);
      // Additional debug information
      if (config.url && (config.url.includes('/api/policies') || config.url.includes('/api/claims'))) {
        console.log('Making protected API call with token preview:', token.substring(0, 10) + '...');
      }
    } else {
      console.log(`No token available for request to ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Token refresh function
const refreshToken = async () => {
  try {
    if (isRefreshing) {
      return refreshPromise;
    }
    
    isRefreshing = true;
    console.log('Starting token refresh');
    
    const refreshTokenValue = localStorage.getItem('refreshToken');
    if (!refreshTokenValue) {
      console.log('No refresh token available');
      throw new Error('No refresh token found');
    }
    
    console.log('Using refresh token:', refreshTokenValue.substring(0, 10) + '...');
    
    refreshPromise = axios.post('http://localhost:8081/api/auth/refresh-token', 
      { refreshToken: refreshTokenValue },
      { 
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      }
    ).then(response => {
      console.log('Refresh token response received:', response.status);
      
      if (response.data && response.data.token) {
        // Store the new tokens
        console.log('New access token received, length:', response.data.token.length);
        localStorage.setItem('token', response.data.token);
        
        if (response.data.refreshToken) {
          console.log('New refresh token received, length:', response.data.refreshToken.length);
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        
        // Update user info if changed
        if (response.data.user) {
          console.log('User data updated from refresh');
          const updatedUser = {
            email: response.data.user.email,
            firstName: response.data.user.firstName,
            lastName: response.data.user.lastName,
            role: response.data.user.role,
            name: `${response.data.user.firstName} ${response.data.user.lastName}`
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        
        console.log('Token refreshed successfully');
        processQueue(null, response.data.token);
        return response.data.token;
      }
      
      console.log('Failed to refresh token - no token in response');
      processQueue(new Error('Failed to refresh token'));
      throw new Error('Failed to refresh token');
    }).catch(error => {
      console.error('Token refresh failed:', error);
      processQueue(error);
      
      // Clear user data on refresh token failure
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      throw error;
    }).finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });
    
    return refreshPromise;
  } catch (error) {
    console.error('Error in refreshToken:', error);
    isRefreshing = false;
    refreshPromise = null;
    processQueue(error);
    throw error;
  }
};

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Skip token refresh for auth endpoints, refresh token requests, and already retried requests
    if (!originalRequest || 
        originalRequest._isRetry || 
        (originalRequest.url && (
          originalRequest.url.includes('/api/auth/login') || 
          originalRequest.url.includes('/api/auth/refresh-token') || 
          originalRequest.url.includes('/api/auth/register')
        ))) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized errors by refreshing the token
    if (error.response?.status === 401) {
      console.log(`401 received for ${originalRequest.url} - attempting token refresh`);
      
      try {
        // Mark this request as retried to prevent loops
        originalRequest._isRetry = true;
        
        const refreshTokenValue = localStorage.getItem('refreshToken');
        if (!refreshTokenValue) {
          console.log('No refresh token available, redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login?auth_error=true';
          return Promise.reject(error);
        }
        
        // Use shared refresh promise if a refresh is already in progress
        let token;
        if (isRefreshing) {
          console.log('Token refresh already in progress, waiting for completion');
          token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
        } else {
          console.log('Starting new token refresh');
          isRefreshing = true;
          
          try {
            // Direct axios call to avoid interceptor loop
            const response = await axios.post('http://localhost:8081/api/auth/refresh-token', 
              { refreshToken: refreshTokenValue },
              { 
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
              }
            );
            
            if (!response.data?.token) {
              throw new Error('No token in refresh response');
            }
            
            // Store the new tokens
            token = response.data.token;
            localStorage.setItem('token', token);
            
            if (response.data.refreshToken) {
              localStorage.setItem('refreshToken', response.data.refreshToken);
            }
            
            if (response.data.user) {
              localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            
            console.log('Token refreshed successfully, length:', token.length);
            processQueue(null, token);
          } catch (refreshError) {
            console.error('Error during token refresh:', refreshError);
            processQueue(refreshError, null);
            throw refreshError;
          } finally {
            isRefreshing = false;
          }
        }
        
        // Retry the original request with the new token
        console.log('Retrying original request with new token');
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed, redirecting to login:', refreshError);
        
        // Clean up auth state on refresh failure
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?auth_error=true';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api; 