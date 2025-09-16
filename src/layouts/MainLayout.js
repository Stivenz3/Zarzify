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
  Tooltip,
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
  Assessment,
  Category,
  ExpandMore,
  AccountCircle,
  Person,
  Work,
  ChevronLeft,
  ChevronRight,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useApp } from '../context/AppContext';
import BusinessSelector from '../components/business/BusinessSelector';
import logoZarzify from '../logo zarzify.png';

const drawerWidth = 240;
const collapsedDrawerWidth = 64;
const maxDrawerWidth = 320;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Categorías', icon: <Category />, path: '/categories' },
  { text: 'Inventario', icon: <Inventory />, path: '/products' },
  { text: 'Clientes', icon: <People />, path: '/clients' },
  { text: 'Ventas', icon: <ShoppingCart />, path: '/sales' },
  { text: 'Gastos', icon: <Receipt />, path: '/expenses' },
  { text: 'Empleados', icon: <Work />, path: '/employees' },
  { text: 'Reportes', icon: <Assessment />, path: '/reports' },
]

function MainLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentDrawerWidth, setCurrentDrawerWidth] = useState(drawerWidth);
  const [isResizing, setIsResizing] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, currentBusiness, darkMode } = useApp();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    if (!sidebarCollapsed) {
      setCurrentDrawerWidth(collapsedDrawerWidth);
    } else {
      setCurrentDrawerWidth(drawerWidth);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  // Función para manejar el redimensionamiento
  const handleMouseDown = (e) => {
    if (sidebarCollapsed) return; // No redimensionar si está colapsado
    setIsResizing(true);
    
    const startX = e.clientX;
    const startWidth = currentDrawerWidth;

    const handleMouseMove = (e) => {
      const newWidth = startWidth + (e.clientX - startX);
      if (newWidth >= drawerWidth && newWidth <= maxDrawerWidth) {
        setCurrentDrawerWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
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
    <Box 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Header con logo y toggle */}
      <Toolbar 
        sx={{ 
          display: 'flex', 
          flexDirection: sidebarCollapsed ? 'column' : 'row',
          alignItems: 'center', 
          py: 2,
          px: sidebarCollapsed ? 1 : 2,
          gap: sidebarCollapsed ? 1 : 2,
          minHeight: 64,
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: sidebarCollapsed ? 0 : 2 }}>
          <img 
            src={logoZarzify} 
            alt="Zarzify Logo" 
            style={{ 
              width: sidebarCollapsed ? '32px' : '40px', 
              height: sidebarCollapsed ? '32px' : '40px',
              transition: 'all 0.3s ease-in-out'
            }}
          />
          {!sidebarCollapsed && (
            <Typography 
              variant="h6" 
              noWrap 
              component="div" 
              sx={{ 
                fontWeight: 'bold',
                background: darkMode 
                  ? 'linear-gradient(45deg, #74b9ff 30%, #a29bfe 90%)'
                  : 'linear-gradient(45deg, #1976d2 30%, #9c27b0 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                transition: 'all 0.3s ease-in-out',
              }}
            >
              Zarzify
            </Typography>
          )}
        </Box>
        
        {/* Toggle Button */}
        <IconButton
          onClick={handleSidebarToggle}
          sx={{
            ml: sidebarCollapsed ? 0 : 'auto',
            mt: sidebarCollapsed ? 1 : 0,
            backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            color: darkMode ? '#ffffff' : '#000000',
            '&:hover': {
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.3s ease-in-out',
            width: 36,
            height: 36,
            zIndex: 1001,
            position: 'absolute',
            top: sidebarCollapsed ? 16 : 16,
            right: sidebarCollapsed ? 14 : 16,
          }}
        >
          {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Toolbar>
      
      <Divider sx={{ borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }} />
      
      {/* Menu Items */}
      <List sx={{ 
        flexGrow: 1, 
        px: 1, 
        py: 1,
        pt: sidebarCollapsed ? 3 : 1, // Añadir más padding superior cuando está colapsado
      }}>
        {menuItems.map((item, index) => {
          const isActiveItem = isSelected(item.path);
          const isFirstItem = index === 0;
          
          return (
            <Tooltip
              key={item.text}
              title={sidebarCollapsed ? item.text : ''}
              placement="right"
              arrow
              PopperProps={{
                sx: {
                  '& .MuiTooltip-tooltip': {
                    backgroundColor: darkMode ? '#2d2d2d' : '#ffffff',
                    color: darkMode ? '#ffffff' : '#000000',
                    border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    boxShadow: darkMode 
                      ? '0 8px 32px rgba(0, 0, 0, 0.5)' 
                      : '0 4px 20px rgba(0, 0, 0, 0.15)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  },
                }
              }}
            >
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActiveItem}
                sx={{
                  borderRadius: '12px',
                  mb: 0.5,
                  minHeight: 48,
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  px: sidebarCollapsed ? 1 : 2,
                  mt: 0, // Remover margen superior adicional
                  transition: 'all 0.3s ease-in-out',
                  '&.Mui-selected': {
                    backgroundColor: darkMode 
                      ? 'rgba(116, 185, 255, 0.15)' 
                      : 'rgba(25, 118, 210, 0.1)',
                    borderLeft: `4px solid ${darkMode ? '#74b9ff' : theme.palette.primary.main}`,
                    '&:hover': {
                      backgroundColor: darkMode 
                        ? 'rgba(116, 185, 255, 0.2)' 
                        : 'rgba(25, 118, 210, 0.15)',
                    },
                    '& .MuiListItemIcon-root': {
                      color: darkMode ? '#74b9ff' : theme.palette.primary.main,
                    },
                    '& .MuiListItemText-primary': {
                      color: darkMode ? '#74b9ff' : theme.palette.primary.main,
                      fontWeight: 600,
                    },
                  },
                  '&:hover': {
                    backgroundColor: darkMode 
                      ? 'rgba(255, 255, 255, 0.08)' 
                      : 'rgba(0, 0, 0, 0.04)',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: sidebarCollapsed ? 0 : 40,
                    justifyContent: 'center',
                    color: isActiveItem 
                      ? (darkMode ? '#74b9ff' : theme.palette.primary.main)
                      : (darkMode ? '#b3b3b3' : 'inherit'),
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!sidebarCollapsed && (
                  <ListItemText 
                    primary={item.text}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontSize: '0.9rem',
                        fontWeight: isActiveItem ? 600 : 500,
                        transition: 'all 0.3s ease-in-out',
                      }
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>
      
      <Divider sx={{ borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }} />
      
      {/* Logout Button */}
      <List sx={{ px: 1, py: 1 }}>
        <Tooltip
          title={sidebarCollapsed ? 'Cerrar Sesión' : ''}
          placement="right"
          arrow
          PopperProps={{
            sx: {
              '& .MuiTooltip-tooltip': {
                backgroundColor: darkMode ? '#2d2d2d' : '#ffffff',
                color: darkMode ? '#ffffff' : '#000000',
                border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                boxShadow: darkMode 
                  ? '0 8px 32px rgba(0, 0, 0, 0.5)' 
                  : '0 4px 20px rgba(0, 0, 0, 0.15)',
                fontSize: '0.875rem',
                fontWeight: 500,
              },
            }
          }}
        >
          <ListItemButton 
            onClick={handleLogout}
            sx={{
              borderRadius: '12px',
              minHeight: 48,
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              px: sidebarCollapsed ? 1 : 2,
              color: darkMode ? '#ff7675' : '#d32f2f',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                backgroundColor: darkMode 
                  ? 'rgba(255, 118, 117, 0.1)' 
                  : 'rgba(211, 47, 47, 0.1)',
                transform: 'translateX(4px)',
              },
            }}
          >
            <ListItemIcon 
              sx={{ 
                minWidth: sidebarCollapsed ? 0 : 40,
                justifyContent: 'center',
                color: darkMode ? '#ff7675' : '#d32f2f',
                transition: 'all 0.3s ease-in-out',
              }}
            >
              <ExitToApp />
            </ListItemIcon>
            {!sidebarCollapsed && (
              <ListItemText 
                primary="Cerrar Sesión"
                sx={{
                  '& .MuiListItemText-primary': {
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    color: darkMode ? '#ff7675' : '#d32f2f',
                  }
                }}
              />
            )}
          </ListItemButton>
        </Tooltip>
      </List>

      {/* Resize Handle */}
      {!sidebarCollapsed && (
        <Box
          onMouseDown={handleMouseDown}
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 4,
            height: '100%',
            cursor: 'ew-resize',
            backgroundColor: isResizing 
              ? (darkMode ? '#74b9ff' : theme.palette.primary.main)
              : 'transparent',
            transition: 'background-color 0.2s ease',
            '&:hover': {
              backgroundColor: darkMode 
                ? 'rgba(116, 185, 255, 0.3)' 
                : 'rgba(25, 118, 210, 0.3)',
            },
            zIndex: 1000,
          }}
        />
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${sidebarCollapsed ? collapsedDrawerWidth : currentDrawerWidth}px)` },
          ml: { sm: `${sidebarCollapsed ? collapsedDrawerWidth : currentDrawerWidth}px` },
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: darkMode 
            ? '0 2px 8px rgba(0,0,0,0.3)' 
            : '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease-in-out',
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
          
          {/* Business Selector - Reemplaza logo en AppBar */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
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
            <MenuItem onClick={() => { navigate('/business'); handleProfileMenuClose(); }}>
              <Business sx={{ mr: 2 }} />
              Gestionar Negocios
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { navigate('/settings'); handleProfileMenuClose(); }}>
              <SettingsIcon sx={{ mr: 2 }} />
              Configuración
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
        sx={{ 
          width: { sm: sidebarCollapsed ? collapsedDrawerWidth : currentDrawerWidth }, 
          flexShrink: { sm: 0 },
          transition: 'width 0.3s ease-in-out',
        }}
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
              width: drawerWidth, // En mobile siempre usar el ancho estándar
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
              width: sidebarCollapsed ? collapsedDrawerWidth : currentDrawerWidth,
              transition: 'width 0.3s ease-in-out',
              overflow: 'hidden', // Evitar scroll cuando está colapsado
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
          width: { sm: `calc(100% - ${sidebarCollapsed ? collapsedDrawerWidth : currentDrawerWidth}px)` },
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <Toolbar />
        {children || <Outlet />}
      </Box>
    </Box>
  );
}

export default MainLayout; 