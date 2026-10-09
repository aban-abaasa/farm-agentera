import { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
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
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Storage as MarketplaceIcon,
  EmojiPeople as SupportIcon,
  Forum as CommunityIcon,
  MenuBook as ResourcesIcon,
  WbSunny as WeatherIcon,
  Person as ProfileIcon,
  Login as LoginIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Explore as PathwaysIcon,
} from '@mui/icons-material';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import PaidIcon from '@mui/icons-material/Paid';
import { useTranslation } from 'react-i18next';
import Footer from './Footer';
import LanguageSwitcher from '../LanguageSwitcher';
import ThemeToggle from '../ThemeToggle';
import { BrandMark, Wordmark } from '../classic/Brand';
import { DoubleRule } from '../classic/Ornament';
import { useAuth } from '../../context/AuthContext';
import { fonts } from '../../theme';

const FOREST = '#1f4d36';
const PARCHMENT = '#f3ebd8';

const todayLine = () =>
  new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [moreAnchorEl, setMoreAnchorEl] = useState(null);
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAuthenticated = !!user;

  const toggleDrawer = () => setMobileOpen((open) => !open);
  const closeProfile = () => setProfileAnchorEl(null);
  const closeMore = () => setMoreAnchorEl(null);

  const handleLogout = () => {
    logout();
    closeProfile();
    navigate('/login');
  };

  const navigationItems = [
    { text: t('header.pathways', 'Pathways'), path: '/join', icon: <PathwaysIcon /> },
    { text: t('header.marketplace'), path: '/marketplace', icon: <MarketplaceIcon /> },
    { text: t('header.myFarm', 'My Farm'), path: '/farm-management', icon: <AgricultureIcon /> },
    { text: t('header.community'), path: '/community', icon: <CommunityIcon /> },
    { text: t('header.supportTeam', 'On-Ground Team'), path: '/support-team', icon: <SupportIcon /> },
    { text: 'ICAN Wallet', path: '/ican-wallet', icon: <PaidIcon />, requireAuth: true },
    { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, requireAuth: true },
  ];

  // Lives under "More" on desktop.
  const moreItems = [
    { text: t('header.resources'), path: '/resources', icon: <ResourcesIcon /> },
    { text: t('header.weather'), path: '/weather', icon: <WeatherIcon /> },
  ];

  const visibleNav = navigationItems.filter((item) => !item.requireAuth || isAuthenticated);

  const brandLink = (
    <Box
      component={Link}
      to="/"
      aria-label="AgriBone home"
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, textDecoration: 'none', color: 'inherit' }}
    >
      <BrandMark size={34} />
      <Wordmark size="1.15rem" />
    </Box>
  );

  const drawer = (
    <Box sx={{ width: 290 }} role="presentation">
      <Toolbar sx={{ justifyContent: 'space-between', borderBottom: '3px double', borderColor: 'divider' }}>
        {brandLink}
        <IconButton aria-label="Close menu" onClick={toggleDrawer}>
          <CloseIcon />
        </IconButton>
      </Toolbar>
      <List sx={{ py: 1 }}>
        {[...visibleNav, ...moreItems].map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton component={NavLink} to={item.path} onClick={toggleDrawer} sx={{ py: 1.4 }}>
              <ListItemIcon sx={{ minWidth: 40, color: 'warning.main' }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  sx: { fontFamily: fonts.display, fontWeight: 600, fontSize: '1.05rem' },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const navLinkSx = {
    color: 'text.primary',
    fontFamily: fonts.body,
    fontWeight: 600,
    fontSize: '0.74rem',
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    textDecoration: 'none',
    px: 2,
    py: 1.4,
    position: 'relative',
    borderRadius: 0,
    '&:hover': { backgroundColor: 'transparent', color: 'primary.main' },
    '&::after': {
      content: '""',
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 6,
      height: 2,
      backgroundColor: 'warning.main',
      transform: 'scaleX(0)',
      transition: 'transform .25s ease',
    },
    '&:hover::after, &.active::after': { transform: 'scaleX(1)' },
    '&.active': { color: 'primary.main' },
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* ── Top strip: dateline, motto, controls ── */}
      <Box sx={{ bgcolor: FOREST, color: PARCHMENT }}>
        <Container maxWidth="xl" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 40 }}>
          <Typography
            className="kicker"
            sx={{ display: { xs: 'none', sm: 'block' }, fontSize: '0.66rem', opacity: 0.85, flex: 1 }}
          >
            {todayLine()}
          </Typography>
          <Typography
            sx={{
              display: { xs: 'none', md: 'block' },
              fontFamily: fonts.accent,
              fontStyle: 'italic',
              fontSize: '1.02rem',
              textAlign: 'center',
              flex: 2,
            }}
          >
            Rooted in the soil · Backed by the people
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              flex: 1,
              ml: { xs: 'auto', sm: 0 },
              '& .MuiIconButton-root': { color: PARCHMENT },
            }}
          >
            <ThemeToggle />
            <LanguageSwitcher />
            {isAuthenticated ? (
              <Tooltip title={user?.name || t('header.profile')}>
                <IconButton onClick={(e) => setProfileAnchorEl(e.currentTarget)} sx={{ p: 0.5, ml: 0.5 }}>
                  <Avatar
                    alt={user?.name}
                    src={user?.avatar}
                    sx={{ width: 28, height: 28, bgcolor: '#b08d3c', color: FOREST, fontFamily: fonts.display, fontWeight: 700, fontSize: '0.85rem' }}
                  >
                    {user?.name?.charAt(0) || 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>
            ) : (
              <Button
                component={Link}
                to="/login"
                size="small"
                startIcon={<LoginIcon fontSize="small" />}
                sx={{ color: PARCHMENT, ml: 0.5, '&:hover': { bgcolor: 'rgba(243,235,216,0.12)' } }}
              >
                {t('header.login')}
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      {/* ── Masthead (desktop) ── */}
      {!isMobile && (
        <Box component="header" sx={{ pt: 4, pb: 2.5, textAlign: 'center', color: 'text.primary' }}>
          <Container maxWidth="lg">
            <Box
              component={Link}
              to="/"
              aria-label="AgriBone home"
              sx={{ display: 'inline-flex', alignItems: 'center', gap: 3, textDecoration: 'none', color: 'inherit' }}
            >
              <BrandMark size={64} />
              <Wordmark sx={{ fontSize: { md: '3.4rem', lg: '4.2rem' }, letterSpacing: '0.22em', pl: '0.22em' }} />
              <BrandMark size={64} />
            </Box>
            <Typography
              className="kicker"
              sx={{ mt: 1.5, color: 'text.secondary', letterSpacing: '0.42em', fontSize: '0.7rem' }}
            >
              The Backbone of the Farm · Est. Uganda
            </Typography>
          </Container>
        </Box>
      )}

      {/* ── Navigation rail ── */}
      <AppBar
        position="sticky"
        component="nav"
        aria-label="Primary"
        sx={{
          top: 0,
          borderTop: '3px solid',
          borderBottom: '1px solid',
          borderColor: 'text.primary',
          boxShadow: '0 6px 12px -8px rgba(60,40,10,0.35)',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            variant="dense"
            sx={{ justifyContent: isMobile ? 'space-between' : 'center', minHeight: 48, flexWrap: 'wrap' }}
          >
            {isMobile ? (
              <>
                <IconButton aria-label="Open menu" edge="start" onClick={toggleDrawer}>
                  <MenuIcon />
                </IconButton>
                {brandLink}
                <Box sx={{ width: 40 }} />
              </>
            ) : (
              <>
                {visibleNav.map((item, i) => (
                  <Box key={item.path} sx={{ display: 'flex', alignItems: 'center' }}>
                    {i > 0 && <Box aria-hidden="true" sx={{ width: '1px', height: 16, bgcolor: 'divider' }} />}
                    <Button component={NavLink} to={item.path} sx={navLinkSx}>
                      {item.text}
                    </Button>
                  </Box>
                ))}
                <Box aria-hidden="true" sx={{ width: '1px', height: 16, bgcolor: 'divider' }} />
                <Button
                  onClick={(e) => setMoreAnchorEl(e.currentTarget)}
                  endIcon={<ExpandMoreIcon fontSize="small" />}
                  sx={navLinkSx}
                >
                  More
                </Button>
              </>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Menus */}
      <Menu
        anchorEl={moreAnchorEl}
        open={Boolean(moreAnchorEl)}
        onClose={closeMore}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
        PaperProps={{ sx: { mt: 0.5, minWidth: 200 } }}
      >
        {moreItems.map((item) => (
          <MenuItem key={item.path} component={Link} to={item.path} onClick={closeMore}>
            <ListItemIcon sx={{ color: 'warning.main' }}>{item.icon}</ListItemIcon>
            <ListItemText>{item.text}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={profileAnchorEl}
        open={Boolean(profileAnchorEl)}
        onClose={closeProfile}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {isAuthenticated && [
          <MenuItem key="profile" component={Link} to={`/profile/${user.id}`} onClick={closeProfile}>
            <ListItemIcon><ProfileIcon fontSize="small" /></ListItemIcon>
            <ListItemText>{t('header.profile')}</ListItemText>
          </MenuItem>,
          <MenuItem key="settings" component={Link} to="/settings" onClick={closeProfile}>
            <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
            <ListItemText>{t('header.settings')}</ListItemText>
          </MenuItem>,
          <Divider key="divider" />,
          <MenuItem key="logout" onClick={handleLogout}>
            <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
            <ListItemText>{t('header.logout')}</ListItemText>
          </MenuItem>,
        ]}
      </Menu>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        {drawer}
      </Drawer>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, width: '100%' }}>
        <Outlet />
      </Box>

      <Footer />
    </Box>
  );
};

export default MainLayout;
