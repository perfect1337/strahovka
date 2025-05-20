import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import HealthForm from './forms/HealthForm';
import KaskoForm from './forms/KaskoForm';
import OsagoForm from './forms/OsagoForm';
import RealEstateForm from './forms/RealEstateForm';
import TravelForm from './forms/TravelForm';
import ApartmentForm from './forms/ApartmentForm';
import MortgageForm from './forms/MortgageForm';

const INSURANCE_CATEGORIES = [
  { key: 'health', label: 'Здоровье' },
  { key: 'kasko', label: 'КАСКО' },
  { key: 'osago', label: 'ОСАГО' },
  { key: 'realestate', label: 'Недвижимость' },
  { key: 'travel', label: 'Путешествия' },
  { key: 'apartment', label: 'Квартира' },
  { key: 'mortgage', label: 'Ипотека' },
];

const InsuranceCategories = () => {
  const [dbCategories, setDbCategories] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [endDate, setEndDate] = useState(null);
  const [details, setDetails] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResponse, packagesResponse] = await Promise.all([
          api.get('/api/insurance/categories'),
          api.get('/api/insurance/packages')
        ]);
        setDbCategories(categoriesResponse.data);
        setPackages(packagesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
      }
    };

    fetchData();
  }, []);

  const handlePurchase = (item, isPackage = false) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (isPackage) {
      setSelectedPackage(item);
      setSelectedCategory(null);
    } else {
      setSelectedCategory(item);
      setSelectedPackage(null);
    }
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      if (selectedPackage) {
        await api.post(`/api/insurance/packages/${selectedPackage.id}/policies`, null, {
          params: {
            endDate: endDate.toISOString().split('T')[0],
            details,
          }
        });
      } else {
        await api.post('/api/insurance/policies', null, {
          params: {
            categoryId: selectedCategory.id,
            endDate: endDate.toISOString().split('T')[0],
            details,
          }
        });
      }

      setOpenDialog(false);
      navigate('/profile');
    } catch (error) {
      console.error('Error creating policy:', error);
      setError('Ошибка при оформлении страховки. Пожалуйста, попробуйте позже.');
    }
  };

  const calculateTotalPrice = (package_) => {
    return package_.categories.reduce((total, category) => total + category.basePrice, 0);
  };

  const calculateDiscountedPrice = (package_) => {
    const total = calculateTotalPrice(package_);
    return total * (1 - package_.discount / 100);
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'BRONZE':
        return '#cd7f32';
      case 'SILVER':
        return '#c0c0c0';
      case 'GOLD':
        return '#ffd700';
      default:
        return '#000000';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Страхование
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {user && (
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="subtitle1">
            Ваш уровень:
          </Typography>
          <Chip
            label={user.level}
            sx={{
              backgroundColor: getLevelColor(user.level),
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        </Box>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Категории" />
          <Tab label="Пакеты" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {dbCategories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="h2">
                    {category.name}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    Базовая стоимость: {category.basePrice} руб.
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {category.description}
                  </Typography>
                  {category.requiredLevel && (
                    <Chip
                      label={`Требуется уровень: ${category.requiredLevel}`}
                      sx={{
                        backgroundColor: getLevelColor(category.requiredLevel),
                        color: 'white',
                        mt: 1,
                      }}
                    />
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => handlePurchase(category)}
                    disabled={category.requiredLevel && (!user || user.level !== category.requiredLevel)}
                  >
                    {!user ? 'Войдите для оформления' : 
                     category.requiredLevel && user.level !== category.requiredLevel ? 
                     'Недоступно для вашего уровня' : 'Оформить страховку'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          {packages.map((package_) => (
            <Grid item xs={12} sm={6} md={4} key={package_.id}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="h2">
                    {package_.name}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    Скидка: {package_.discount}%
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {package_.description}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Включает:
                  </Typography>
                  <List dense>
                    {package_.categories.map((category) => (
                      <ListItem key={category.id}>
                        <ListItemText
                          primary={category.name}
                          secondary={`${category.basePrice} руб.`}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                    Итого со скидкой: {calculateDiscountedPrice(package_).toFixed(2)} руб.
                  </Typography>
                  {package_.requiredLevel && (
                    <Chip
                      label={`Требуется уровень: ${package_.requiredLevel}`}
                      sx={{
                        backgroundColor: getLevelColor(package_.requiredLevel),
                        color: 'white',
                        mt: 1,
                      }}
                    />
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => handlePurchase(package_, true)}
                    disabled={package_.requiredLevel && (!user || user.level !== package_.requiredLevel)}
                  >
                    {!user ? 'Войдите для оформления' : 
                     package_.requiredLevel && user.level !== package_.requiredLevel ? 
                     'Недоступно для вашего уровня' : 'Оформить пакет'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          Оформление {selectedPackage ? 'пакета страховок' : 'страховки'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            {selectedPackage ? selectedPackage.name : selectedCategory?.name}
          </Typography>
          {selectedPackage && (
            <>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Скидка: {selectedPackage.discount}%
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Итого со скидкой: {calculateDiscountedPrice(selectedPackage).toFixed(2)} руб.
              </Typography>
            </>
          )}
          {selectedCategory && (
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Базовая стоимость: {selectedCategory?.basePrice} руб.
            </Typography>
          )}
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Дата окончания"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: 'normal',
                },
              }}
            />
          </LocalizationProvider>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Дополнительная информация"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button onClick={handleSubmit} color="primary">
            Оформить
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Выберите категорию страховки
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {INSURANCE_CATEGORIES.map((cat) => (
            <Grid item key={cat.key}>
              <Button
                variant={selected === cat.key ? 'contained' : 'outlined'}
                onClick={() => setSelected(cat.key)}
              >
                {cat.label}
              </Button>
            </Grid>
          ))}
        </Grid>
        {selected === 'health' && <HealthForm />}
        {selected === 'kasko' && <KaskoForm />}
        {selected === 'osago' && <OsagoForm />}
        {selected === 'realestate' && <RealEstateForm />}
        {selected === 'travel' && <TravelForm />}
        {selected === 'apartment' && <ApartmentForm />}
        {selected === 'mortgage' && <MortgageForm />}
      </Box>
    </Container>
  );
};

export default InsuranceCategories; 