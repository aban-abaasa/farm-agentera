/**
 * Produce offers: a farmer says what they have and at what price, and
 * suppliers on Digital City Era see it (table `farm_produce_offers`, see
 * backend/db/schemas/farm/12_produce_offers.sql).
 *
 * Everything here is plain functions with no React or Supabase in them, so the
 * rules can be tested on their own. The "market" figures are arithmetic on the
 * other live offers (median, range) — never a forecast — and the page says how
 * many offers they come from.
 */

import { regions } from '../content/regions.js';

// ── vocabulary ───────────────────────────────────────────────────────────────

/** Units the database accepts (see the CHECK on farm_produce_offers.unit). */
export const UNITS = [
  { value: 'kg', label: 'kg' },
  { value: 'ton', label: 'ton (1,000 kg)' },
  { value: 'bag', label: 'bag / sack' },
  { value: 'crate', label: 'crate' },
  { value: 'bunch', label: 'bunch' },
  { value: 'basket', label: 'basket' },
  { value: 'tray', label: 'tray' },
  { value: 'piece', label: 'piece' },
  { value: 'litre', label: 'litre' },
];

/** Common produce, with the unit it is usually sold in. Free text is still allowed. */
export const CROPS = [
  { name: 'Maize', unit: 'kg' },
  { name: 'Beans', unit: 'kg' },
  { name: 'Matooke', unit: 'bunch' },
  { name: 'Cassava', unit: 'kg' },
  { name: 'Sweet potatoes', unit: 'kg' },
  { name: 'Irish potatoes', unit: 'kg' },
  { name: 'Tomatoes', unit: 'kg' },
  { name: 'Onions', unit: 'kg' },
  { name: 'Cabbage', unit: 'piece' },
  { name: 'Carrots', unit: 'kg' },
  { name: 'Green pepper', unit: 'kg' },
  { name: 'Eggplant', unit: 'kg' },
  { name: 'Pumpkin', unit: 'piece' },
  { name: 'Spinach', unit: 'bunch' },
  { name: 'Sukuma wiki', unit: 'bunch' },
  { name: 'Pineapples', unit: 'piece' },
  { name: 'Passion fruit', unit: 'kg' },
  { name: 'Mangoes', unit: 'kg' },
  { name: 'Avocados', unit: 'kg' },
  { name: 'Oranges', unit: 'kg' },
  { name: 'Watermelon', unit: 'piece' },
  { name: 'Bananas (sweet)', unit: 'bunch' },
  { name: 'Groundnuts', unit: 'kg' },
  { name: 'Soya beans', unit: 'kg' },
  { name: 'Sorghum', unit: 'kg' },
  { name: 'Millet', unit: 'kg' },
  { name: 'Rice', unit: 'kg' },
  { name: 'Simsim', unit: 'kg' },
  { name: 'Eggs', unit: 'tray' },
  { name: 'Milk', unit: 'litre' },
];

/** How long an offer stays visible. Short by default so a price never goes stale. */
export const KEEP_OPEN_DAYS = [3, 7, 14, 30];
export const DEFAULT_KEEP_OPEN_DAYS = 7;

/** How many other offers it takes before we call a figure "typical". */
export const MIN_SAMPLE = 3;

// ── units and crop names ─────────────────────────────────────────────────────

// Prices are only comparable in the same unit. Tons are folded into kilograms so
// a farmer selling by the ton is compared with one selling by the kilo.
const BASE = {
  kg: { base: 'kg', factor: 1 },
  ton: { base: 'kg', factor: 1000 },
  bag: { base: 'bag', factor: 1 },
  crate: { base: 'crate', factor: 1 },
  bunch: { base: 'bunch', factor: 1 },
  basket: { base: 'basket', factor: 1 },
  tray: { base: 'tray', factor: 1 },
  piece: { base: 'piece', factor: 1 },
  litre: { base: 'litre', factor: 1 },
};

