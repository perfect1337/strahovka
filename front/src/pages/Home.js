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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

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
        const response = await api.get('/api/insurance/packages');
        setPackages(response.data);
      } catch (err) {
        console.error('Error fetching packages:', err);
        if (err.response?.status === 403) {
          setError('Для просмотра пакетов необходимо авторизоваться');
        } else {
          setError('Ошибка при загрузке пакетов. Пожалуйста, попробуйте позже.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handleBuyClick = (packageId) => {
    if (!user) {
      navigate('/login');
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
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Страховые пакеты
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {packages.map((pkg) => (
          <Grid item xs={12} sm={6} md={4} key={pkg.id}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  {pkg.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {pkg.description}
                </Typography>
                <Typography variant="h6" color="primary">
                  {pkg.price} ₽/мес
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="large"
                  fullWidth
                  variant="contained"
                  onClick={() => handleBuyClick(pkg.id)}
                >
                  {user ? 'Купить' : 'Войти для покупки'}
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