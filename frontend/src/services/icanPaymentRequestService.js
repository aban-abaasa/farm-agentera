/**
 * ICAN Payment Request Service
 * Real, working "Receive" requests denominated in icaneracoin — reuses the
 * same shared payment_requests table ICAN app already uses for local
 * currency requests (see ALLOW_ICAN_PAYMENT_REQUESTS.sql, which adds 'ICAN'
 * as a valid currency). A request generates a real scannable QR value
 * (`ICANPAY:<code>`); paying it calls sendICAN() (0% fee, same as any
 * wallet-to-wallet send) and marks the request completed.
 */

import { supabase } from '../lib/supabase/client';
import { SOURCE_APP } from './icanWalletService';

const TABLE = 'payment_requests';

function generatePaymentCode() {
  const baseId = (globalThis.crypto?.randomUUID?.() || `${Date.now()}${Math.random()}`)
    .replace(/-/g, '')
    .toUpperCase();
  return `ICANPAY_${baseId.substring(0, 12)}`;
}

export async function createIcanPaymentRequest({ userId, icanAmount, description = '' }) {
  if (!(icanAmount > 0)) throw new Error('Enter a valid ICAN amount');
  const paymentCode = generatePaymentCode();

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      user_id: userId,
      payment_code: paymentCode,
      amount: icanAmount,
      currency: 'ICAN',
      description,
      status: 'pending',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return { ...data, qrValue: `ICANPAY:${paymentCode}` };
}

export async function getIcanPaymentRequest(paymentCode) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('payment_code', paymentCode)
    .eq('currency', 'ICAN')
    .single();

  if (error || !data) throw new Error('Payment request not found');
  if (data.status !== 'pending') throw new Error(`This payment request was already ${data.status}`);
  if (new Date(data.expires_at) < new Date()) throw new Error('This payment request has expired');
  return data;
}

/** Parses a scanned QR value; returns the payment code, or null if not an ICAN payment request. */
export function parseIcanPayCode(scannedText) {
  const value = (scannedText || '').trim();
  const match = /^ICANPAY:(.+)$/i.exec(value);
  if (match) return match[1].trim();
  return /^ICANPAY_[A-Z0-9]+$/i.test(value) ? value : null;
}

/**
 * Pays a scanned ICAN payment request.
 *
 * The transfer and the "mark completed" step happen in ONE database
 * transaction (pay_ican_payment_request, see backend/PAY_ICAN_PAYMENT_REQUEST.sql).
 * Doing them as two client calls left requests open after payment, because
 * RLS only lets the request owner update it — so the same QR could be paid
 * repeatedly. The payer is always the signed-in user, decided server-side.
 */
export async function payIcanRequest({ paymentCode }) {
  // Friendly pre-check (amount shown/validated before we ask the server to move coins).
  const request = await getIcanPaymentRequest(paymentCode);

  const { data, error } = await supabase.rpc('pay_ican_payment_request', {
    p_payment_code: paymentCode,
    p_source_app: SOURCE_APP,
  });
  if (error) throw error;
  if (!data?.success) throw new Error(data?.error ?? 'Payment failed');

  return { request, transfer: data };
}

export async function getActiveIcanPaymentRequests(userId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .eq('currency', 'ICAN')
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function deleteIcanPaymentRequest(paymentCode) {
  const { error } = await supabase.from(TABLE).delete().eq('payment_code', paymentCode);
  if (error) throw error;
}
