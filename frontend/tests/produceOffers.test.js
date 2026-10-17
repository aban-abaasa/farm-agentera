import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cropKey, comparable, fromBase, marketKey, median, isLive, benchmark, verdict, MIN_SAMPLE,
  formatUgx, offerTotal, offerState, unitName, regionOfSubRegion, buildOffer, formFromOffer, emptyForm, priceAdvice, cleanPhone, UNITS, CROPS,
} from '../src/utils/produceOffers.js';

const NOW = new Date('2026-10-17T09:00:00Z');
const later = (days) => new Date(NOW.getTime() + days * 86400000).toISOString();
const offer = (o) => ({ id: Math.random().toString(36).slice(2), farmer_id: 'f1', status: 'active', expires_at: later(5), unit: 'kg', quantity: 100, price_per_unit: 1000, crop: 'Maize', ...o });

// ── names and units ─────────────────────────────────────────────────────────
test('cropKey: plurals, case and punctuation do not make a different crop', () => {
  assert.equal(cropKey('Tomatoes'), 'tomato');
  assert.equal(cropKey(' tomato '), 'tomato');
  assert.equal(cropKey('Sweet Potatoes'), 'sweet potato');
  assert.equal(cropKey('Passion fruit'), cropKey('passion fruits'));
  assert.equal(cropKey('Cherries'), 'cherry');
  assert.equal(cropKey('Beans'), 'bean');
  assert.equal(cropKey('Bananas (sweet)'), 'banana sweet');
  assert.equal(cropKey('Grass'), 'grass', 'a double s is not a plural');
  assert.equal(cropKey(null), '');
});

test('every suggested crop uses a unit the database accepts', () => {
  const allowed = new Set(UNITS.map((u) => u.value));
  for (const c of CROPS) assert.ok(allowed.has(c.unit), `${c.name} -> ${c.unit}`);
});

test('comparable folds tons into kilograms and leaves other units alone', () => {
  assert.deepEqual(comparable({ quantity: 2, unit: 'ton', price_per_unit: 1_200_000 }), { unit: 'kg', quantity: 2000, price: 1200 });
  assert.deepEqual(comparable({ quantity: 5, unit: 'bunch', price_per_unit: 15000 }), { unit: 'bunch', quantity: 5, price: 15000 });
  assert.equal(comparable({ quantity: 1, unit: 'sack', price_per_unit: 1 }), null, 'an unknown unit is not compared');
  assert.equal(comparable({ quantity: 'x', unit: 'kg', price_per_unit: 1 }), null);
  assert.equal(fromBase(1200, 'ton'), 1_200_000);
  assert.equal(fromBase(1200, 'kg'), 1200);
});

test('marketKey groups the same crop in the same comparison unit', () => {
  assert.equal(marketKey({ crop: 'Maize', unit: 'kg', quantity: 1, price_per_unit: 1 }), marketKey({ crop: 'maize', unit: 'ton', quantity: 1, price_per_unit: 1 }));
  assert.notEqual(marketKey({ crop: 'Maize', unit: 'kg', quantity: 1, price_per_unit: 1 }), marketKey({ crop: 'Maize', unit: 'bag', quantity: 1, price_per_unit: 1 }));
});

test('median', () => {
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([4, 1, 3, 2]), 2.5);
  assert.equal(median([]), null);
  assert.equal(median([NaN, 5]), 5);
});

// ── market figures ──────────────────────────────────────────────────────────
test('isLive: active and not past its closing time', () => {
  const now = NOW.getTime();
  assert.equal(isLive(offer({}), now), true);
  assert.equal(isLive(offer({ expires_at: later(-1) }), now), false);
  assert.equal(isLive(offer({ status: 'paused' }), now), false);
  assert.equal(isLive(offer({ status: 'sold' }), now), false);
});

test('benchmark uses live offers of the same crop and unit, and leaves out your own', () => {
  const now = NOW.getTime();
  const offers = [
    offer({ farmer_id: 'a', price_per_unit: 900 }),
    offer({ farmer_id: 'b', price_per_unit: 1000 }),
    offer({ farmer_id: 'c', price_per_unit: 1400, crop: 'maize' }),
    offer({ farmer_id: 'd', price_per_unit: 5, crop: 'Beans' }),
    offer({ farmer_id: 'e', price_per_unit: 1, expires_at: later(-2) }),
    offer({ farmer_id: 'me', price_per_unit: 100 }),
    offer({ farmer_id: 'f', price_per_unit: 2_000_000, unit: 'ton', quantity: 1 }),
  ];
  const s = benchmark(offers, { crop: 'Maize', unit: 'kg', excludeFarmerId: 'me', now });
  assert.equal(s.count, 4);
  assert.equal(s.min, 900);
  assert.equal(s.max, 2000, 'a ton price is brought down to a kilo price');
  assert.equal(s.median, 1200);
  assert.equal(s.totalQuantity, 100 + 100 + 100 + 1000);
  assert.equal(benchmark(offers, { crop: 'Maize', unit: 'ton', excludeFarmerId: 'me', now }).count, 4, 'asking in tons gives the same group');
  assert.equal(benchmark(offers, { crop: 'Maize', unit: 'bag', now }), null, 'bags are not kilos');
  assert.equal(benchmark(offers, { crop: 'Cassava', unit: 'kg', now }), null);
  assert.equal(benchmark(offers, { crop: '', unit: 'kg', now }), null);
});

