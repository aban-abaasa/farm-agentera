import { useState } from 'react';
import { Alert, Box, Button, CircularProgress, Grid, MenuItem, TextField, Typography } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useRoles } from '../../context/RoleContext';
import { accountRoles, getPathway } from '../../content/agribone';
import { ApplicationForm } from '../join/JoinRole';
import { fonts } from '../../theme';

const farmingTypes = ['Crop Farming', 'Livestock Farming', 'Mixed Farming', 'Plantation', 'Aquaculture', 'Poultry', 'Other'];

const List = ({ heading, items }) => (
  <Box sx={{ mb: 2.5 }}>
    <Typography className="kicker" sx={{ color: 'warning.main', mb: 0.75 }}>{heading}</Typography>
    <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, borderTop: '1px solid', borderColor: 'divider' }}>
      {items.map((item) => (
        <Box component="li" key={item} sx={{ py: 0.9, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', gap: 1.25, alignItems: 'baseline', fontSize: '0.92rem' }}>
          <Box component="span" aria-hidden="true" sx={{ color: 'warning.main', fontSize: '0.7rem' }}>◆</Box>
          {item}
        </Box>
      ))}
    </Box>
  </Box>
);

/** Farmers need no approval: choose a farming type and the account is switched on. */
const BecomeFarmerForm = () => {
  const { updateProfile } = useAuth();
  const { setActiveRole } = useRoles();
  const [farmerType, setFarmerType] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [state, setState] = useState('idle'); // idle | saving | error
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    if (!farmerType) {
      setError('Choose what kind of farming you do.');
      return;
    }
    setError('');
    setState('saving');
    try {
      await updateProfile({
        role: 'farmer',
        farmer_type: farmerType,
        farm_size: farmSize ? parseFloat(farmSize) : null,
        updated_at: new Date().toISOString(),
      });
      setActiveRole('farmer'); // the Farmer tab now exists — take them to it
    } catch (err) {
      console.error('[BecomeFarmer] could not save:', err);
      setState('error');
    }
  };

  return (
    <Box component="form" onSubmit={submit} noValidate>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField select fullWidth required label="Farming type" value={farmerType} onChange={(e) => setFarmerType(e.target.value)} error={Boolean(error)} helperText={error}>
            {farmingTypes.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth type="number" label="Farm size (acres, optional)" value={farmSize} onChange={(e) => setFarmSize(e.target.value)} />
        </Grid>
      </Grid>
      <Button type="submit" variant="contained" size="large" disabled={state === 'saving'} startIcon={state === 'saving' ? <CircularProgress size={16} color="inherit" /> : null} sx={{ mt: 2.5 }}>
        {state === 'saving' ? 'Setting up…' : 'Become a farmer'}
      </Button>
      {state === 'error' && <Alert severity="error" sx={{ mt: 2 }}>We could not set that up just now. Please try again.</Alert>}
    </Box>
  );
};

/**
 * A "Become a …" tab. Farmers switch on straight away; suppliers and farm
 * specialists apply and are approved by the AgriBone developer panel.
 */
const BecomeTab = ({ role }) => {
  const { user } = useAuth();
  const { refresh } = useRoles();
  const pathway = getPathway(accountRoles[role].pathway);

  return (
    <Grid container spacing={{ xs: 3, md: 4 }}>
      <Grid size={{ xs: 12, md: 5 }}>
        <Typography variant="h4" component="h2" sx={{ fontFamily: fonts.display, mb: 0.5 }}>
          Become a {accountRoles[role].label.toLowerCase()}
        </Typography>
        <Typography sx={{ fontFamily: fonts.accent, fontStyle: 'italic', fontSize: '1.4rem', color: 'secondary.main', mb: 2 }}>
          {pathway.tagline}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>{pathway.summary}</Typography>
        <List heading="You may" items={pathway.can} />
        <List heading="You will need" items={pathway.requires} />
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <Box sx={{ border: '1px solid', borderColor: 'text.primary', p: 0.5, bgcolor: 'background.paper' }}>
          <Box sx={{ border: '3px double', borderColor: 'text.primary', p: { xs: 2.25, md: 3 } }}>
            {role === 'farmer' ? (
              <>
                <Typography variant="h5" component="h3" sx={{ fontFamily: fonts.display, mb: 0.5 }}>Start your farm</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                  No approval needed. Tell us what you farm and your Farmer tab opens straight away.
                </Typography>
                <BecomeFarmerForm />
              </>
            ) : (
              <ApplicationForm key={role} pathway={pathway} user={user} onSubmitted={refresh} />
            )}
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default BecomeTab;
