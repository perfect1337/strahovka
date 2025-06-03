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
  Tabs,
  Tab,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const Home = () => {
  const [tabValue, setTabValue] = useState(0);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleBuyClick = (packageId) => {
    navigate(`/insurance/apply?type=package&id=${packageId}`);
  };

  const handleCreatePolicy = (type) => {
    const categoryToPath = {
      'OSAGO': '/insurance/osago',
      'KASKO': '/insurance/kasko',
      'PROPERTY': '/insurance/realestate',
      'HEALTH': '/insurance/health',
      'MORTGAGE': '/insurance/mortgage',
      'TRAVEL': '/insurance/travel',
      'APARTMENT': '/insurance/apartment'
    };
    
    const path = categoryToPath[type];
    if (!path) {
      console.error('Unknown insurance type:', type);
      return;
    }
    navigate(path);
  };

  const renderPackages = () => (
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
                {pkg.basePrice ? pkg.basePrice.toLocaleString('ru-RU') : '0'} ₽
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
                Оформить
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderPolicies = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={4}>
        <Box>
          <Typography variant="h6" gutterBottom>
            ОСАГО
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Обязательное страхование автогражданской ответственности
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button 
              variant="contained" 
              fullWidth
              onClick={() => handleCreatePolicy('OSAGO')}
            >
              ОФОРМИТЬ
            </Button>
            <Button
              variant="outlined"
              startIcon={<HelpOutlineIcon />}
              onClick={() => navigate('/insurance-guide', { state: { type: 'OSAGO' } })}
            >
              СПРАВКА
            </Button>
          </Stack>
        </Box>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <Box>
          <Typography variant="h6" gutterBottom>
            КАСКО
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Добровольное страхование автомобиля
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button 
              variant="contained" 
              fullWidth
              onClick={() => handleCreatePolicy('KASKO')}
            >
              ОФОРМИТЬ
            </Button>
            <Button
              variant="outlined"
              startIcon={<HelpOutlineIcon />}
              onClick={() => navigate('/insurance-guide', { state: { type: 'KASKO' } })}
            >
              СПРАВКА
            </Button>
          </Stack>
        </Box>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Страхование путешествий
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Защита во время поездок по России и за рубежом
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button 
              variant="contained" 
              fullWidth
              onClick={() => handleCreatePolicy('TRAVEL')}
            >
              ОФОРМИТЬ
            </Button>
            <Button
              variant="outlined"
              startIcon={<HelpOutlineIcon />}
              onClick={() => navigate('/insurance-guide', { state: { type: 'TRAVEL' } })}
            >
              СПРАВКА
            </Button>
          </Stack>
        </Box>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Страхование здоровья
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Медицинское страхование и страхование от несчастных случаев
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button 
              variant="contained" 
              fullWidth
              onClick={() => handleCreatePolicy('HEALTH')}
            >
              ОФОРМИТЬ
            </Button>
            <Button
              variant="outlined"
              startIcon={<HelpOutlineIcon />}
              onClick={() => navigate('/insurance-guide', { state: { type: 'HEALTH' } })}
            >
              СПРАВКА
            </Button>
          </Stack>
        </Box>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Страхование недвижимости
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Защита домов, коттеджей и коммерческой недвижимости
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button 
              variant="contained" 
              fullWidth
              onClick={() => handleCreatePolicy('PROPERTY')}
            >
              ОФОРМИТЬ
            </Button>
            <Button
              variant="outlined"
              startIcon={<HelpOutlineIcon />}
              onClick={() => navigate('/insurance-guide', { state: { type: 'PROPERTY' } })}
            >
              СПРАВКА
            </Button>
          </Stack>
        </Box>
      </Grid>
    </Grid>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Страховые продукты
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          centered
          textColor="primary"
          indicatorColor="primary"
          sx={{
            '& .MuiTab-root': {
              fontSize: '1rem',
              fontWeight: 500,
              color: 'rgba(0, 0, 0, 0.7)',
              '&.Mui-selected': {
                color: 'primary.main',
                fontWeight: 600,
              },
            },
          }}
        >
          <Tab label="СТРАХОВЫЕ ПАКЕТЫ" />
          <Tab label="ОТДЕЛЬНЫЕ ПОЛИСЫ" />
        </Tabs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {tabValue === 0 ? renderPackages() : renderPolicies()}
    </Container>
  );
};

export default Home; 