import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, Tabs, Tab,
  Chip, Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, Paper, CircularProgress, Alert, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Tooltip, IconButton, Snackbar,
} from '@mui/material';
import BuyIcan from '../components/BuyIcan';
import SellIcan from '../components/SellIcan';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import { useTheme, alpha } from '@mui/material/styles';
import { supabase } from '../lib/supabase/client';
import {
  getOrCreateWallet, getBalance, getTransactions, sendICAN,
  formatICAN, ICAN_TO_UGX,
} from '../services/icanWalletService';

// ─── helpers ─────────────────────────────────────────────────────────────────

const TX_LABELS = {
  earn: 'Earned', cashback: 'Cashback', purchase: 'Purchase',
  transfer_in: 'Received', transfer_out: 'Sent',
  tithe: 'Tithe (10%)', sale: 'Sale', refund: 'Refund',
};

const APP_LABELS = {
  ican: 'ICAN Core', 'digital-city-era': 'Supermarket',
  'farm-agent': 'Backbone', mybodaguy: 'My Boda Guy',
};

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-UG', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BalanceCard({ balance, onSend, onReceive, onBuy, onSell, onRefresh, refreshing }) {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(balance.address ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card sx={{
      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, #0f2055 60%, #0a3d2b 100%)`,
      color: '#fff', borderRadius: 4, mb: 3, position: 'relative', overflow: 'hidden',
    }}>
      <Box sx={{
        position: 'absolute', top: -40, right: -40,
        width: 200, height: 200, borderRadius: '50%',
        background: alpha('#7c3aed', 0.2),
      }} />
      <CardContent sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={3}>
          <AccountBalanceWalletIcon sx={{ color: '#a78bfa' }} />
          <Typography fontWeight={700} fontSize={16}>Icaneracoin Wallet — Backbone</Typography>
        </Box>

        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', letterSpacing: 2, textTransform: 'uppercase' }}>
          ICAN Balance
        </Typography>
        <Typography variant="h3" fontWeight={800} mb={0.5}>
          {formatICAN(balance.ican)} ICAN
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
          ≈ UGX {Number(balance.ugx).toLocaleString()}
        </Typography>

        {balance.address && (
          <Box display="flex" alignItems="center" gap={1}
            sx={{ background: 'rgba(255,255,255,0.1)', borderRadius: 2, px: 2, py: 1, mb: 3 }}>
            <Typography variant="caption" fontFamily="monospace" sx={{ color: 'rgba(255,255,255,0.7)', flexGrow: 1 }}>
              {balance.address}
            </Typography>
            <Tooltip title={copied ? 'Copied!' : 'Copy address'}>
              <IconButton size="small" onClick={copyAddress} sx={{ color: 'rgba(255,255,255,0.6)' }}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Button fullWidth variant="contained" startIcon={<ArrowUpwardIcon />} onClick={onSend}
              sx={{ background: 'rgba(255,255,255,0.15)', '&:hover': { background: 'rgba(255,255,255,0.25)' }, borderRadius: 3 }}>
              Send
            </Button>
          </Grid>
          <Grid item xs={3}>
            <Button fullWidth variant="contained" startIcon={<ArrowDownwardIcon />} onClick={onReceive}
              sx={{ background: 'rgba(255,255,255,0.15)', '&:hover': { background: 'rgba(255,255,255,0.25)' }, borderRadius: 3 }}>
              Receive
            </Button>
          </Grid>
          <Grid item xs={3}>
            <Button fullWidth variant="contained" onClick={onBuy}
              sx={{ background: 'rgba(34,197,94,0.35)', '&:hover': { background: 'rgba(34,197,94,0.55)' }, borderRadius: 3 }}>
              💳 Buy
            </Button>
          </Grid>
          <Grid item xs={3}>
            <Button fullWidth variant="contained" onClick={onSell}
              sx={{ background: 'rgba(244,63,94,0.35)', '&:hover': { background: 'rgba(244,63,94,0.55)' }, borderRadius: 3 }}>
              💰 Sell
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

function SendDialog({ open, onClose, userId, onDone }) {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    setError('');
    if (!address || !amount) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const { data: rw, error: re } = await supabase
        .from('ican_user_wallets').select('user_id').eq('wallet_address', address.trim()).single();
      if (re || !rw) { setError('Wallet address not found'); return; }
      await sendICAN({ fromUserId: userId, toUserId: rw.user_id, amount: parseFloat(amount), note });
      onDone();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle fontWeight={700}>Send ICAN Coins</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField fullWidth label="Recipient Wallet Address" value={address}
          onChange={e => setAddress(e.target.value)} sx={{ mb: 2, mt: 1 }}
          placeholder="ICA-XXXXXXXXXXXXXXXX" />
        <TextField fullWidth label="Amount (ICAN)" type="number" value={amount}
          onChange={e => setAmount(e.target.value)} sx={{ mb: 2 }}
          helperText={amount ? `≈ UGX ${(parseFloat(amount || 0) * ICAN_TO_UGX).toLocaleString()}` : '1 ICAN = 5,000 UGX'} />
        <TextField fullWidth label="Note (optional)" value={note}
          onChange={e => setNote(e.target.value)} sx={{ mb: 1 }} />
        <Alert severity="info" sx={{ mt: 1 }}>10% tithe is automatically deducted from recipient earnings.</Alert>
      </DialogContent>
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button onClick={handleSend} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Send ICAN'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ReceiveDialog({ open, onClose, address }) {
  const [copied, setCopied] = useState(false);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle fontWeight={700}>Receive ICAN</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" mb={2} fontSize={14}>
          Share your wallet address to receive ICAN coins from any app in the Icanera ecosystem.
        </Typography>
        <Box sx={{ background: '#f5f5f5', borderRadius: 2, p: 2, fontFamily: 'monospace', fontSize: 13, wordBreak: 'break-all', mb: 2 }}>
          {address}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined">Close</Button>
        <Button variant="contained" startIcon={<ContentCopyIcon />}
          onClick={() => { navigator.clipboard.writeText(address); setCopied(true); }}>
          {copied ? 'Copied!' : 'Copy Address'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ICANWallet() {
  const theme = useTheme();
  const [userId, setUserId] = useState(null);
  const [balance, setBalance] = useState({ ican: 0, ugx: 0, address: null, totalEarned: 0, totalTithe: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [sendOpen, setSendOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [buyOpen, setBuyOpen] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [snack, setSnack] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });
  }, []);

  const loadData = useCallback(async () => {
    if (!userId) return;
    try {
      await getOrCreateWallet(userId);
      const [bal, txs] = await Promise.all([getBalance(userId), getTransactions(userId)]);
      setBalance(bal);
      setTransactions(txs);
    } catch (e) {
      setSnack('Error loading wallet: ' + e.message);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [userId, loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    setSnack('Wallet refreshed');
  };

  const tabFilters = [
    (tx) => true,
    (tx) => tx.direction === 'in',
    (tx) => tx.direction === 'out',
    (tx) => tx.transaction_type === 'tithe',
  ];
  const filteredTx = transactions.filter(tabFilters[tabValue]);

  if (!userId) return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="60vh">
      <Alert severity="info">Please sign in to access your ICAN Wallet.</Alert>
    </Box>
  );

  if (loading) return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="60vh">
      <CircularProgress />
    </Box>
  );

  return (
    <Box maxWidth={760} mx="auto" px={2} py={4}>

      {/* Page title */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <AgricultureIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
        <Box>
          <Typography variant="h5" fontWeight={800}>ICAN Wallet</Typography>
          <Typography variant="body2" color="text.secondary">Backbone — Icaneracoin powered earnings</Typography>
        </Box>
      </Box>

      {/* Balance card */}
      <BalanceCard
        balance={balance}
        onSend={() => setSendOpen(true)}
        onReceive={() => setReceiveOpen(true)}
        onBuy={() => setBuyOpen(true)}
        onSell={() => setSellOpen(true)}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {/* Stats */}
      <Grid container spacing={2} mb={3}>
        {[
          { label: 'Total Earned', value: `${formatICAN(balance.totalEarned)} ICAN` },
          { label: 'Tithe Paid', value: `${formatICAN(balance.totalTithe)} ICAN` },
          { label: '1 ICAN', value: `UGX ${ICAN_TO_UGX.toLocaleString()}` },
        ].map(s => (
          <Grid item xs={4} key={s.label}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" display="block">{s.label}</Typography>
              <Typography fontWeight={700} fontSize={13}>{s.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Earn-more section */}
      <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`, borderRadius: 3, mb: 3, background: alpha(theme.palette.success.light, 0.05) }}>
        <CardContent>
          <Typography fontWeight={700} gutterBottom>Earn ICAN on Backbone</Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            {[
              'Sell produce on the marketplace — earn ICAN equivalent to your UGX sale amount',
              'List land for lease — earn ICAN when a lease is confirmed',
              'Offer agricultural services — earn ICAN per completed job',
              '10% tithe is auto-deducted from all earnings',
            ].map(item => (
              <Box component="li" key={item} sx={{ mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">{item}</Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Typography fontWeight={700} mb={2}>Transaction History</Typography>
      <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2 }}>
        {['All', 'Received', 'Sent', 'Tithe'].map(label => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>

      {filteredTx.length === 0 ? (
        <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <Typography fontSize={40} mb={1}>🌱</Typography>
          <Typography color="text.secondary">No transactions yet. Start earning by selling produce or listing land.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>App</strong></TableCell>
                <TableCell><strong>Note</strong></TableCell>
                <TableCell align="right"><strong>Amount</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTx.map(tx => {
                const isIn = tx.direction === 'in';
                return (
                  <TableRow key={tx.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {isIn
                          ? <ArrowDownwardIcon fontSize="small" color="success" />
                          : <ArrowUpwardIcon fontSize="small" color="error" />}
                        <Typography fontSize={13} fontWeight={600}>
                          {TX_LABELS[tx.transaction_type] ?? tx.transaction_type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={APP_LABELS[tx.source_app] ?? tx.source_app} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography fontSize={12} color="text.secondary" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tx.note || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={700} fontSize={13}
                        color={isIn ? 'success.main' : tx.transaction_type === 'tithe' ? 'warning.main' : 'error.main'}>
                        {isIn ? '+' : '-'}{formatICAN(tx.ican_amount)} ICAN
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        UGX {(tx.ican_amount * ICAN_TO_UGX).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontSize={12} color="text.secondary">{formatDate(tx.created_at)}</Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialogs */}
      <SendDialog open={sendOpen} onClose={() => setSendOpen(false)} userId={userId} onDone={loadData} />
      {balance.address && <ReceiveDialog open={receiveOpen} onClose={() => setReceiveOpen(false)} address={balance.address} />}

      {/* Buy ICAN Dialog */}
      <Dialog open={buyOpen} onClose={() => setBuyOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle fontWeight={700}>💳 Buy ICAN Coins</DialogTitle>
        <DialogContent sx={{ p: 1 }}>
          <BuyIcan userId={userId} onSuccess={() => { loadData(); setBuyOpen(false); }} />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setBuyOpen(false)} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Sell ICAN Dialog */}
      <Dialog open={sellOpen} onClose={() => setSellOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle fontWeight={700}>💰 Sell ICAN Coins</DialogTitle>
        <DialogContent sx={{ p: 1 }}>
          <SellIcan userId={userId} onSuccess={() => { loadData(); setSellOpen(false); }} />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setSellOpen(false)} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} message={snack} />
    </Box>
  );
}
