import { Link as RouterLink } from 'react-router-dom';
import { Box, Card, CardActionArea, Grid, Typography } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { fonts } from '../../theme';

/**
 * Big, obvious things a person can do from their account.
 * items: [{ icon, title, body, to? , href? }] — `href` opens in a new tab.
 */
const ActionGrid = ({ items }) => (
  <Grid container spacing={2}>
    {items.map(({ icon, title, body, to, href }) => {
      const linkProps = href
        ? { component: 'a', href, target: '_blank', rel: 'noopener noreferrer' }
        : { component: RouterLink, to };
      return (
        <Grid key={title} size={{ xs: 12, sm: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardActionArea {...linkProps} sx={{ height: '100%', p: 2.25, display: 'flex', gap: 2, alignItems: 'flex-start', justifyContent: 'flex-start' }}>
              <Box
                sx={{
                  width: 42, height: 42, flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center',
                  bgcolor: 'primary.main', color: 'primary.contrastText', border: '2px solid', borderColor: 'warning.main',
                }}
              >
                {icon}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontFamily: fonts.display, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  {title}
                  {href && <OpenInNewIcon sx={{ fontSize: 14, color: 'text.secondary' }} />}
                </Typography>
                <Typography variant="body2" color="text.secondary">{body}</Typography>
              </Box>
            </CardActionArea>
          </Card>
        </Grid>
      );
    })}
  </Grid>
);

export default ActionGrid;
