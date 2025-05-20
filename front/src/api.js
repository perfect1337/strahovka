import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Добавляем поддержку CORS
});

// Добавляем перехватчик для запросов
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Log all requests to debug authentication issues
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: {
        ...config.headers,
        Authorization: config.headers.Authorization 
          ? `${config.headers.Authorization.substring(0, 15)}...` // Only show beginning of token for security
          : 'none'
      },
      hasToken: !!token,
      tokenLength: token ? token.length : 0
    });

    // Проверяем и логируем данные запроса
    if (config.method === 'post') {
      console.log('Request data:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
        data: config.data,
        baseURL: config.baseURL,
        withCredentials: config.withCredentials,
      });

      // Проверяем формат данных
      if (config.data) {
        try {
          const data = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
          console.log('Request data validation:', {
            hasEmail: !!data.email,
            hasPassword: !!data.password,
            hasFirstName: !!data.firstName,
            hasLastName: !!data.lastName,
            emailLength: data.email?.length,
            passwordLength: data.password?.length,
            dataKeys: Object.keys(data),
            dataValues: Object.entries(data).map(([key, value]) => ({
              key,
              type: typeof value,
              length: typeof value === 'string' ? value.length : undefined,
            })),
          });
        } catch (e) {
          console.error('Error parsing request data:', e);
        }
      }
    }

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Добавляем перехватчик для ответов
api.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers,
      config: {
        url: response.config.url,
        method: response.config.method,
        headers: response.config.headers,
        withCredentials: response.config.withCredentials,
      },
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        data: error.config?.data,
        withCredentials: error.config?.withCredentials,
      },
    });

    // Проверяем формат ответа с ошибкой
    if (error.response?.data) {
      try {
        const errorData = typeof error.response.data === 'string' 
          ? JSON.parse(error.response.data) 
          : error.response.data;
        console.log('Error response data:', errorData);
      } catch (e) {
        console.log('Raw error response data:', error.response.data);
      }
    }

    // Проверяем заголовки ответа
    if (error.response?.headers) {
      console.log('Error response headers:', {
        'access-control-allow-origin': error.response.headers['access-control-allow-origin'],
        'access-control-allow-credentials': error.response.headers['access-control-allow-credentials'],
        'access-control-allow-methods': error.response.headers['access-control-allow-methods'],
        'access-control-allow-headers': error.response.headers['access-control-allow-headers'],
        'content-type': error.response.headers['content-type'],
        'content-length': error.response.headers['content-length'],
      });
    }

    return Promise.reject(error);
  }
);

/**
 * Tests the connection to the API and authentication status
 * @returns {Promise} Promise that resolves with test results
 */
api.testConnection = async () => {
  const results = { success: false, steps: [] };
  
  try {
    // Step 1: Check if token exists
    const token = localStorage.getItem('token');
    results.steps.push({
      step: 'Check token',
      success: !!token,
      message: token ? `Token exists (${token.substring(0, 10)}...)` : 'No token found'
    });
    
    // Step 2: Try a public endpoint
    try {
      const publicResponse = await api.get('/api/insurance/categories');
      results.steps.push({
        step: 'Public endpoint',
        success: true,
        status: publicResponse.status,
        message: 'Successfully accessed public endpoint'
      });
    } catch (error) {
      results.steps.push({
        step: 'Public endpoint',
        success: false,
        status: error.response?.status,
        message: `Failed to access public endpoint: ${error.message}`
      });
    }
    
    // Step 3: Try a protected endpoint
    if (token) {
      try {
        const protectedResponse = await api.get('/api/insurance/policies');
        results.steps.push({
          step: 'Protected endpoint',
          success: true,
          status: protectedResponse.status,
          message: 'Successfully accessed protected endpoint'
        });
      } catch (error) {
        results.steps.push({
          step: 'Protected endpoint',
          success: false,
          status: error.response?.status,
          message: `Failed to access protected endpoint: ${error.message}`
        });
      }
    }
    
    // Step 4: Try to refresh the token
    if (token) {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          const refreshResponse = await api.post('/api/auth/refresh-token', { email: user.email });
          results.steps.push({
            step: 'Token refresh',
            success: true,
            status: refreshResponse.status,
            message: 'Successfully refreshed token'
          });
          
          // Save the new token
          localStorage.setItem('token', refreshResponse.data.token);
        } catch (error) {
          results.steps.push({
            step: 'Token refresh',
            success: false,
            status: error.response?.status,
            message: `Failed to refresh token: ${error.message}`
          });
        }
      }
    }
    
    results.success = results.steps.every(step => step.success);
  } catch (error) {
    results.steps.push({
      step: 'Overall test',
      success: false,
      message: `Test failed with error: ${error.message}`
    });
  }
  
  console.log('API Connection Test Results:', results);
  return results;
};

export default api; 