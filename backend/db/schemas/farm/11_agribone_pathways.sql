-- ============================================================================
-- AGRIBONE PATHWAY APPLICATIONS
-- Run in the Supabase SQL editor (after 10_farm_security_policies.sql and
-- DEV_PANEL_ACCESS.sql).
--
-- People apply to become On-Ground Support, a Supplier or a Partner/Investor.
-- Each application is reviewed in the Agribone developer panel, which sets
-- status to approved / rejected and can leave a note for the applicant.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.agribone_applications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pathway       TEXT NOT NULL CHECK (pathway IN ('support', 'supplier', 'partner')),
  full_name     TEXT NOT NULL,
  phone         TEXT,
  organisation  TEXT,
  pitchin_ref   TEXT,                       -- PitchIn profile / registration number
  region        TEXT,
  sub_region    TEXT,
  district      TEXT,
  capabilities  TEXT[] NOT NULL DEFAULT '{}', -- what the applicant can do / supply / offer
  details       TEXT,                       -- experience or free-text note
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  review_note   TEXT,
  reviewed_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS agribone_applications_user_idx   ON public.agribone_applications (user_id);
CREATE INDEX IF NOT EXISTS agribone_applications_status_idx ON public.agribone_applications (status, created_at DESC);

ALTER TABLE public.agribone_applications ENABLE ROW LEVEL SECURITY;

-- Applicants can read their own applications and file new ones, but only as
-- "pending": they can never approve themselves.
DROP POLICY IF EXISTS "applicants read own" ON public.agribone_applications;
CREATE POLICY "applicants read own" ON public.agribone_applications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "applicants insert own" ON public.agribone_applications;
CREATE POLICY "applicants insert own" ON public.agribone_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id AND status = 'pending' AND reviewed_at IS NULL AND review_note IS NULL);

-- ── Developer panel RPCs (same dev_token pattern as DEV_PANEL_ACCESS.sql) ────

CREATE OR REPLACE FUNCTION public.farm_dev_get_applications(dev_token TEXT)
RETURNS SETOF public.agribone_applications
SECURITY DEFINER SET search_path = public LANGUAGE plpgsql AS $$
BEGIN
  IF dev_token != 'dev_Farm_Ag3nt_KV25' THEN RAISE EXCEPTION 'unauthorized'; END IF;
  RETURN QUERY SELECT * FROM public.agribone_applications ORDER BY
    (status = 'pending') DESC, created_at DESC;
END; $$;
GRANT EXECUTE ON FUNCTION public.farm_dev_get_applications(TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.farm_dev_review_application(
  dev_token TEXT, application_id UUID, new_status TEXT, note TEXT DEFAULT NULL
)
RETURNS public.agribone_applications
SECURITY DEFINER SET search_path = public LANGUAGE plpgsql AS $$
DECLARE result public.agribone_applications;
BEGIN
  IF dev_token != 'dev_Farm_Ag3nt_KV25' THEN RAISE EXCEPTION 'unauthorized'; END IF;
  IF new_status NOT IN ('pending', 'approved', 'rejected') THEN RAISE EXCEPTION 'invalid status'; END IF;
  UPDATE public.agribone_applications
     SET status = new_status,
         review_note = note,
         reviewed_at = CASE WHEN new_status = 'pending' THEN NULL ELSE now() END
   WHERE id = application_id
   RETURNING * INTO result;
  RETURN result;
END; $$;
GRANT EXECUTE ON FUNCTION public.farm_dev_review_application(TEXT, UUID, TEXT, TEXT) TO anon, authenticated;
