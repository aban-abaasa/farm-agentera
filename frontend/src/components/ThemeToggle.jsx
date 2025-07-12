import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip
} from '@mui/material';
import { 
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  SettingsBrightness as AutoModeIcon
} from '@mui/icons-material';
import { useAppTheme } from '../context/ThemeContext';

// Theme options
const themeOptions = [
  { mode: 'light', name: 'Light', icon: <LightModeIcon /> },
  { mode: 'dark', name: 'Dark', icon: <DarkModeIcon /> },
  { mode: 'system', name: 'System', icon: <AutoModeIcon /> },
];

const ThemeToggle = () => {
  const { t } = useTranslation();
  const { updateThemeMode } = useAppTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Get current theme from localStorage to determine the actual setting (not the computed theme)
  const currentThemeSetting = localStorage.getItem('theme') || 'light';
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleThemeChange = async (mode) => {
    await updateThemeMode(mode);
    handleMenuClose();
  };

  // Get the appropriate icon for the current theme
  const getCurrentIcon = () => {
    switch (currentThemeSetting) {
      case 'dark':
        return <DarkModeIcon />;
      case 'system':
        return <AutoModeIcon />;
      default:
        return <LightModeIcon />;
    }
  };
  
  return (
    <>
      <Tooltip title={t('settings.appearance.themeMode') || 'Theme Mode'}>
        <IconButton 
          color="inherit"
          onClick={handleMenuOpen}
          size="medium"
        >
          {getCurrentIcon()}
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: { minWidth: 150 }
        }}
      >
        {themeOptions.map((option) => (
          <MenuItem
            key={option.mode}
            onClick={() => handleThemeChange(option.mode)}
            selected={currentThemeSetting === option.mode}
          >
            <ListItemIcon>
              {option.icon}
            </ListItemIcon>
            <ListItemText>
              {t(`settings.appearance.${option.mode}`) || option.name}
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ThemeToggle;
