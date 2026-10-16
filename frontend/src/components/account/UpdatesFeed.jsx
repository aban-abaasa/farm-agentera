import { Link as RouterLink } from 'react-router-dom';
import { Box, Link, Typography } from '@mui/material';
import { fonts } from '../../theme';

const TONE_COLOR = { success: 'success.main', warning: 'warning.main', info: 'info.main', todo: 'text.disabled' };

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/**
 * The feed on each role's account: real updates (applications filed and
 * reviewed) first, then plain "next step" prompts.
 * items: [{ id, tone, title, body?, when?, to?, href?, cta? }]
 */
const UpdatesFeed = ({ title = 'Your feed', items }) => (
  <Box sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', p: { xs: 2, md: 2.5 } }}>
    <Typography className="kicker" sx={{ color: 'warning.main', mb: 1.5 }}>{title}</Typography>

    {items.length === 0 ? (
      <Typography variant="body2" color="text.secondary">Nothing new yet. Updates will appear here.</Typography>
    ) : (
      <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
        {items.map((item) => {
          const linkProps = item.href
            ? { href: item.href, target: '_blank', rel: 'noopener noreferrer' }
            : { component: RouterLink, to: item.to };
          return (
            <Box component="li" key={item.id} sx={{ display: 'flex', gap: 1.5, py: 1.5, borderTop: '1px solid', borderColor: 'divider', '&:first-of-type': { borderTop: 0, pt: 0 } }}>
              <Box
                aria-hidden="true"
                sx={{ width: 10, height: 10, mt: 0.7, flexShrink: 0, borderRadius: '50%', bgcolor: item.tone === 'todo' ? 'transparent' : TONE_COLOR[item.tone] || TONE_COLOR.info, border: '2px solid', borderColor: TONE_COLOR[item.tone] || TONE_COLOR.info }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '0.98rem' }}>{item.title}</Typography>
                {item.body && <Typography variant="body2" color="text.secondary">{item.body}</Typography>}
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mt: 0.5, flexWrap: 'wrap' }}>
                  {item.when && <Typography variant="caption" color="text.secondary">{formatDate(item.when)}</Typography>}
                  {item.cta && (item.to || item.href) && (
                    <Link {...linkProps} variant="caption" sx={{ fontWeight: 700 }}>{item.cta} →</Link>
                  )}
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    )}
  </Box>
);

export default UpdatesFeed;
