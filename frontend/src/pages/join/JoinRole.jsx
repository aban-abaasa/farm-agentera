import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, Navigate, useParams } from 'react-router-dom';
import {
  Alert, Box, Button, Checkbox, CircularProgress, Container, FormControl, FormControlLabel, FormGroup,
  FormHelperText, FormLabel, Grid, InputLabel, Link, MenuItem, Select, TextField, Typography,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useAuth } from '../../context/AuthContext';
import { Ornament } from '../../components/classic/Ornament';
import { pathwayIcons } from '../../components/classic/pathwayIcons';
import {
  CMMS_URL, PITCHIN_URL, getPathway, partnerModes, regions, supplierCategories, supplierStandards,
  supportCapabilities,
} from '../../content/agribone';
import { getMyApplications, submitApplication } from '../../services/api/pathwayService';
import { fonts } from '../../theme';

const emptyForm = {
  fullName: '', phone: '', organisation: '', pitchinRef: '', region: '', subRegion: '', district: '',
  capabilities: [], details: '', standards: [],
};

const capabilityOptions = {
  support: { label: 'What can you do?', options: supportCapabilities, required: true },
  supplier: { label: 'What do you supply?', options: supplierCategories, required: true },
  partner: { label: 'How would you like to support?', options: partnerModes, required: true },
};

const STATUS_COPY = {
  pending: { severity: 'info', text: 'Your application is with the AgriBone developer panel. We will update this page when it is reviewed.' },
  approved: { severity: 'success', text: 'Approved. Welcome aboard.' },
  rejected: { severity: 'warning', text: 'This application was not approved. You may amend and apply again.' },
};

const Panel = ({ title, children }) => (
  <Box sx={{ border: '1px solid', borderColor: 'text.primary', p: 0.75, bgcolor: 'background.paper' }}>
    <Box sx={{ border: '3px double', borderColor: 'text.primary', p: { xs: 2.5, md: 4 } }}>
      <Typography variant="h4" component="h2" sx={{ mb: 0.5 }}>{title}</Typography>
      <Ornament sx={{ mb: 3, maxWidth: 220 }} />
      {children}
    </Box>
  </Box>
);

