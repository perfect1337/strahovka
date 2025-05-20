import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Alert, List, ListItem, ListItemText } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../api';

/**
 * A component for debugging authentication issues
 * Should only be used in development environments
 */
const AuthDebugger = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await api.testConnection();
      setTestResults(results);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearStorage = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        right: 0, 
        width: '350px', 
        p: 2, 
        m: 2, 
        zIndex: 9999,
        opacity: 0.9,
        maxHeight: '80vh',
        overflow: 'auto',
        borderTop: '4px solid #f50057'
      }}
    >
      <Typography variant="h6" gutterBottom>Auth Debugger</Typography>
      
      <Typography variant="subtitle2">Current User:</Typography>
      <Box sx={{ mb: 2, fontSize: '0.75rem', whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>
        {user ? JSON.stringify(user, null, 2) : 'Not logged in'}
      </Box>
      
      <Typography variant="subtitle2">Token in LocalStorage:</Typography>
      <Box sx={{ mb: 2, fontSize: '0.75rem', whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>
        {localStorage.getItem('token') 
          ? `${localStorage.getItem('token').substring(0, 20)}...` 
          : 'No token found'}
      </Box>
      
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button 
          variant="contained" 
          size="small" 
          onClick={runTest} 
          disabled={loading}
          color="primary"
        >
          {loading ? 'Testing...' : 'Test Connection'}
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={clearStorage}
          color="error"
        >
          Clear Storage
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {testResults && (
        <>
          <Typography variant="subtitle2">Test Results:</Typography>
          <List dense>
            {testResults.steps.map((step, index) => (
              <ListItem key={index} dense divider>
                <ListItemText 
                  primary={step.step} 
                  secondary={step.message}
                  primaryTypographyProps={{ 
                    color: step.success ? 'success.main' : 'error.main',
                    variant: 'body2',
                    fontWeight: 'bold'
                  }}
                  secondaryTypographyProps={{ 
                    variant: 'caption' 
                  }}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}
      
      <Typography variant="caption" sx={{ mt: 2, display: 'block', color: 'text.secondary' }}>
        * Debug mode - remove in production
      </Typography>
    </Paper>
  );
};

export default AuthDebugger; 