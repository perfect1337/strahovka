import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Container,
  Paper
} from '@mui/material';

const insuranceTypes = [
  {
    title: 'ОСАГО',
    description: 'Обязательное страхование автогражданской ответственности',
    path: '/insurance/osago'
  },
  {
    title: 'КАСКО',
    description: 'Добровольное страхование автомобиля',
    path: '/insurance/kasko'
  },
  {
    title: 'Страхование путешествий',
    description: 'Защита во время поездок по России и за рубежом',
    path: '/insurance/travel'
  },
  {
    title: 'Страхование здоровья',
    description: 'Медицинское страхование и страхование от несчастных случаев',
    path: '/insurance/health'
  },
  {
    title: 'Страхование недвижимости',
    description: 'Защита домов, коттеджей и коммерческой недвижимости',
    path: '/insurance/realestate'
  }
];

const CreatePolicy = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: 'transparent' }}>
          <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 500 }}>
            Оформление страхового полиса
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Выберите тип страхования для оформления полиса
          </Typography>
        </Paper>
        
        <Grid container spacing={3}>
          {insuranceTypes.map((type, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.shadows[4]
                  },
                  borderRadius: 2
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography 
                    gutterBottom 
                    variant="h6" 
                    component="h2" 
                    sx={{ 
                      fontWeight: 500,
                      mb: 2
                    }}
                  >
                    {type.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {type.description}
                  </Typography>
                </CardContent>
                <Button 
                  variant="contained" 
                  fullWidth 
                  sx={{ 
                    py: 1.5,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                    borderBottomLeftRadius: '8px',
                    borderBottomRightRadius: '8px',
                    '&:hover': {
                      background: (theme) => theme.palette.primary.dark
                    }
                  }}
                  onClick={() => navigate(type.path)}
                >
                  Оформить
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default CreatePolicy; 