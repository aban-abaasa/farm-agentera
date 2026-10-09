import { Box, Typography } from '@mui/material';
import { fonts } from '../../theme';

/** The AgriBone logo, cropped to a brass-ringed roundel. */
export const BrandMark = ({ size = 40 }) => (
  <Box
    component="img"
    src="/agribone-logo.jpg"
    alt="AgriBone"
    sx={{
      width: size,
      height: size,
      flexShrink: 0,
      borderRadius: '50%',
      objectFit: 'cover',
      border: '2px solid #b08d3c',
      boxShadow: '0 0 0 1px rgba(42,33,24,0.25)',
    }}
  />
);

/** Wordmark in letterspaced Playfair capitals. */
export const Wordmark = ({ size = '1.5rem', color = 'inherit', sx = {} }) => (
  <Typography
    component="span"
    sx={{
      fontFamily: fonts.display,
      fontWeight: 900,
      fontSize: size,
      letterSpacing: '0.18em',
      lineHeight: 1,
      color,
      ...sx,
    }}
  >
    AGRIBONE
  </Typography>
);
