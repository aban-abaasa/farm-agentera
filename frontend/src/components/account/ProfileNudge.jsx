import { useState } from 'react';
import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { fonts } from '../../theme';

/**
 * Sign-up only asks for a name, so phone and location are asked here, on the
 * customer page, once and only if they are missing. It never blocks anything.
 */
const ProfileNudge = () => {
  const { user, updateProfile } = useAuth();
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [state, setState] = useState('idle'); // idle | saving | error
  const [hidden, setHidden] = useState(false);

  const hasPhone = Boolean(user?.phone_number || user?.phone);
  const hasLocation = Boolean(user?.location || user?.address);
  if (hidden || !user || (hasPhone && hasLocation)) return null;

  const save = async (event) => {
    event.preventDefault();
    const updates = {};
    if (!hasPhone && phone.trim()) updates.phone_number = phone.trim();
    if (!hasLocation && location.trim()) updates.location = location.trim();
    if (!Object.keys(updates).length) {
      setHidden(true);
      return;
    }
    setState('saving');
    try {
      await updateProfile({ ...updates, updated_at: new Date().toISOString() });
      setState('idle');
    } catch (err) {
      console.error('[ProfileNudge] could not save:', err);
      setState('error');
    }
  };

  return (
    <Box sx={{ border: '1px dashed', borderColor: 'warning.main', bgcolor: 'background.paper', p: { xs: 2, md: 2.5 } }}>
      <Typography className="kicker" sx={{ color: 'warning.main', mb: 0.5 }}>Optional</Typography>
      <Typography sx={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '1.1rem', mb: 0.5 }}>
        Help sellers and deliveries reach you
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Add a phone number and where you are. You can skip this and do it any time.
      </Typography>
      <Box component="form" onSubmit={save} noValidate sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {!hasPhone && (
          <TextField size="small" label="Phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} sx={{ flex: '1 1 180px' }} />
        )}
        {!hasLocation && (
          <TextField size="small" label="Town or district" autoComplete="address-level2" value={location} onChange={(e) => setLocation(e.target.value)} sx={{ flex: '1 1 180px' }} />
        )}
        <Button type="submit" variant="contained" disabled={state === 'saving'} startIcon={state === 'saving' ? <CircularProgress size={16} color="inherit" /> : null}>
          Save
        </Button>
        <Button color="inherit" onClick={() => setHidden(true)}>Not now</Button>
      </Box>
      {state === 'error' && <Alert severity="error" sx={{ mt: 2 }}>We could not save that just now. Please try again.</Alert>}
    </Box>
  );
};

export default ProfileNudge;
