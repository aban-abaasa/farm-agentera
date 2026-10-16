import { Box, Button, Chip, MenuItem, TextField, Typography } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useRoles } from '../../context/RoleContext';
import { accountRoles, CMMS_URL, PITCHIN_URL } from '../../content/agribone';
import { fonts } from '../../theme';

const VERIFICATION = {
  verified: { label: 'Verified', color: 'success' },
  pending: { label: 'Verification pending', color: 'info' },
  rejected: { label: 'Verification not approved', color: 'warning' },
  unverified: { label: 'Not verified yet', color: 'default' },
};

const Detail = ({ label, children }) =>
  children ? (
    <Box sx={{ display: 'flex', gap: 1.5, py: 0.75, borderTop: '1px solid', borderColor: 'divider', fontSize: '0.9rem' }}>
      <Typography component="span" variant="body2" color="text.secondary" sx={{ minWidth: 110 }}>{label}</Typography>
      <Typography component="span" variant="body2">{children}</Typography>
    </Box>
  ) : null;

/**
 * The company a role runs as. Read from the shared ICAN database: the
 * business they manage in PitchIn and/or the company they run in CMMS, so a
 * farmer, supplier or farm specialist is treated as a company.
 */
const BusinessProfileCard = ({ role }) => {
  const { companies, companyForRole, setCompanyForRole, applicationByPathway } = useRoles();
  const roleInfo = accountRoles[role];
  const company = companyForRole(role);
  const application = applicationByPathway[roleInfo.pathway];
  const verification = VERIFICATION[company?.verification] || VERIFICATION.unverified;

  return (
    <Box sx={{ border: '1px solid', borderColor: 'text.primary', p: 0.5, bgcolor: 'background.paper' }}>
      <Box sx={{ border: '3px double', borderColor: 'text.primary', p: { xs: 2.25, md: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', mb: 1 }}>
          <Typography className="kicker" sx={{ color: 'warning.main' }}>Your company</Typography>
          {company ? (
            <Chip size="small" color={verification.color} icon={company.verification === 'verified' ? <CheckCircleIcon /> : undefined} label={verification.label} />
          ) : (
            <Chip size="small" variant="outlined" label="No company found yet" />
          )}
        </Box>

        {company ? (
          <>
            <Typography variant="h5" component="h2" sx={{ fontFamily: fonts.display, mb: 0.5 }}>{company.name}</Typography>
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.5 }}>
              {company.sources.includes('pitchin') && <Chip size="small" variant="outlined" label="PitchIn" />}
              {company.sources.includes('cmms') && <Chip size="small" variant="outlined" label="CMMS" />}
            </Box>

            {companies.length > 1 && (
              <TextField
                select
                size="small"
                label="Company"
                value={company.key}
                onChange={(e) => setCompanyForRole(role, e.target.value)}
                sx={{ mb: 1.5, minWidth: 240 }}
              >
                {companies.map((c) => <MenuItem key={c.key} value={c.key}>{c.name}</MenuItem>)}
              </TextField>
            )}

            <Box sx={{ mb: 2 }}>
              <Detail label="Type">{company.type}</Detail>
              <Detail label="Registration">{company.registration}</Detail>
              <Detail label="Location">{company.location}</Detail>
              <Detail label="CMMS company">{company.cmmsName}</Detail>
              <Detail label="Role here">{roleInfo.label}</Detail>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              {company.sources.includes('pitchin') ? (
                <Button component="a" href={PITCHIN_URL} target="_blank" rel="noopener noreferrer" variant="outlined" endIcon={<OpenInNewIcon />}>
                  Manage in PitchIn
                </Button>
              ) : (
                <Button component="a" href={PITCHIN_URL} target="_blank" rel="noopener noreferrer" variant="contained" endIcon={<OpenInNewIcon />}>
                  Add to PitchIn
                </Button>
              )}
              <Button component="a" href={CMMS_URL} target="_blank" rel="noopener noreferrer" variant="outlined" endIcon={<OpenInNewIcon />}>
                {company.sources.includes('cmms') ? 'Open CMMS' : 'Set up CMMS'}
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Typography variant="h5" component="h2" sx={{ fontFamily: fonts.display, mb: 0.5 }}>
              {application?.organisation || `Your ${roleInfo.label.toLowerCase()} business`}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              We read your company from the same account in PitchIn and CMMS. Once you create it there, it shows up here
              on its own — nothing to copy across.
              {application?.pitchin_ref ? ` You gave the reference ${application.pitchin_ref}.` : ''}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button component="a" href={PITCHIN_URL} target="_blank" rel="noopener noreferrer" variant="contained" endIcon={<OpenInNewIcon />}>
                Create in PitchIn
              </Button>
              <Button component="a" href={CMMS_URL} target="_blank" rel="noopener noreferrer" variant="outlined" endIcon={<OpenInNewIcon />}>
                Set up CMMS
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default BusinessProfileCard;
