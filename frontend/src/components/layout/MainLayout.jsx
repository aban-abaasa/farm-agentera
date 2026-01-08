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
  Extension as ExtensionIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import Footer from './Footer';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';
import ThemeToggle from '../ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import GrassIcon from '@mui/icons-material/Grass';
import PaidIcon from '@mui/icons-material/Paid';

const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [extensionsAnchorEl, setExtensionsAnchorEl] = useState(null);
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

  const handleExtensionsMenuOpen = (event) => {
    setExtensionsAnchorEl(event.currentTarget);
  };

  const handleExtensionsMenuClose = () => {
    setExtensionsAnchorEl(null);
  };
  
  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    navigate('/login');
  };

  const navigationItems = [
    // Main Navigation Items
    { 
      text: 'Dashboard', 
      path: '/dashboard', 
      icon: <DashboardIcon />, 
      category: 'main',
      requireAuth: true 
    },
    { 
      text: t('header.marketplace'), 
      path: '/marketplace', 
      icon: <MarketplaceIcon />, 
      category: 'main' 
    },
    { 
      text: t('header.myFarm'), 
      path: '/farm-management', 
      icon: <AgricultureIcon />, 
      category: 'main',
      requireAuth: true 
    },
    { 
      text: t('header.community'), 
      path: '/community', 
      icon: <CommunityIcon />, 
      category: 'main' 
    },
    { 
      text: t('header.resources'), 
      path: '/resources', 
      icon: <ResourcesIcon />, 
      category: 'main' 
    },
    { 
      text: t('header.supportTeam'), 
      path: '/support-team', 
      icon: <SupportIcon />, 
      category: 'main' 
    },
  ];

  // Extensions items (for dropdown)
  const extensionsItems = [
    { 
      text: t('header.weather'), 
      path: '/weather', 
      icon: <WeatherIcon />, 
      requireAuth: true 
    },
  ];

  const drawer = (
    <div>
      <Toolbar sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
        <Typography variant="h6" component={Link} to="/" sx={{ 
          fontWeight: 700, 
          textDecoration: 'none', 
          color: 'inherit',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <HomeIcon />
          FARM-AGENT
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {/* Main Navigation Items */}
        {navigationItems.filter(item => !item.requireAuth || (item.requireAuth && isAuthenticated)).map((item) => (
          <ListItem button component={Link} to={item.path} key={item.text} onClick={handleDrawerToggle}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        
        {/* Extensions Section */}
        {extensionsItems.some(item => !item.requireAuth || (item.requireAuth && isAuthenticated)) && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem>
              <ListItemIcon>
                <ExtensionIcon />
              </ListItemIcon>
              <ListItemText primary="Extensions" sx={{ opacity: 0.7 }} />
            </ListItem>
            {extensionsItems.filter(item => !item.requireAuth || (item.requireAuth && isAuthenticated)).map((item) => (
              <ListItem button component={Link} to={item.path} key={item.text} onClick={handleDrawerToggle} sx={{ pl: 4 }}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </>
        )}
      </List>
    </div>
  );

  // Extensions menu
  const extensionsMenu = (
    <Menu
      anchorEl={extensionsAnchorEl}
      open={Boolean(extensionsAnchorEl)}
      onClose={handleExtensionsMenuClose}
      transformOrigin={{ horizontal: 'left', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      PaperProps={{
        sx: {
          mt: 1,
          minWidth: 200,
        }
      }}
    >
      {extensionsItems.filter(item => !item.requireAuth || (item.requireAuth && isAuthenticated)).map((item) => (
        <MenuItem 
          key={item.text}
          component={Link} 
          to={item.path} 
          onClick={handleExtensionsMenuClose}
        >
          <ListItemIcon>
            {item.icon}
          </ListItemIcon>
          <ListItemText>{item.text}</ListItemText>
        </MenuItem>
      ))}
    </Menu>
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
          <MenuItem component={Link} to={`/profile/${user.id}`} onClick={handleProfileMenuClose}>
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
              flexGrow: 0, 
              textDecoration: 'none', 
              color: 'inherit',
              fontWeight: 700,
              letterSpacing: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mr: 3
            }}>
              <HomeIcon />
              FARM-AGENT
            </Typography>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
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
                
                {/* Extensions Dropdown */}
                {extensionsItems.some(item => !item.requireAuth || (item.requireAuth && isAuthenticated)) && (
                  <Button
                    color="inherit"
                    onClick={handleExtensionsMenuOpen}
                    endIcon={<ExpandMoreIcon />}
                    startIcon={<ExtensionIcon />}
                    sx={{ mx: 0.5 }}
                  >
                    Extensions
                  </Button>
                )}
              </Box>
            )}
            
            {/* Theme Toggle and Language Switcher */}
            <ThemeToggle />
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
      
      {/* Extensions menu */}
      {extensionsMenu}
      
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