import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Alert, CircularProgress,
  Typography, InputAdornment, Skeleton,
} from '@mui/material';
import { sellICAN, getBalance } from '../services/icanWalletService';
import { useLiveIcaneracoinPrice } from '../hooks/useIcanPrice';

export default function SellIcan({ userId, onSuccess }) {
  const [icanAmount, setIcanAmount] = useState('');
  const [balance, setBalance]       = useState(0);
  const [loading, setLoading]       = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  const { priceUgx, priceUsd, appreciationPct, loading: priceLoading } =
    useLiveIcaneracoinPrice();

  const ugxAmount =
    icanAmount && priceUgx > 0
      ? parseFloat(icanAmount) * priceUgx
      : 0;

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      try {
        const bal = await getBalance(userId);
        setBalance(bal.ican);
      } catch (err) {
        setError('Failed to load balance');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const handleSell = async (e) => {
    e.preventDefault();

    if (!icanAmount || parseFloat(icanAmount) <= 0) {
      setError('Please enter a valid icaneracoin amount');
      return;
    }

    if (parseFloat(icanAmount) > balance) {
      setError(`Insufficient balance. You have ${balance.toFixed(4)} icaneracoins`);
      return;
    }

    try {
      setProcessing(true);
      setError('');
      setSuccess('');

      const result = await sellICAN({
        userId,
        icanAmount: parseFloat(icanAmount),
        reference: `FARM-SELL-${Date.now()}`,
      });

      if (result.success) {
        setSuccess(
          `Successfully sold ${parseFloat(icanAmount).toFixed(4)} icaneracoins for UGX ${Math.round(ugxAmount).toLocaleString()}!`
        );
        setBalance(balance - parseFloat(icanAmount));
        setIcanAmount('');
        if (onSuccess) onSuccess(result);
      } else {
        setError(result.error || 'Sale failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during sale');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSell} sx={{ p: 2 }}>

      {/* Live Price Banner */}
      <Box
        sx={{
          mb: 2, p: 1.5,
          background: 'linear-gradient(135deg,#6c47ff22,#6c47ff11)',
          border: '1px solid #6c47ff44',
          borderRadius: 2,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            icaneracoin live price
          </Typography>
          {priceLoading ? (
            <Skeleton width={100} height={24} />
          ) : (
            <Typography variant="body2" fontWeight={700} color="primary">
              UGX {priceUgx.toLocaleString()} · ${priceUsd.toFixed(4)} USD
            </Typography>
          )}
        </Box>
        {!priceLoading && appreciationPct > 0 && (
          <Typography variant="caption" color="success.main" fontWeight={700}>
            +{appreciationPct.toFixed(2)}% above floor
          </Typography>
        )}
      </Box>

      <Typography variant="body2" color="text.secondary" mb={2}>
        Convert icaneracoins back to local currency at the live rate
      </Typography>

      {balance > 0 && (
        <Box
          sx={{
            mb: 2, p: 2,
            background: '#eef9f5',
            borderRadius: 2,
            border: '1px solid #c7e9df',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}
        >
          <Box>
            <Typography variant="caption" color="success.dark" fontWeight={600} display="block">
              Your icaneracoin Balance
            </Typography>
            <Typography variant="body1" fontWeight={700}>
              {balance.toFixed(4)} ERA
            </Typography>
          </Box>
          {!priceLoading && (
            <Box textAlign="right">
              <Typography variant="caption" color="text.secondary" display="block">
                Estimated value
              </Typography>
              <Typography variant="body2" fontWeight={600} color="success.dark">
                UGX {Math.round(balance * priceUgx).toLocaleString()}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      <TextField
        fullWidth
        label="icaneracoins to Sell"
        type="number"
        value={icanAmount}
        onChange={(e) => { setIcanAmount(e.target.value); setError(''); setSuccess(''); }}
        placeholder="Enter amount"
        disabled={processing || balance === 0}
        inputProps={{ max: balance, step: '0.0001' }}
        InputProps={{
          startAdornment: <InputAdornment position="start">ERA</InputAdornment>,
        }}
        sx={{ mb: 2 }}
      />

      {icanAmount > 0 && (
        <Box
          sx={{
            p: 2, mb: 2,
            background: '#f5f5f5',
            borderRadius: 2,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">You Sell</Typography>
            <Typography variant="body1" fontWeight={700}>
              {parseFloat(icanAmount).toFixed(4)} icaneracoins
            </Typography>
          </Box>
          <Typography variant="h6">→</Typography>
          <Box>
            <Typography variant="caption" color="text.secondary">You Get</Typography>
            <Typography variant="body1" fontWeight={700} color="primary">
              UGX {Math.round(ugxAmount).toLocaleString()}
            </Typography>
          </Box>
        </Box>
      )}

      {error   && <Alert severity="error"   sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={
          !icanAmount ||
          parseFloat(icanAmount) <= 0 ||
          parseFloat(icanAmount) > balance ||
          processing ||
          priceLoading
        }
        sx={{ mb: 2 }}
      >
        {processing ? (
          <><CircularProgress size={20} sx={{ mr: 1 }} /> Processing...</>
        ) : (
          'Sell icaneracoins'
        )}
      </Button>

      <Box
        sx={{
          p: 2, background: '#f8f9fa', borderRadius: 2,
          borderLeft: '3px solid', borderColor: 'primary.main',
        }}
      >
        <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={1}>
          HOW IT WORKS
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
          Live rate: 1 icaneracoin = UGX {priceLoading ? '...' : priceUgx.toLocaleString()}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
          Payout processed and sent to your account
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          No hidden fees or charges
        </Typography>
      </Box>
    </Box>
  );
}
