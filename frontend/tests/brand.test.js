import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PRODUCT_OWNER, PRODUCT_OWNER_URL } from '../src/constants/brand.js';

// The "A product of GODMINDERA ORGANISATION (U) LTD" credit links to the owner's site on IcanEra: icanera.space/<business-name>.

test('the owner is named and linked in the IcanEra business-site format', () => {
  assert.equal(PRODUCT_OWNER, 'GODMINDERA ORGANISATION (U) LTD');
  assert.equal(PRODUCT_OWNER_URL, 'https://icanera.space/godmindera-organisation-u-ltd');
});

test('the footer shows the credit as a link, not as plain text', () => {
  const footer = readFileSync(new URL('../src/components/layout/Footer.jsx', import.meta.url), 'utf8');
  assert.match(footer, /href=\{PRODUCT_OWNER_URL\}[^>]*>\{PRODUCT_OWNER\}<\/Link>/);
  assert.ok(!/A product of GODMINDERA/.test(footer), 'a plain-text credit is left in the footer');
});
