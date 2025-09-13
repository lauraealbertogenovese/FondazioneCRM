import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  AdminPanelSettings as AdminIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  MedicalServices as MedicalIcon,
  CalendarToday as CalendarIcon,
  Event as EventIcon,
  Group as GroupIcon,
  Receipt as ReceiptIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
// import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { patientService } from '../services/api';

const drawerWidth = 240;

const menuItems = [
  {
    text: 'Pazienti',
    icon: <PeopleIcon />,
    path: '/patients',
    permission: 'patients.read',
    title: 'Gestione Pazienti',
    subtitle: 'Visualizza e gestisci tutti i pazienti del sistema',
  },
  {
    text: 'Profili Clinici',
    icon: <MedicalIcon />,
    path: '/clinical-records',
    permission: 'clinical.read',
    title: 'Profili Clinici',
    subtitle: 'Gestisci le cartelle cliniche e i profili clinici',
  },
  {
    text: 'Gruppi di Supporto',
    icon: <GroupIcon />,
    path: '/groups',
    permission: 'groups.read',
    title: 'Gruppi di Supporto',
    subtitle: 'Gestisci i gruppi di supporto psicologico e i loro membri',
  },
  {
    text: 'Utenti',
    icon: <AdminIcon />,
    path: '/users',
    permission: 'users.read',
    title: 'Gestione Utenti',
    subtitle: 'Visualizza e gestisci tutti gli utenti del sistema',
  },
  {
    text: 'Fatturazione',
    icon: <ReceiptIcon />,
    path: '/billing',
    permission: 'billing.read',
    title: 'Gestione Fatturazione',
    subtitle: 'Panoramica pagamenti e fatture pazienti',
  },
  {
    text: 'Amministrazione',
    icon: <SecurityIcon />,
    path: '/admin',
    permission: 'admin',
    title: 'Amministrazione',
    subtitle: 'Pannello di controllo per la configurazione del sistema',
  },
];

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasPermission } = useAuth();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [patientStats, setPatientStats] = useState({
    total_patients: 0,
    active_patients: 0
  });

  // Fetch patient statistics
  useEffect(() => {
    const fetchPatientStats = async () => {
      try {
        const response = await patientService.getStatistics();
        setPatientStats(response.data);
      } catch (error) {
        console.error('Error fetching patient statistics:', error);
      }
    };

    // Only fetch stats if user has permission to read patients
    if (hasPermission('patients.read')) {
      fetchPatientStats();
    }
  }, [hasPermission]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Filtra i menu items in base ai permessi
  const filteredMenuItems = menuItems.filter(item => {
    try {
      return !item.permission || hasPermission(item.permission);
    } catch (error) {
      console.error('Error checking permission for item:', item.text, error);
      return false; // In caso di errore, nascondi l'item
    }
  });

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 3, py: 2, minHeight: '64px !important' }}>
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            fontWeight: 700, 
            fontSize: '1.1rem',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.01em'
          }}
        >
          Fondazione CRM
        </Typography>
        {isMobile && (
          <IconButton 
            onClick={handleDrawerToggle}
            sx={{ 
              p: 1,
              '&:hover': { backgroundColor: '#f9fafb' }
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: '1.25rem', color: '#636e83' }} />
          </IconButton>
        )}
      </Toolbar>
      
      <Box sx={{ px: 2, py: 1, flexGrow: 1, overflow: 'hidden' }}>
        <List sx={{ p: 0 }}>
          {filteredMenuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  py: 1,
                  px: 2,
                  mx: 0,
                  minHeight: 36,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Box sx={{ 
                    color: location.pathname === item.path ? '#3b82f6' : '#64748b',
                    transition: 'color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '& .MuiSvgIcon-root': { fontSize: '1.1rem' }
                  }}>
                    {item.icon}
                  </Box>
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.85rem',
                    fontWeight: location.pathname === item.path ? 600 : 500,
                    color: location.pathname === item.path ? '#1e293b' : '#334155',
                    letterSpacing: '0.01em',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* User section at bottom */}
      <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid rgba(226, 232, 240, 0.6)' }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          borderRadius: 2,
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.06) 0%, rgba(37, 99, 235, 0.03) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.08)',
        }}>
          <Avatar sx={{ 
            width: 28, 
            height: 28, 
            fontSize: '0.75rem',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: '#ffffff',
          }}>
            {user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <Typography variant="body2" sx={{ 
              fontWeight: 600, 
              color: '#1e293b',
              fontSize: '0.8rem',
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {user?.username || 'Utente'}
            </Typography>
            <Typography variant="caption" sx={{ 
              color: '#64748b',
              fontSize: '0.7rem',
              lineHeight: 1.1,
              fontWeight: 500,
            }}>
              {user?.role_name || 'Ruolo'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar sx={{ px: 3, py: 2, minHeight: '64px !important' }}>
          <IconButton
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 3, 
              display: { md: 'none' },
              p: 1.5,
              borderRadius: 2,
              color: '#64748b',
              '&:hover': { 
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                color: '#3b82f6',
                transform: 'scale(1.05)'
              }
            }}
          >
            <MenuIcon sx={{ fontSize: '1.5rem' }} />
          </IconButton>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            {location.pathname === '/patients' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#3b82f6' }}>
                  Pazienti in Cura
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ color: '#374151' }}>
                    {patientStats.total_patients} pazienti totali
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#059669', fontWeight: 500 }}>
                    • {patientStats.active_patients} in cura attiva
                  </Typography>
                </Box>
              </Box>
            )}
            {location.pathname === '/clinical-records' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#3b82f6' }}>
                  Cartelle Cliniche
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ color: '#374151' }}>
                    Gestione documentazione clinica
                  </Typography>
                </Box>
              </Box>
            )}
            {location.pathname === '/groups' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#3b82f6' }}>
                  Gruppi di Supporto
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ color: '#374151' }}>
                    Gestione gruppi terapeutici
                  </Typography>
                </Box>
              </Box>
            )}
            {location.pathname === '/users' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#3b82f6' }}>
                  Utenti
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ color: '#374151' }}>
                    Gestione utenti del sistema
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', alignItems: 'flex-end' }}>
              <Typography variant="body2" sx={{ 
                fontWeight: 600,
                color: '#1e293b',
                fontSize: '0.8rem',
                lineHeight: 1.2,
                letterSpacing: '0.01em'
              }}>
                {user?.first_name && user?.last_name 
                  ? `${user.first_name} ${user.last_name}`
                  : user?.username || 'Utente'
                }
              </Typography>
              <Typography variant="caption" sx={{ 
                color: '#64748b',
                fontSize: '0.7rem',
                lineHeight: 1.1,
                fontWeight: 500,
              }}>
                {user?.role_name || 'Ruolo'}
              </Typography>
            </Box>
            <IconButton
              onClick={handleMenuOpen}
              sx={{
                p: 0.5,
                borderRadius: 2,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  transform: 'scale(1.05)'
                },
              }}
            >
              <Avatar sx={{ 
                width: 32, 
                height: 32,
                fontSize: '0.75rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: '#ffffff',
                boxShadow: '0 2px 8px 0 rgba(59, 130, 246, 0.3)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  boxShadow: '0 4px 12px 0 rgba(59, 130, 246, 0.4)'
                }
              }}>
                {user?.first_name?.[0] || user?.username?.[0]?.toUpperCase() || 'U'}
                {user?.last_name?.[0] || ''}
              </Avatar>
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
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <AccountIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Profilo</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
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
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;