import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Grid, Typography } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import PaidIcon from '@mui/icons-material/Paid';
import { fonts } from '../../theme';
import plateLand from '../../assets/images/lease_land.jpg';

const pillars = [
  { Icon: VerifiedIcon, label: 'Verified on the ground' },
  { Icon: Inventory2Icon, label: 'Managed in CMMS' },
  { Icon: PaidIcon, label: 'Settled in ICAN' },
];

const Hero = () => (
  <Container maxWidth="xl" sx={{ pt: { xs: 5, md: 7 }, pb: { xs: 6, md: 9 } }}>
    <Grid container spacing={{ xs: 5, md: 8 }} alignItems="center">
      <Grid size={{ xs: 12, md: 7 }}>
        <Typography className="kicker" sx={{ color: 'warning.main', mb: 2 }}>
          Vol. I · An almanac for Uganda&rsquo;s farms
        </Typography>
        <Typography
          variant="h1"
          component="h1"
          sx={{ fontSize: { xs: '2.6rem', sm: '3.4rem', lg: '4.4rem' }, mb: 3 }}
        >
          Every farm needs{' '}
          <Box component="span" sx={{ fontStyle: 'italic', fontWeight: 600, color: 'primary.main' }}>
            a backbone.
          </Box>
        </Typography>
        <Typography
          className="drop-cap"
          sx={{
            fontSize: { xs: '1.05rem', md: '1.15rem' }, color: 'text.secondary', maxWidth: 640, mb: 4, lineHeight: 1.8,
            '&::first-letter': { color: 'primary.main' },
          }}
        >
          Customers, farmers, on-ground specialists, suppliers and partners meet in one trusted ledger.
          Farmers run their farm and sell direct, people on the ground vouch for them, and every sale is
          settled on the ICAN wallet.
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 5 }}>
          <Button component={RouterLink} to="/join" variant="contained" size="large">
            Choose your pathway
          </Button>
          <Button component={RouterLink} to="/marketplace" variant="outlined" size="large" color="inherit">
            Visit the market
          </Button>
        </Box>

        <Box
          sx={{
            display: 'flex', flexWrap: 'wrap', borderTop: '3px solid', borderBottom: '1px solid', borderColor: 'text.primary',
            maxWidth: 640,
          }}
        >
          {pillars.map((pillar, i) => (
            <Box
              key={pillar.label}
              sx={{
                flex: '1 1 160px', display: 'flex', alignItems: 'center', gap: 1.25, py: 1.5, px: 2,
                borderLeft: i === 0 ? 'none' : { sm: '1px solid' }, borderColor: 'divider',
              }}
            >
              <pillar.Icon sx={{ color: 'warning.main', fontSize: 20 }} />
              <Typography className="kicker" sx={{ fontSize: '0.66rem', letterSpacing: '0.14em' }}>
                {pillar.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
        <Box component="figure" sx={{ m: 0, maxWidth: 480, mx: { xs: 'auto', md: 0 }, ml: { md: 'auto' } }}>
          <Box
            sx={{
              p: 1.5, bgcolor: 'background.paper', border: '1px solid', borderColor: 'text.primary', boxShadow: 5,
              transform: { md: 'rotate(1.2deg)' },
            }}
          >
            <Box sx={{ p: 0.75, border: '1px solid', borderColor: 'warning.main' }}>
              <Box
                component="img"
                src={plateLand}
                alt="Green hillside fields under a clouded sky"
                className="plate-img"
                sx={{ display: 'block', width: '100%', aspectRatio: '4 / 5', objectFit: 'cover', objectPosition: '50% 60%' }}
              />
            </Box>
            <Box component="figcaption" sx={{ textAlign: 'center', pt: 1.5, pb: 0.5 }}>
              <Typography sx={{ fontFamily: fonts.accent, fontStyle: 'italic', fontSize: '1.1rem', color: 'text.secondary' }}>
                Plate I &mdash; where the work begins.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Grid>
    </Grid>
  </Container>
);

export default Hero;
