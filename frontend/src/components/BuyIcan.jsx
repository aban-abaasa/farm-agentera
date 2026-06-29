/**
 * 💳 Buy ICAN Component - FARM-AGENT
 * Simplified version for buying ICAN coins
 */

import React, { useState } from 'react';
import {
  Box, TextField, Button, Alert, CircularProgress,
  Typography, InputAdornment,
} from '@mui/material';
import { buyICAN, ugxToICAN, ICAN_TO_UGX } from '../services/icanWalletService';

export default function BuyIcan({ userId, onSuccess }) {
  const [ugxAmount, setUgxAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const icanAmount = ugxAmount ? ugxToICAN(parseFloat(ugxAmount)) : 0;

  const handleBuy = async (e) => {
    e.preventDefault();
    
    if (!ugxAmount || parseFloat(ugxAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const minAmount = ICAN_TO_UGX; // Minimum 1 ICAN = 5,000 UGX
    if (parseFloat(ugxAmount) < minAmount) {
      setError(`Minimum purchase is UGX ${minAmount.toLocaleString()}`);
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
          `✅ Successfully purchased ${icanAmount.toFixed(4)} ICAN for UGX ${parseFloat(ugxAmount).toLocaleString()}!`
        );
        setUgxAmount('');
        if (onSuccess) onSuccess(result);
      } else {
        setError(result.error || 'Purchase failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during purchase');
      console.error('Buy ICAN error:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleBuy} sx={{ p: 2 }}>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Convert your local currency to ICAN at the current rate
      </Typography>

      <TextField
        fullWidth
        label="Amount in UGX"
        type="number"
        value={ugxAmount}
        onChange={(e) => {
          setUgxAmount(e.target.value);
          setError('');
          setSuccess('');
        }}
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
            p: 2,
            mb: 2,
            background: '#f5f5f5',
            borderRadius: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              You Pay
            </Typography>
            <Typography variant="body1" fontWeight={700}>
              UGX {parseFloat(ugxAmount).toLocaleString()}
            </Typography>
          </Box>
          <Typography variant="h6">→</Typography>
          <Box>
            <Typography variant="caption" color="text.secondary">
              You Get
            </Typography>
            <Typography variant="body1" fontWeight={700} color="primary">
              {icanAmount.toFixed(4)} ICAN
            </Typography>
          </Box>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={!ugxAmount || parseFloat(ugxAmount) <= 0 || processing}
        sx={{ mb: 2 }}
      >
        {processing ? (
          <>
            <CircularProgress size={20} sx={{ mr: 1 }} /> Processing...
          </>
        ) : (
          '💳 Buy Now'
        )}
      </Button>

      <Box
        sx={{
          p: 2,
          background: '#f8f9fa',
          borderRadius: 2,
          borderLeft: '3px solid',
          borderColor: 'primary.main',
        }}
      >
        <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={1}>
          ℹ️ HOW IT WORKS
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
          ✓ Current rate: 1 ICAN = {ICAN_TO_UGX.toLocaleString()} UGX
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
          ✓ ICAN coins arrive in your wallet instantly
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          ✓ Ready to use across all Icanera apps
        </Typography>
      </Box>
    </Box>
  );
}
