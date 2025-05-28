import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8081',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true
});

// Add request interceptor for authentication
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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
        if (error.response?.status === 401) {
            const publicEndpoints = [
                '/api/auth/login',
                '/api/auth/register',
                '/api/insurance/packages/public',
                '/api/insurance/categories',
                '/api/insurance/guides'
            ];
            
            // Only redirect to login for protected endpoints
            const isPublicEndpoint = publicEndpoints.some(endpoint => 
                error.config.url.includes(endpoint)
            );
            
            if (!isPublicEndpoint) {
                // Clear invalid token
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api; 