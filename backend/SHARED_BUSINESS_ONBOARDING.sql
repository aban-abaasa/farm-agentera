-- AgriBone company onboarding linked to the shared Pichin business profile.

CREATE TABLE IF NOT EXISTS public.agribone_business_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_profile_id UUID NOT NULL UNIQUE REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_mode TEXT NOT NULL DEFAULT 'sole_proprietor'
    CHECK (business_mode IN ('sole_proprietor', 'organisation', 'enterprise')),
  registration_number TEXT,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('pending', 'active', 'suspended', 'closed')),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.agribone_business_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agribone_business_id UUID NOT NULL REFERENCES public.agribone_business_accounts(id) ON DELETE CASCADE,
  auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'worker',
  department TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('invited', 'active', 'suspended', 'removed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (agribone_business_id, auth_user_id)
);

CREATE INDEX IF NOT EXISTS idx_agribone_business_profile
  ON public.agribone_business_accounts(business_profile_id);

ALTER TABLE public.agribone_business_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agribone_business_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS agribone_business_member_read ON public.agribone_business_accounts;
CREATE POLICY agribone_business_member_read ON public.agribone_business_accounts
  FOR SELECT TO authenticated
  USING (public.ican_business_member(business_profile_id));

DROP POLICY IF EXISTS agribone_business_admin_write ON public.agribone_business_accounts;
CREATE POLICY agribone_business_admin_write ON public.agribone_business_accounts
  FOR ALL TO authenticated
  USING (public.ican_business_admin(business_profile_id))
  WITH CHECK (public.ican_business_admin(business_profile_id));

DROP POLICY IF EXISTS agribone_member_read ON public.agribone_business_members;
CREATE POLICY agribone_member_read ON public.agribone_business_members
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.agribone_business_accounts a
    WHERE a.id = agribone_business_members.agribone_business_id
      AND public.ican_business_member(a.business_profile_id)
  ));

DROP POLICY IF EXISTS agribone_admin_manage_members ON public.agribone_business_members;
CREATE POLICY agribone_admin_manage_members ON public.agribone_business_members
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.agribone_business_accounts a
    WHERE a.id = agribone_business_members.agribone_business_id
      AND public.ican_business_admin(a.business_profile_id)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.agribone_business_accounts a
    WHERE a.id = agribone_business_members.agribone_business_id
      AND public.ican_business_admin(a.business_profile_id)
  ));
