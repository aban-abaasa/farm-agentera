import { Box, Button, Chip, Typography } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { PITCHIN_URL } from '../../content/agribone';
import { fonts } from '../../theme';

/**
 * The business profile every non-customer role keeps in PitchIn.
 * `pitchinRef` is the reference the person gave on their application, if any.
 */
const BusinessProfileCard = ({ roleLabel, pitchinRef, businessName }) => {
  const linked = Boolean(pitchinRef);
  return (
    <Box sx={{ border: '1px solid', borderColor: 'text.primary', p: 0.5, bgcolor: 'background.paper' }}>
      <Box sx={{ border: '3px double', borderColor: 'text.primary', p: { xs: 2.25, md: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', mb: 1 }}>
          <Typography className="kicker" sx={{ color: 'warning.main' }}>Business profile</Typography>
          {linked ? (
            <Chip size="small" color="success" icon={<CheckCircleIcon />} label="Linked to PitchIn" />
          ) : (
            <Chip size="small" variant="outlined" label="Not set up yet" />
          )}
        </Box>

        <Typography variant="h5" component="h2" sx={{ fontFamily: fonts.display, mb: 0.5 }}>
          {businessName || `Your ${roleLabel.toLowerCase()} business`}
        </Typography>

        {linked ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            PitchIn reference: <strong>{pitchinRef}</strong>. Your pitch, documents and verification all live there, so
            partners and customers see the same, up-to-date profile.
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Pitch your business once in PitchIn and it is shown everywhere on AgriBone. It only takes a few minutes, and
            you can come back and finish later.
          </Typography>
        )}

        <Button
          component="a"
          href={PITCHIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          variant={linked ? 'outlined' : 'contained'}
          endIcon={<OpenInNewIcon />}
        >
          {linked ? 'Open in PitchIn' : 'Create in PitchIn'}
        </Button>
      </Box>
    </Box>
  );
};

export default BusinessProfileCard;
