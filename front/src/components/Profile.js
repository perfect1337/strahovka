import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, Box } from '@mui/material';

const UserLevelCard = ({ level, policyCount }) => {
  const getLevelInfo = () => {
    switch (level) {
      case 'PLATINUM':
        return { color: '#E5E4E2', cashback: 20, name: 'Платиновый' };
      case 'GOLD':
        return { color: '#FFD700', cashback: 15, name: 'Золотой' };
      case 'SILVER':
        return { color: '#C0C0C0', cashback: 10, name: 'Серебряный' };
      case 'BRONZE':
        return { color: '#CD7F32', cashback: 5, name: 'Бронзовый' };
      case 'WOODEN':
        return { color: '#8B4513', cashback: 2, name: 'Деревянный' };
      default:
        return { color: '#8B4513', cashback: 2, name: 'Деревянный' };
    }
  };

  const levelInfo = getLevelInfo();

  return (
    <Card sx={{ mb: 3, border: `2px solid ${levelInfo.color}` }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Уровень пользователя
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: levelInfo.color,
              border: '1px solid #ccc',
              mr: 2
            }}
          />
          <Typography variant="subtitle1">
            {levelInfo.name} уровень
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Количество активных страховок: {policyCount || 0}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Кешбэк с каждой оплаты: {levelInfo.cashback}%
        </Typography>
        
        {(!policyCount || policyCount === 0) && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Оформите первую страховку, чтобы получить бронзовый уровень и кешбэк 5%
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const Profile = () => {
  // ... existing state and useEffect ...

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
        Личный кабинет
      </Typography>
      
      <UserLevelCard level={userData?.level} policyCount={userData?.policyCount} />
      
      {/* ... existing profile content ... */}
    </Container>
  );
};

export default Profile; 