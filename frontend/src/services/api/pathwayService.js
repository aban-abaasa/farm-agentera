/**
 * AgriBone pathway applications (On-Ground Support, Supplier, Partner).
 * Applicants file and read their own; the developer panel reviews them.
 * Table + RPCs: backend/db/schemas/farm/11_agribone_pathways.sql
 */
import { supabase } from '../../lib/supabase/client';

const TABLE = 'agribone_applications';

export async function submitApplication(userId, pathway, form) {
  const row = {
    user_id: userId,
    pathway,
    full_name: form.fullName.trim(),
    phone: form.phone?.trim() || null,
    organisation: form.organisation?.trim() || null,
    pitchin_ref: form.pitchinRef?.trim() || null,
    region: form.region || null,
    sub_region: form.subRegion || null,
    district: form.district?.trim() || null,
    capabilities: form.capabilities || [],
    details: form.details?.trim() || null,
  };
  const { data, error } = await supabase.from(TABLE).insert(row).select().single();
  if (error) throw error;
  return data;
}

export async function getMyApplications(userId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ── Developer panel ────────────────────────────────────────────────────────

export async function devListApplications(devToken) {
  const { data, error } = await supabase.rpc('farm_dev_get_applications', { dev_token: devToken });
  if (error) throw error;
  return data ?? [];
}

export async function devReviewApplication(devToken, applicationId, status, note = null) {
  const { data, error } = await supabase.rpc('farm_dev_review_application', {
    dev_token: devToken,
    application_id: applicationId,
    new_status: status,
    note,
  });
  if (error) throw error;
  return data;
}
