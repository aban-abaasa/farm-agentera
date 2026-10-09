import { createTheme } from '@mui/material/styles';

/**
 * AgriBone — "Almanac" theme.
 *
 * A classic, print-inspired look: parchment paper, ink text, serif type,
 * hairline double rules, small radii and brass accents. Dark mode is the
 * same book read by candlelight.
 */

// Accent ("ink") schemes. Keys are kept from the previous theme so saved
// user settings keep working; the values are now classic pigments.
const colorSchemes = {
  green: {
    // Forest
    primary: { light: '#4a8062', main: '#1f4d36', dark: '#133222' },
    secondary: { light: '#a65a55', main: '#7b2d2d', dark: '#551c1c' },
  },
  blue: {
    // Prussian
    primary: { light: '#4f78a3', main: '#1f3f66', dark: '#142a45' },
    secondary: { light: '#c79a4a', main: '#9a7424', dark: '#6e5216' },
  },
  amber: {
    // Umber & brass
    primary: { light: '#c79a4a', main: '#8a5f17', dark: '#5f4010' },
    secondary: { light: '#4a8062', main: '#1f4d36', dark: '#133222' },
  },
  purple: {
    // Aubergine
    primary: { light: '#8d5a86', main: '#5b2a54', dark: '#3d1b38' },
    secondary: { light: '#c79a4a', main: '#9a7424', dark: '#6e5216' },
  },
  teal: {
    // Verdigris
    primary: { light: '#4a8d86', main: '#1f5c57', dark: '#133d3a' },
    secondary: { light: '#a65a55', main: '#7b2d2d', dark: '#551c1c' },
  },
};

export const fonts = {
  display: '"Playfair Display", "Cormorant Garamond", Georgia, "Times New Roman", serif',
  body: '"Lora", Georgia, "Times New Roman", serif',
  accent: '"Cormorant Garamond", Georgia, "Times New Roman", serif',
};

// Paper noise, kept very faint. Encoded once and reused.
const paperGrain =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.35 0 0 0 0 0.27 0 0 0 0 0.15 0 0 0 0.09 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const palettes = {
  light: {
    bg: '#f3ebd8',
    paper: '#fbf7ec',
    paperAlt: '#f6efde',
    ink: '#2a2118',
    inkSoft: '#5c4e3c',
    inkMuted: '#8a7a62',
    rule: '#cbba94',
    ruleStrong: '#a8946a',
    brass: '#a8842f',
  },
  dark: {
    bg: '#14110d',
    paper: '#1d1914',
    paperAlt: '#252019',
    ink: '#efe5cf',
    inkSoft: '#c2b69c',
    inkMuted: '#8f8368',
    rule: '#3a3226',
    ruleStrong: '#5a4e3a',
    brass: '#d4ae5a',
  },
};

