import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Badge,
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useAuth } from '../context/AuthContext';
import { checkIfAdmin } from '../utils/roleUtils';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  // Отладочное логирование
  console.log('Current user in Navbar:', user);
  // Проверка на админа, учитывающая разные форматы роли
  const isAdmin = user && checkIfAdmin(user.role);
  console.log('Is Admin check:', { userRole: user?.role, isAdmin });

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          Страховка
        </Typography>

        {user ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {isAdmin && (
                <>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/admin"
                    sx={{ mr: 2 }}
                  >
                    Админ-панель
                  </Button>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/admin/claims"
                    sx={{ mr: 2 }}
                  >
                    Страховые случаи
                  </Button>
                </>
              )}
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <Badge 
                  color={isAdmin ? "secondary" : "default"}
                  variant="dot" 
                  invisible={!isAdmin}
                >
                  <AccountCircle />
                </Badge>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
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
                <MenuItem
                  component={RouterLink}
                  to="/profile"
                  onClick={handleClose}
                >
                  Мой профиль {isAdmin && "(Админ)"}
                </MenuItem>
                {isAdmin && (
                  <MenuItem
                    component={RouterLink}
                    to="/admin"
                    onClick={handleClose}
                  >
                    Админ-панель
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>Выйти</MenuItem>
              </Menu>
            </Box>
          </>
        ) : (
          <Button color="inherit" component={RouterLink} to="/login">
            Войти
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 