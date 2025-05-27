import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Box,
  Divider
} from '@mui/material';
import ClaimComments from './ClaimComments';

const ClaimDetails = ({ claim }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING':
        return 'На рассмотрении';
      case 'APPROVED':
        return 'Одобрено';
      case 'REJECTED':
        return 'Отклонено';
      default:
        return status;
    }
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>
                Страховой случай #{claim.id}
              </Typography>
              <Chip
                label={getStatusLabel(claim.status)}
                color={getStatusColor(claim.status)}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Дата происшествия
              </Typography>
              <Typography variant="body1" gutterBottom>
                {new Date(claim.incidentDate).toLocaleDateString()}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Тип страхования
              </Typography>
              <Typography variant="body1" gutterBottom>
                {claim.insuranceType}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">
                Описание происшествия
              </Typography>
              <Typography variant="body1" paragraph>
                {claim.description}
              </Typography>
            </Grid>

            {claim.rejectionReason && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="error">
                  Причина отказа
                </Typography>
                <Typography variant="body1" color="error">
                  {claim.rejectionReason}
                </Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />
      
      {/* Comments Section */}
      <ClaimComments claimId={claim.id} />
    </Box>
  );
};

export default ClaimDetails; 