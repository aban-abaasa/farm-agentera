import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { createAppTheme } from '../theme';
import { getUserSettings, updateSettingsCategory, initializeUserSettings } from '../services/api/settingsService';

const ThemeContext = createContext();

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeContextProvider');
  }
  return context;
};

export const ThemeContextProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get initial values from localStorage as fallback
  const [themeMode, setThemeMode] = useState(() => {
    const saved = localStorage.getItem('theme') || 'system'; // Default to system
    if (saved === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return saved;
  });
  
  const [colorScheme, setColorScheme] = useState(() => {
    return localStorage.getItem('colorScheme') || 'green';
  });
  
  const [fontSize, setFontSize] = useState(() => {
    return parseInt(localStorage.getItem('fontSize')) || 100;
  });

  const [reducedMotion, setReducedMotion] = useState(() => {
    return localStorage.getItem('reducedMotion') === 'true' || false;
  });

  // Load settings from database on mount (optional if user is signed in)
  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        setLoading(true);
        
        // Try to load from database, but don't fail if user is not authenticated
        try {
          const { data, error } = await getUserSettings();
          
          if (error) {
            // If it's an auth error, just use localStorage (user not signed in)
            if (error.message?.includes('auth') || error.message?.includes('unauthorized') || error.message?.includes('JWT')) {
              console.log('User not authenticated, using localStorage settings');
            } else {
              console.warn('Failed to load user settings, using localStorage:', error);
              setError(error);
            }
          } else if (data) {
            // Update state with database values
            const savedTheme = data.theme || 'system'; // Default to system if no theme in database
            localStorage.setItem('theme', savedTheme);
            
            if (savedTheme === 'system') {
              const systemMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              setThemeMode(systemMode);
            } else {
              setThemeMode(savedTheme);
            }
            
            setColorScheme(data.color_scheme || 'green');
            setFontSize(data.font_size || 100);
            setReducedMotion(data.reduced_motion || false);
            
            // Sync localStorage with database values
            localStorage.setItem('colorScheme', data.color_scheme || 'green');
            localStorage.setItem('fontSize', (data.font_size || 100).toString());
            localStorage.setItem('reducedMotion', (data.reduced_motion || false).toString());
          }
        } catch {
          // Database error (likely auth-related), continue with localStorage
          console.log('Cannot load user settings (likely not authenticated), using localStorage');
        }
        
        // Ensure system theme is set as default if no theme exists
        if (!localStorage.getItem('theme')) {
          localStorage.setItem('theme', 'system');
          const systemMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          setThemeMode(systemMode);
        }
        
      } catch (err) {
        console.error('Error in theme initialization:', err);
        setError(err);
        // Continue with localStorage values
      } finally {
        setLoading(false);
      }
    };

    loadUserSettings();
  }, []);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        setThemeMode(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  // Update theme mode
  const updateThemeMode = async (mode) => {
    try {
      localStorage.setItem('theme', mode);
      
      if (mode === 'system') {
        const systemMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setThemeMode(systemMode);
      } else {
        setThemeMode(mode);
      }

      // Try to update database only if user is authenticated
      try {
        await initializeUserSettings();
        await updateSettingsCategory('appearance', { theme: mode });
      } catch {
        // Silently fail if user is not authenticated - settings saved to localStorage
        console.log('Could not save theme to database (user may not be authenticated)');
      }
    } catch (error) {
      console.error('Failed to update theme mode:', error);
      // Continue with local update even if database update fails
    }
  };

  // Update color scheme
  const updateColorScheme = async (scheme) => {
    try {
      localStorage.setItem('colorScheme', scheme);
      setColorScheme(scheme);

      // Try to update database only if user is authenticated
      try {
        await initializeUserSettings();
        await updateSettingsCategory('appearance', { colorScheme: scheme });
      } catch {
        // Silently fail if user is not authenticated - settings saved to localStorage
        console.log('Could not save color scheme to database (user may not be authenticated)');
      }
    } catch (error) {
      console.error('Failed to update color scheme:', error);
      // Continue with local update even if database update fails
    }
  };

  // Update font size
  const updateFontSize = async (size) => {
    try {
      localStorage.setItem('fontSize', size.toString());
      setFontSize(size);

      // Try to update database only if user is authenticated
      try {
        await initializeUserSettings();
        await updateSettingsCategory('appearance', { fontSize: size });
      } catch {
        // Silently fail if user is not authenticated - settings saved to localStorage
        console.log('Could not save font size to database (user may not be authenticated)');
      }
    } catch (error) {
      console.error('Failed to update font size:', error);
      // Continue with local update even if database update fails
    }
  };

  // Update reduced motion
  const updateReducedMotion = async (reduced) => {
    try {
      localStorage.setItem('reducedMotion', reduced.toString());
      setReducedMotion(reduced);

      // Try to update database only if user is authenticated
      try {
        await initializeUserSettings();
        await updateSettingsCategory('appearance', { reducedMotion: reduced });
      } catch {
        // Silently fail if user is not authenticated - settings saved to localStorage
        console.log('Could not save reduced motion to database (user may not be authenticated)');
      }
    } catch (error) {
      console.error('Failed to update reduced motion:', error);
      // Continue with local update even if database update fails
    }
  };

  // Create the theme based on current settings
  const theme = createAppTheme(themeMode, colorScheme, fontSize);

  // Apply reduced motion styles
  useEffect(() => {
    if (reducedMotion) {
      document.documentElement.style.setProperty('--motion-duration', '0.1s');
      document.documentElement.style.setProperty('--motion-timing', 'linear');
      document.documentElement.style.setProperty('--slow-motion-duration', '3s');
      // Add a class to enable reduced motion styles
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.style.removeProperty('--motion-duration');
      document.documentElement.style.removeProperty('--motion-timing');
      document.documentElement.style.removeProperty('--slow-motion-duration');
      document.documentElement.classList.remove('reduced-motion');
    }
  }, [reducedMotion]);

  const value = {
    // Current settings
    themeMode: localStorage.getItem('theme') || 'system', // Return the actual stored setting
    colorScheme,
    fontSize,
    reducedMotion,
    
    // Loading and error states
    loading,
    error,
    
    // Update functions
    updateThemeMode,
    updateColorScheme,
    updateFontSize,
    updateReducedMotion,
    
    // MUI theme object
    muiTheme: theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;
