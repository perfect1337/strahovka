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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const CreateClaim = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [policies, setPolicies] = useState([]);
  const [formData, setFormData] = useState({
    policyId: '',
    description: '',
    incidentDate: null,
  });
  const [files, setFiles] = useState([]);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const policiesResponse = await api.get('/api/insurance/policies');
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

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    event.target.value = null; // Reset input
  };

  const handleRemoveFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUploadError('');

    try {
      // First create the claim
      const claimResponse = await api.post('/api/insurance/claims', {
        policyId: formData.policyId,
        description: formData.description,
        incidentDate: formData.incidentDate.toISOString(),
      });

      // Then upload files if any
      if (files.length > 0) {
        const claimId = claimResponse.data.id;
        for (const file of files) {
          const formData = new FormData();
          formData.append('file', file);
          try {
            await api.post(`/api/insurance/claims/${claimId}/attachments`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
          } catch (uploadErr) {
            setUploadError(`Ошибка при загрузке файла ${file.name}: ${uploadErr.message}`);
          }
        }
      }

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

        {uploadError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {uploadError}
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

          <Box sx={{ mt: 2, mb: 2 }}>
            <input
              accept="image/*,.pdf,.doc,.docx"
              style={{ display: 'none' }}
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                fullWidth
              >
                Прикрепить файлы
              </Button>
            </label>
          </Box>

          {files.length > 0 && (
            <List>
              {files.map((file, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={file.name}
                    secondary={`${(file.size / 1024).toFixed(2)} KB`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleRemoveFile(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}

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