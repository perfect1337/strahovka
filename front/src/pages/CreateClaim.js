import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const CreateClaim = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [formData, setFormData] = useState({
    policyId: '',
    description: '',
    incidentDate: null,
    amount: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesResponse, policiesResponse] = await Promise.all([
          api.get('/api/insurance/categories'),
          api.get('/api/insurance/policies'),
        ]);
        setCategories(categoriesResponse.data);
        setPolicies(policiesResponse.data);
      } catch (err) {
        setError('Ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      incidentDate: date,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('/api/claims', {
        ...formData,
        incidentDate: formData.incidentDate.toISOString(),
      });
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при создании заявки');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Создание заявки
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            select
            fullWidth
            label="Страховой полис"
            name="policyId"
            value={formData.policyId}
            onChange={handleChange}
            required
            margin="normal"
          >
            {policies.map((policy) => (
              <MenuItem key={policy.id} value={policy.id}>
                {`${policy.category.name} - ${policy.policyNumber}`}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Описание происшествия"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            multiline
            rows={4}
            margin="normal"
          />

          <DatePicker
            label="Дата происшествия"
            value={formData.incidentDate}
            onChange={handleDateChange}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                required
                margin="normal"
              />
            )}
          />

          <TextField
            fullWidth
            label="Сумма ущерба"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            required
            margin="normal"
            InputProps={{
              inputProps: { min: 0, step: 0.01 }
            }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ mt: 3 }}
          >
            Создать заявку
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default CreateClaim; 