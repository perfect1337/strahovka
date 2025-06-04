import React, { useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
} from '@mui/material';
import api from '../utils/api';

// Простой компонент для тестирования производительности ввода
const SimpleClaimDialog = ({ open, onClose }) => {
  const [text, setText] = useState('');
  
  const handleSubmit = useCallback(async () => {
    try {
      await api.post('/insurance/claims/test', { response: text });
      onClose();
    } catch (error) {
      console.error('Error:', error);
    }
  }, [text, onClose]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      disablePortal
      keepMounted={false}
    >
      <DialogTitle>Тест производительности ввода</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <div style={{ marginBottom: '16px' }}>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              style={{
                width: '100%',
                minHeight: '150px',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
              placeholder="Введите текст здесь..."
            />
          </div>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Основной компонент страницы для тестирования
const AdminClaims = () => {
  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Тест производительности ввода
      </Typography>
      
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleOpenDialog}
        sx={{ mb: 2 }}
      >
        Открыть тестовое окно
      </Button>

      <SimpleClaimDialog
        open={openDialog}
        onClose={handleCloseDialog}
      />
    </Container>
  );
};

export default AdminClaims; 