const singular = (word) => {
  if (word.length > 3 && word.endsWith('ies')) return `${word.slice(0, -3)}y`;
  if (word.length > 4 && word.endsWith('oes')) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
};

/** "Sweet Potatoes " and "sweet potato" are the same crop. */
export const cropKey = (name) => String(name ?? '')
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, ' ')
  .split(/\s+/)
  .filter(Boolean)
  .map(singular)
  .join(' ');

/** The offer's price and quantity in the unit prices are compared in, or null for an unknown unit. */
export const comparable = ({ quantity, unit, price_per_unit: price }) => {
  const b = BASE[unit];
  const q = Number(quantity);
  const p = Number(price);
  if (!b || !Number.isFinite(q) || !Number.isFinite(p)) return null;
  return { unit: b.base, quantity: q * b.factor, price: p / b.factor };
};

const NAMES = {
  kg: ['kg', 'kg'], ton: ['ton', 'tons'], bag: ['bag', 'bags'], crate: ['crate', 'crates'], bunch: ['bunch', 'bunches'],
  basket: ['basket', 'baskets'], tray: ['tray', 'trays'], piece: ['piece', 'pieces'], litre: ['litre', 'litres'],
};

/** "1 bunch", "40 bunches": the unit's name for a given quantity (singular when it is exactly 1). */
export const unitName = (unit, quantity = 1) => {
  const names = NAMES[unit];
  if (!names) return String(unit ?? '');
  return Number(quantity) === 1 ? names[0] : names[1];
};

/** A comparison-unit price shown in the unit the farmer chose (UGX 1,000/kg -> UGX 1,000,000/ton). */
export const fromBase = (price, unit) => price * (BASE[unit]?.factor ?? 1);

export const marketKey = (offer) => {
  const c = comparable(offer);
  const crop = cropKey(offer.crop);
  return c && crop ? `${crop}|${c.unit}` : null;
};

// ── market figures ───────────────────────────────────────────────────────────

