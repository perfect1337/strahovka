import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Description as DescriptionIcon,
  VpnKey as VpnKeyIcon,
  AdminPanelSettings as AdminIcon,
  MedicalServices as ClaimsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { checkIfAdmin } from '../utils/roleUtils';

const SideMenu = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isAdmin = user && checkIfAdmin(user.role);
  console.log('SideMenu isAdmin check:', { role: user?.role, isAdmin });

  const menuItems = [
    { text: 'Создать заявку', icon: <AssignmentIcon />, path: '/create-claim' },
    { text: 'Профиль', icon: <PersonIcon />, path: '/profile' },
    { text: 'Страховые полисы', icon: <SecurityIcon />, path: '/insurance' },
    { text: 'Сменить пароль', icon: <VpnKeyIcon />, path: '/change-password' },
  ];
  
  const adminMenuItems = [
    { text: 'Админ-панель', icon: <AdminIcon />, path: '/admin' },
    { text: 'Страховые случаи', icon: <ClaimsIcon />, path: '/admin/claims' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          marginTop: '64px', // Высота AppBar
        },
      }}
    >
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        
        {isAdmin && (
          <>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Администрирование
              </Typography>
            </Box>
            <List>
              {adminMenuItems.map((item) => (
                <ListItem
                  button
                  key={item.text}
                  onClick={() => navigate(item.path)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Box>
    </Drawer>
  );
};

export default SideMenu; 