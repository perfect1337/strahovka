import React from 'react';
import { Outlet, Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Link,
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useAuth } from '../context/AuthContext';
import SideMenu from './SideMenu';
import { checkIfAdmin, checkIfModerator } from '../utils/roleUtils';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  // Add debug logging
  console.log('Layout - Current user:', user);
  console.log('Layout - User role:', user?.role);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const isAdmin = user && checkIfAdmin(user.role);
  const isModerator = user && (checkIfModerator(user.role) || checkIfAdmin(user.role));

  // Add debug logging for role checks
  console.log('Layout - Role checks:', { isAdmin, isModerator });

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              '&:hover': {
                color: 'inherit',
              },
            }}
          >
            Страховая компания
          </Typography>

          <Button
            color="inherit"
            component={RouterLink}
            to="/insurance/packages"
            sx={{ mr: 2 }}
          >
            Страховые продукты
          </Button>

          {user ? (
            <>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleProfile}>Личный кабинет</MenuItem>
                {isAdmin && (
                  <MenuItem onClick={() => { handleClose(); navigate('/admin'); }}>
                    Панель администратора
                  </MenuItem>
                )}
                {isModerator && (
                  <MenuItem onClick={() => { handleClose(); navigate('/moderator/claims'); }}>
                    Управление заявками
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>Выйти</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                component={RouterLink}
                to="/login"
                state={{ from: location.pathname }}
              >
                Войти
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/register"
              >
                Регистрация
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      {user && <SideMenu />}

      <Box component="main" sx={{ 
        flexGrow: 1, 
        p: 3,
        width: user ? 'calc(100% - 240px)' : '100%',
        ml: user ? '240px' : 0,
        mt: '64px'
      }}>
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          position: 'fixed',
          bottom: 0,
          width: user ? 'calc(100% - 240px)' : '100%',
          ml: user ? '240px' : 0,
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Страховая компания. Все права защищены.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 