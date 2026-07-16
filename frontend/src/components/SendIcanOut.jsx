/**
 * 📤 Send ICAN Out Component
 * Sell ICAN and disburse UGX directly to mobile money or a bank account via
 * Flutterwave, instead of an offline cashier payout.
 */

import React, { useState } from 'react';
import {
  Box, TextField, Button, Alert, CircularProgress, Typography,
  ToggleButtonGroup, ToggleButton, Divider,
} from '@mui/material';
import { requestIcanPayout, ICAN_TO_UGX, formatICAN } from '../services/icanWalletService';

export default function SendIcanOut({ userId, balance = 0, onSuccess }) {
  const [icanAmount, setIcanAmount] = useState('');
  const [channel, setChannel] = useState('mobilemoneyuganda');
  const [network, setNetwork] = useState('MTN');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const amount = parseFloat(icanAmount) || 0;
  const ugxGross = amount * ICAN_TO_UGX;
  const feePercent = 3; // flat 3% cash-out fee, same as any ICAN sell — applied server-side in sell_ican_coins()
  const ugxNet = ugxGross - Math.round((ugxGross * feePercent) / 100);

  const canSubmit =
    amount > 0 &&
    amount <= balance &&
    (channel === 'mobilemoneyuganda' ? !!phoneNumber : !!accountNumber && !!bankCode && !!beneficiaryName);

  const handleSendOut = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setProcessing(true);
    setError('');
    setResult(null);
    try {
      const data = await requestIcanPayout({
        icanAmount: amount,
        channel,
        phoneNumber: channel === 'mobilemoneyuganda' ? phoneNumber : undefined,
        network: channel === 'mobilemoneyuganda' ? network : undefined,
        accountNumber: channel === 'bank' ? accountNumber : undefined,
        bankCode: channel === 'bank' ? bankCode : undefined,
        beneficiaryName: channel === 'bank' ? beneficiaryName : undefined,
      });
      setResult(data);
      setIcanAmount('');
      if (onSuccess) onSuccess(data);
    } catch (err) {
      setError(err.message || 'Payout failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSendOut} sx={{ p: 2 }}>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Sell ICAN and receive UGX directly to mobile money or your bank account.
      </Typography>

      <TextField
        fullWidth
        label="ICAN to Send Out"
        type="number"
        value={icanAmount}
        onChange={(e) => { setIcanAmount(e.target.value); setError(''); setResult(null); }}
        placeholder="Enter amount"
        disabled={processing || balance === 0}
        inputProps={{ max: balance, step: '0.0001' }}
        helperText={`Balance: ${formatICAN(balance)} ICAN`}
        sx={{ mb: 2 }}
      />

      <ToggleButtonGroup
        fullWidth
        exclusive
        value={channel}
        onChange={(_, v) => v && setChannel(v)}
        disabled={processing}
        sx={{ mb: 2 }}
      >
        <ToggleButton value="mobilemoneyuganda">Mobile Money</ToggleButton>
        <ToggleButton value="bank">Bank Account</ToggleButton>
      </ToggleButtonGroup>

      {channel === 'mobilemoneyuganda' ? (
        <>
          <ToggleButtonGroup
            fullWidth
            exclusive
            value={network}
            onChange={(_, v) => v && setNetwork(v)}
            disabled={processing}
            sx={{ mb: 2 }}
          >
            <ToggleButton value="MTN">MTN</ToggleButton>
            <ToggleButton value="AIRTEL">Airtel</ToggleButton>
          </ToggleButtonGroup>
          <TextField
            fullWidth
            label="Mobile Money Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="e.g. 0770123456"
            disabled={processing}
            sx={{ mb: 2 }}
          />
        </>
      ) : (
        <>
          <TextField
            fullWidth
            label="Bank Code"
            value={bankCode}
            onChange={(e) => setBankCode(e.target.value)}
            disabled={processing}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Account Number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            disabled={processing}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Account Holder Name"
            value={beneficiaryName}
            onChange={(e) => setBeneficiaryName(e.target.value)}
            disabled={processing}
            sx={{ mb: 2 }}
          />
        </>
      )}

      {amount > 0 && (
        <Box sx={{ p: 2, mb: 2, background: '#f5f5f5', borderRadius: 2 }}>
          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption" color="text.secondary">Gross</Typography>
            <Typography variant="caption">UGX {ugxGross.toLocaleString()}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption" color="text.secondary">Fee ({feePercent}%)</Typography>
            <Typography variant="caption" color="error.main">-UGX {(ugxGross - ugxNet).toLocaleString()}</Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" fontWeight={700}>You Receive</Typography>
            <Typography variant="body2" fontWeight={700} color="primary">UGX {ugxNet.toLocaleString()}</Typography>
          </Box>
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {result && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {result.message} You'll receive UGX {Number(result.ugx_net).toLocaleString()}.
        </Alert>
      )}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="error"
        disabled={!canSubmit || processing}
      >
        {processing ? (
          <><CircularProgress size={20} sx={{ mr: 1 }} /> Sending…</>
        ) : (
          'Send Out via Flutterwave'
        )}
      </Button>
    </Box>
  );
}
