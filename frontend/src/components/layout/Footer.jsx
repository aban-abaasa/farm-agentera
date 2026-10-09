import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Link, IconButton, TextField, Button, Grid, Tooltip } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn, Send, Phone, Email, LocationOn } from '@mui/icons-material';
import { BrandMark, Wordmark } from '../classic/Brand';
import { DoubleRule, Ornament } from '../classic/Ornament';
import { fonts } from '../../theme';

const INK = '#17231b';
const PARCHMENT = '#f3ebd8';
const BRASS = '#d4ae5a';

const columnTitle = {
  fontFamily: fonts.display,
  fontWeight: 700,
  fontSize: '1.05rem',
  color: BRASS,
  mb: 2,
};

const linkSx = {
  display: 'block',
  py: 0.6,
  color: 'rgba(243,235,216,0.82)',
  textDecoration: 'none',
  fontSize: '0.9rem',
  '&:hover': { color: '#fff', textDecoration: 'underline', textUnderlineOffset: 4 },
};

const pathwayLinks = [
  ['Customer', '/join/customer'],
  ['Farmer', '/join/farmer'],
  ['On-Ground Support', '/join/support'],
  ['Supplier', '/join/supplier'],
  ['Partner & Investor', '/join/partner'],
];

const exploreLinks = [
  ['Marketplace', '/marketplace'],
  ['Community', '/community'],
  ['Resources', '/resources'],
  ['Weather', '/weather'],
  ['ICAN Wallet', '/ican-wallet'],
];

const Footer = () => (
  <Box component="footer" sx={{ bgcolor: INK, color: PARCHMENT, mt: { xs: 6, md: 10 }, pt: { xs: 6, md: 8 }, pb: 3 }}>
    <Container maxWidth="xl">
      <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: { xs: 1.5, sm: 2.5 } }}>
          <BrandMark size={52} />
          <Wordmark color={PARCHMENT} sx={{ fontSize: { xs: '1.5rem', sm: '2.1rem' }, letterSpacing: '0.2em' }} />
          <Box sx={{ display: { xs: 'none', sm: 'inline-flex' } }}><BrandMark size={52} /></Box>
        </Box>
        <Typography
          sx={{ mt: 1.5, fontFamily: fonts.accent, fontStyle: 'italic', fontSize: '1.25rem', color: 'rgba(243,235,216,0.8)' }}
        >
          The backbone of every farm in Uganda.
        </Typography>
        <Ornament sx={{ mt: 3, maxWidth: 360, mx: 'auto', color: 'rgba(243,235,216,0.35)', '& span': { color: BRASS } }} />
      </Box>

      <Grid container spacing={{ xs: 4, md: 6 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography sx={columnTitle}>Pathways</Typography>
          {pathwayLinks.map(([label, to]) => (
            <Link key={to} component={RouterLink} to={to} sx={linkSx}>{label}</Link>
          ))}
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography sx={columnTitle}>Explore</Typography>
          {exploreLinks.map(([label, to]) => (
            <Link key={to} component={RouterLink} to={to} sx={linkSx}>{label}</Link>
          ))}
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography sx={columnTitle}>Correspondence</Typography>
          {[
            { Icon: LocationOn, text: 'P.O. Box 12345, Kampala, Uganda' },
            { Icon: Email, text: 'support@farmagentcom' },
            { Icon: Phone, text: '+256 706993614' },
          ].map((row) => (
            <Box key={row.text} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, py: 0.6, color: 'rgba(243,235,216,0.82)' }}>
              <row.Icon sx={{ fontSize: 18, mt: '3px', color: BRASS }} />
              <Typography variant="body2">{row.text}</Typography>
            </Box>
          ))}
          <Box sx={{ display: 'flex', gap: 0.5, mt: 2 }}>
            {[
              { Icon: Facebook, label: 'Facebook', href: 'https://facebook.com/farmagentuganda' },
              { Icon: Twitter, label: 'Twitter', href: 'https://twitter.com/farmagentuganda' },
              { Icon: Instagram, label: 'Instagram', href: 'https://instagram.com/farmagentuganda' },
              { Icon: LinkedIn, label: 'LinkedIn', href: 'https://linkedin.com/company/farmagentuganda' },
            ].map((social) => (
              <Tooltip key={social.label} title={social.label}>
                <IconButton
                  component="a"
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  sx={{ color: PARCHMENT, border: '1px solid rgba(243,235,216,0.25)', '&:hover': { color: BRASS, borderColor: BRASS } }}
                >
                  <social.Icon fontSize="small" />
                </IconButton>
              </Tooltip>
            ))}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography sx={columnTitle}>The Weekly Bulletin</Typography>
          <Typography variant="body2" sx={{ color: 'rgba(243,235,216,0.82)', mb: 2 }}>
            Market prices, farming notes and community events, delivered to your inbox.
          </Typography>
          <Box component="form" onSubmit={(e) => e.preventDefault()} sx={{ display: 'flex' }}>
            <TextField
              type="email"
              placeholder="Your email address"
              size="small"
              fullWidth
              inputProps={{ 'aria-label': 'Email address' }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: PARCHMENT,
                  bgcolor: 'rgba(243,235,216,0.06)',
                  borderRadius: '2px 0 0 2px',
                  '& fieldset': { borderColor: 'rgba(243,235,216,0.35)' },
                  '&:hover fieldset': { borderColor: BRASS },
                  '&.Mui-focused fieldset': { borderColor: BRASS },
                },
                '& input::placeholder': { color: 'rgba(243,235,216,0.6)', opacity: 1 },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              aria-label="Subscribe"
              sx={{ borderRadius: '0 2px 2px 0', minWidth: 52, bgcolor: BRASS, color: INK, '&:hover': { bgcolor: '#e2c077' } }}
            >
              <Send fontSize="small" />
            </Button>
          </Box>
        </Grid>
      </Grid>

      <DoubleRule color="rgba(243,235,216,0.35)" sx={{ mt: { xs: 5, md: 7 }, mb: 2.5 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="caption" sx={{ color: 'rgba(243,235,216,0.65)', letterSpacing: '0.08em' }}>
          © {new Date().getFullYear()} AGRIBONE · All rights reserved
        </Typography>
        <Box sx={{ display: 'flex', gap: 3 }}>
          {['Privacy Policy', 'Terms of Service', 'Sitemap'].map((label) => (
            <Link key={label} href="#" sx={{ ...linkSx, display: 'inline', py: 0, fontSize: '0.78rem' }}>
              {label}
            </Link>
          ))}
        </Box>
      </Box>
    </Container>
  </Box>
);

export default Footer;
