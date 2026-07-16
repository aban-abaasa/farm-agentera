import React, { useState } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert, Typography } from '@mui/material';
import { setInitialPin, validatePIN } from '../services/pinService';

/**
 * Shown once per session when the signed-in user has no transaction PIN
 * yet. Setting a PIN is self-service from any app; if they ever forget it,
 * recovery is ICAN-app-only (dev panel), which this modal does not handle.
 */
export default function SetPinPrompt({ open, userId, onDone }) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSetPin = async () => {
    setError('');
    if (!validatePIN(pin)) { setError('PIN must be 4-6 digits'); return; }
    if (pin !== confirmPin) { setError('PINs do not match'); return; }

    setProcessing(true);
    try {
      const result = await setInitialPin(userId, pin);
      if (!result.success) { setError(result.error); return; }
      onDone();
    } catch (e) {
      setError(e.message || 'Could not set PIN');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onClose={onDone} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle fontWeight={700} textAlign="center">🔐 Set Your Transaction PIN</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" textAlign="center" mb={2}>
          Protects your IcanEra Wallet across all apps. If you ever forget it, you'll need to visit the ICAN app to recover it.
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          fullWidth
          type="password"
          label="PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
          inputProps={{ inputMode: 'numeric', maxLength: 6 }}
          disabled={processing}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          type="password"
          label="Confirm PIN"
          value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
          inputProps={{ inputMode: 'numeric', maxLength: 6 }}
          disabled={processing}
        />
      </DialogContent>
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={onDone} variant="outlined">Later</Button>
        <Button onClick={handleSetPin} variant="contained" disabled={processing || !pin || !confirmPin}>
          {processing ? 'Saving…' : 'Set PIN'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
