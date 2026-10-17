import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert, Autocomplete, Box, Button, Chip, CircularProgress, Collapse, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, FormControlLabel, Grid, Link, MenuItem, Snackbar, Switch, TextField, Typography,
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import { useAuth } from '../context/AuthContext';
import { fonts } from '../theme';
import { regions } from '../content/regions.js';
import {
  CROPS, UNITS, KEEP_OPEN_DAYS, emptyForm, buildOffer, formFromOffer, priceAdvice, offerState, offerTotal, formatUgx,
  subRegionsOf, cleanPhone, unitName,
} from '../utils/produceOffers';
import {
  createOffer, updateOffer, setOfferStatus, renewOffer, deleteOffer, getMyOffers, getMarketOffers, getInterestsForOffers,
  isMissingTable,
} from '../services/api/produceOfferService';

const farmerNameOf = (user) =>
  user?.full_name || [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.name || '';

const phoneOf = (user) => user?.phone_number || user?.phone || '';

const timeAgo = (iso) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

const ADVICE_SEVERITY = { first: 'info', few: 'info', typical: 'info', fair: 'success', below: 'info', above: 'warning' };

/** The app's double-rule frame, used for each block on the page. */
const Frame = ({ children, ...rest }) => (
  <Box sx={{ border: '1px solid', borderColor: 'text.primary', p: 0.5, bgcolor: 'background.paper' }} {...rest}>
    <Box sx={{ border: '3px double', borderColor: 'text.primary', p: { xs: 2, md: 3 } }}>{children}</Box>
  </Box>
);

const InterestList = ({ interests }) => (
  <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
    {interests.map((i) => (
      <Box key={i.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', borderTop: '1px solid', borderColor: 'divider', pt: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600 }}>{i.supplier_name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {timeAgo(i.created_at)}{i.message ? ` · “${i.message}”` : ''}
          </Typography>
        </Box>
        {i.supplier_phone && (
          <Button size="small" variant="outlined" startIcon={<PhoneIcon />} component="a" href={`tel:${cleanPhone(i.supplier_phone)}`}>
            {i.supplier_phone}
          </Button>
        )}
      </Box>
    ))}
  </Box>
);

const OfferCard = ({ offer, interests, busy, onEdit, onPause, onResume, onSold, onRenew, onDelete }) => {
  const [open, setOpen] = useState(false);
  const state = offerState(offer);
  const total = offerTotal(offer.quantity, offer.price_per_unit);
  const where = [offer.district, offer.sub_region].filter(Boolean).join(', ');
  const ready = offer.ready_date && offer.ready_date > new Date().toISOString().slice(0, 10)
    ? `Ready from ${new Date(offer.ready_date).toLocaleDateString('en-UG', { day: 'numeric', month: 'short' })}`
    : 'Ready now';

  return (
    <Frame>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="h6" component="h3" sx={{ fontFamily: fonts.display }}>
          {offer.crop}
          {offer.is_organic && <Chip size="small" color="success" variant="outlined" label="Organic" sx={{ ml: 1, verticalAlign: 'middle' }} />}
        </Typography>
        <Chip size="small" color={state.tone} variant={state.tone === 'default' ? 'outlined' : 'filled'} label={state.label} />
      </Box>

      <Typography sx={{ mt: 0.5 }}>
        {Number(offer.quantity).toLocaleString()} {unitName(offer.unit, offer.quantity)} at <b>{formatUgx(offer.price_per_unit)}</b> per {unitName(offer.unit)}
        {total > 0 && <Typography component="span" color="text.secondary"> · {formatUgx(total)} in all</Typography>}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {where ? `${where} · ` : ''}{ready}
      </Typography>
      {offer.notes && <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>{offer.notes}</Typography>}

      {interests.length > 0 && (
        <Box sx={{ mt: 1.5 }}>
          <Button size="small" color="success" variant="contained" disableElevation onClick={() => setOpen((v) => !v)} aria-expanded={open}>
            {interests.length} supplier{interests.length === 1 ? '' : 's'} interested {open ? '▴' : '▾'}
          </Button>
          <Collapse in={open} unmountOnExit><InterestList interests={interests} /></Collapse>
        </Box>
      )}

      <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button size="small" variant="outlined" disabled={busy} onClick={() => onEdit(offer)}>Change price or amount</Button>
        {state.key === 'live' && <Button size="small" variant="outlined" disabled={busy} onClick={() => onPause(offer)}>Pause</Button>}
        {state.key === 'paused' && <Button size="small" variant="outlined" disabled={busy} onClick={() => onResume(offer)}>Show again</Button>}
        {(state.key === 'live' || state.key === 'paused') && <Button size="small" variant="outlined" disabled={busy} onClick={() => onSold(offer)}>Mark as sold</Button>}
        {(state.key === 'expired' || state.key === 'live') && <Button size="small" variant="outlined" disabled={busy} onClick={() => onRenew(offer)}>Keep open 7 more days</Button>}
        <Button size="small" color="error" disabled={busy} onClick={() => onDelete(offer)}>Delete</Button>
      </Box>
    </Frame>
  );
};

/**
 * /produce-offers — "Tell suppliers what you have". A farmer says what they
 * have, how much, and the price they want; suppliers on Digital City Era see it
 * in the Farm Produce tab of their portal and can show interest.
 */
const ProduceOffers = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const farmerName = farmerNameOf(user);

  const [form, setForm] = useState(() => emptyForm({ phone: phoneOf(user) }));
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const [offers, setOffers] = useState([]);
  const [market, setMarket] = useState([]);
  const [interests, setInterests] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadProblem, setLoadProblem] = useState('');
  const [toast, setToast] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const unitTouched = useRef(false);
  const formRef = useRef(null);
  const phoneFilled = useRef(Boolean(phoneOf(user)));

  // The profile can arrive after the first render: fill the phone in once, never over what they typed.
  useEffect(() => {
    const phone = phoneOf(user);
    if (phone && !phoneFilled.current) {
      phoneFilled.current = true;
      setForm((f) => (f.phone ? f : { ...f, phone }));
    }
  }, [user]);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const [mine, all] = await Promise.all([getMyOffers(userId), getMarketOffers()]);
    if (mine.error) {
      setLoadProblem(isMissingTable(mine.error)
        ? 'Sharing produce with suppliers is being set up. Please check back soon.'
        : 'We could not load your offers. Check your connection and try again.');
      setOffers([]);
      setLoading(false);
      return;
    }
    setLoadProblem('');
    setOffers(mine.data);
    setMarket(all.data || []); // the price hint is a nicety: if it fails, the form still works
    const found = await getInterestsForOffers(mine.data.map((o) => o.id));
    const byOffer = {};
    (found.data || []).forEach((i) => { (byOffer[i.offer_id] ||= []).push(i); });
    setInterests(byOffer);
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const pickCrop = (name) => {
    const known = CROPS.find((c) => c.name.toLowerCase() === String(name || '').toLowerCase());
    if (known && !unitTouched.current) setForm((f) => ({ ...f, crop: known.name, unit: known.unit }));
  };

  const advice = useMemo(
    () => priceAdvice(market, form, { excludeFarmerId: userId }),
    [market, form, userId],
  );
  const total = offerTotal(form.quantity, form.price);

  const resetForm = (keep = {}) => {
    unitTouched.current = false;
    setErrors({});
    setEditingId(null);
    setForm((f) => emptyForm({
      region: f.region, subRegion: f.subRegion, district: f.district, phone: f.phone, keepOpenDays: f.keepOpenDays, ...keep,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const result = buildOffer(form, { farmerName });
    if (result.errors) {
      setErrors(result.errors);
      if (result.errors.farmerName) setToast(result.errors.farmerName);
      return;
    }
    setSaving(true);
    const { error } = editingId ? await updateOffer(editingId, result.value) : await createOffer(userId, result.value);
    setSaving(false);
    if (error) {
      setToast(isMissingTable(error)
        ? 'Sharing produce with suppliers is being set up. Please try again soon.'
        : 'We could not save that. Check your connection and try again.');
      return;
    }
    setToast(editingId ? 'Saved. Your offer is open again.' : 'Posted. Suppliers can see it now.');
    resetForm();
    load();
  };

  const startEdit = (offer) => {
    unitTouched.current = true;
    setErrors({});
    setEditingId(offer.id);
    setForm(formFromOffer(offer));
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const act = async (offer, work, done) => {
    setBusyId(offer.id);
    const { error } = await work();
    setBusyId(null);
    if (error) { setToast('That did not go through. Please try again.'); return; }
    setToast(done);
    if (editingId === offer.id) resetForm();
    load();
  };

  const onPause = (o) => act(o, () => setOfferStatus(o.id, 'paused'), 'Paused. Suppliers no longer see it.');
  const onResume = (o) => act(o, () => setOfferStatus(o.id, 'active'), 'Visible to suppliers again.');
  const onSold = (o) => act(o, () => setOfferStatus(o.id, 'sold'), 'Marked as sold.');
  const onRenew = (o) => act(o, () => renewOffer(o.id, 7), 'Open for 7 more days.');
  const doDelete = () => {
    const offer = confirmDelete;
    setConfirmDelete(null);
    if (offer) act(offer, () => deleteOffer(offer.id), 'Deleted.');
  };

  const subRegions = subRegionsOf(form.region);

  return (
    <Box>
      <Typography className="kicker" sx={{ color: 'warning.main' }}>Farmer</Typography>
      <Typography variant="h4" component="h1" sx={{ fontFamily: fonts.display, mb: 0.5 }}>Tell suppliers what you have</Typography>
      <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 680 }}>
        Say what you have, how much, and the price you want. Suppliers on Digital City Era see it straight away and can contact you.
        Offers close by themselves, so nobody is shown an old price.
      </Typography>

      {!farmerName && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Add your name to <Link component={RouterLink} to="/profile/edit">your profile</Link> so suppliers know who is offering.
        </Alert>
      )}

      {loadProblem && <Alert severity="info" sx={{ mb: 2 }}>{loadProblem}</Alert>}

      <Grid container spacing={{ xs: 2.5, md: 3 }}>
        <Grid size={{ xs: 12, lg: 5 }} ref={formRef}>
          <Frame component="form" onSubmit={submit} noValidate>
            <Typography className="kicker" sx={{ color: 'warning.main', mb: 1.5 }}>
              {editingId ? 'Change this offer' : 'What do you have?'}
            </Typography>

            <Grid container spacing={2}>
              <Grid size={12}>
                <Autocomplete
                  freeSolo
                  options={CROPS.map((c) => c.name)}
                  inputValue={form.crop}
                  onInputChange={(_, value, reason) => { if (reason !== 'reset') set('crop', value); }}
                  onChange={(_, value) => { if (typeof value === 'string') { set('crop', value); pickCrop(value); } }}
                  renderInput={(params) => (
                    <TextField {...params} label="Produce" placeholder="e.g. Maize" required error={!!errors.crop} helperText={errors.crop} />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="How much" type="number" required fullWidth value={form.quantity} onChange={(e) => set('quantity', e.target.value)}
                  error={!!errors.quantity} helperText={errors.quantity} slotProps={{ htmlInput: { min: 0, step: 'any', inputMode: 'decimal' } }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  select label="Unit" fullWidth value={form.unit} error={!!errors.unit} helperText={errors.unit}
                  onChange={(e) => { unitTouched.current = true; set('unit', e.target.value); }}
                >
                  {UNITS.map((u) => <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={12}>
                <TextField
                  label={`Your price for each ${unitName(form.unit)}`} type="number" required fullWidth value={form.price}
                  onChange={(e) => set('price', e.target.value)} error={!!errors.price} helperText={errors.price}
                  slotProps={{ htmlInput: { min: 0, step: 'any', inputMode: 'decimal' }, input: { startAdornment: <Typography component="span" color="text.secondary" sx={{ mr: 1 }}>UGX</Typography> } }}
                />
              </Grid>

              {(total > 0 || advice) && (
                <Grid size={12}>
                  <Box role="status" aria-live="polite" sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {total > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        {Number(form.quantity).toLocaleString()} {unitName(form.unit, form.quantity)} × {formatUgx(form.price)} = <b>{formatUgx(total)}</b>
                      </Typography>
                    )}
                    {advice && <Alert severity={ADVICE_SEVERITY[advice.kind]} icon={false} sx={{ py: 0 }}>{advice.text}</Alert>}
                  </Box>
                </Grid>
              )}

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select label="Region" fullWidth value={form.region}
                  onChange={(e) => { set('region', e.target.value); set('subRegion', ''); }}
                >
                  {Object.keys(regions).map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select label="Sub-region" required fullWidth value={form.subRegion} disabled={!form.region}
                  onChange={(e) => set('subRegion', e.target.value)} error={!!errors.subRegion}
                  helperText={errors.subRegion || (!form.region ? 'Choose a region first' : '')}
                >
                  {subRegions.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={12}>
                <TextField label="District or village (optional)" fullWidth value={form.district} onChange={(e) => set('district', e.target.value)} />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Ready from" type="date" fullWidth value={form.readyDate} onChange={(e) => set('readyDate', e.target.value)}
                  error={!!errors.readyDate} helperText={errors.readyDate || 'Leave empty if it is ready now'} slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select label="Keep this offer open for" fullWidth value={form.keepOpenDays}
                  onChange={(e) => set('keepOpenDays', Number(e.target.value))} error={!!errors.keepOpenDays} helperText={errors.keepOpenDays}
                >
                  {KEEP_OPEN_DAYS.map((d) => <MenuItem key={d} value={d}>{d} days</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Your phone" type="tel" required fullWidth value={form.phone} onChange={(e) => set('phone', e.target.value)}
                  error={!!errors.phone} helperText={errors.phone || 'Suppliers call or WhatsApp this number'}
                  slotProps={{ htmlInput: { inputMode: 'tel', autoComplete: 'tel' } }}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Anything else? (optional)" placeholder="Dry and sorted, can deliver to Kampala…" fullWidth multiline minRows={2}
                  value={form.notes} onChange={(e) => set('notes', e.target.value)} error={!!errors.notes} helperText={errors.notes}
                />
              </Grid>
              <Grid size={12}>
                <FormControlLabel control={<Switch checked={form.isOrganic} onChange={(e) => set('isOrganic', e.target.checked)} />} label="Grown organically" />
              </Grid>

              <Grid size={12} sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button type="submit" variant="contained" size="large" disabled={saving || !userId} startIcon={saving ? <CircularProgress size={18} color="inherit" /> : null}>
                  {editingId ? 'Save and reopen' : 'Show suppliers'}
                </Button>
                {editingId && <Button size="large" onClick={() => resetForm()} disabled={saving}>Cancel</Button>}
              </Grid>
              {farmerName && (
                <Grid size={12}>
                  <Typography variant="caption" color="text.secondary">Suppliers will see your name as “{farmerName}”, your area and your phone number.</Typography>
                </Grid>
              )}
            </Grid>
          </Frame>
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <Typography className="kicker" sx={{ color: 'warning.main', mb: 1.5 }}>Your offers</Typography>
          {loading ? (
            <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}><CircularProgress /></Box>
          ) : offers.length === 0 ? (
            <Frame>
              <Typography sx={{ fontFamily: fonts.display }} variant="h6">Nothing on offer yet</Typography>
              <Typography color="text.secondary">Fill in the form and suppliers will see what you have.</Typography>
            </Frame>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {offers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  interests={interests[offer.id] || []}
                  busy={busyId === offer.id}
                  onEdit={startEdit}
                  onPause={onPause}
                  onResume={onResume}
                  onSold={onSold}
                  onRenew={onRenew}
                  onDelete={setConfirmDelete}
                />
              ))}
            </Box>
          )}
        </Grid>
      </Grid>

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Delete this offer?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDelete ? `${confirmDelete.crop} — suppliers will no longer see it, and any interest they showed is removed.` : ''}
            {' '}To hide it for now and keep it, choose Pause instead.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Keep it</Button>
          <Button color="error" onClick={doDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!toast} autoHideDuration={5000} onClose={() => setToast('')} message={toast} />
    </Box>
  );
};

export default ProduceOffers;
