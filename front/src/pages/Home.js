import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Home = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        // Use public endpoint for unauthorized users
        const endpoint = user ? '/api/insurance/packages' : '/api/insurance/packages/public';
        const response = await api.get(endpoint);
        setPackages(response.data);
      } catch (err) {
        console.error('Error fetching packages:', err);
        setError('Ошибка при загрузке пакетов. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [user]);

  const handleBuyClick = (packageId) => {
    if (!user) {
      navigate('/login', { state: { from: `/insurance/buy/${packageId}` } });
      return;
    }
    navigate(`/insurance/buy/${packageId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Страховые пакеты
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {packages.map((pkg) => (
          <Grid item xs={12} sm={6} md={4} key={pkg.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {pkg.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {pkg.description}
                </Typography>
                <Typography variant="h6" color="primary" gutterBottom>
                  {pkg.basePrice.toLocaleString('ru-RU')} ₽
                </Typography>
                {pkg.discount > 0 && (
                  <Typography variant="body2" color="error">
                    Скидка: {pkg.discount}%
                  </Typography>
                )}
                <Box mt={1}>
                  {pkg.categories.map((category) => (
                    <Chip
                      key={category.id}
                      label={category.name}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
              </CardContent>
              <CardActions>
                <Button 
                  fullWidth 
                  variant="contained" 
                  color="primary" 
                  onClick={() => handleBuyClick(pkg.id)}
                >
                  {user ? 'Оформить' : 'Войти и оформить'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home; 