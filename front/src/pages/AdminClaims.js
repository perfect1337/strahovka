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
} from '@mui/material';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { checkIfAdmin } from '../utils/roleUtils';

const AdminClaims = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    // Only fetch claims if user is admin
    if (user && checkIfAdmin(user.role)) {
      fetchClaims();
    }
  }, [user]);

  const fetchClaims = async () => {
    try {
      const response = await api.get('/api/insurance/claims/pending');
      setClaims(response.data);
    } catch (error) {
      console.error('Error fetching claims:', error);
    }
  };

  const handleProcessClaim = async () => {
    try {
      await api.post(
        `/api/insurance/claims/${selectedClaim.id}/process`,
        null,
        {
          params: {
            response,
            status,
          }
        }
      );
      setOpenDialog(false);
      setResponse('');
      setStatus('');
      fetchClaims();
    } catch (error) {
      console.error('Error processing claim:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Обработка страховых случаев
      </Typography>

      <Grid container spacing={3}>
        {claims.map((claim) => (
          <Grid item xs={12} md={6} key={claim.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  Страховой случай #{claim.id}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Статус: {claim.status}
                </Typography>
                <Typography variant="body2">
                  Дата создания: {new Date(claim.claimDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Полис: {claim.policy.category.name}
                </Typography>
                <Typography variant="body2">
                  Клиент: {claim.policy.user.firstName} {claim.policy.user.lastName}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Описание: {claim.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => {
                    setSelectedClaim(claim);
                    setOpenDialog(true);
                  }}
                >
                  Обработать
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Обработка страхового случая</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Страховой случай #{selectedClaim?.id}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Описание: {selectedClaim?.description}
          </Typography>

          <FormControl fullWidth margin="normal">
            <InputLabel>Статус</InputLabel>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              label="Статус"
            >
              <MenuItem value="APPROVED">Одобрить</MenuItem>
              <MenuItem value="REJECTED">Отклонить</MenuItem>
              <MenuItem value="IN_PROGRESS">В обработке</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Ответ"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button onClick={handleProcessClaim} color="primary">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminClaims; 