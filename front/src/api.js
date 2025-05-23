import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

let refreshPromise = null;

const refreshToken = async () => {
  const storedUser = localStorage.getItem('user');
  const refreshToken = localStorage.getItem('refreshToken');

  if (!storedUser || !refreshToken) {
    throw new Error('No refresh token available');
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = api.post('/auth/refresh-token', { 
    email: JSON.parse(storedUser).email,
    refreshToken: refreshToken
  })
  .then(response => {
    console.log('Refresh token response:', response.data);
    
    if (response.data && response.data.token && response.data.refreshToken) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      // Update user info if changed
      const updatedUser = {
        email: response.data.email,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        role: response.data.role,
        level: response.data.level,
        policyCount: response.data.policyCount,
        name: `${response.data.firstName} ${response.data.lastName}`
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return response.data;
    }
    throw new Error('Invalid refresh token response');
  })
  .catch(error => {
    console.error('Error refreshing token:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw error;
  })
  .finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
};

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const data = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api; 