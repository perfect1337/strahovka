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
  SupervisorAccount as ModeratorIcon,
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { checkIfAdmin, checkIfModerator } from '../utils/roleUtils';

const SideMenu = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isAdmin = user && checkIfAdmin(user.role);
  const isModerator = user && (checkIfModerator(user.role) || checkIfAdmin(user.role));

  const commonMenuItems = [
    { text: 'Профиль', icon: <PersonIcon />, path: '/profile' },
    { text: 'Страховые полисы', icon: <SecurityIcon />, path: '/insurance' },
    { text: 'Страховые случаи', icon: <ClaimsIcon />, path: '/claims' },
    { text: 'Сменить пароль', icon: <VpnKeyIcon />, path: '/change-password' },
  ];
  
  const adminMenuItems = [
    { text: 'Админ-панель', icon: <AdminIcon />, path: '/admin' },
  ];

  const moderatorMenuItems = [
    { text: 'Управление заявками', icon: <ModeratorIcon />, path: '/moderator/claims' },
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
        },
      }}
    >
      <Box sx={{ overflow: 'auto', mt: 8 }}>
        <List>
          {commonMenuItems.map((item) => (
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
        
        {(isAdmin || isModerator) && (
          <>
            <Divider />
            <List>
              {isAdmin && adminMenuItems.map((item) => (
                <ListItem
                  button
                  key={item.text}
                  onClick={() => navigate(item.path)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
              {isModerator && moderatorMenuItems.map((item) => (
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