test('verdict needs enough offers before it calls a price high or low', () => {
  const few = { count: MIN_SAMPLE - 1, median: 1000 };
  const enough = { count: MIN_SAMPLE, median: 1000 };
  assert.deepEqual(verdict(500, few), { level: 'unknown', diffPct: null });
  assert.deepEqual(verdict(500, null), { level: 'unknown', diffPct: null });
  assert.deepEqual(verdict(0, enough), { level: 'unknown', diffPct: null });
  assert.deepEqual(verdict(850, enough), { level: 'below', diffPct: -15 });
  assert.deepEqual(verdict(1500, enough), { level: 'above', diffPct: 50 });
  assert.equal(verdict(1050, enough).level, 'fair');
  assert.equal(verdict(900, enough).level, 'below', 'exactly 10% under counts as under');
  assert.equal(verdict(1100, enough).level, 'above');
});

test('unitName: singular only for exactly one', () => {
  assert.equal(unitName('bunch', 1), 'bunch');
  assert.equal(unitName('bunch', 40), 'bunches');
  assert.equal(unitName('bag', '30'), 'bags');
  assert.equal(unitName('kg', 500), 'kg');
  assert.equal(unitName('bag'), 'bag', 'no quantity means the plain name (as in "per bag")');
  assert.equal(unitName('sack', 2), 'sack', 'unknown units are shown as typed');
  for (const u of UNITS) assert.ok(unitName(u.value, 2), u.value);
});

// ── money and state ─────────────────────────────────────────────────────────
test('money and totals', () => {
  assert.equal(formatUgx(1234567.4), 'UGX 1,234,567');
  assert.equal(formatUgx('x'), 'UGX 0');
  assert.equal(offerTotal(50, 1200), 60000);
  assert.equal(offerTotal('', 1200), 0);
  assert.equal(offerTotal(-1, 5), 0);
});

test('offerState tells the farmer where an offer stands', () => {
  const now = NOW.getTime();
  assert.equal(offerState(offer({ status: 'sold' }), now).key, 'sold');
  assert.equal(offerState(offer({ status: 'paused' }), now).key, 'paused');
  assert.equal(offerState(offer({ expires_at: later(-0.1) }), now).key, 'expired');
  assert.match(offerState(offer({ expires_at: later(0.5) }), now).label, /closes today/);
  assert.match(offerState(offer({ expires_at: later(1.2) }), now).label, /2 more days/);
  assert.match(offerState(offer({ expires_at: later(1) }), now).label, /1 more day$/);
});

// ── the form ────────────────────────────────────────────────────────────────
const goodForm = (o = {}) => emptyForm({ crop: ' Maize ', quantity: '500', unit: 'kg', price: '1100', region: 'Central', subRegion: 'Buganda North', phone: '0772 123-456', ...o });

test('buildOffer turns a good form into a row with the database column names', () => {
  const { value, errors } = buildOffer(goodForm({ district: ' Luwero ', isOrganic: true, notes: ' dry  and sorted ', readyDate: '2026-10-25' }), { farmerName: 'Aisha Nakato', now: NOW });
  assert.equal(errors, undefined);
  assert.deepEqual(value, {
    farmer_name: 'Aisha Nakato',
    contact_phone: '0772123456',
    crop: 'Maize',
    quantity: 500,
    unit: 'kg',
    price_per_unit: 1100,
    region: 'Central',
    sub_region: 'Buganda North',
    district: 'Luwero',
    ready_date: '2026-10-25',
    is_organic: true,
    notes: 'dry and sorted',
    expires_at: later(7),
  });
});

test('buildOffer fills in the region from the sub-region, and treats a past date as ready now', () => {
  const { value } = buildOffer(goodForm({ region: '', readyDate: '2026-10-01', keepOpenDays: 14 }), { farmerName: 'A', now: NOW });
  assert.equal(value.region, 'Central');
  assert.equal(value.ready_date, null);
  assert.equal(value.expires_at, later(14));
  assert.equal(regionOfSubRegion('Acholi'), 'Northern');
  assert.equal(regionOfSubRegion('Atlantis'), '');
});