const Step = ({ n, title, children }) => (
  <Box sx={{ display: 'flex', gap: 2.5, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
    <Typography sx={{ fontFamily: fonts.display, fontStyle: 'italic', fontWeight: 700, fontSize: '1.6rem', color: 'warning.main', minWidth: 34, lineHeight: 1.2 }}>
      {n}.
    </Typography>
    <Box>
      <Typography sx={{ fontFamily: fonts.display, fontWeight: 700, mb: 0.5 }}>{title}</Typography>
      <Typography variant="body2" color="text.secondary" component="div">{children}</Typography>
    </Box>
  </Box>
);

const DirectSteps = ({ pathway, user }) => {
  const external = (href, label) => (
    <Link href={href} target="_blank" rel="noopener noreferrer" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
      {label} <OpenInNewIcon sx={{ fontSize: 14 }} />
    </Link>
  );
  return (
    <Panel title={pathway.slug === 'farmer' ? 'Begin your farm' : 'Begin buying'}>
      {pathway.slug === 'customer' ? (
        <>
          <Step n="1" title="Create your account">
            {user ? 'You are signed in.' : <>It is free. <Link component={RouterLink} to="/register">Create an account</Link> or <Link component={RouterLink} to="/login">sign in</Link>.</>}
          </Step>
          <Step n="2" title="Open your ICAN wallet">
            Orders are paid from your wallet. <Link component={RouterLink} to="/ican-wallet">Open the wallet</Link>.
          </Step>
          <Step n="3" title="Order at the source">
            Browse produce from farmers, stores and suppliers, and add transport delivery to an order.
          </Step>
        </>
      ) : (
        <>
          <Step n="1" title="Establish your business">
            Create a business profile in {external(PITCHIN_URL, 'PitchIn')}, or register a company.
          </Step>
          <Step n="2" title="Get verified on the ground">
            An on-ground specialist in your sub-region visits and verifies you. <Link component={RouterLink} to="/support-team">Find a specialist</Link>.
            Need a manager or partner meanwhile? Connect with the available verified farm specialists.
          </Step>
          <Step n="3" title="Run the farm">
            Track livestock, farm inputs and customer orders in {external(CMMS_URL, 'CMMS')}, then list your outputs for sale.
          </Step>
        </>
      )}
      <Button component={RouterLink} to={pathway.start.to} variant="contained" size="large" sx={{ mt: 3 }}>
        {pathway.start.label}
      </Button>
    </Panel>
  );
};

const ApplicationForm = ({ pathway, user }) => {
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
  }));
  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState('idle'); // idle | sending | sent | error
  const [errors, setErrors] = useState({});

  const slug = pathway.slug;
  const caps = capabilityOptions[slug];
  const needsArea = slug === 'support';
  const needsStandards = slug === 'supplier';

  useEffect(() => {
    let cancelled = false;
    getMyApplications(user.id)
      .then((rows) => { if (!cancelled) setExisting(rows.find((r) => r.pathway === slug) || null); })
      .catch((err) => console.error('[JoinRole] could not load applications:', err))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user.id, slug]);

  const subRegions = useMemo(() => regions[form.region] || [], [form.region]);
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const toggle = (key, value) =>
    setForm((f) => ({ ...f, [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value] }));

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Please enter your name.';
    if (!form.phone.trim()) e.phone = 'A phone number lets us reach you.';
    if (needsArea && !form.region) e.region = 'Choose your region.';
    if (needsArea && !form.subRegion) e.subRegion = 'Choose your sub-region.';
    if (caps?.required && form.capabilities.length === 0) e.capabilities = 'Choose at least one.';
    if (needsStandards && form.standards.length < supplierStandards.length) e.standards = 'Please agree to every standard.';
    if (needsArea && !form.details.trim()) e.details = 'Tell us briefly about your experience.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (state === 'sending' || !validate()) return;
    setState('sending');
    try {
      const saved = await submitApplication(user.id, slug, form);
      setExisting(saved);
      setState('sent');
    } catch (err) {
      console.error('[JoinRole] application failed:', err);
      setState('error');
    }
  };

  if (loading) {
    return <Panel title="Application"><CircularProgress size={28} /></Panel>;
  }

  if (existing && existing.status !== 'rejected') {
    const copy = STATUS_COPY[existing.status];
    return (
      <Panel title="Your application">
        <Alert severity={copy.severity} sx={{ mb: 2 }}>{copy.text}</Alert>
        {existing.review_note && (
          <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 2 }}>Note from the panel: &ldquo;{existing.review_note}&rdquo;</Typography>
        )}
        <Typography variant="caption" color="text.secondary">
          Filed {new Date(existing.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          {existing.sub_region ? ` · ${existing.sub_region}` : ''}
        </Typography>
      </Panel>
    );
  }

  return (
    <Panel title="Application">
      {existing?.status === 'rejected' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {STATUS_COPY.rejected.text}
          {existing.review_note ? ` Panel note: “${existing.review_note}”` : ''}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Full name" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} error={!!errors.fullName} helperText={errors.fullName} fullWidth required />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} error={!!errors.phone} helperText={errors.phone} fullWidth required />
          </Grid>

          {(needsArea || slug === 'supplier') && (
            <>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth required={needsArea} error={!!errors.region}>
                  <InputLabel id="region-label">Region</InputLabel>
                  <Select labelId="region-label" label="Region" value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value, subRegion: '' }))}>
                    {Object.keys(regions).map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                  </Select>
                  {errors.region && <FormHelperText>{errors.region}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth required={needsArea} error={!!errors.subRegion} disabled={!form.region}>
                  <InputLabel id="subregion-label">Sub-region</InputLabel>
                  <Select labelId="subregion-label" label="Sub-region" value={form.subRegion} onChange={(e) => set('subRegion', e.target.value)}>
                    {subRegions.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                  </Select>
                  {errors.subRegion && <FormHelperText>{errors.subRegion}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField label="District" value={form.district} onChange={(e) => set('district', e.target.value)} fullWidth />
              </Grid>
            </>
          )}

          {slug !== 'support' && (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label={slug === 'partner' ? 'Organisation (optional)' : 'Business name'} value={form.organisation} onChange={(e) => set('organisation', e.target.value)} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="PitchIn profile or registration no." value={form.pitchinRef} onChange={(e) => set('pitchinRef', e.target.value)} fullWidth />
              </Grid>
            </>
          )}

          {caps && (
            <Grid size={{ xs: 12 }}>
              <FormControl component="fieldset" error={!!errors.capabilities} required>
                <FormLabel component="legend" sx={{ fontWeight: 600, mb: 0.5 }}>{caps.label}</FormLabel>
                <FormGroup sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr' } }}>
                  {caps.options.map((opt) => (
                    <FormControlLabel key={opt} label={opt} control={<Checkbox size="small" checked={form.capabilities.includes(opt)} onChange={() => toggle('capabilities', opt)} />} />
                  ))}
                </FormGroup>
                {errors.capabilities && <FormHelperText>{errors.capabilities}</FormHelperText>}
              </FormControl>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <TextField
              label={needsArea ? 'Your experience' : slug === 'partner' ? 'A short note' : 'Anything else we should know'}
              value={form.details}
              onChange={(e) => set('details', e.target.value)}
              error={!!errors.details}
              helperText={errors.details}
              multiline
              rows={3}
              fullWidth
              required={needsArea}
            />
          </Grid>

          {needsStandards && (
            <Grid size={{ xs: 12 }}>
              <FormControl component="fieldset" error={!!errors.standards}>
                <FormLabel component="legend" sx={{ fontWeight: 600, mb: 0.5 }}>Supplier standards</FormLabel>
                <FormGroup>
                  {supplierStandards.map((s) => (
                    <FormControlLabel key={s} label={s} control={<Checkbox size="small" checked={form.standards.includes(s)} onChange={() => toggle('standards', s)} />} />
                  ))}
                </FormGroup>
                {errors.standards && <FormHelperText>{errors.standards}</FormHelperText>}
              </FormControl>
            </Grid>
          )}
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button type="submit" variant="contained" size="large" disabled={state === 'sending'} startIcon={state === 'sending' ? <CircularProgress size={16} color="inherit" /> : null}>
            {state === 'sending' ? 'Submitting…' : 'Submit application'}
          </Button>
          <Typography variant="caption" color="text.secondary">Reviewed by the AgriBone developer panel.</Typography>
        </Box>
        {state === 'error' && (
          <Alert severity="error" sx={{ mt: 2 }}>We could not file your application just now. Please try again.</Alert>
        )}
      </Box>
    </Panel>
  );
};

/** /join/:role — one pathway in detail, with its entry steps or application. */
const JoinRole = () => {
  const { role } = useParams();
  const { user } = useAuth();
  const pathway = getPathway(role);
  if (!pathway) return <Navigate to="/join" replace />;

  const Icon = pathwayIcons[pathway.slug];

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 5, md: 8 } }}>
      <Link component={RouterLink} to="/join" className="kicker" sx={{ display: 'inline-block', mb: 4 }}>
        ← All pathways
      </Link>
      <Grid container spacing={{ xs: 5, md: 8 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography sx={{ fontFamily: fonts.display, fontStyle: 'italic', fontWeight: 600, fontSize: '3rem', color: 'warning.main', lineHeight: 1 }}>
              {pathway.numeral}.
            </Typography>
            <Box sx={{ width: 48, height: 48, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'primary.main', color: 'primary.contrastText', border: '2px solid', borderColor: 'warning.main' }}>
              <Icon />
            </Box>
          </Box>
          <Typography variant="h1" component="h1" sx={{ fontSize: { xs: '2.4rem', md: '3.2rem' }, mb: 1 }}>{pathway.title}</Typography>
          <Typography sx={{ fontFamily: fonts.accent, fontStyle: 'italic', fontSize: '1.6rem', color: 'secondary.main', mb: 3 }}>
            {pathway.tagline}
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 4 }}>{pathway.summary}</Typography>

          {[['You may', pathway.can], ['You will need', pathway.requires]].map(([heading, items]) => (
            <Box key={heading} sx={{ mb: 3 }}>
              <Typography className="kicker" sx={{ color: 'warning.main', mb: 1 }}>{heading}</Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, borderTop: '1px solid', borderColor: 'divider' }}>
                {items.map((item) => (
                  <Box component="li" key={item} sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', gap: 1.25, alignItems: 'baseline', fontSize: '0.92rem' }}>
                    <Box component="span" aria-hidden="true" sx={{ color: 'warning.main', fontSize: '0.7rem' }}>◆</Box>
                    {item}
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          {pathway.mode === 'direct' ? (
            <DirectSteps pathway={pathway} user={user} />
          ) : user ? (
            <ApplicationForm key={pathway.slug} pathway={pathway} user={user} />
          ) : (
            <Panel title="Application">
              <Typography sx={{ mb: 3 }} color="text.secondary">
                Sign in or create an account to apply. Your application is reviewed by the AgriBone developer panel.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button component={RouterLink} to="/login" variant="contained" size="large">Sign in</Button>
                <Button component={RouterLink} to="/register" variant="outlined" color="inherit" size="large">Create an account</Button>
              </Box>
            </Panel>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default JoinRole;
