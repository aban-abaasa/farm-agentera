import { supabase } from '../../lib/supabase/client';

/**
 * Produce offers: what a farmer has, at what price. Suppliers on Digital City
 * Era read the same table (backend/db/schemas/farm/12_produce_offers.sql).
 * Every call returns { data, error } like marketplaceService.
 */

const OFFER_COLUMNS = [
  'id', 'farmer_id', 'farmer_name', 'contact_phone', 'crop', 'quantity', 'unit', 'price_per_unit',
  'region', 'sub_region', 'district', 'ready_date', 'is_organic', 'notes', 'status', 'expires_at',
  'created_at', 'updated_at',
].join(', ');

const DAY = 24 * 60 * 60 * 1000;

/** True when the SQL file has not been run in this Supabase project yet. */
export const isMissingTable = (error) =>
  error?.code === '42P01' || error?.code === 'PGRST205' || /schema cache|does not exist/i.test(error?.message || '');

const run = async (label, work) => {
  try {
    const { data, error } = await work();
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`[produceOffers] ${label}:`, error);
    return { data: null, error };
  }
};

/** Post a new offer. `value` comes from buildOffer() in utils/produceOffers. */
export const createOffer = (farmerId, value) =>
  run('create', () => supabase
    .from('farm_produce_offers')
    .insert({ ...value, farmer_id: farmerId, status: 'active' })
    .select(OFFER_COLUMNS)
    .single());

/** Save an edit. Saving reopens the offer (active, with a fresh closing time). */
export const updateOffer = (id, value) =>
  run('update', () => supabase
    .from('farm_produce_offers')
    .update({ ...value, status: 'active' })
    .eq('id', id)
    .select(OFFER_COLUMNS)
    .single());

/** active | paused | sold */
export const setOfferStatus = (id, status) =>
  run('status', () => supabase
    .from('farm_produce_offers')
    .update({ status })
    .eq('id', id)
    .select(OFFER_COLUMNS)
    .single());

/** Keep an offer in front of suppliers for another `days` days. */
export const renewOffer = (id, days) =>
  run('renew', () => supabase
    .from('farm_produce_offers')
    .update({ status: 'active', expires_at: new Date(Date.now() + days * DAY).toISOString() })
    .eq('id', id)
    .select(OFFER_COLUMNS)
    .single());

export const deleteOffer = (id) =>
  run('delete', () => supabase.from('farm_produce_offers').delete().eq('id', id));

/** All of a farmer's own offers, newest first (including paused, sold and closed). */
export const getMyOffers = (farmerId) =>
  run('mine', () => supabase
    .from('farm_produce_offers')
    .select(OFFER_COLUMNS)
    .eq('farmer_id', farmerId)
    .order('created_at', { ascending: false }));

/**
 * Everybody's live offers, for the price comparison only — so just the columns
 * that comparison needs (no names, no phone numbers).
 */
export const getMarketOffers = () =>
  run('market', () => supabase
    .from('farm_produce_offers')
    .select('id, farmer_id, crop, quantity, unit, price_per_unit, status, expires_at')
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .limit(1000));

/** Suppliers who showed interest in any of these offers, newest first. */
export const getInterestsForOffers = (offerIds) => {
  if (!offerIds?.length) return Promise.resolve({ data: [], error: null });
  return run('interests', () => supabase
    .from('farm_produce_interests')
    .select('id, offer_id, supplier_name, supplier_phone, message, created_at')
    .in('offer_id', offerIds)
    .order('created_at', { ascending: false }));
};
