/**
 * 💰 Sell ICAN Component - FARM-AGENT
 * Simplified version for selling ICAN coins
 */

import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Alert, CircularProgress,
  Typography, InputAdornment,
} from '@mui/material';
import { sellICAN, getBalance, icanToUGX, ICAN_TO_UGX } from '../services/icanWalletService';

export default function SellIcan({ userId, onSuccess }) {
  const [icanAmount, setIcanAmount] = useState('');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const ugxAmount = icanAmount ? icanToUGX(parseFloat(icanAmount)) : 0;

  useEffect(() => {
    const loadBalance = async () => {
      try {
        const bal = await getBalance(userId);
        setBalance(bal.ican);
      } catch (err) {
        setError('Failed to load balance');
        console.error('Load balance error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadBalance();
    }
  }, [userId]);

  const handleSell = async (e) => {
    e.preventDefault();

    if (!icanAmount || parseFloat(icanAmount) <= 0) {
      setError('Please enter a valid ICAN amount');
      return;
    }

    if (parseFloat(icanAmount) > balance) {
      setError(`Insufficient balance. You have ${balance.toFixed(4)} ICAN`);
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
          `✅ Successfully sold ${parseFloat(icanAmount).toFixed(4)} ICAN for UGX ${ugxAmount.toLocaleString()}!`
        );
        
        // Update local balance
        setBalance(balance - parseFloat(icanAmount));
        setIcanAmount('');
        
        if (onSuccess) onSuccess(result);
      } else {
        setError(result.error || 'Sale failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during sale');
      console.error('Sell ICAN error:', err);
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
      <Typography variant="body2" color="text.secondary" mb={2}>
        Convert ICAN back to local currency at the current rate
      </Typography>

      {balance > 0 && (
        <Box
          sx={{
            mb: 2,
            p: 2,
            background: '#eef9f5',
            borderRadius: 2,
            border: '1px solid #c7e9df',
          }}
        >
          <Typography variant="caption" color="success.dark" fontWeight={600}>
            Your ICAN Balance:{' '}
            <Typography component="span" variant="body1" fontWeight={700}>
              {balance.toFixed(4)}
            </Typography>
          </Typography>
        </Box>
      )}

      <TextField
        fullWidth
        label="ICAN Amount to Sell"
        type="number"
        value={icanAmount}
        onChange={(e) => {
          setIcanAmount(e.target.value);
          setError('');
          setSuccess('');
        }}
        placeholder="Enter ICAN amount"
        disabled={processing || balance === 0}
        inputProps={{
          max: balance,
          step: '0.0001',
        }}
        InputProps={{
          startAdornment: <InputAdornment position="start">💎</InputAdornment>,
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
              You Sell
            </Typography>
            <Typography variant="body1" fontWeight={700}>
              {parseFloat(icanAmount).toFixed(4)} ICAN
            </Typography>
          </Box>
          <Typography variant="h6">→</Typography>
          <Box>
            <Typography variant="caption" color="text.secondary">
              You Get
            </Typography>
            <Typography variant="body1" fontWeight={700} color="primary">
              UGX {ugxAmount.toLocaleString()}
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
        disabled={
          !icanAmount ||
          parseFloat(icanAmount) <= 0 ||
          parseFloat(icanAmount) > balance ||
          processing
        }
        sx={{ mb: 2 }}
      >
        {processing ? (
          <>
            <CircularProgress size={20} sx={{ mr: 1 }} /> Processing...
          </>
        ) : (
          '💰 Sell Now'
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
          ✓ Money processed and sent to your account
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          ✓ No hidden fees or charges
        </Typography>
      </Box>
    </Box>
  );
}
