import React, { useState } from 'react';
import { Box, Button, Typography, Paper, List, ListItem, ListItemText, CircularProgress, Alert } from '@mui/material';
import api from '../api';

/**
 * A component for debugging authentication issues
 * Should only be used in development environments
 */
const AuthDebugger = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const runTest = async () => {
    setTesting(true);
    setResults(null);
    setError(null);
    
    try {
      // Debug current auth state
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      // Check backend debug endpoint
      let debugInfo = null;
      try {
        const debugResponse = await api.get('/api/auth/debug-token');
        debugInfo = debugResponse.data;
      } catch (err) {
        debugInfo = {
          error: err.message,
          status: err.response?.status,
          data: err.response?.data
        };
      }
      
      // Test connection
      const testResults = await api.testConnection();
      
      setResults({
        token: token ? {
          value: `${token.substring(0, 20)}...`,
          length: token.length
        } : null,
        user: user ? JSON.parse(user) : null,
        debugInfo,
        testResults
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setTesting(false);
    }
  };
  
  return (
    <Box sx={{ mt: 2, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Auth Debugger</Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
        
        <Button 
          variant="contained" 
          onClick={runTest}
          disabled={testing}
          sx={{ mb: 3 }}
        >
          {testing ? <CircularProgress size={24} /> : 'Run Diagnostics'}
        </Button>
        
        {results && (
          <Box>
            <Typography variant="h6" gutterBottom>Current User:</Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2, whiteSpace: 'pre-wrap' }}>
              {results.user ? JSON.stringify(results.user, null, 2) : 'Not logged in'}
            </Paper>
            
            <Typography variant="h6" gutterBottom>Token in LocalStorage:</Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2, whiteSpace: 'pre-wrap' }}>
              {results.token ? `${results.token.value} (${results.token.length} characters)` : 'No token found'}
            </Paper>
            
            <Typography variant="h6" gutterBottom>Backend Auth Info:</Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(results.debugInfo, null, 2)}
            </Paper>
            
            <Typography variant="h6" gutterBottom>Test Results:</Typography>
            <List sx={{ bgcolor: 'background.paper' }}>
              {results.testResults.steps.map((step, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={`${step.step}: ${step.success ? '✅' : '❌'}`}
                    secondary={step.message}
                  />
                </ListItem>
              ))}
            </List>
            
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  runTest();
                }}
                color="error"
              >
                Clear Auth Data
              </Button>
              
              <Button 
                variant="outlined"
                onClick={() => window.location.href = '/login'}
              >
                Go to Login
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AuthDebugger; 