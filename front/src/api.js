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
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
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
    
    const userData = localStorage.getItem('user');
    if (!userData) {
      throw new Error('No user data found');
    }
    
    const user = JSON.parse(userData);
    
    refreshPromise = axios.post('http://localhost:8081/api/auth/refresh-token', 
      { email: user.email },
      { 
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      }
    ).then(response => {
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        // Update user info if changed
        if (response.data.email && response.data.firstName && response.data.lastName && response.data.role) {
          const updatedUser = {
            email: response.data.email,
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            role: response.data.role,
            name: `${response.data.firstName} ${response.data.lastName}`
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        
        processQueue(null, response.data.token);
        return response.data.token;
      }
      
      processQueue(new Error('Failed to refresh token'));
      throw new Error('Failed to refresh token');
    }).catch(error => {
      processQueue(error);
      
      // Clear user data on refresh token failure
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      throw error;
    }).finally(() => {
      isRefreshing = false;
    });
    
    return refreshPromise;
  } catch (error) {
    isRefreshing = false;
    processQueue(error);
    throw error;
  }
};

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if ((error.response?.status === 401 || error.response?.status === 403) && 
        !originalRequest._retry &&
        !originalRequest.url.includes('/api/auth/login') && 
        !originalRequest.url.includes('/api/auth/refresh-token')) {
      
      originalRequest._retry = true;
      
      try {
        let token;
        
        if (isRefreshing) {
          token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
        } else {
          token = await refreshToken();
        }
        
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        if (!window.location.pathname.includes('/login')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login?auth_error=true';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api; 