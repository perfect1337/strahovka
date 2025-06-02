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
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import AddIcon from '@mui/icons-material/Add';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const InsurancePackages = ({ adminView = false }) => {
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
    if (user) {
      fetchCategories();
    }
  }, [user]);

  const fetchPackages = async () => {
    try {
      const endpoint = adminView ? '/api/insurance/packages/admin' : '/api/insurance/packages/public';
      const packagesResponse = await api.get(endpoint);
      setPackages(packagesResponse.data);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesResponse = await api.get('/api/insurance/categories');
      setCategories(categoriesResponse.data);
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
      const selectedCategories = formData.categories.map(categoryId => 
        categories.find(c => c.id === categoryId)
      );

      const data = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        categories: selectedCategories
      };

      if (selectedPackage) {
        await api.put(`/api/insurance/packages/${selectedPackage.id}`, data);
      } else {
        await api.post('/api/insurance/packages', data);
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
        await api.delete(`/api/insurance/packages/${id}`);
        fetchPackages();
      } catch (error) {
        console.error('Error deleting package:', error);
      }
    }
  };

  const handleToggleActive = async (pkg) => {
    try {
      await api.put(`/api/insurance/packages/${pkg.id}`, {
        ...pkg,
        active: !pkg.active
      });
      fetchPackages();
    } catch (error) {
      console.error('Error toggling package status:', error);
    }
  };

  const handleCreatePolicy = (item, type) => {
    if (type === 'package') {
      navigate(`/create-policy?type=package&id=${item.id}`);
    } else {
      const categoryToPath = {
        'OSAGO': '/insurance/osago',
        'KASKO': '/insurance/kasko',
        'HEALTH': '/insurance/health',
        'MORTGAGE': '/insurance/mortgage',
        'TRAVEL': '/insurance/travel',
        'APARTMENT': '/insurance/apartment',
        'REALESTATE': '/insurance/realestate'
      };
      
      const path = categoryToPath[item.type];
      if (!path) {
        console.error('Unknown insurance type:', item.type);
        return;
      }
      navigate(path);
    }
  };

  const renderPackages = () => (
    <Grid container spacing={3}>
      {packages.map((pkg) => (
        <Grid item xs={12} sm={6} md={4} key={pkg.id}>
          <Card sx={{ 
            opacity: pkg.active ? 1 : 0.7,
            position: 'relative',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {!pkg.active && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  bgcolor: 'error.main',
                  color: 'white',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.75rem',
                }}
              >
                Неактивен
              </Box>
            )}
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
              {!adminView && pkg.active && (
                <Button 
                  fullWidth 
                  variant="contained" 
                  color="primary"
                  onClick={() => handleCreatePolicy(pkg, 'package')}
                >
                  Оформить
                </Button>
              )}
              {adminView && (
                <>
                  <Button size="small" onClick={() => handleOpenDialog(pkg)}>
                    Редактировать
                  </Button>
                  <Button 
                    size="small" 
                    color={pkg.active ? "warning" : "success"}
                    onClick={() => handleToggleActive(pkg)}
                  >
                    {pkg.active ? 'Деактивировать' : 'Активировать'}
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
              onClick={() => handleCreatePolicy({ type: 'OSAGO' }, 'policy')}
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
              onClick={() => handleCreatePolicy({ type: 'KASKO' }, 'policy')}
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
              onClick={() => handleCreatePolicy({ type: 'TRAVEL' }, 'policy')}
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
              onClick={() => handleCreatePolicy({ type: 'HEALTH' }, 'policy')}
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
              onClick={() => handleCreatePolicy({ type: 'REALESTATE' }, 'policy')}
            >
              ОФОРМИТЬ
            </Button>
            <Button
              variant="outlined"
              startIcon={<HelpOutlineIcon />}
              onClick={() => navigate('/insurance-guide', { state: { type: 'REALESTATE' } })}
            >
              СПРАВКА
            </Button>
          </Stack>
        </Box>
      </Grid>

    </Grid>
  );

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

      {tabValue === 0 ? (
        <>
          {adminView && (
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Добавить пакет
              </Button>
            </Box>
          )}
          {renderPackages()}
        </>
      ) : (
        renderPolicies()
      )}

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
              required
            />
            <TextField
              fullWidth
              label="Описание"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={4}
              required
            />
            <TextField
              fullWidth
              label="Базовая цена"
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
              margin="normal"
              type="number"
              required
              InputProps={{
                inputProps: { min: 0 }
              }}
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
            <FormControl fullWidth margin="normal" required>
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
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!formData.name || !formData.description || !formData.basePrice || formData.categories.length === 0}
          >
            {selectedPackage ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InsurancePackages; 