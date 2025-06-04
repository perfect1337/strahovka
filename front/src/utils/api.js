import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8081',
    headers: {
        'Accept': 'application/json'
    },
    withCredentials: true
});

let isRefreshing = false;
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

// List of public endpoints that don't require authentication
const publicEndpoints = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/api/auth/validate',
    '/api/insurance/guides',
    '/api/insurance/packages/public',
    '/api/insurance/unauthorized'
];

// Add request interceptor to add token to all requests
api.interceptors.request.use(
    (config) => {
        // Check if the current request URL matches any public endpoint
        const isPublicEndpoint = publicEndpoints.some(endpoint => 
            config.url.includes(endpoint)
        );

        // Only add Authorization header for non-public endpoints
        if (!isPublicEndpoint) {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        
        // Only set Content-Type if not already set (for multipart form data)
        if (!config.headers['Content-Type']) {
            config.headers['Content-Type'] = 'application/json';
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for handling auth errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Check if the current request URL matches any public endpoint
            const isPublicEndpoint = publicEndpoints.some(endpoint => 
                originalRequest.url.includes(endpoint)
            );
            
            // Only handle token refresh for protected endpoints
            if (!isPublicEndpoint) {
                if (isRefreshing) {
                    try {
                        const token = await new Promise((resolve, reject) => {
                            failedQueue.push({ resolve, reject });
                        });
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    } catch (err) {
                        return Promise.reject(err);
                    }
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    const refreshToken = localStorage.getItem('refreshToken');
                    if (!refreshToken) {
                        throw new Error('No refresh token available');
                    }

                    const response = await api.post('/api/auth/refresh', null, {
                        headers: {
                            'Authorization': `Bearer ${refreshToken}`
                        }
                    });

                    const { accessToken, newRefreshToken } = response.data;
                    localStorage.setItem('token', accessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);
                    
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    processQueue(null, accessToken);
                    
                    return api(originalRequest);
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }
        }
        
        return Promise.reject(error);
    }
);

export default api; 