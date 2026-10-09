import { Box, Container, Grid, Typography } from '@mui/material';
import { SectionHeading } from '../../components/classic/Ornament';
import { testimonials } from '../../mocks/home';
import { fonts } from '../../theme';

/** Testimonials, set as "Letters to the editor". */
const Letters = () => (
  <Box component="section" sx={{ py: { xs: 7, md: 10 }, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
    <Container maxWidth="xl">
      <SectionHeading kicker="Letters from the field" title="Words from our growers" />
      <Grid container spacing={4}>
        {testimonials.map((t) => (
          <Grid key={t.name} size={{ xs: 12, md: 4 }}>
            <Box component="figure" sx={{ m: 0, height: '100%', p: 3.5, border: '1px solid', borderColor: 'divider', position: 'relative' }}>
              <Typography
                aria-hidden="true"
                sx={{ position: 'absolute', top: -6, left: 18, fontFamily: fonts.display, fontSize: '5rem', lineHeight: 1, color: 'warning.main', opacity: 0.55 }}
              >
                &ldquo;
              </Typography>
              <Typography component="blockquote" sx={{ m: 0, pt: 3, fontFamily: fonts.accent, fontStyle: 'italic', fontSize: '1.3rem', lineHeight: 1.55 }}>
                {t.quote}
              </Typography>
              <Box component="figcaption" sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography sx={{ fontFamily: fonts.display, fontWeight: 700 }}>{t.name}</Typography>
                <Typography className="kicker" sx={{ color: 'text.secondary', fontSize: '0.64rem' }}>{t.role}</Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);

export default Letters;
