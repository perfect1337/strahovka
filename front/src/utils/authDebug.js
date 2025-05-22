import api from '../api';

export const debugAuth = async () => {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');
  const user = localStorage.getItem('user');
  
  console.group('Auth Debug Information');
  
  console.log('Token state:', {
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    tokenPreview: token ? `${token.substring(0, 15)}...` : null,
    hasRefreshToken: !!refreshToken,
    refreshTokenLength: refreshToken ? refreshToken.length : 0,
    hasUser: !!user,
    user: user ? JSON.parse(user) : null
  });
  
  try {
    // Check headers being sent
    console.log('Making test request to debug headers...');
    const headersResponse = await api.get('/api/debug/headers');
    console.log('Headers sent in request:', headersResponse.data);
    
    // Check auth status
    console.log('Checking auth status...');
    const authStatusResponse = await api.get('/api/debug/auth-status');
    console.log('Auth status from server:', authStatusResponse.data);
    
    console.log('Auth debug completed successfully');
  } catch (error) {
    console.error('Error during auth debugging:', error);
  }
  
  console.groupEnd();
  
  return {
    token,
    refreshToken,
    user: user ? JSON.parse(user) : null
  };
};

export const clearAuthAndRedirect = () => {
  console.log('Clearing auth data and redirecting to login...');
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  
  // Add query param to indicate auth error
  window.location.href = '/login?authError=true';
};

export default {
  debugAuth,
  clearAuthAndRedirect
}; 