export const median = (numbers) => {
  const sorted = numbers.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/** Is this offer still in front of suppliers? (The database enforces the same rule.) */
export const isLive = (offer, now = Date.now()) =>
  offer.status === 'active' && new Date(offer.expires_at).getTime() > now;

/**
 * Figures for one crop in one comparison unit across the other farmers' live
 * offers, or null when there are none. `excludeFarmerId` keeps a farmer's own
 * offers out of their own benchmark.
 */
export const benchmark = (offers, { crop, unit, excludeFarmerId = null, now = Date.now() }) => {
  const wanted = cropKey(crop);
  const baseUnit = BASE[unit]?.base;
  if (!wanted || !baseUnit) return null;

  const prices = [];
  let totalQuantity = 0;
  for (const offer of offers) {
    if (!isLive(offer, now)) continue;
    if (excludeFarmerId && offer.farmer_id === excludeFarmerId) continue;
    if (cropKey(offer.crop) !== wanted) continue;
    const c = comparable(offer);
    if (!c || c.unit !== baseUnit || !(c.price > 0)) continue;
    prices.push(c.price);
    totalQuantity += c.quantity;
  }
  if (!prices.length) return null;
  return {
    unit: baseUnit,
    count: prices.length,
    totalQuantity,
    min: Math.min(...prices),
    max: Math.max(...prices),
    median: median(prices),
  };
};

/**
 * Where a price sits against the median of the other offers.
 *   unknown — fewer than MIN_SAMPLE offers, or no usable price
 *   below / fair / above — more than `tolerance` under, within, or over the median
 */
export const verdict = (price, summary, tolerance = 0.1) => {
  if (!summary || summary.count < MIN_SAMPLE || !(price > 0) || !(summary.median > 0)) {
    return { level: 'unknown', diffPct: null };
  }
  // Classify on the whole percentage that is shown, so the label and the number
  // never disagree and floating point can't tip an exact 10% either way.
  const diffPct = Math.round((price / summary.median - 1) * 100);
  const limit = Math.round(tolerance * 100);
  if (diffPct <= -limit) return { level: 'below', diffPct };
  if (diffPct >= limit) return { level: 'above', diffPct };
  return { level: 'fair', diffPct };
};

// ── money, time, text ────────────────────────────────────────────────────────

export const formatUgx = (n) => `UGX ${Math.round(Number(n) || 0).toLocaleString('en-UG')}`;

export const offerTotal = (quantity, price) => {
  const q = Number(quantity);
  const p = Number(price);
  return Number.isFinite(q) && Number.isFinite(p) && q > 0 && p > 0 ? q * p : 0;
};

const DAY = 24 * 60 * 60 * 1000;

/** What the farmer should see for an offer's lifecycle. */
export const offerState = (offer, now = Date.now()) => {
  if (offer.status === 'sold') return { key: 'sold', label: 'Sold out', tone: 'default' };
  if (offer.status === 'paused') return { key: 'paused', label: 'Paused', tone: 'warning' };
  const left = new Date(offer.expires_at).getTime() - now;
  if (!(left > 0)) return { key: 'expired', label: 'Closed — ran out of time', tone: 'default' };
  if (left < DAY) return { key: 'live', label: 'Live — closes today', tone: 'warning' };
  const days = Math.ceil(left / DAY);
  return { key: 'live', label: `Live — ${days} more day${days === 1 ? '' : 's'}`, tone: 'success' };
};

export const subRegionsOf = (region) => regions[region] || [];

/** Region a sub-region belongs to ('' when unknown). */
export const regionOfSubRegion = (subRegion) =>
  Object.keys(regions).find((r) => regions[r].includes(subRegion)) || '';

// ── the form ─────────────────────────────────────────────────────────────────

export const emptyForm = (defaults = {}) => ({
  crop: '',
  quantity: '',
  unit: 'kg',
  price: '',
  region: '',
  subRegion: '',
  district: '',
  readyDate: '',
  keepOpenDays: DEFAULT_KEEP_OPEN_DAYS,
  isOrganic: false,
  notes: '',
  phone: '',
  ...defaults,
});

const tidy = (text) => String(text ?? '').replace(/\s+/g, ' ').trim();

/** Digits with an optional leading +, nothing else ("0772 123-456" -> "0772123456"). */
export const cleanPhone = (phone) => {
  const raw = String(phone ?? '').trim();
  const digits = raw.replace(/\D/g, '');
  return raw.startsWith('+') ? `+${digits}` : digits;
};

const isoDate = (d) => d.toISOString().slice(0, 10);

/**
 * Check the form and, when it is fine, build the row to save.
 * Returns { errors } or { value } — value has the database column names.
 */
export const buildOffer = (form, { farmerName, now = new Date() } = {}) => {
  const errors = {};

  const crop = tidy(form.crop);
  if (crop.length < 2) errors.crop = 'Say what you have, e.g. Maize.';
  else if (crop.length > 80) errors.crop = 'Keep the name under 80 letters.';

  const quantity = Number(form.quantity);
  if (!(quantity > 0)) errors.quantity = 'How much do you have?';
  else if (quantity > 1e9) errors.quantity = 'That is too large — check the number.';

  if (!UNITS.some((u) => u.value === form.unit)) errors.unit = 'Choose a unit.';

  const price = Number(form.price);
  if (!(price > 0)) errors.price = 'What price do you want for each unit?';
  else if (price > 1e9) errors.price = 'That is too large — check the number.';

  const region = form.region || regionOfSubRegion(form.subRegion);
  if (!form.subRegion) errors.subRegion = 'Where is it? Suppliers look for produce near them.';
  else if (!subRegionsOf(region).includes(form.subRegion)) errors.subRegion = 'Choose a sub-region from the list.';

  const phone = cleanPhone(form.phone);
  if (phone.replace(/\D/g, '').length < 9 || phone.replace(/\D/g, '').length > 15) {
    errors.phone = 'Suppliers need a phone number to reach you.';
  }

  const keepOpenDays = Number(form.keepOpenDays);
  if (!KEEP_OPEN_DAYS.includes(keepOpenDays)) errors.keepOpenDays = 'Choose how long to keep it open.';

  const notes = tidy(form.notes);
  if (notes.length > 500) errors.notes = 'Keep the note under 500 letters.';

  let readyDate = null;
  if (form.readyDate) {
    if (Number.isNaN(Date.parse(form.readyDate))) errors.readyDate = 'That date is not valid.';
    // A date already past just means "ready now".
    else readyDate = form.readyDate > isoDate(now) ? form.readyDate : null;
  }

  if (!tidy(farmerName)) errors.farmerName = 'Add your name to your profile first.';

  if (Object.keys(errors).length) return { errors };

  return {
    value: {
      farmer_name: tidy(farmerName).slice(0, 120),
      contact_phone: phone,
      crop,
      quantity,
      unit: form.unit,
      price_per_unit: price,
      region,
      sub_region: form.subRegion,
      district: tidy(form.district) || null,
      ready_date: readyDate,
      is_organic: Boolean(form.isOrganic),
      notes: notes || null,
      expires_at: new Date(now.getTime() + keepOpenDays * DAY).toISOString(),
    },
  };
};

/**
 * Put a saved offer back into the form (for editing). Saving an edit reopens the
 * offer for the chosen number of days, so a corrected price is never left to lapse.
 */
export const formFromOffer = (offer) => emptyForm({
  crop: offer.crop,
  quantity: String(offer.quantity),
  unit: offer.unit,
  price: String(offer.price_per_unit),
  region: offer.region || regionOfSubRegion(offer.sub_region),
  subRegion: offer.sub_region || '',
  district: offer.district || '',
  readyDate: offer.ready_date || '',
  isOrganic: Boolean(offer.is_organic),
  notes: offer.notes || '',
  phone: offer.contact_phone || '',
});

/**
 * The words under the price box. Compares the farmer's price (in the unit they
 * chose) with the other live offers for the same crop.
 */
export const priceAdvice = (offers, form, { excludeFarmerId = null, now = Date.now() } = {}) => {
  const crop = tidy(form.crop);
  if (crop.length < 2) return null;

  const summary = benchmark(offers, { crop, unit: form.unit, excludeFarmerId, now });
  if (!summary) {
    return { kind: 'first', text: `Nobody else has ${crop.toLowerCase()} on offer right now, so suppliers looking for it will find you first.` };
  }

  const inUnit = (p) => formatUgx(fromBase(p, form.unit));
  const per = form.unit;
  const range = summary.min === summary.max ? inUnit(summary.min) : `${inUnit(summary.min)} to ${inUnit(summary.max)}`;
  const offersWord = `${summary.count} other offer${summary.count === 1 ? '' : 's'}`;

  if (summary.count < MIN_SAMPLE) {
    return { kind: 'few', text: `${offersWord} for ${crop.toLowerCase()}: ${range} per ${per}. Too few to call that a typical price yet.` };
  }

  const typical = `Typical price among ${summary.count} other offers is ${inUnit(summary.median)} per ${per} (range ${range}).`;
  const price = Number(form.price);
  const v = verdict(comparable({ quantity: 1, unit: form.unit, price_per_unit: price })?.price, summary);
  if (v.level === 'unknown') return { kind: 'typical', text: typical };
  if (v.level === 'below') return { kind: 'below', text: `${typical} Yours is ${Math.abs(v.diffPct)}% lower — suppliers will notice, but you may be asking less than you could.` };
  if (v.level === 'above') return { kind: 'above', text: `${typical} Yours is ${v.diffPct}% higher — it may be passed over unless the quality is better.` };
  return { kind: 'fair', text: `${typical} Your price is in line with it.` };
};
