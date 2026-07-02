import React, { useState } from 'react';
import {
  Box, TextField, Button, Alert, CircularProgress,
  Typography, InputAdornment, Skeleton,
} from '@mui/material';
import { buyICAN } from '../services/icanWalletService';
import { useLiveIcaneracoinPrice } from '../hooks/useIcanPrice';

export default function BuyIcan({ userId, onSuccess }) {
  const [ugxAmount, setUgxAmount]   = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  const { priceUgx, priceUsd, appreciationPct, loading: priceLoading } =
    useLiveIcaneracoinPrice();

  // Live conversion: how many icaneracoins does ugxAmount buy?
  const icanAmount =
    ugxAmount && priceUgx > 0
      ? Math.floor((parseFloat(ugxAmount) / priceUgx) * 1e8) / 1e8
      : 0;

  const handleBuy = async (e) => {
    e.preventDefault();

    if (!ugxAmount || parseFloat(ugxAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(ugxAmount) < priceUgx) {
      setError(`Minimum purchase is UGX ${priceUgx.toLocaleString()} (1 icaneracoin)`);
      return;
    }

    try {
      setProcessing(true);
      setError('');
      setSuccess('');

      const result = await buyICAN({
        userId,
        icanAmount,
        paymentRef: `FARM-BUY-${Date.now()}`,
      });

      if (result.success) {
        setSuccess(
          `Successfully purchased ${icanAmount.toFixed(4)} icaneracoins for UGX ${parseFloat(ugxAmount).toLocaleString()}!`
        );
        setUgxAmount('');
        if (onSuccess) onSuccess(result);
      } else {
        setError(result.error || 'Purchase failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during purchase');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleBuy} sx={{ p: 2 }}>

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
        Convert your local currency to icaneracoins at the live rate
      </Typography>

      <TextField
        fullWidth
        label="Amount in UGX"
        type="number"
        value={ugxAmount}
        onChange={(e) => { setUgxAmount(e.target.value); setError(''); setSuccess(''); }}
        placeholder="Enter amount"
        disabled={processing}
        InputProps={{
          startAdornment: <InputAdornment position="start">Sh</InputAdornment>,
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
            <Typography variant="caption" color="text.secondary">You Pay</Typography>
            <Typography variant="body1" fontWeight={700}>
              UGX {parseFloat(ugxAmount).toLocaleString()}
            </Typography>
          </Box>
          <Typography variant="h6">→</Typography>
          <Box>
            <Typography variant="caption" color="text.secondary">You Get</Typography>
            <Typography variant="body1" fontWeight={700} color="primary">
              {icanAmount.toFixed(4)} icaneracoins
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
        disabled={!ugxAmount || parseFloat(ugxAmount) <= 0 || processing || priceLoading}
        sx={{ mb: 2 }}
      >
        {processing ? (
          <><CircularProgress size={20} sx={{ mr: 1 }} /> Processing...</>
        ) : (
          'Buy icaneracoins'
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
          icaneracoins arrive in your wallet instantly
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
          Stable in USD — protected from local currency inflation
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Ready to use across all Icanera apps
        </Typography>
      </Box>
    </Box>
  );
}
