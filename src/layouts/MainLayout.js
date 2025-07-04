import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemButton,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Inventory,
  People,
  ShoppingCart,
  Receipt,
  ExitToApp,
  Business,
  Settings,
  Assessment,
  ExpandMore,
  AccountCircle,
  Person,
} from '@mui/icons-material';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useApp } from '../context/AppContext';
import BusinessSelector from '../components/business/BusinessSelector';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Inventario', icon: <Inventory />, path: '/products' },
  { text: 'Clientes', icon: <People />, path: '/clients' },
  { text: 'Ventas', icon: <ShoppingCart />, path: '/sales' },
  { text: 'Reportes', icon: <Assessment />, path: '/reports' },
  { text: 'Gastos', icon: <Receipt />, path: '/expenses' },
  { text: 'Configuración', icon: <Settings />, path: '/settings' },
];

function MainLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, currentBusiness } = useApp();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
    setProfileMenuAnchor(null);
  };

  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const isSelected = (path) => {
    return location.pathname === path;
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Zarzify
        </Typography>
      </Toolbar>
      <Divider />
      
      {/* Business Selector en sidebar para móviles y escritorio */}
      <Box sx={{ p: 2 }}>
        <BusinessSelector />
      </Box>
      
      <Divider />
      
      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            selected={isSelected(item.path)}
            sx={{
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main + '20',
                borderRight: `3px solid ${theme.palette.primary.main}`,
                '& .MuiListItemIcon-root': {
                  color: theme.palette.primary.main,
                },
                '& .MuiListItemText-primary': {
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                },
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
      
      <Divider />
      
      <List>
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText primary="Cerrar Sesión" />
        </ListItemButton>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Zarzify
          </Typography>

          {/* Business Selector - Visible en desktop */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', mr: 2 }}>
            <BusinessSelector />
          </Box>

          {/* User Avatar */}
          <Avatar 
            src={user?.photoURL} 
            alt={user?.displayName}
            sx={{ 
              width: 32, 
              height: 32,
              cursor: 'pointer',
              bgcolor: theme.palette.primary.main
            }}
            onClick={handleProfileMenuOpen}
          >
            {user?.displayName?.charAt(0) || user?.email?.charAt(0)}
          </Avatar>
          
          {/* Profile Menu */}
          <Menu
            anchorEl={profileMenuAnchor}
            open={Boolean(profileMenuAnchor)}
            onClose={handleProfileMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleProfileMenuClose}>
              <Person sx={{ mr: 2 }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user?.displayName || 'Usuario'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { navigate('/settings'); handleProfileMenuClose(); }}>
              <Settings sx={{ mr: 2 }} />
              Configuración
            </MenuItem>
            <MenuItem onClick={() => { navigate('/business'); handleProfileMenuClose(); }}>
              <Business sx={{ mr: 2 }} />
              Gestionar Negocios
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 2 }} />
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {children || <Outlet />}
      </Box>
    </Box>
  );
}

export default MainLayout; 