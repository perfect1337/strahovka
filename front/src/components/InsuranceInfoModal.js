import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  IconButton,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const InsuranceInfoModal = ({ open, onClose, guide }) => {
  if (!guide) {
    return null;
  }

  // Function to format text with newlines
  const formatText = (text) => {
    return text && typeof text === 'string' ? text.split('\\n').map((line, index) => (
      <Typography variant="body2" component="span" display="block" key={index}>
        {line}
      </Typography>
    )) : <Typography variant="body2" component="span" display="block">-</Typography>;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {guide.title || 'Информация о страховом продукте'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {guide.description && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom component="div">
              Описание продукта
            </Typography>
            <Typography variant="body2" color="text.secondary">{guide.description}</Typography>
          </Box>
        )}

        {guide.calculationRules && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom component="div">
              Как рассчитывается стоимость?
            </Typography>
            {formatText(guide.calculationRules)}
          </Box>
        )}
        
        <Divider sx={{ my: 2 }} />

        {guide.coverageDetails && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom component="div">
              Детали покрытия
            </Typography>
            {formatText(guide.coverageDetails)}
          </Box>
        )}

        {guide.importantNotes && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom component="div">
              Важные заметки
            </Typography>
            {formatText(guide.importantNotes)}
          </Box>
        )}

        {guide.requiredDocuments && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom component="div">
              Необходимые документы
            </Typography>
            {formatText(guide.requiredDocuments)}
          </Box>
        )}

      </DialogContent>
      <DialogActions sx={{ p:2 }}>
        <Button onClick={onClose} variant="outlined">
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InsuranceInfoModal; 