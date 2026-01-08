import { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Divider, 
  FormControl, MenuItem, Select, Switch, Slider, Button, 
  InputLabel, Paper, Tabs, Tab, 
  Alert, Snackbar, FormControlLabel, 
  ToggleButton, ToggleButtonGroup, Tooltip, 
  List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction,
  Avatar, FormHelperText, useTheme, alpha
} from '@mui/material';
import { 
  Settings as SettingsIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Accessibility as AccessibilityIcon,
  FormatSize as FormatSizeIcon,
  DataUsage as DataUsageIcon,
  Check as CheckIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  PushPin as PushPinIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Brightness4 as Brightness4Icon,
  People as PeopleIcon,
  PlayArrow as PlayArrowIcon,
  HighQuality as HighQualityIcon,
  Group as CommunityIcon,
  ShoppingCart as MarketplaceIcon,
  WbSunny as WeatherIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import useDateTimeFormat from '../hooks/useDateTimeFormat';
import { useAppTheme } from '../context/ThemeContext';
import { getUserSettings, updateSettingsCategory, resetUserSettings, initializeUserSettings } from '../services/api/settingsService';

// Language options
const languages = [
  { code: 'en', name: 'English' },
  { code: 'sw', name: 'Swahili' },
  { code: 'lg', name: 'Luganda' },
  { code: 'fr', name: 'French' },
];

const Settings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();
  const { formatDate, formatTime, dateFormat, timeFormat } = useDateTimeFormat();
  const theme = useTheme();
  
  // Theme context
  const { 
    themeMode, 
    colorScheme, 
    fontSize, 
    reducedMotion,
    updateThemeMode, 
    updateColorScheme, 
    updateFontSize, 
    updateReducedMotion 
  } = useAppTheme();
  
  const isDark = themeMode === 'dark';
  
  // Get current values
  const language = i18n.language;
  
  // App settings (non-theme related)
  const [settings, setSettings] = useState({
    // Notification settings
    emailNotifications: true,
    pushNotifications: false,
    marketplaceAlerts: true,
    communityAlerts: true,
    weatherAlerts: true,
    
    // Privacy settings
    profileVisibility: 'public',
    contactInfoVisibility: 'connections',
    activityTracking: true,
    
    // Data usage
    autoPlay: false,
    highQualityImages: true,
    dataUsageOptimization: false,
  });

  // Load settings from database on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        
        // First ensure user settings are initialized
        await initializeUserSettings();
        
        const { data, error } = await getUserSettings();
        
        if (error) {
          console.warn('Failed to load settings:', error);
          // Use localStorage as fallback
          setSettings({
            emailNotifications: localStorage.getItem('emailNotifications') === 'true' || true,
            pushNotifications: localStorage.getItem('pushNotifications') === 'true' || false,
            marketplaceAlerts: localStorage.getItem('marketplaceAlerts') === 'true' || true,
            communityAlerts: localStorage.getItem('communityAlerts') === 'true' || true,
            weatherAlerts: localStorage.getItem('weatherAlerts') === 'true' || true,
            profileVisibility: localStorage.getItem('profileVisibility') || 'public',
            contactInfoVisibility: localStorage.getItem('contactInfoVisibility') || 'connections',
            activityTracking: localStorage.getItem('activityTracking') === 'true' || true,
            autoPlay: localStorage.getItem('autoPlay') === 'true' || false,
            highQualityImages: localStorage.getItem('highQualityImages') === 'true' || true,
            dataUsageOptimization: localStorage.getItem('dataUsageOptimization') === 'true' || false,
          });
        } else if (data) {
          // Convert snake_case to camelCase and update state
          setSettings({
            emailNotifications: data.email_notifications ?? true,
            pushNotifications: data.push_notifications ?? false,
            marketplaceAlerts: data.marketplace_alerts ?? true,
            communityAlerts: data.community_alerts ?? true,
            weatherAlerts: data.weather_alerts ?? true,
            profileVisibility: data.profile_visibility || 'public',
            contactInfoVisibility: data.contact_info_visibility || 'connections',
            activityTracking: data.activity_tracking ?? true,
            autoPlay: data.auto_play ?? false,
            highQualityImages: data.high_quality_images ?? true,
            dataUsageOptimization: data.data_usage_optimization ?? false,
          });
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save settings to localStorage and show confirmation
  const saveSettings = () => {
    // Save regular settings
    Object.entries(settings).forEach(([key, value]) => {
      localStorage.setItem(key, value.toString());
    });
    
    // Save language settings via i18next
    i18n.changeLanguage(language);
    
    setSnackbar({
      open: true,
      message: t('settings.savedSuccessfully'),
      severity: 'success'
    });
  };

  // Reset all settings to defaults
  const resetSettings = () => {
    const defaultSettings = {
      emailNotifications: true,
      pushNotifications: false,
      marketplaceAlerts: true,
      communityAlerts: true,
      weatherAlerts: true,
      profileVisibility: 'public',
      contactInfoVisibility: 'connections',
      activityTracking: true,
      autoPlay: false,
      highQualityImages: true,
      dataUsageOptimization: false
    };
    
    // Reset settings state
    setSettings(defaultSettings);
    
    // Reset theme settings
    updateThemeMode('light');
    updateColorScheme('green');
    updateFontSize(100);
    updateReducedMotion(false);
    
    // Reset language settings
    i18n.changeLanguage('en');
    
    // Reset date and time formats
    localStorage.setItem('dateFormat', 'MM/DD/YYYY');
    localStorage.setItem('timeFormat', '12h');
    
    // Trigger storage event to update hooks
    window.dispatchEvent(new Event('storage'));
    
    setSnackbar({
      open: true,
      message: t('settings.resetSuccessfully'),
      severity: 'info'
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSettingChange = (setting, value) => {
    // Handle theme-related settings separately
    if (setting === 'theme') {
      updateThemeMode(value);
    } else if (setting === 'colorScheme') {
      updateColorScheme(value);
    } else if (setting === 'fontSize') {
      updateFontSize(value);
    } else if (setting === 'reducedMotion') {
      updateReducedMotion(value);
    } else {
      // Handle regular settings
      setSettings({
        ...settings,
        [setting]: value
      });
    }
  };

  // Handle language change
  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    i18n.changeLanguage(newLanguage);
  };

  // Handle date format change
  const handleDateFormatChange = (event) => {
    const newFormat = event.target.value;
    localStorage.setItem('dateFormat', newFormat);
    // Trigger storage event to update hooks
    window.dispatchEvent(new Event('storage'));
  };

  // Handle time format change
  const handleTimeFormatChange = (event) => {
    const newFormat = event.target.value;
    localStorage.setItem('timeFormat', newFormat);
    // Trigger storage event to update hooks
    window.dispatchEvent(new Event('storage'));
  };

  // Color schemes available
  const colorSchemes = [
    { name: 'green', color: '#4caf50', label: t('settings.appearance.green') },
    { name: 'blue', color: '#2196f3', label: t('settings.appearance.blue') },
    { name: 'amber', color: '#ff9800', label: t('settings.appearance.amber') },
    { name: 'purple', color: '#9c27b0', label: t('settings.appearance.purple') },
    { name: 'teal', color: '#009688', label: t('settings.appearance.teal') },
  ];

  return (
    <Box className="w-full max-w-screen-2xl mx-auto">
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: isDark
            ? `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette.primary.dark} 100%)`
            : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
          color: theme.palette.common.white,
          borderRadius: 4,
          mb: 5,
          px: { xs: 3, md: 6 },
          py: { xs: 4, md: 5 },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.background.paper, 0.1)} 0%, transparent 70%)`,
            top: '-100px',
            right: '-50px',
            zIndex: 0,
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <SettingsIcon sx={{ mr: 1, color: alpha(theme.palette.common.white, 0.8) }} />
            <Typography
              variant="subtitle1"
              sx={{
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: 1,
                color: alpha(theme.palette.common.white, 0.9)
              }}
            >
              {t('settings.subtitle')}
            </Typography>
          </Box>

          <Typography
            component="h1"
            variant="h3"
            fontWeight={700}
            sx={{
              mb: 2,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-12px',
                left: 0,
                width: '60px',
                height: '4px',                  background: theme.palette.warning.main,
                borderRadius: '2px',
              }
            }}
          >
            {t('settings.title')}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mt: 3,
              maxWidth: '800px',
              color: alpha(theme.palette.common.white, 0.9),
              fontSize: '1.1rem',
              lineHeight: 1.6
            }}
          >
            {t('settings.description')}
          </Typography>
        </Box>
      </Paper>

      {/* Settings Tabs and Content */}
      <Box sx={{ width: '100%' }}>
        {/* Tabs for different setting categories - Now horizontal */}
        <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                py: 2,
                px: 3,
                minWidth: { xs: 'auto', sm: 120 }
              }
            }}
          >
            <Tab 
              icon={<PaletteIcon />} 
              iconPosition="start" 
              label={t('settings.appearance.title')} 
            />
            <Tab 
              icon={<LanguageIcon />} 
              iconPosition="start" 
              label={t('settings.language.title')} 
            />
            <Tab 
              icon={<NotificationsIcon />} 
              iconPosition="start" 
              label={t('settings.notifications.title')} 
            />
            <Tab 
              icon={<SecurityIcon />} 
              iconPosition="start" 
              label={t('settings.privacy.title')} 
            />
            <Tab 
              icon={<DataUsageIcon />} 
              iconPosition="start" 
              label={t('settings.dataUsage.title')} 
            />
            <Tab 
              icon={<AccessibilityIcon />} 
              iconPosition="start" 
              label={t('settings.accessibility.title')}
            />
          </Tabs>
        </Paper>
        
        {/* Action Buttons - Now positioned above the content */}
        <Box sx={{ mb: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={saveSettings}
            sx={{ py: 1.25, px: 3, borderRadius: 2 }}
          >
            {t('settings.saveSettings')}
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={resetSettings}
            sx={{ py: 1.25, px: 3, borderRadius: 2 }}
          >
            {t('settings.resetToDefault')}
          </Button>
        </Box>

        {/* Settings Content - Full width now */}
        <Paper elevation={3} sx={{ borderRadius: 3, p: { xs: 2, md: 4 } }}>
          {/* Appearance Settings */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {t('settings.appearance.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {t('settings.appearance.description')}
              </Typography>
              
              <Divider sx={{ my: 3 }} />
              
              {/* Theme Selection */}
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    {t('settings.appearance.themeMode')}
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <ToggleButtonGroup
                      value={themeMode}
                      exclusive
                      onChange={(e, value) => value && handleSettingChange('theme', value)}
                      fullWidth
                    >
                      <ToggleButton value="light" aria-label="light theme" sx={{ py: 1.5 }}>
                        <LightModeIcon sx={{ mr: 1 }} />
                        {t('settings.appearance.light')}
                      </ToggleButton>
                      <ToggleButton value="dark" aria-label="dark theme" sx={{ py: 1.5 }}>
                        <DarkModeIcon sx={{ mr: 1 }} />
                        {t('settings.appearance.dark')}
                      </ToggleButton>
                      <ToggleButton value="system" aria-label="system theme" sx={{ py: 1.5 }}>
                        <Brightness4Icon sx={{ mr: 1 }} />
                        {t('settings.appearance.system')}
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    {t('settings.appearance.colorScheme')}
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {colorSchemes.map((scheme) => (
                        <Tooltip title={scheme.label} key={scheme.name}>
                          <Box
                            onClick={() => handleSettingChange('colorScheme', scheme.name)}
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              bgcolor: scheme.color,
                              cursor: 'pointer',
                              border: colorScheme === scheme.name ? 
                                '3px solid rgba(0,0,0,0.3)' : '3px solid transparent',
                              transition: 'transform 0.2s',
                              '&:hover': {
                                transform: 'scale(1.1)',
                              },
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {colorScheme === scheme.name && (
                              <CheckIcon sx={{ color: '#fff' }} fontSize="small" />
                            )}
                          </Box>
                        </Tooltip>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
                
                {/* Font Size */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    {t('settings.appearance.fontSize')}
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item>
                        <FormatSizeIcon fontSize="small" />
                      </Grid>
                      <Grid item xs>
                        <Slider
                          value={fontSize}
                          onChange={(e, newValue) => handleSettingChange('fontSize', newValue)}
                          valueLabelDisplay="auto"
                          step={10}
                          marks
                          min={80}
                          max={120}
                          valueLabelFormat={(value) => `${value}%`}
                        />
                      </Grid>
                      <Grid item>
                        <FormatSizeIcon fontSize="large" />
                      </Grid>
                    </Grid>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ mt: 2, fontSize: `${fontSize * 0.01}rem` }}
                    >
                      {t('settings.appearance.fontSizePreview', { size: fontSize })}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Language & Region Settings */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {t('settings.language.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {t('settings.language.description')}
              </Typography>
              
              <Divider sx={{ my: 3 }} />
              
              <Grid container spacing={3}>
                {/* Language Selection */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>{t('settings.language.displayLanguage')}</InputLabel>
                    <Select
                      value={language}
                      onChange={handleLanguageChange}
                      label={t('settings.language.displayLanguage')}
                    >
                      {languages.map((lang) => (
                        <MenuItem key={lang.code} value={lang.code}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {lang.name}
                            {lang.code === language && (
                              <CheckIcon sx={{ ml: 1, fontSize: 16, color: 'primary.main' }} />
                            )}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* Date Format */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>{t('settings.language.dateFormat')}</InputLabel>
                    <Select
                      value={dateFormat}
                      onChange={handleDateFormatChange}
                      label={t('settings.language.dateFormat')}
                    >
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY (e.g., 12/31/2023)</MenuItem>
                      <MenuItem value="DD/MM/YYYY">DD/MM/YYYY (e.g., 31/12/2023)</MenuItem>
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD (e.g., 2023-12-31)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* Time Format */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>{t('settings.language.timeFormat')}</InputLabel>
                    <Select
                      value={timeFormat}
                      onChange={handleTimeFormatChange}
                      label={t('settings.language.timeFormat')}
                    >
                      <MenuItem value="12h">{t('settings.language.timeFormat12h')}</MenuItem>
                      <MenuItem value="24h">{t('settings.language.timeFormat24h')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* Preview */}
                <Grid item xs={12}>
                  <Paper 
                    variant="outlined" 
                    sx={{ p: 3, borderRadius: 2, bgcolor: 'background.default' }}
                  >
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {t('settings.language.formatPreview')}
                    </Typography>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 1, 
                      bgcolor: 'background.paper',
                      border: '1px dashed',
                      borderColor: 'divider'
                    }}>
                      <Typography variant="body1">
                        {t('settings.language.date')}: <strong>
                          {formatDate(new Date())}
                        </strong>
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        {t('settings.language.time')}: <strong>
                          {formatTime(new Date())}
                        </strong>
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Notification Settings */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {t('settings.notifications.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {t('settings.notifications.description')}
              </Typography>
              
              <Divider sx={{ my: 3 }} />
              
              <List sx={{ width: '100%' }}>
                {/* Email Notifications */}
                <Paper variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
                  <ListItem>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        <NotificationsIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary={t('settings.notifications.emailNotifications')} 
                      secondary={t('settings.notifications.emailNotificationsDesc')}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.emailNotifications}
                        onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </Paper>
                
                {/* Push Notifications */}
                <Paper variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
                  <ListItem>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        <PushPinIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary={t('settings.notifications.pushNotifications')} 
                      secondary={t('settings.notifications.pushNotificationsDesc')}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.pushNotifications}
                        onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </Paper>
                
                <Typography variant="subtitle1" sx={{ mt: 4, mb: 2, fontWeight: 'medium' }}>
                  {t('settings.notifications.categories')}
                </Typography>
                
                {/* Marketplace Alerts */}
                <Paper variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
                  <ListItem>
                    <ListItemIcon>
                      <MarketplaceIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t('settings.notifications.marketplaceAlerts')} 
                      secondary={t('settings.notifications.marketplaceAlertsDesc')}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        disabled={!settings.emailNotifications && !settings.pushNotifications}
                        checked={settings.marketplaceAlerts}
                        onChange={(e) => handleSettingChange('marketplaceAlerts', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </Paper>
                
                {/* Community Alerts */}
                <Paper variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
                  <ListItem>
                    <ListItemIcon>
                      <CommunityIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t('settings.notifications.communityNotifications')} 
                      secondary={t('settings.notifications.communityNotificationsDesc')}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        disabled={!settings.emailNotifications && !settings.pushNotifications}
                        checked={settings.communityAlerts}
                        onChange={(e) => handleSettingChange('communityAlerts', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </Paper>
                
                {/* Weather Alerts */}
                <Paper variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
                  <ListItem>
                    <ListItemIcon>
                      <WeatherIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t('settings.notifications.weatherAlerts')} 
                      secondary={t('settings.notifications.weatherAlertsDesc')}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        disabled={!settings.emailNotifications && !settings.pushNotifications}
                        checked={settings.weatherAlerts}
                        onChange={(e) => handleSettingChange('weatherAlerts', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </Paper>
              </List>
            </Box>
          )}

          {/* Privacy Settings */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {t('settings.privacy.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {t('settings.privacy.description')}
              </Typography>
              
              <Divider sx={{ my: 3 }} />
              
              <Grid container spacing={3}>
                {/* Profile Visibility */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    {t('settings.privacy.profileVisibility')}
                  </Typography>
                  <FormControl fullWidth variant="outlined">
                    <Select
                      value={settings.profileVisibility}
                      onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                    >
                      <MenuItem value="public">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <VisibilityIcon sx={{ mr: 1, color: 'success.main' }} />
                          {t('settings.privacy.public')}
                        </Box>
                      </MenuItem>
                      <MenuItem value="connections">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PeopleIcon sx={{ mr: 1, color: 'info.main' }} />
                          {t('settings.privacy.connections')}
                        </Box>
                      </MenuItem>
                      <MenuItem value="private">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <VisibilityOffIcon sx={{ mr: 1, color: 'error.main' }} />
                          {t('settings.privacy.private')}
                        </Box>
                      </MenuItem>
                    </Select>
                    <FormHelperText>
                      {t('settings.privacy.profileVisibilityDesc')}
                    </FormHelperText>
                  </FormControl>
                </Grid>
                
                {/* Contact Info Visibility */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    {t('settings.privacy.contactVisibility')}
                  </Typography>
                  <FormControl fullWidth variant="outlined">
                    <Select
                      value={settings.contactInfoVisibility}
                      onChange={(e) => handleSettingChange('contactInfoVisibility', e.target.value)}
                    >
                      <MenuItem value="public">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <VisibilityIcon sx={{ mr: 1, color: 'success.main' }} />
                          {t('settings.privacy.public')}
                        </Box>
                      </MenuItem>
                      <MenuItem value="connections">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PeopleIcon sx={{ mr: 1, color: 'info.main' }} />
                          {t('settings.privacy.connections')}
                        </Box>
                      </MenuItem>
                      <MenuItem value="private">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <VisibilityOffIcon sx={{ mr: 1, color: 'error.main' }} />
                          {t('settings.privacy.private')}
                        </Box>
                      </MenuItem>
                    </Select>
                    <FormHelperText>
                      {t('settings.privacy.contactVisibilityDesc')}
                    </FormHelperText>
                  </FormControl>
                </Grid>
                
                {/* Activity Tracking */}
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mt: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.activityTracking}
                          onChange={(e) => handleSettingChange('activityTracking', e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {t('settings.privacy.activityTracking')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t('settings.privacy.activityTrackingDesc')}
                          </Typography>
                        </Box>
                      }
                      sx={{ alignItems: 'flex-start', ml: 0 }}
                    />
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Data Usage Settings */}
          {activeTab === 4 && (
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {t('settings.dataUsage.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {t('settings.dataUsage.description')}
              </Typography>
              
              <Divider sx={{ my: 3 }} />
              
              <List>
                {/* Media Autoplay */}
                <Paper variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                  <ListItem>
                    <ListItemIcon>
                      <PlayArrowIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t('settings.dataUsage.mediaAutoplay')} 
                      secondary={t('settings.dataUsage.mediaAutoplayDesc')}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.autoPlay}
                        onChange={(e) => handleSettingChange('autoPlay', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </Paper>
                
                {/* High Quality Images */}
                <Paper variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                  <ListItem>
                    <ListItemIcon>
                      <HighQualityIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t('settings.dataUsage.highQualityImages')} 
                      secondary={t('settings.dataUsage.highQualityImagesDesc')}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.highQualityImages}
                        onChange={(e) => handleSettingChange('highQualityImages', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </Paper>
                
                {/* Data Optimization */}
                <Paper variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                  <ListItem>
                    <ListItemIcon>
                      <DataUsageIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={t('settings.dataUsage.dataOptimization')} 
                      secondary={t('settings.dataUsage.dataOptimizationDesc')}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.dataUsageOptimization}
                        onChange={(e) => handleSettingChange('dataUsageOptimization', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </Paper>
              </List>
              
              <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                <Typography variant="body2">
                  {t('settings.dataUsage.dataOptimizationInfo')}
                </Typography>
              </Alert>
            </Box>
          )}

          {/* Accessibility Settings */}
          {activeTab === 5 && (
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {t('settings.accessibility.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {t('settings.accessibility.description')}
              </Typography>
              
              <Divider sx={{ my: 3 }} />
              
              <Grid container spacing={3}>
                {/* Reduced Motion */}
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={reducedMotion}
                          onChange={(e) => handleSettingChange('reducedMotion', e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {t('settings.accessibility.reducedMotion')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t('settings.accessibility.reducedMotionDesc')}
                          </Typography>
                        </Box>
                      }
                      sx={{ alignItems: 'flex-start', ml: 0 }}
                    />
                  </Paper>
                </Grid>
                
                {/* Text Size already covered in Appearance tab */}
                <Grid item xs={12}>
                  <Alert 
                    severity="success" 
                    icon={<AccessibilityIcon />}
                    sx={{ borderRadius: 2 }}
                  >
                    <Typography variant="body1" gutterBottom>
                      {t('settings.accessibility.commitmentMessage')}
                    </Typography>
                    <Typography variant="body2">
                      {t('settings.accessibility.supportMessage')}
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings; 