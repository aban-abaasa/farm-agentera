import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  useMediaQuery,
  useTheme,
  Divider,
  Menu,
  MenuItem,
  Avatar,
  Container,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Home as HomeIcon,
  Storage as MarketplaceIcon,
  EmojiPeople as SupportIcon,
  Forum as CommunityIcon,
  MenuBook as ResourcesIcon,
  WbSunny as WeatherIcon,
  Person as ProfileIcon,
  Login as LoginIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import Footer from './Footer';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';
import { useAuth } from '../../context/AuthContext';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import GrassIcon from '@mui/icons-material/Grass';
import PaidIcon from '@mui/icons-material/Paid';

const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Check if user is authenticated
  const isAuthenticated = !!user;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };
  
  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    navigate('/login');
  };

  const navigationItems = [
    { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { text: t('header.home'), path: '/', icon: <HomeIcon /> },
    { text: t('header.soilCrop'), path: '/soil-crop-planner', icon: <GrassIcon /> },
    { text: t('header.livestock'), path: '/livestock-management', icon: <AgricultureIcon /> },
    { text: t('header.marketplace'), path: '/marketplace', icon: <MarketplaceIcon /> },
    { text: t('header.investments'), path: '/investments', icon: <PaidIcon /> },
    { text: t('header.community'), path: '/community', icon: <CommunityIcon /> },
    { text: t('header.supportTeam'), path: '/support-team', icon: <SupportIcon /> },
    { text: t('header.weather'), path: '/weather', icon: <WeatherIcon /> },
  ];

  const drawer = (
    <div>
      <Toolbar sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
          FARM-AGENT
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {navigationItems.filter(item => !item.requireAuth || (item.requireAuth && isAuthenticated)).map((item) => (
          <ListItem button component={Link} to={item.path} key={item.text} onClick={handleDrawerToggle}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  // Profile menu
  const profileMenu = (
    <Menu
      anchorEl={profileAnchorEl}
      open={Boolean(profileAnchorEl)}
      onClose={handleProfileMenuClose}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      {isAuthenticated ? (
        <>
          <MenuItem component={Link} to="/profile" onClick={handleProfileMenuClose}>
            <ListItemIcon>
              <ProfileIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('header.profile')}</ListItemText>
          </MenuItem>
          <MenuItem component={Link} to="/settings" onClick={handleProfileMenuClose}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('header.settings')}</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('header.logout')}</ListItemText>
          </MenuItem>
        </>
      ) : (
        <MenuItem component={Link} to="/login" onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <LoginIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('header.login')}</ListItemText>
        </MenuItem>
      )}
    </Menu>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Container maxWidth="xl">
          <Toolbar>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" component={Link} to="/" sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'inherit',
              fontWeight: 700,
              letterSpacing: 1
            }}>
              FARM-AGENT
            </Typography>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: 'flex', flexGrow: 1, ml: 2 }}>
                {navigationItems.filter(item => !item.requireAuth || (item.requireAuth && isAuthenticated)).map((item) => (
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to={item.path} 
                    key={item.text}
                    startIcon={item.icon}
                    sx={{ mx: 0.5 }}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
            )}
            
            {/* Language Switcher Component */}
            <LanguageSwitcher />
            
            {/* Login/Profile Button */}
            {isAuthenticated ? (
              <Tooltip title={user?.name || t('header.profile')}>
                <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0, ml: 1 }}>
                  <Avatar alt={user?.name} src={user?.avatar}>
                    {user?.name?.charAt(0) || 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>
            ) : (
              <Button 
                color="inherit" 
                component={Link} 
                to="/login"
                startIcon={<LoginIcon />}
              >
                {t('header.login')}
              </Button>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Profile menu */}
      {profileMenu}
      
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }} // Better mobile performance
        sx={{
          '& .MuiDrawer-paper': { width: 280 },
          display: { xs: 'block', md: 'none' },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main content */}
      <Box component="main" sx={{ 
        flexGrow: 1, 
        width: '100%',
        mt: { xs: '56px', sm: '64px' }
      }}>
        <Outlet />
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default MainLayout; 