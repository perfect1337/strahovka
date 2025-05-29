import api from '../utils/api';

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

export const processKaskoPayment = async (applicationId) => {
    try {
        const response = await api.post(`/api/insurance/applications/kasko/${applicationId}/pay`);
        console.log('Payment successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('Payment processing error:', {
            applicationId,
            error: error.message,
            response: error.response?.data
        });
        throw new Error(error.response?.data || 'Ошибка при обработке платежа');
    }
};

export const cancelClaim = async (claimId) => {
    try {
        const response = await api.post(`/api/insurance/claims/${claimId}/cancel`);
        return response.data;
    } catch (error) {
        console.error('Error cancelling claim:', error);
        throw error;
    }
};

export const getKaskoApplications = async () => {
    const response = await api.get('/api/insurance/applications/user/kasko');
    return response.data;
};

export const getOsagoApplications = async () => {
    const response = await api.get('/api/insurance/applications/user/osago');
    return response.data;
};

export const getTravelApplications = async () => {
    const response = await api.get('/api/insurance/applications/user/travel');
    return response.data;
};

export const getHealthApplications = async () => {
    const response = await api.get('/api/insurance/applications/user/health');
    return response.data;
};

export const getPropertyApplications = async () => {
    const response = await api.get('/api/insurance/applications/user/property');
    return response.data;
}; 