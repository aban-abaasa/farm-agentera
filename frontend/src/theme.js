import { createTheme } from '@mui/material/styles';

// Color schemes
const colorSchemes = {
  green: {
    primary: { light: '#6abf69', main: '#4caf50', dark: '#357a38' },
    secondary: { light: '#ffb74d', main: '#ff9800', dark: '#f57c00' }
  },
  blue: {
    primary: { light: '#64b5f6', main: '#2196f3', dark: '#1976d2' },
    secondary: { light: '#ffb74d', main: '#ff9800', dark: '#f57c00' }
  },
  amber: {
    primary: { light: '#ffcc02', main: '#ff9800', dark: '#f57c00' },
    secondary: { light: '#6abf69', main: '#4caf50', dark: '#357a38' }
  },
  purple: {
    primary: { light: '#ba68c8', main: '#9c27b0', dark: '#7b1fa2' },
    secondary: { light: '#ffb74d', main: '#ff9800', dark: '#f57c00' }
  },
  teal: {
    primary: { light: '#4db6ac', main: '#009688', dark: '#00695c' },
    secondary: { light: '#ffb74d', main: '#ff9800', dark: '#f57c00' }
  }
};

// Common theme settings
const commonSettings = {
  typography: {
    fontFamily: [
      'Roboto',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Helvetica',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: { fontSize: '2.5rem', fontWeight: 500, lineHeight: 1.2 },
    h2: { fontSize: '2rem', fontWeight: 500, lineHeight: 1.2 },
    h3: { fontSize: '1.75rem', fontWeight: 500, lineHeight: 1.2 },
    h4: { fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.2 },
    h5: { fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.2 },
    h6: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.2 },
    subtitle1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5 },
    subtitle2: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.57 },
    body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.43 },
    button: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.75, textTransform: 'none' },
  },
  shape: { borderRadius: 8 },
  shadows: [
    'none',
    '0 2px 4px rgba(0,0,0,0.05)',
    '0 4px 6px rgba(0,0,0,0.07)',
    '0 5px 15px rgba(0,0,0,0.08)',
    '0 8px 20px rgba(0,0,0,0.10)',
    '0 10px 25px rgba(0,0,0,0.12)',
    '0 12px 28px rgba(0,0,0,0.14)',
    '0 14px 30px rgba(0,0,0,0.16)',
    '0 16px 32px rgba(0,0,0,0.18)',
    '0 18px 34px rgba(0,0,0,0.20)',
    '0 20px 36px rgba(0,0,0,0.22)',
    '0 22px 38px rgba(0,0,0,0.24)',
    '0 24px 40px rgba(0,0,0,0.26)',
    '0 26px 42px rgba(0,0,0,0.28)',
    '0 28px 44px rgba(0,0,0,0.30)',
    '0 30px 46px rgba(0,0,0,0.32)',
    '0 32px 48px rgba(0,0,0,0.34)',
    '0 34px 50px rgba(0,0,0,0.36)',
    '0 36px 52px rgba(0,0,0,0.38)',
    '0 40px 56px rgba(0,0,0,0.42)',
    '0 42px 58px rgba(0,0,0,0.44)',
    '0 44px 60px rgba(0,0,0,0.46)',
    '0 46px 62px rgba(0,0,0,0.48)',
    '0 48px 64px rgba(0,0,0,0.50)'
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 4px 6px rgba(0,0,0,0.07)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': { borderRadius: 8 },
        },
      },
    },
  },
};

// Function to create theme based on mode and color scheme
export const createAppTheme = (mode = 'light', colorScheme = 'green', fontSize = 100) => {
  const isDark = mode === 'dark';
  const colors = colorSchemes[colorScheme] || colorSchemes.green;
  
  // Calculate font size multiplier
  const fontSizeMultiplier = fontSize / 100;
  
  // Create typography with font size adjustments
  const typography = {
    ...commonSettings.typography,
    fontSize: 14 * fontSizeMultiplier,
    h1: { ...commonSettings.typography.h1, fontSize: `${2.5 * fontSizeMultiplier}rem` },
    h2: { ...commonSettings.typography.h2, fontSize: `${2 * fontSizeMultiplier}rem` },
    h3: { ...commonSettings.typography.h3, fontSize: `${1.75 * fontSizeMultiplier}rem` },
    h4: { ...commonSettings.typography.h4, fontSize: `${1.5 * fontSizeMultiplier}rem` },
    h5: { ...commonSettings.typography.h5, fontSize: `${1.25 * fontSizeMultiplier}rem` },
    h6: { ...commonSettings.typography.h6, fontSize: `${1 * fontSizeMultiplier}rem` },
    subtitle1: { ...commonSettings.typography.subtitle1, fontSize: `${1 * fontSizeMultiplier}rem` },
    subtitle2: { ...commonSettings.typography.subtitle2, fontSize: `${0.875 * fontSizeMultiplier}rem` },
    body1: { ...commonSettings.typography.body1, fontSize: `${1 * fontSizeMultiplier}rem` },
    body2: { ...commonSettings.typography.body2, fontSize: `${0.875 * fontSizeMultiplier}rem` },
    button: { ...commonSettings.typography.button, fontSize: `${0.875 * fontSizeMultiplier}rem` },
  };

  return createTheme({
    palette: {
      mode,
      primary: {
        ...colors.primary,
        contrastText: '#fff',
      },
      secondary: {
        ...colors.secondary,
        contrastText: '#fff',
      },
      error: {
        light: '#e57373',
        main: '#f44336',
        dark: '#d32f2f',
        contrastText: '#fff',
      },
      warning: {
        light: '#ffb74d',
        main: '#ff9800',
        dark: '#f57c00',
        contrastText: isDark ? '#fff' : 'rgba(0, 0, 0, 0.87)',
      },
      info: {
        light: '#64b5f6',
        main: '#2196f3',
        dark: '#1976d2',
        contrastText: '#fff',
      },
      success: {
        light: '#81c784',
        main: '#4caf50',
        dark: '#388e3c',
        contrastText: isDark ? '#fff' : 'rgba(0, 0, 0, 0.87)',
      },
      grey: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#eeeeee',
        300: '#e0e0e0',
        400: '#bdbdbd',
        500: '#9e9e9e',
        600: '#757575',
        700: '#616161',
        800: '#424242',
        900: '#212121',
      },
      background: {
        default: isDark ? '#121212' : '#f5f5f5',
        paper: isDark ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: isDark ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)',
        secondary: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
        disabled: isDark ? 'rgba(255, 255, 255, 0.38)' : 'rgba(0, 0, 0, 0.38)',
      },
    },
    typography,
    ...commonSettings,
  });
};

// Export the default theme for backward compatibility
const theme = createAppTheme();
export default theme; 