import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Link, Typography } from '@mui/material';
import { SectionHeading } from '../../components/classic/Ornament';
import { journey } from '../../content/agribone';
import { fonts } from '../../theme';

const BRASS = '#d4ae5a';
const PARCHMENT = '#f3ebd8';

/** The farmer's journey, drawn as a road with mile-markers. */
const FarmersRoad = () => (
  <Box component="section" sx={{ py: { xs: 7, md: 10 }, bgcolor: '#17231b', color: PARCHMENT }}>
    <Container maxWidth="xl">
      <SectionHeading
        light
        kicker="The farmer's road"
        title="From first furrow to final settlement"
        subtitle="Five milestones, in the order a farm actually grows."
      />

      <Box
        component="ol"
        sx={{
          listStyle: 'none', m: 0, p: 0, position: 'relative',
          display: 'grid', gap: { xs: 4, lg: 3 },
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(5, 1fr)' },
          // The road itself
          '&::before': {
            content: '""', position: 'absolute',
            background: {
              xs: `repeating-linear-gradient(180deg, ${BRASS} 0 10px, transparent 10px 18px)`,
              lg: `repeating-linear-gradient(90deg, ${BRASS} 0 10px, transparent 10px 18px)`,
            },
            left: { xs: 27, lg: '10%' }, right: { lg: '10%' }, top: { xs: 20, lg: 27 }, bottom: { xs: 20, lg: 'auto' },
            width: { xs: 2, lg: 'auto' }, height: { xs: 'auto', lg: 2 },
          },
        }}
      >
        {journey.map((step) => (
          <Box
            component="li"
            key={step.step}
            sx={{
              position: 'relative', display: 'flex', flexDirection: { xs: 'row', lg: 'column' },
              alignItems: { xs: 'flex-start', lg: 'center' }, textAlign: { xs: 'left', lg: 'center' }, gap: { xs: 3, lg: 2.5 },
            }}
          >
            <Box
              sx={{
                width: 56, height: 56, flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center',
                bgcolor: '#17231b', border: `2px solid ${BRASS}`, boxShadow: `0 0 0 5px #17231b`,
                fontFamily: fonts.display, fontStyle: 'italic', fontWeight: 700, fontSize: '1.25rem', color: BRASS, zIndex: 1,
              }}
            >
              {step.step}
            </Box>
            <Box sx={{ maxWidth: { lg: 230 } }}>
              <Typography variant="h5" component="h3" sx={{ color: PARCHMENT, mb: 1 }}>
                {step.title}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(243,235,216,0.78)', mb: 1.5 }}>
                {step.body}
              </Typography>
              <Link
                component={RouterLink}
                to={step.to}
                sx={{
                  color: BRASS, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
                  textDecorationColor: 'rgba(212,174,90,0.5)', textUnderlineOffset: 5,
                }}
              >
                {step.link} →
              </Link>
            </Box>
          </Box>
        ))}
      </Box>
    </Container>
  </Box>
);

export default FarmersRoad;
