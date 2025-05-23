import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  OutlinedInput,
  Tabs,
  Tab,
  Paper,
  CardMedia,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const InsurancePackages = () => {
  const [tabValue, setTabValue] = useState(0);
  const [packages, setPackages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    discount: 0,
    categories: [],
    active: true
  });

  useEffect(() => {
    fetchPackages();
    fetchCategories();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await api.get('/insurance/packages');
      setPackages(response.data);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/insurance/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (pkg = null) => {
    if (pkg) {
      setFormData({
        name: pkg.name,
        description: pkg.description,
        basePrice: pkg.basePrice.toString(),
        discount: pkg.discount,
        categories: pkg.categories.map(c => c.id),
        active: pkg.active
      });
      setSelectedPackage(pkg);
    } else {
      setFormData({
        name: '',
        description: '',
        basePrice: '',
        discount: 0,
        categories: [],
        active: true
      });
      setSelectedPackage(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPackage(null);
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        basePrice: parseFloat(formData.basePrice)
      };

      if (selectedPackage) {
        await api.put(`/insurance/packages/${selectedPackage.id}`, data);
      } else {
        await api.post('/insurance/packages', data);
      }

      handleCloseDialog();
      fetchPackages();
    } catch (error) {
      console.error('Error saving package:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот пакет?')) {
      try {
        await api.delete(`/insurance/packages/${id}`);
        fetchPackages();
      } catch (error) {
        console.error('Error deleting package:', error);
      }
    }
  };

  const handleCreatePolicy = (item, type) => {
    if (type === 'package') {
      navigate(`/create-policy?type=package&id=${item.id}`);
    } else {
      navigate(`/create-policy?category=${item.id}`);
    }
  };

  const renderPackages = () => (
    <Grid container spacing={3}>
      {packages.map((pkg) => (
        <Grid item xs={12} sm={6} md={4} key={pkg.id}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {pkg.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                {pkg.description}
              </Typography>
              <Typography variant="h6" color="primary">
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
              <Button size="small" color="primary" onClick={() => handleCreatePolicy(pkg, 'package')}>
                Оформить
              </Button>
              {isAdmin && (
                <>
                  <Button size="small" onClick={() => handleOpenDialog(pkg)}>
                    Редактировать
                  </Button>
                  <Button size="small" color="error" onClick={() => handleDelete(pkg.id)}>
                    Удалить
                  </Button>
                </>
              )}
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderPolicies = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardMedia
            component="img"
            height="140"
            image="/images/car-insurance.jpg"
            alt="ОСАГО"
          />
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ОСАГО
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Обязательное страхование автогражданской ответственности
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" color="primary" onClick={() => navigate('/create-policy?type=osago')}>
              Оформить
            </Button>
          </CardActions>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardMedia
            component="img"
            height="140"
            image="/images/kasko.jpg"
            alt="КАСКО"
          />
          <CardContent>
            <Typography variant="h6" gutterBottom>
              КАСКО
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Добровольное страхование автомобиля
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" color="primary" onClick={() => navigate('/create-policy?type=kasko')}>
              Оформить
            </Button>
          </CardActions>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardMedia
            component="img"
            height="140"
            image="/images/property.jpg"
            alt="Недвижимость"
          />
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Недвижимость
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Страхование квартир, домов и других объектов недвижимости
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" color="primary" onClick={() => navigate('/create-policy?type=property')}>
              Оформить
            </Button>
          </CardActions>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardMedia
            component="img"
            height="140"
            image="/images/health.jpg"
            alt="Здоровье"
          />
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Здоровье
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Добровольное медицинское страхование
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" color="primary" onClick={() => navigate('/create-policy?type=health')}>
              Оформить
            </Button>
          </CardActions>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardMedia
            component="img"
            height="140"
            image="/images/mortgage.jpg"
            alt="Ипотека"
          />
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Ипотечное страхование
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Комплексное страхование для ипотечных заемщиков
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" color="primary" onClick={() => navigate('/create-policy?type=mortgage')}>
              Оформить
            </Button>
          </CardActions>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardMedia
            component="img"
            height="140"
            image="/images/travel.jpg"
            alt="Путешествия"
          />
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Путешествия
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Страхование для путешественников
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" color="primary" onClick={() => navigate('/create-policy?type=travel')}>
              Оформить
            </Button>
          </CardActions>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Страховые продукты</Typography>
        {isAdmin && tabValue === 0 && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenDialog()}
          >
            Добавить пакет
          </Button>
        )}
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Страховые пакеты" />
          <Tab label="Отдельные полисы" />
        </Tabs>
      </Paper>

      {tabValue === 0 ? renderPackages() : renderPolicies()}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedPackage ? 'Редактировать пакет' : 'Новый пакет'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Название"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Описание"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={4}
            />
            <TextField
              fullWidth
              label="Базовая цена"
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
              margin="normal"
              type="number"
            />
            <TextField
              fullWidth
              label="Скидка (%)"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) || 0 })}
              margin="normal"
              type="number"
              inputProps={{ min: 0, max: 100 }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Категории</InputLabel>
              <Select
                multiple
                value={formData.categories}
                onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                input={<OutlinedInput label="Категории" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={categories.find(c => c.id === value)?.name}
                      />
                    ))}
                  </Box>
                )}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedPackage ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InsurancePackages; 