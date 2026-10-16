/**
 * The person's businesses, read from the shared ICAN database.
 *
 *  - PitchIn  → `business_profiles`      (the business they pitched / manage in ICAN)
 *  - CMMS     → `cmms_company_profiles`  (the company they run in CMMS)
 *
 * A CMMS company that is linked to a PitchIn business (via
 * `business_profile_id` / `pichin_business_profile_id`) is merged into one
 * entry, so a farmer, supplier or specialist is treated as one company.
 * Each source is read on its own: if one can't be read (not set up, or
 * blocked by RLS) the other still works.
 */
import { supabase } from '../../lib/supabase/client';

async function readPitchin(userId) {
  const { data, error } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('user_id', userId) // RLS also exposes other people's verified profiles
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('[businessService] PitchIn business profiles unavailable:', error.message);
    return [];
  }
  return data ?? [];
}

async function readCmms(userId, email) {
  let query = supabase.from('cmms_company_profiles').select('*');
  // RLS already limits rows to ones the person can see; narrow to ones they own.
  query = email
    ? query.or(`created_by.eq.${userId},email.eq.${email.replace(/[,()]/g, '')}`)
    : query.eq('created_by', userId);
  const { data, error } = await query;
  if (error) {
    console.warn('[businessService] CMMS companies unavailable:', error.message);
    return [];
  }
  return data ?? [];
}

const linkedBusinessId = (c) => c.business_profile_id || c.pichin_business_profile_id || null;

/** Merge PitchIn businesses and CMMS companies into one list of companies. */
export function mergeCompanies(pitchin, cmms) {
  const usedCmms = new Set();

  const merged = pitchin.map((bp) => {
    const cmmsCompany = cmms.find((c) => linkedBusinessId(c) === bp.id) || null;
    if (cmmsCompany) usedCmms.add(cmmsCompany.id);
    return {
      key: `pitchin:${bp.id}`,
      name: bp.business_name,
      type: bp.business_type || null,
      registration: bp.registration_number || cmmsCompany?.company_registration || null,
      location: bp.business_address || cmmsCompany?.location || null,
      description: bp.description || null,
      verification: bp.verification_status || 'unverified',
      pitchinId: bp.id,
      cmmsId: cmmsCompany?.id || null,
      cmmsName: cmmsCompany?.company_name || null,
      sources: cmmsCompany ? ['pitchin', 'cmms'] : ['pitchin'],
    };
  });

  cmms
    .filter((c) => !usedCmms.has(c.id))
    .forEach((c) => {
      merged.push({
        key: `cmms:${c.id}`,
        name: c.company_name,
        type: c.industry || null,
        registration: c.company_registration || null,
        location: c.location || null,
        description: null,
        verification: 'unverified',
        pitchinId: null,
        cmmsId: c.id,
        cmmsName: c.company_name,
        sources: ['cmms'],
      });
    });

  return merged;
}

export async function getMyCompanies(userId, email) {
  const [pitchin, cmms] = await Promise.all([readPitchin(userId), readCmms(userId, email)]);
  return mergeCompanies(pitchin, cmms);
}
