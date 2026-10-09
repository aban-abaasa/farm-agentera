import { Box, Typography } from '@mui/material';
import { fonts } from '../../theme';

/** A hairline rule with a centred fleuron. */
export const Ornament = ({ symbol = '❦', sx = {} }) => (
  <Box
    aria-hidden="true"
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      color: 'text.disabled',
      '&::before, &::after': { content: '""', flex: 1, borderTop: '1px solid', borderColor: 'divider' },
      ...sx,
    }}
  >
    <Typography component="span" sx={{ fontSize: '1.2rem', lineHeight: 1, color: 'warning.main' }}>
      {symbol}
    </Typography>
  </Box>
);

/** Heavy-over-hairline rule, as under a newspaper masthead. */
export const DoubleRule = ({ color = 'currentColor', sx = {} }) => (
  <Box
    aria-hidden="true"
    sx={{ height: 6, borderTop: `3px solid ${color}`, borderBottom: `1px solid ${color}`, ...sx }}
  />
);

/** Kicker + serif title + italic standfirst, centred or left aligned. */
export const SectionHeading = ({ kicker, title, subtitle, align = 'center', light = false, sx = {} }) => (
  <Box sx={{ textAlign: align, mb: { xs: 4, md: 6 }, ...sx }}>
    {kicker && (
      <Typography
        className="kicker"
        sx={{ color: light ? 'rgba(243,235,216,0.75)' : 'warning.main', display: 'block', mb: 1.5 }}
      >
        {kicker}
      </Typography>
    )}
    <Typography variant="h2" component="h2" sx={{ color: light ? '#f3ebd8' : 'text.primary', mb: 2 }}>
      {title}
    </Typography>
    {subtitle && (
      <Typography
        variant="subtitle1"
        sx={{
          color: light ? 'rgba(243,235,216,0.85)' : 'text.secondary',
          maxWidth: 720,
          mx: align === 'center' ? 'auto' : 0,
          fontFamily: fonts.accent,
          fontSize: '1.3rem',
        }}
      >
        {subtitle}
      </Typography>
    )}
    <Ornament sx={{ mt: 3, maxWidth: align === 'center' ? 320 : 220, mx: align === 'center' ? 'auto' : 0, color: light ? 'rgba(243,235,216,0.5)' : undefined }} />
  </Box>
);
