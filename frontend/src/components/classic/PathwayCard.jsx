import { Link as RouterLink } from 'react-router-dom';
import { Box, Card, Typography } from '@mui/material';
import { pathwayIcons } from './pathwayIcons';
import EastIcon from '@mui/icons-material/East';
import { fonts } from '../../theme';


/** One "pathway" (role) rendered as an engraved card. */
const PathwayCard = ({ pathway, to }) => {
  const Icon = pathwayIcons[pathway.slug] || pathwayIcons.farmer;
  return (
    <Card
      component={RouterLink}
      to={to || `/join/${pathway.slug}`}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: { xs: 3, md: 3.5 },
        textDecoration: 'none',
        color: 'text.primary',
        position: 'relative',
        transition: 'transform .25s ease, box-shadow .25s ease, border-color .25s ease',
        // Inner hairline frame, like a certificate border.
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 7,
          border: '1px solid',
          borderColor: 'divider',
          pointerEvents: 'none',
          transition: 'border-color .25s ease',
        },
        '&:hover': { transform: 'translateY(-4px)', boxShadow: 5, borderColor: 'warning.main' },
        '&:hover::before': { borderColor: 'warning.main' },
        '&:hover .pathway-cta': { gap: 1.5 },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography
          sx={{ fontFamily: fonts.display, fontStyle: 'italic', fontWeight: 600, fontSize: '2.4rem', lineHeight: 1, color: 'warning.main' }}
        >
          {pathway.numeral}.
        </Typography>
        <Box
          sx={{
            width: 46, height: 46, borderRadius: '50%', display: 'grid', placeItems: 'center',
            bgcolor: 'primary.main', color: 'primary.contrastText', border: '2px solid', borderColor: 'warning.main',
          }}
        >
          <Icon fontSize="small" />
        </Box>
      </Box>

      <Typography variant="h4" component="h3" sx={{ mb: 0.5 }}>
        {pathway.title}
      </Typography>
      <Typography
        sx={{ fontFamily: fonts.accent, fontStyle: 'italic', fontSize: '1.25rem', color: 'secondary.main', mb: 1.5 }}
      >
        {pathway.tagline}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        {pathway.summary}
      </Typography>

      <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, mb: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        {pathway.can.map((item) => (
          <Box
            component="li"
            key={item}
            sx={{
              py: 0.9, fontSize: '0.86rem', borderBottom: '1px solid', borderColor: 'divider',
              display: 'flex', gap: 1.25, alignItems: 'baseline',
            }}
          >
            <Box component="span" aria-hidden="true" sx={{ color: 'warning.main', fontSize: '0.7rem' }}>◆</Box>
            {item}
          </Box>
        ))}
      </Box>

      <Box
        className="pathway-cta"
        sx={{
          mt: 'auto', display: 'inline-flex', alignItems: 'center', gap: 1, transition: 'gap .25s ease',
          fontWeight: 700, fontSize: '0.74rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'primary.main',
        }}
      >
        {pathway.mode === 'apply' ? 'Apply' : 'Begin'} <EastIcon sx={{ fontSize: 16 }} />
      </Box>
    </Card>
  );
};

export default PathwayCard;
