import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Grid, Typography } from '@mui/material';
import { charter, supplierStandards } from '../../content/agribone';
import { fonts } from '../../theme';

/** On-ground charter + supplier standards, set as a pair of printed notices. */
const OnTheGround = () => (
  <Container maxWidth="xl" component="section" sx={{ py: { xs: 7, md: 10 } }}>
    <Grid container spacing={{ xs: 4, md: 6 }}>
      <Grid size={{ xs: 12, md: 7 }}>
        <Box sx={{ border: '1px solid', borderColor: 'text.primary', p: 1, height: '100%' }}>
          <Box sx={{ border: '3px double', borderColor: 'text.primary', p: { xs: 3, md: 5 }, height: '100%', bgcolor: 'background.paper' }}>
            <Typography className="kicker" sx={{ color: 'secondary.main', textAlign: 'center', mb: 1 }}>
              Notice to the public
            </Typography>
            <Typography variant="h2" component="h2" sx={{ textAlign: 'center', fontSize: { xs: '2rem', md: '2.6rem' }, mb: 1 }}>
              Wanted: people on the ground
            </Typography>
            <Typography sx={{ textAlign: 'center', fontFamily: fonts.accent, fontStyle: 'italic', fontSize: '1.25rem', color: 'text.secondary', mb: 4 }}>
              Become AgriBone where you live. Verify farms, guide neighbours, and be paid for the trust you build.
            </Typography>

            <Box sx={{ borderTop: '1px solid', borderColor: 'text.primary' }}>
              {charter.map((row) => (
                <Box
                  key={row.heading}
                  sx={{
                    display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '130px 1fr' }, gap: { xs: 0.5, sm: 3 }, py: 2.25,
                    borderBottom: '1px solid', borderColor: 'divider',
                  }}
                >
                  <Typography sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '1.2rem', color: 'primary.main' }}>
                    {row.heading}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{row.body}</Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button component={RouterLink} to="/join/support" variant="contained" size="large">
                Apply to serve
              </Button>
            </Box>
          </Box>
        </Box>
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
        <Box sx={{ height: '100%', p: { xs: 3, md: 4 }, bgcolor: 'primary.main', color: 'primary.contrastText', border: '1px solid', borderColor: 'warning.main', outline: '1px solid', outlineColor: 'warning.main', outlineOffset: -9 }}>
          <Typography className="kicker" sx={{ color: '#d4ae5a', mb: 1 }}>For suppliers</Typography>
          <Typography variant="h3" component="h2" sx={{ mb: 1.5, color: 'inherit' }}>
            Supplier standards
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.85, mb: 3 }}>
            Supply the farm &mdash; inputs, tools, equipment &mdash; and, if you wish, human labour. Suppliers keep to a common standard so farmers can buy with confidence.
          </Typography>
          <Box component="ol" sx={{ m: 0, pl: 0, listStyle: 'none', counterReset: 'std' }}>
            {supplierStandards.map((s) => (
              <Box
                component="li"
                key={s}
                sx={{
                  counterIncrement: 'std', display: 'flex', gap: 2, py: 1.25, borderTop: '1px solid rgba(243,235,216,0.25)',
                  fontSize: '0.9rem', '&::before': { content: 'counter(std, upper-roman) "."', fontFamily: fonts.display, fontStyle: 'italic', color: '#d4ae5a', minWidth: 28 },
                }}
              >
                {s}
              </Box>
            ))}
          </Box>
          <Button
            component={RouterLink}
            to="/join/supplier"
            variant="outlined"
            sx={{ mt: 3, color: 'inherit', borderColor: 'rgba(243,235,216,0.6)', '&:hover': { borderColor: '#d4ae5a', bgcolor: 'rgba(243,235,216,0.08)' } }}
          >
            Apply to supply
          </Button>
        </Box>
      </Grid>
    </Grid>
  </Container>
);

export default OnTheGround;