const baseTypography = {
  fontFamily: fonts.body,
  h1: { fontFamily: fonts.display, fontSize: '3rem', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.01em' },
  h2: { fontFamily: fonts.display, fontSize: '2.35rem', fontWeight: 700, lineHeight: 1.12, letterSpacing: '-0.005em' },
  h3: { fontFamily: fonts.display, fontSize: '1.9rem', fontWeight: 700, lineHeight: 1.18 },
  h4: { fontFamily: fonts.display, fontSize: '1.55rem', fontWeight: 700, lineHeight: 1.22 },
  h5: { fontFamily: fonts.display, fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.28 },
  h6: { fontFamily: fonts.display, fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.3 },
  subtitle1: { fontFamily: fonts.accent, fontSize: '1.2rem', fontWeight: 500, fontStyle: 'italic', lineHeight: 1.5 },
  subtitle2: { fontFamily: fonts.body, fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.57 },
  body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.7 },
  body2: { fontSize: '0.9rem', fontWeight: 400, lineHeight: 1.65 },
  caption: { fontSize: '0.78rem', lineHeight: 1.5 },
  overline: { fontFamily: fonts.body, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.2em', lineHeight: 2 },
  button: {
    fontFamily: fonts.body,
    fontSize: '0.78rem',
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    lineHeight: 1.75,
  },
};

// Soft, warm shadows (MUI needs 25 entries).
const shadows = [
  'none',
  '0 1px 2px rgba(60,40,10,0.08)',
  '0 1px 0 rgba(255,255,255,0.5) inset, 0 2px 6px rgba(60,40,10,0.10)',
  '0 3px 10px rgba(60,40,10,0.12)',
  '0 4px 14px rgba(60,40,10,0.13)',
  '0 6px 18px rgba(60,40,10,0.14)',
  ...Array.from({ length: 19 }, (_, i) => `0 ${8 + i}px ${20 + i * 2}px rgba(60,40,10,${Math.min(0.14 + i * 0.01, 0.3)})`),
];

export const createAppTheme = (mode = 'light', colorScheme = 'green', fontSize = 100) => {
  const isDark = mode === 'dark';
  const p = palettes[isDark ? 'dark' : 'light'];
  const scheme = colorSchemes[colorScheme] || colorSchemes.green;
  const k = fontSize / 100;

  // On dark paper the dark pigments vanish, so lift to the lighter tint.
  const primary = isDark
    ? { light: scheme.primary.light, main: scheme.primary.light, dark: scheme.primary.main, contrastText: '#14110d' }
    : { ...scheme.primary, contrastText: '#fbf7ec' };
  const secondary = isDark
    ? { light: scheme.secondary.light, main: scheme.secondary.light, dark: scheme.secondary.main, contrastText: '#14110d' }
    : { ...scheme.secondary, contrastText: '#fbf7ec' };

  const scale = (variant, rem) => ({ ...baseTypography[variant], fontSize: `${rem * k}rem` });

  const typography = {
    ...baseTypography,
    fontSize: 14 * k,
    h1: scale('h1', 3),
    h2: scale('h2', 2.35),
    h3: scale('h3', 1.9),
    h4: scale('h4', 1.55),
    h5: scale('h5', 1.25),
    h6: scale('h6', 1.05),
    subtitle1: scale('subtitle1', 1.2),
    subtitle2: scale('subtitle2', 0.875),
    body1: scale('body1', 1),
    body2: scale('body2', 0.9),
    button: scale('button', 0.78),
  };

  const hairline = `1px solid ${p.rule}`;

  return createTheme({
    palette: {
      mode,
      primary,
      secondary,
      error: { light: '#c26a6a', main: isDark ? '#d98383' : '#9b2c2c', dark: '#6f1d1d', contrastText: '#fff' },
      warning: { light: '#d6ad5a', main: isDark ? '#d4ae5a' : '#a8842f', dark: '#7a5e1c', contrastText: isDark ? '#14110d' : '#fff' },
      info: { light: '#6f93b3', main: isDark ? '#7fa3c3' : '#2f5b7c', dark: '#1e3f57', contrastText: isDark ? '#14110d' : '#fff' },
      success: { light: '#6f9a78', main: isDark ? '#7fae8d' : '#3c6e47', dark: '#264a2f', contrastText: isDark ? '#14110d' : '#fff' },
      grey: {
        50: '#faf6ec', 100: '#f3ebd8', 200: '#e7dcc1', 300: '#d6c8a5', 400: '#b8a57d',
        500: '#8f7f5f', 600: '#6f6249', 700: '#554a38', 800: '#3a3226', 900: '#241f17',
      },
      background: { default: p.bg, paper: p.paper },
      text: { primary: p.ink, secondary: p.inkSoft, disabled: p.inkMuted },
      divider: p.rule,
      // Handy for components that want the brass accent.
      brass: { main: p.brass },
    },
    typography,
    shape: { borderRadius: 2 },
    shadows,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: p.bg,
            backgroundImage: paperGrain,
            backgroundAttachment: 'fixed',
            color: p.ink,
            fontFamily: fonts.body,
          },
          '::selection': { backgroundColor: isDark ? '#4a3d22' : '#e6d29a', color: p.ink },
          'h1, h2, h3, h4, h5, h6': { textWrap: 'balance' },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 2,
            padding: '8px 20px',
            transition: 'background-color .2s, color .2s, border-color .2s, box-shadow .2s',
          },
          contained: {
            border: `1px solid ${p.brass}`,
            boxShadow: `inset 0 0 0 1px ${isDark ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.18)'}`,
            '&:hover': { boxShadow: `inset 0 0 0 1px ${p.brass}` },
          },
          outlined: {
            borderWidth: 1,
            '&:hover': { borderWidth: 1 },
          },
          sizeSmall: { padding: '4px 12px', fontSize: '0.7rem' },
          sizeLarge: { padding: '12px 30px', fontSize: '0.85rem' },
        },
      },
      MuiIconButton: { styleOverrides: { root: { borderRadius: 2 } } },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: 3,
            border: hairline,
            backgroundImage: 'none',
            backgroundColor: p.paper,
            boxShadow: shadows[2],
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { borderRadius: 3, backgroundImage: 'none' },
          outlined: { border: hairline },
        },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0, color: 'inherit' },
        styleOverrides: {
          root: {
            backgroundColor: p.paper,
            color: p.ink,
            backgroundImage: 'none',
            borderRadius: 0,
          },
        },
      },
      MuiDrawer: { styleOverrides: { paper: { borderRadius: 0, backgroundColor: p.paper } } },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 3, border: `1px solid ${p.ruleStrong}`, boxShadow: shadows[8] },
        },
      },
      MuiDialogTitle: { styleOverrides: { root: { fontFamily: fonts.display, fontWeight: 700 } } },
      MuiMenu: { styleOverrides: { paper: { border: hairline, borderRadius: 3 } } },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: p.ink,
            color: p.paper,
            fontFamily: fonts.body,
            fontSize: '0.75rem',
            borderRadius: 2,
          },
        },
      },
      MuiDivider: { styleOverrides: { root: { borderColor: p.rule } } },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 2,
            fontFamily: fonts.body,
            fontWeight: 600,
            fontSize: '0.72rem',
            letterSpacing: '0.04em',
          },
        },
      },
      MuiTextField: { defaultProps: { variant: 'outlined' } },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 2,
            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.55)',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: p.ruleStrong },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: p.inkSoft },
          },
        },
      },
      MuiInputLabel: { styleOverrides: { root: { fontFamily: fonts.body } } },
      MuiTabs: { styleOverrides: { indicator: { height: 2 } } },
      MuiTab: {
        styleOverrides: {
          root: {
            fontFamily: fonts.body,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontSize: '0.74rem',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: p.rule },
          head: {
            fontFamily: fonts.body,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontSize: '0.72rem',
            backgroundColor: p.paperAlt,
          },
        },
      },
      MuiAlert: { styleOverrides: { root: { borderRadius: 2, fontFamily: fonts.body } } },
      MuiLinearProgress: { styleOverrides: { root: { borderRadius: 0 } } },
    },
  });
};

// Default theme for places that import it directly (e.g. main.jsx).
const theme = createAppTheme();
export default theme;