test('buildOffer says what is missing, in plain words', () => {
  const { errors } = buildOffer(emptyForm(), { farmerName: '', now: NOW });
  assert.deepEqual(Object.keys(errors).sort(), ['crop', 'farmerName', 'phone', 'price', 'quantity', 'subRegion']);
  assert.ok(buildOffer(goodForm({ quantity: '0' }), { farmerName: 'A' }).errors.quantity);
  assert.ok(buildOffer(goodForm({ price: '-3' }), { farmerName: 'A' }).errors.price);
  assert.ok(buildOffer(goodForm({ price: '5e12' }), { farmerName: 'A' }).errors.price);
  assert.ok(buildOffer(goodForm({ unit: 'sack' }), { farmerName: 'A' }).errors.unit);
  assert.ok(buildOffer(goodForm({ phone: '123' }), { farmerName: 'A' }).errors.phone);
  assert.ok(buildOffer(goodForm({ subRegion: 'Acholi', region: 'Central' }), { farmerName: 'A' }).errors.subRegion, 'sub-region must belong to the region');
  assert.ok(buildOffer(goodForm({ keepOpenDays: 90 }), { farmerName: 'A' }).errors.keepOpenDays);
  assert.ok(buildOffer(goodForm({ notes: 'x'.repeat(501) }), { farmerName: 'A' }).errors.notes);
  assert.ok(buildOffer(goodForm({ readyDate: 'soon' }), { farmerName: 'A' }).errors.readyDate);
});

test('cleanPhone keeps digits and a leading plus', () => {
  assert.equal(cleanPhone('+256 772 123 456'), '+256772123456');
  assert.equal(cleanPhone('(0772) 123-456'), '0772123456');
  assert.equal(cleanPhone(null), '');
});

test('formFromOffer round-trips through buildOffer', () => {
  const saved = { crop: 'Beans', quantity: 80, unit: 'bag', price_per_unit: 210000, region: 'Western', sub_region: 'Kigezi', district: 'Kabale', ready_date: null, is_organic: true, notes: 'Nambale', contact_phone: '0701000111' };
  const { value } = buildOffer(formFromOffer(saved), { farmerName: 'Joel', now: NOW });
  assert.equal(value.crop, 'Beans');
  assert.equal(value.quantity, 80);
  assert.equal(value.price_per_unit, 210000);
  assert.equal(value.sub_region, 'Kigezi');
  assert.equal(value.is_organic, true);
  assert.equal(value.contact_phone, '0701000111');
});

// ── advice under the price box ──────────────────────────────────────────────
test('priceAdvice: nothing until a crop is named', () => {
  assert.equal(priceAdvice([], emptyForm()), null);
  assert.equal(priceAdvice([], emptyForm({ crop: 'M' })), null);
});

test('priceAdvice: the first farmer to list a crop is told so', () => {
  const a = priceAdvice([], emptyForm({ crop: 'Cassava' }), { now: NOW.getTime() });
  assert.equal(a.kind, 'first');
  assert.match(a.text, /cassava/);
});

test('priceAdvice: too few offers to call a price typical', () => {
  const offers = [offer({ farmer_id: 'a', price_per_unit: 900 }), offer({ farmer_id: 'b', price_per_unit: 1100 })];
  const a = priceAdvice(offers, emptyForm({ crop: 'Maize', price: '1000' }), { now: NOW.getTime() });
  assert.equal(a.kind, 'few');
  assert.match(a.text, /2 other offers/);
  assert.match(a.text, /UGX 900 to UGX 1,100 per kg/);
});

test('priceAdvice: compares against the median once there are enough offers, in the unit the farmer chose', () => {
  const offers = [900, 1000, 1100, 1200].map((p, i) => offer({ farmer_id: `x${i}`, price_per_unit: p }));
  const now = NOW.getTime();
  const base = { crop: 'maize', unit: 'kg' };
  assert.equal(priceAdvice(offers, emptyForm({ ...base, price: '1050' }), { now }).kind, 'fair');
  const high = priceAdvice(offers, emptyForm({ ...base, price: '1600' }), { now });
  assert.equal(high.kind, 'above');
  assert.match(high.text, /1,050 per kg/);
  assert.match(high.text, /52% higher/);
  const low = priceAdvice(offers, emptyForm({ ...base, price: '800' }), { now });
  assert.equal(low.kind, 'below');
  assert.match(low.text, /24% lower/);
  assert.equal(priceAdvice(offers, emptyForm({ ...base, price: '' }), { now }).kind, 'typical');

  const tons = priceAdvice(offers, emptyForm({ crop: 'Maize', unit: 'ton', price: '1050000' }), { now });
  assert.equal(tons.kind, 'fair');
  assert.match(tons.text, /1,050,000 per ton/);
});

test("priceAdvice: a farmer's own offers do not move their own benchmark", () => {
  const offers = [offer({ farmer_id: 'me', price_per_unit: 1 }), ...[900, 1000, 1100].map((p, i) => offer({ farmer_id: `x${i}`, price_per_unit: p }))];
  const a = priceAdvice(offers, emptyForm({ crop: 'Maize', price: '1000' }), { excludeFarmerId: 'me', now: NOW.getTime() });
  assert.equal(a.kind, 'fair');
  assert.match(a.text, /3 other offers/);
});
