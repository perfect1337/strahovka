import axios from 'axios';

// Configure axios defaults
const api = axios.create({
    baseURL: 'http://localhost:8081',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor for authentication
api.interceptors.request.use(request => {
    const token = localStorage.getItem('token');
    if (token) {
        request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
});

// Add request interceptor for logging
api.interceptors.request.use(request => {
    console.log('Request:', {
        url: request.url,
        method: request.method,
        data: request.data
    });
    return request;
});

// Add response interceptor for error handling
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.data) {
            console.error('API Error:', {
                status: error.response.status,
                data: error.response.data,
                message: error.message
            });
        }
        throw error;
    }
);

export const createKaskoApplication = async (applicationData) => {
    try {
        console.log('Sending KASKO data:', applicationData);
        const response = await api.post('/api/insurance/applications/kasko', applicationData);
        return response.data;
    } catch (error) {
        console.error('KASKO application error:', {
            originalData: applicationData,
            error: error.message,
            response: error.response?.data
        });
        throw error;
    }
};

export const getKaskoApplications = async () => {
    const response = await api.get('/api/insurance/applications/user/kasko');
    return response.data;
};

export const getApplicationById = async (id, type) => {
    const response = await api.get(`/api/insurance/applications/user/${type}/${id}`);
    return response.data;
}; 