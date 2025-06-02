import api from '../utils/api';

export const createKaskoApplication = async (applicationData) => {
    try {
        console.log('Sending KASKO data:', applicationData);
        const response = await api.post('/api/insurance/kasko', applicationData);
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
        const response = await api.post(`/api/insurance/kasko/${applicationId}/pay`);
        console.log('Payment successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('Payment processing error:', {
            applicationId,
            error: error.message,
            response: error.response?.data
        });
        let errorMessage = 'Ошибка при обработке платежа Kasko';
        
        if (error.response?.data) {
            if (typeof error.response.data === 'string') {
                errorMessage = error.response.data;
            } else if (error.response.data.message && typeof error.response.data.message === 'string') {
                errorMessage = error.response.data.message;
            } else if (error.response.data.error && typeof error.response.data.error === 'string') {
                errorMessage = error.response.data.error;
            }
        } else if (error.message && typeof error.message === 'string') {
            errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
    }
};

export const cancelClaim = async (claimId) => {
    try {
        const response = await api.post(`/api/insurance/claims/${claimId}/cancel`);
        return response.data;
    } catch (error) {
        console.error('Error cancelling claim:', error);
        let errorMessage = 'Ошибка при отмене заявки';

        if (error.response?.data) {
            if (typeof error.response.data === 'string') {
                errorMessage = error.response.data;
            } else if (error.response.data.message && typeof error.response.data.message === 'string') {
                errorMessage = error.response.data.message;
            } else if (error.response.data.error && typeof error.response.data.error === 'string') {
                errorMessage = error.response.data.error;
            } else if (typeof error.response.data === 'object') {
                try {
                    const errStr = JSON.stringify(error.response.data);
                    if (errStr !== '{}') { 
                        errorMessage = errStr;
                    } else if (error.response.statusText) {
                        errorMessage = error.response.statusText;
                    }
                } catch (e) {
                    if (error.response.statusText) {
                        errorMessage = error.response.statusText;
                    }
                }
            }
        } else if (error.message && typeof error.message === 'string') {
            errorMessage = error.message;
        }
        
        throw new Error(String(errorMessage)); // Ensure the thrown error is a string
    }
};

export const getKaskoApplications = async () => {
    const response = await api.get('/api/insurance/applications/kasko');
    return response.data;
};

export const getOsagoApplications = async () => {
    const response = await api.get('/api/insurance/applications/osago');
    return response.data;
};

export const getTravelApplications = async () => {
    const response = await api.get('/api/insurance/applications/travel');
    return response.data;
};

export const getHealthApplications = async () => {
    const response = await api.get('/api/insurance/applications/health');
    return response.data;
};

export const getPropertyApplications = async () => {
    const response = await api.get('/api/insurance/applications/property');
    return response.data;
};

export const processTravelPayment = async (applicationId) => {
    try {
        const response = await api.post(`/api/insurance/travel/${applicationId}/pay`);
        console.log('Travel payment successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('Travel payment processing error:', {
            applicationId,
            error: error.message,
            response: error.response?.data
        });
        let errorMessage = 'Ошибка при обработке платежа Travel';
        
        if (error.response?.data) {
            if (typeof error.response.data === 'string') {
                errorMessage = error.response.data;
            } else if (error.response.data.message && typeof error.response.data.message === 'string') {
                errorMessage = error.response.data.message;
            } else if (error.response.data.error && typeof error.response.data.error === 'string') {
                errorMessage = error.response.data.error;
            }
        } else if (error.message && typeof error.message === 'string') {
            errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
    }
};

export const processPropertyPayment = async (applicationId) => {
    try {
        const response = await api.post(`/api/insurance/property/${applicationId}/pay`);
        console.log('Property payment successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('Property payment processing error:', {
            applicationId,
            error: error.message,
            response: error.response?.data
        });
        let errorMessage = 'Ошибка при обработке платежа Property';
        
        if (error.response?.data) {
            if (typeof error.response.data === 'string') {
                errorMessage = error.response.data;
            } else if (error.response.data.message && typeof error.response.data.message === 'string') {
                errorMessage = error.response.data.message;
            } else if (error.response.data.error && typeof error.response.data.error === 'string') {
                errorMessage = error.response.data.error;
            }
        } else if (error.message && typeof error.message === 'string') {
            errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
    }
};

export const processOsagoPayment = async (applicationId) => {
    try {
        const response = await api.post(`/api/insurance/osago/${applicationId}/pay`);
        console.log('OSAGO Payment successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('OSAGO Payment processing error:', {
            applicationId,
            error: error.message,
            response: error.response?.data
        });
        let errorMessage = 'Ошибка при обработке платежа ОСАГО';
        
        if (error.response?.data) {
            if (typeof error.response.data === 'string') {
                errorMessage = error.response.data;
            } else if (error.response.data.message && typeof error.response.data.message === 'string') {
                errorMessage = error.response.data.message;
            } else if (error.response.data.error && typeof error.response.data.error === 'string') {
                errorMessage = error.response.data.error;
            }
        } else if (error.message && typeof error.message === 'string') {
            errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
    }
};

export const createTravelApplication = async (applicationData) => {
    try {
        console.log('Sending Travel data:', applicationData);
        const response = await api.post('/api/insurance/applications/travel', applicationData);
        return response.data;
    } catch (error) {
        console.error('Travel application error:', {
            originalData: applicationData,
            error: error.message,
            response: error.response?.data
        });
        throw error;
    }
};

export const createHealthApplication = async (applicationData) => {
    try {
        console.log('Sending Health data:', applicationData);
        const response = await api.post('/api/insurance/applications/health', applicationData);
        return response.data;
    } catch (error) {
        console.error('Health application error:', {
            originalData: applicationData,
            error: error.message,
            response: error.response?.data
        });
        throw error;
    }
};

export const createPropertyApplication = async (applicationData) => {
    try {
        console.log('Sending Property data:', applicationData);
        const response = await api.post('/api/insurance/applications/property', applicationData);
        return response.data;
    } catch (error) {
        console.error('Property application error:', {
            originalData: applicationData,
            error: error.message,
            response: error.response?.data
        });
        throw error;
    }
};

export const processHealthPayment = async (applicationId) => {
    try {
        const response = await api.post(`/api/insurance/health/${applicationId}/pay`);
        console.log('Health Payment successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('Health Payment processing error:', {
            applicationId,
            error: error.message,
            response: error.response?.data
        });
        let errorMessage = 'Ошибка при обработке платежа Health';
        
        if (error.response?.data) {
            if (typeof error.response.data === 'string') {
                errorMessage = error.response.data;
            } else if (error.response.data.message && typeof error.response.data.message === 'string') {
                errorMessage = error.response.data.message;
            } else if (error.response.data.error && typeof error.response.data.error === 'string') {
                errorMessage = error.response.data.error;
            }
        } else if (error.message && typeof error.message === 'string') {
            errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
    }
}; 