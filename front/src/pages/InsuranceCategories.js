import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Container,
  Tabs,
  Tab
} from '@mui/material';

const insuranceTypes = [
  {
    title: 'ОСАГО',
    description: 'Обязательное страхование автогражданской ответственности',
    path: '/insurance/osago',
    image: '/images/osago.png'
  },
  {
    title: 'КАСКО',
    description: 'Добровольное страхование автомобиля',
    path: '/insurance/kasko',
    image: '/images/kasko.png'
  },
  {
    title: 'Недвижимость',
    description: 'Страхование квартир, домов и других объектов недвижимости',
    path: '/insurance/realestate',
    image: '/images/realestate.png'
  },
  {
    title: 'Здоровье',
    description: 'Добровольное медицинское страхование',
    path: '/insurance/health',
    image: '/images/health.png'
  },
  {
    title: 'Ипотечное страхование',
    description: 'Комплексное страхование для ипотечных заемщиков',
    path: '/insurance/mortgage',
    image: '/images/mortgage.png'
  },
  {
    title: 'Путешествия',
    description: 'Страхование для путешественников',
    path: '/insurance/travel',
    image: '/images/travel.png'
  }
];

const InsuranceCategories = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(1); // 0 - пакеты, 1 - отдельные полисы

  return (
    <Container maxWidth="lg">
      <Box sx={{ width: '100%', mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            centered
          >
            <Tab label="СТРАХОВЫЕ ПАКЕТЫ" />
            <Tab label="ОТДЕЛЬНЫЕ ПОЛИСЫ" />
          </Tabs>
        </Box>

        {activeTab === 1 && (
          <Grid container spacing={3}>
            {insuranceTypes.map((type, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {type.image && (
                    <Box
                      component="img"
                      src={type.image}
                      alt={type.title}
                      sx={{
                        width: '100%',
                        height: 140,
                        objectFit: 'cover'
                      }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1, pb: 0 }}>
                    <Typography variant="h6" gutterBottom>
                      {type.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {type.description}
                    </Typography>
                  </CardContent>
                  <Button 
                    variant="text" 
                    color="primary"
                    sx={{ 
                      mt: 2,
                      mb: 2,
                      textTransform: 'uppercase',
                      fontWeight: 'bold'
                    }}
                    onClick={() => navigate(type.path)}
                  >
                    ОФОРМИТЬ
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {activeTab === 0 && (
          <Typography variant="h6" align="center" color="text.secondary">
            Страховые пакеты пока недоступны
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default InsuranceCategories; 