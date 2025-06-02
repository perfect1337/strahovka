import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  FormHelperText,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';

const InsuranceGuide = () => {
  const [guides, setGuides] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const location = useLocation();
  const guideRefs = useRef({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    insuranceType: '',
    importantNotes: '',
    requiredDocuments: '',
    coverageDetails: '',
    calculationRules: '',
    active: true,
    displayOrder: 0,
    content: ''
  });

  const insuranceTypes = [
    { value: 'OSAGO', label: 'ОСАГО' },
    { value: 'KASKO', label: 'КАСКО' },
    { value: 'TRAVEL', label: 'Страхование путешествий' },
    { value: 'HEALTH', label: 'Страхование здоровья' },
    { value: 'PROPERTY', label: 'Страхование имущества' }
  ];

  useEffect(() => {
    fetchGuides();
  }, []);

  useEffect(() => {
    // Scroll to the relevant section if type is provided in navigation state
    if (location.state?.type && guideRefs.current[location.state.type]) {
      guideRefs.current[location.state.type].scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.state, guides]);

  const fetchGuides = async () => {
    try {
      const response = await api.get('/api/insurance/guides');
      setGuides(response.data);
    } catch (error) {
      console.error('Error fetching guides:', error);
    }
  };

  const handleOpenDialog = (guide = null) => {
    if (guide) {
      setFormData({
        title: guide.title,
        description: guide.description,
        insuranceType: guide.insuranceType,
        importantNotes: guide.importantNotes || '',
        requiredDocuments: guide.requiredDocuments || '',
        coverageDetails: guide.coverageDetails || '',
        calculationRules: guide.calculationRules || '',
        active: guide.active,
        displayOrder: guide.displayOrder || 0,
        content: guide.content || ''
      });
      setSelectedGuide(guide);
    } else {
      setFormData({
        title: '',
        description: '',
        insuranceType: '',
        importantNotes: '',
        requiredDocuments: '',
        coverageDetails: '',
        calculationRules: '',
        active: true,
        displayOrder: 0,
        content: ''
      });
      setSelectedGuide(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedGuide(null);
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.title || !formData.description || !formData.insuranceType ||
        !formData.importantNotes || !formData.requiredDocuments || !formData.coverageDetails ||
        formData.displayOrder === null) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      if (selectedGuide) {
        await api.put(`/api/insurance/guides/${selectedGuide.id}`, formData);
      } else {
        await api.post('/api/insurance/guides', formData);
      }
      handleCloseDialog();
      fetchGuides();
    } catch (error) {
      console.error('Error saving guide:', error);
      if (error.response?.data) {
        alert(`Ошибка: ${error.response.data}`);
      } else {
        alert('Произошла ошибка при сохранении справочника');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту запись?')) {
      try {
        await api.delete(`/api/insurance/guides/${id}`);
        fetchGuides();
      } catch (error) {
        console.error('Error deleting guide:', error);
      }
    }
  };

  const groupedGuides = guides.reduce((acc, guide) => {
    if (!acc[guide.insuranceType]) {
      acc[guide.insuranceType] = [];
    }
    acc[guide.insuranceType].push(guide);
    return acc;
  }, {});

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Справочник по страхованию</Typography>
        {isAdmin && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenDialog()}
          >
            Добавить информацию
          </Button>
        )}
      </Box>

      {insuranceTypes.map(type => (
        <Box 
          key={type.value} 
          mb={3} 
          ref={el => guideRefs.current[type.value] = el}
        >
          <Typography variant="h5" gutterBottom>{type.label}</Typography>
          {groupedGuides[type.value]?.map(guide => (
            <Accordion 
              key={guide.id}
              defaultExpanded={location.state?.type === type.value}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{guide.title}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>{guide.description}</Typography>
                {guide.importantNotes && (
                  <>
                    <Typography variant="h6" gutterBottom>Важные примечания</Typography>
                    <Typography paragraph>{guide.importantNotes}</Typography>
                  </>
                )}
                {guide.requiredDocuments && (
                  <>
                    <Typography variant="h6" gutterBottom>Необходимые документы</Typography>
                    <Typography paragraph>{guide.requiredDocuments}</Typography>
                  </>
                )}
                {guide.coverageDetails && (
                  <>
                    <Typography variant="h6" gutterBottom>Детали покрытия</Typography>
                    <Typography paragraph>{guide.coverageDetails}</Typography>
                  </>
                )}
                {guide.calculationRules && (
                  <>
                    <Typography variant="h6" gutterBottom>Правила расчета</Typography>
                    <Typography paragraph sx={{ whiteSpace: 'pre-line' }}>
                      {guide.calculationRules}
                    </Typography>
                  </>
                )}
                {isAdmin && (
                  <Box mt={2}>
                    <Button
                      size="small"
                      onClick={() => handleOpenDialog(guide)}
                      sx={{ mr: 1 }}
                    >
                      Редактировать
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDelete(guide.id)}
                    >
                      Удалить
                    </Button>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      ))}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedGuide ? 'Редактировать запись' : 'Новая запись'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Заголовок"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              margin="normal"
              required
              error={!formData.title}
              helperText={!formData.title ? "Название справочника обязательно" : ""}
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
              error={!formData.description}
              helperText={!formData.description ? "Описание справочника обязательно" : ""}
            />
            <FormControl fullWidth margin="normal" required error={!formData.insuranceType}>
              <InputLabel>Тип страхования</InputLabel>
              <Select
                value={formData.insuranceType}
                onChange={(e) => setFormData({ ...formData, insuranceType: e.target.value })}
                label="Тип страхования"
              >
                {insuranceTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
              {!formData.insuranceType && (
                <FormHelperText>Тип страхования обязателен</FormHelperText>
              )}
            </FormControl>
            <TextField
              fullWidth
              label="Важные примечания"
              value={formData.importantNotes}
              onChange={(e) => setFormData({ ...formData, importantNotes: e.target.value })}
              margin="normal"
              multiline
              rows={3}
              required
              error={!formData.importantNotes}
              helperText={!formData.importantNotes ? "Важные заметки обязательны" : ""}
            />
            <TextField
              fullWidth
              label="Необходимые документы"
              value={formData.requiredDocuments}
              onChange={(e) => setFormData({ ...formData, requiredDocuments: e.target.value })}
              margin="normal"
              multiline
              rows={3}
              required
              error={!formData.requiredDocuments}
              helperText={!formData.requiredDocuments ? "Необходимые документы обязательны" : ""}
            />
            <TextField
              fullWidth
              label="Детали покрытия"
              value={formData.coverageDetails}
              onChange={(e) => setFormData({ ...formData, coverageDetails: e.target.value })}
              margin="normal"
              multiline
              rows={4}
              required
              error={!formData.coverageDetails}
              helperText={!formData.coverageDetails ? "Детали покрытия обязательны" : ""}
            />
            <TextField
              fullWidth
              label="Правила расчета стоимости"
              value={formData.calculationRules}
              onChange={(e) => setFormData({ ...formData, calculationRules: e.target.value })}
              margin="normal"
              multiline
              rows={4}
            />
            <TextField
              fullWidth
              label="Порядок отображения"
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
              margin="normal"
              required
              error={formData.displayOrder === null}
              helperText={formData.displayOrder === null ? "Порядок отображения обязателен" : ""}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={!formData.title || !formData.description || !formData.insuranceType ||
                     !formData.importantNotes || !formData.requiredDocuments || !formData.coverageDetails ||
                     formData.displayOrder === null}
          >
            {selectedGuide ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InsuranceGuide; 