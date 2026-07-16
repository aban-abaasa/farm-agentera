/**
 * ICAN Wallet Service — AgriBone
 * 1 ICAN = 5,000 UGX floor price.
 * All earnings auto-deduct 10% tithe via DB stored function.
 */

import { supabase } from '../lib/supabase/client';

export const ICAN_TO_UGX = 5000;
export const SOURCE_APP = 'farm-agent';

// ─── Wallet ─────────────────────────────────────────────────────────────────

export async function getOrCreateWallet(userId) {
  const { data, error } = await supabase.rpc('get_or_create_ican_wallet', {
    p_user_id: userId,
  });
  if (error) throw error;
  return data;
}

export async function getWallet(userId) {
  const { data, error } = await supabase
    .from('ican_user_wallets')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getBalance(userId) {
  const wallet = await getWallet(userId);
  return {
    ican: wallet?.ican_balance ?? 0,
    ugx: (wallet?.ican_balance ?? 0) * ICAN_TO_UGX,
    address: wallet?.wallet_address ?? null,
    totalEarned: wallet?.total_earned ?? 0,
    totalTithe: wallet?.total_tithe_paid ?? 0,
  };
}

// ─── Transactions ────────────────────────────────────────────────────────────

export async function getTransactions(userId, limit = 50) {
  const { data, error } = await supabase
    .from('ican_coin_transactions')
    .select('*')
    .or(`sender_user_id.eq.${userId},recipient_user_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(tx => ({
    ...tx,
    direction: tx.recipient_user_id === userId ? 'in' : 'out',
  }));
}

// ─── Earnings ────────────────────────────────────────────────────────────────

/**
 * Farmer earns ICAN when produce is sold on the marketplace.
 * DB function auto-deducts 10% tithe and credits net to wallet.
 */
/**
 * All three listing types go through farm_credit_listing_sale.
 * The DB function enforces the 5,000 UGX floor and 10% tithe.
 */
export async function earnFromProduceSale({ userId, ugxSaleAmount, saleId, produceTitle }) {
  const { data, error } = await supabase.rpc('farm_credit_listing_sale', {
    p_seller_user_id: userId,
    p_ugx_price: ugxSaleAmount,
    p_listing_type: 'produce',
    p_listing_id: saleId ?? null,
    p_listing_title: produceTitle,
  });
  if (error) throw error;
  if (!data.success) throw new Error(data.error ?? 'Earning credit failed');
  return data;
}

export async function earnFromLandLease({ userId, ugxLeaseAmount, leaseId, landTitle }) {
  const { data, error } = await supabase.rpc('farm_credit_listing_sale', {
    p_seller_user_id: userId,
    p_ugx_price: ugxLeaseAmount,
    p_listing_type: 'land',
    p_listing_id: leaseId ?? null,
    p_listing_title: landTitle,
  });
  if (error) throw error;
  if (!data.success) throw new Error(data.error ?? 'Earning credit failed');
  return data;
}

export async function earnFromService({ userId, ugxServiceAmount, serviceId, serviceTitle }) {
  const { data, error } = await supabase.rpc('farm_credit_listing_sale', {
    p_seller_user_id: userId,
    p_ugx_price: ugxServiceAmount,
    p_listing_type: 'service',
    p_listing_id: serviceId ?? null,
    p_listing_title: serviceTitle,
  });
  if (error) throw error;
  if (!data.success) throw new Error(data.error ?? 'Earning credit failed');
  return data;
}

// ─── Buy / Sell ──────────────────────────────────────────────────────────────

/**
 * Buy ICAN coins — user pays UGX (notional), ICAN credited to wallet.
 * 1 ICAN = 5,000 UGX floor price. No tithe on purchases.
 */
export async function buyICAN({ userId, icanAmount, paymentRef = null }) {
  const { data, error } = await supabase.rpc('buy_ican_coins', {
    p_user_id: userId,
    p_ican_amount: icanAmount,
    p_source_app: SOURCE_APP,
    p_payment_ref: paymentRef,
  });
  if (error) throw error;
  if (!data.success) throw new Error(data.error ?? 'Buy failed');
  return data;
}

/**
 * Sell ICAN coins — ICAN debited, UGX payout handled offline by admin.
 */
export async function sellICAN({ userId, icanAmount, reference = null }) {
  const { data, error } = await supabase.rpc('sell_ican_coins', {
    p_user_id: userId,
    p_ican_amount: icanAmount,
    p_source_app: SOURCE_APP,
    p_reference: reference,
  });
  if (error) throw error;
  if (!data.success) throw new Error(data.error ?? 'Sell failed');
  return data;
}

// ─── Send Out (cash out via Flutterwave) ──────────────────────────────────────

/**
 * Sell ICAN and disburse the UGX directly to mobile money or a bank account
 * via Flutterwave, instead of an offline cashier payout. Debits the wallet
 * immediately; the transfer itself settles asynchronously and is refunded
 * automatically if Flutterwave rejects or fails it.
 */
export async function requestIcanPayout({
  icanAmount,
  channel, // 'mobilemoneyuganda' | 'bank'
  phoneNumber,
  network, // 'MTN' | 'AIRTEL' — required for mobilemoneyuganda
  accountNumber,
  bankCode,
  beneficiaryName,
}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not signed in');

  const { data, error } = await supabase.functions.invoke('flutterwave-payout', {
    body: {
      ican_amount: icanAmount,
      channel,
      phone_number: phoneNumber,
      network,
      account_number: accountNumber,
      bank_code: bankCode,
      beneficiary_name: beneficiaryName,
      source_app: SOURCE_APP,
    },
  });
  if (error) throw error;
  if (!data?.success) throw new Error(data?.error ?? 'Payout failed');
  return data;
}

// ─── Transfer ────────────────────────────────────────────────────────────────

export async function sendICAN({ fromUserId, toUserId, amount, note = '' }) {
  const { data, error } = await supabase.rpc('transfer_ican', {
    p_from_user: fromUserId,
    p_to_user: toUserId,
    p_amount: amount,
    p_note: note,
    p_source_app: SOURCE_APP,
  });
  if (error) throw error;
  if (!data.success) throw new Error(data.error);
  return data;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function ugxToICAN(ugx) {
  return Math.floor((ugx / ICAN_TO_UGX) * 1e8) / 1e8;
}

export function icanToUGX(ican) {
  return ican * ICAN_TO_UGX;
}

export function formatICAN(amount) {
  return Number(amount).toFixed(4);
}

export default {
  getOrCreateWallet,
  getWallet,
  getBalance,
  getTransactions,
  earnFromProduceSale,
  earnFromLandLease,
  earnFromService,
  buyICAN,
  sellICAN,
  sendICAN,
  ugxToICAN,
  icanToUGX,
  formatICAN,
  ICAN_TO_UGX,
  SOURCE_APP,
};
