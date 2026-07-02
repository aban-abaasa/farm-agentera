-- ============================================================================
-- FARM AGENT DEV PANEL ACCESS — Run ONCE in Supabase SQL Editor
-- ============================================================================
-- Token:        dev_Farm_Ag3nt_KV25   (must match DEV_TOKEN in DevPanel.jsx)
-- Dev email:    farmagent25@gmail.com
-- Dev password: @1997God
-- ============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. GET ALL FARMER PROFILES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.farm_dev_get_profiles(dev_token TEXT)
RETURNS TABLE (
  id UUID, email TEXT, first_name TEXT, last_name TEXT,
  phone_number TEXT, role TEXT, farmer_type TEXT,
  farm_size TEXT, farm_location TEXT, location TEXT,
  avatar_url TEXT, created_at TIMESTAMPTZ
)
SECURITY DEFINER SET search_path = public LANGUAGE plpgsql AS $$
BEGIN
  IF dev_token != 'dev_Farm_Ag3nt_KV25' THEN RAISE EXCEPTION 'unauthorized'; END IF;
  RETURN QUERY
    SELECT p.id, p.email,
           COALESCE(p.first_name,''), COALESCE(p.last_name,''),
           COALESCE(p.phone_number,''), COALESCE(p.role,'user'),
           COALESCE(p.farmer_type,''), COALESCE(p.farm_size::TEXT,''),
           COALESCE(p.farm_location,''), COALESCE(p.location,''),
           p.avatar_url, p.created_at
    FROM public.profiles p ORDER BY p.created_at DESC;
END; $$;
GRANT EXECUTE ON FUNCTION public.farm_dev_get_profiles(TEXT) TO anon, authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. GET ALL FARMS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.farm_dev_get_farms(dev_token TEXT)
RETURNS TABLE (
  id UUID, user_id UUID, name TEXT, location TEXT,
  size_acres NUMERIC, farm_type TEXT, created_at TIMESTAMPTZ
)
SECURITY DEFINER SET search_path = public LANGUAGE plpgsql AS $$
BEGIN
  IF dev_token != 'dev_Farm_Ag3nt_KV25' THEN RAISE EXCEPTION 'unauthorized'; END IF;
  RETURN QUERY
    SELECT f.id, f.user_id,
           COALESCE(f.name,'Unnamed farm'), COALESCE(f.location,''),
           COALESCE(f.size_acres,0), COALESCE(f.farm_type,''),
           f.created_at
    FROM public.farms f ORDER BY f.created_at DESC;
EXCEPTION WHEN undefined_table THEN RETURN;
END; $$;
GRANT EXECUTE ON FUNCTION public.farm_dev_get_farms(TEXT) TO anon, authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. GET LIVESTOCK SUMMARY PER FARM
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.farm_dev_get_livestock(dev_token TEXT)
RETURNS TABLE (farm_id UUID, animal_type TEXT, count BIGINT, total_value NUMERIC)
SECURITY DEFINER SET search_path = public LANGUAGE plpgsql AS $$
BEGIN
  IF dev_token != 'dev_Farm_Ag3nt_KV25' THEN RAISE EXCEPTION 'unauthorized'; END IF;
  RETURN QUERY
    SELECT l.farm_id, COALESCE(l.animal_type,'unknown'),
           COUNT(*), COALESCE(SUM(l.value),0)
    FROM public.farm_livestock l
    GROUP BY l.farm_id, l.animal_type ORDER BY l.farm_id, count DESC;
EXCEPTION WHEN undefined_table THEN RETURN;
END; $$;
GRANT EXECUTE ON FUNCTION public.farm_dev_get_livestock(TEXT) TO anon, authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. GET CROP YIELD SUMMARY
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.farm_dev_get_crops(dev_token TEXT)
RETURNS TABLE (
  farm_id UUID, crop_name TEXT, season TEXT,
  yield_kg NUMERIC, revenue NUMERIC, harvest_date DATE
)
SECURITY DEFINER SET search_path = public LANGUAGE plpgsql AS $$
BEGIN
  IF dev_token != 'dev_Farm_Ag3nt_KV25' THEN RAISE EXCEPTION 'unauthorized'; END IF;
  RETURN QUERY
    SELECT cy.farm_id, COALESCE(cy.crop_name,'unknown'),
           COALESCE(cy.season,''), COALESCE(cy.yield_kg,0),
           COALESCE(cy.revenue,0), cy.harvest_date
    FROM public.crop_yields cy ORDER BY cy.harvest_date DESC NULLS LAST;
EXCEPTION WHEN undefined_table THEN RETURN;
END; $$;
GRANT EXECUTE ON FUNCTION public.farm_dev_get_crops(TEXT) TO anon, authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. GET ICAN WALLETS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.farm_dev_get_wallets(dev_token TEXT)
RETURNS TABLE (
  user_id UUID, ican_balance NUMERIC, total_earned NUMERIC,
  total_spent NUMERIC, total_tithe_paid NUMERIC
)
SECURITY DEFINER SET search_path = public LANGUAGE plpgsql AS $$
BEGIN
  IF dev_token != 'dev_Farm_Ag3nt_KV25' THEN RAISE EXCEPTION 'unauthorized'; END IF;
  RETURN QUERY
    SELECT w.user_id, w.ican_balance, w.total_earned,
           w.total_spent, w.total_tithe_paid
    FROM public.ican_user_wallets w ORDER BY w.ican_balance DESC;
END; $$;
GRANT EXECUTE ON FUNCTION public.farm_dev_get_wallets(TEXT) TO anon, authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. GET MARKETPLACE LISTINGS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.farm_dev_get_listings(dev_token TEXT)
RETURNS TABLE (
  id UUID, user_id UUID, title TEXT, category TEXT,
  price NUMERIC, listing_type TEXT, status TEXT, created_at TIMESTAMPTZ
)
SECURITY DEFINER SET search_path = public LANGUAGE plpgsql AS $$
BEGIN
  IF dev_token != 'dev_Farm_Ag3nt_KV25' THEN RAISE EXCEPTION 'unauthorized'; END IF;
  RETURN QUERY
    SELECT ml.id, ml.user_id,
           COALESCE(ml.title,'—'), COALESCE(ml.category,'other'),
           COALESCE(ml.price,0), COALESCE(ml.listing_type,'—'),
           COALESCE(ml.status,'active'), ml.created_at
    FROM public.marketplace_listings ml ORDER BY ml.created_at DESC;
EXCEPTION WHEN undefined_table THEN RETURN;
END; $$;
GRANT EXECUTE ON FUNCTION public.farm_dev_get_listings(TEXT) TO anon, authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- 7. GET FARM FINANCIAL TRANSACTIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.farm_dev_get_finances(dev_token TEXT)
RETURNS TABLE (
  farm_id UUID, user_id UUID, tx_type TEXT,
  amount NUMERIC, category TEXT, created_at TIMESTAMPTZ
)
SECURITY DEFINER SET search_path = public LANGUAGE plpgsql AS $$
BEGIN
  IF dev_token != 'dev_Farm_Ag3nt_KV25' THEN RAISE EXCEPTION 'unauthorized'; END IF;
  RETURN QUERY
    SELECT ft.farm_id, ft.user_id,
           COALESCE(ft.transaction_type, ft.type, 'expense'),
           COALESCE(ft.amount,0), COALESCE(ft.category,'—'),
           ft.created_at
    FROM public.farm_financial_transactions ft
    ORDER BY ft.created_at DESC LIMIT 500;
EXCEPTION WHEN undefined_table THEN RETURN;
END; $$;
GRANT EXECUTE ON FUNCTION public.farm_dev_get_finances(TEXT) TO anon, authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- 8. SYSTEM TOTALS — farmer-type aggregate
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.farm_dev_system_totals(dev_token TEXT)
RETURNS TABLE (
  farmer_type TEXT, user_count BIGINT, farm_count BIGINT,
  total_balance NUMERIC, total_earned NUMERIC, total_tithe NUMERIC
)
SECURITY DEFINER SET search_path = public LANGUAGE plpgsql AS $$
BEGIN
  IF dev_token != 'dev_Farm_Ag3nt_KV25' THEN RAISE EXCEPTION 'unauthorized'; END IF;
  RETURN QUERY
    SELECT COALESCE(p.farmer_type,'general'),
           COUNT(DISTINCT p.id), COUNT(DISTINCT f.id),
           COALESCE(SUM(w.ican_balance),0),
           COALESCE(SUM(w.total_earned),0),
           COALESCE(SUM(w.total_tithe_paid),0)
    FROM public.profiles p
    LEFT JOIN public.farms f             ON f.user_id = p.id
    LEFT JOIN public.ican_user_wallets w ON w.user_id = p.id
    GROUP BY p.farmer_type ORDER BY total_balance DESC;
EXCEPTION WHEN undefined_table THEN
  RETURN QUERY
    SELECT 'general'::TEXT, COUNT(DISTINCT p.id), 0::BIGINT,
           COALESCE(SUM(w.ican_balance),0),
           COALESCE(SUM(w.total_earned),0),
           COALESCE(SUM(w.total_tithe_paid),0)
    FROM public.profiles p
    LEFT JOIN public.ican_user_wallets w ON w.user_id = p.id;
END; $$;
GRANT EXECUTE ON FUNCTION public.farm_dev_system_totals(TEXT) TO anon, authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- 9. GRANT ICAN BONUS (with 10% tithe)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.farm_dev_grant_bonus(
  dev_token TEXT, target_user_id UUID, bonus_amount NUMERIC
)
RETURNS VOID
SECURITY DEFINER SET search_path = public LANGUAGE plpgsql AS $$
DECLARE tithe NUMERIC; net NUMERIC;
BEGIN
  IF dev_token != 'dev_Farm_Ag3nt_KV25' THEN RAISE EXCEPTION 'unauthorized'; END IF;
  tithe := ROUND(bonus_amount * 0.1, 6);
  net   := bonus_amount - tithe;
  INSERT INTO public.ican_user_wallets (user_id, ican_balance, total_earned, total_tithe_paid)
  VALUES (target_user_id, net, bonus_amount, tithe)
  ON CONFLICT (user_id) DO UPDATE SET
    ican_balance     = ican_user_wallets.ican_balance     + net,
    total_earned     = ican_user_wallets.total_earned     + bonus_amount,
    total_tithe_paid = ican_user_wallets.total_tithe_paid + tithe;
  INSERT INTO public.ican_coin_transactions (recipient_user_id, ican_amount)
  VALUES (target_user_id, net);
END; $$;
GRANT EXECUTE ON FUNCTION public.farm_dev_grant_bonus(TEXT, UUID, NUMERIC) TO anon, authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- 10. GET RECENT MESSAGES (all conversations — dev view)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.farm_dev_get_messages(dev_token TEXT)
RETURNS TABLE (
  message_id      UUID,
  conversation_id UUID,
  conv_title      TEXT,
  sender_id       UUID,
  sender_name     TEXT,
  content         TEXT,
  created_at      TIMESTAMPTZ
)
SECURITY DEFINER SET search_path = public LANGUAGE plpgsql AS $$
BEGIN
  IF dev_token != 'dev_Farm_Ag3nt_KV25' THEN RAISE EXCEPTION 'unauthorized'; END IF;
  RETURN QUERY
    SELECT m.id,
           m.conversation_id,
           COALESCE(c.title, 'Direct')                   AS conv_title,
           m.sender_id,
           COALESCE(p.first_name || ' ' || p.last_name,
                    p.email, 'User')                     AS sender_name,
           COALESCE(m.content, '')                       AS content,
           m.created_at
    FROM public.messages m
    LEFT JOIN public.conversations c ON c.id = m.conversation_id
    LEFT JOIN public.profiles      p ON p.id = m.sender_id
    WHERE COALESCE(m.is_deleted, false) = false
    ORDER BY m.created_at DESC
    LIMIT 300;
EXCEPTION WHEN undefined_table THEN RETURN;
END; $$;
GRANT EXECUTE ON FUNCTION public.farm_dev_get_messages(TEXT) TO anon, authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- 11. SUBSCRIPTIONS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.farm_subscriptions (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan        VARCHAR(20) DEFAULT 'basic' CHECK (plan IN ('basic','pro','enterprise')),
  target_type VARCHAR(20) DEFAULT 'farmer' CHECK (target_type IN ('farmer','farm','marketplace')),
  active      BOOLEAN     DEFAULT true,
  expires_at  TIMESTAMPTZ,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.farm_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "farm_dev_manage_subscriptions" ON public.farm_subscriptions;
CREATE POLICY "farm_dev_manage_subscriptions"
  ON public.farm_subscriptions FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);
GRANT ALL ON public.farm_subscriptions TO anon, authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- 12. GET BLOCKCHAIN SECURITY RECORDS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.farm_dev_get_blockchain(dev_token TEXT)
RETURNS TABLE (
  id              UUID,
  message_id      UUID,
  conversation_id UUID,
  sender_id       UUID,
  record_hash     TEXT,
  blockchain_tx_hash TEXT,
  content_hash    TEXT,
  is_verified     BOOLEAN,
  verified_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ
)
SECURITY DEFINER SET search_path = public LANGUAGE plpgsql AS $$
BEGIN
  IF dev_token != 'dev_Farm_Ag3nt_KV25' THEN RAISE EXCEPTION 'unauthorized'; END IF;
  RETURN QUERY
    SELECT br.id, br.message_id, br.conversation_id, br.sender_id,
           br.record_hash, COALESCE(br.blockchain_tx_hash,''),
           br.content_hash,
           COALESCE(br.is_verified, false), br.verified_at, br.created_at
    FROM public.message_blockchain_records br
    ORDER BY br.created_at DESC LIMIT 300;
EXCEPTION WHEN undefined_table THEN RETURN;
END; $$;
GRANT EXECUTE ON FUNCTION public.farm_dev_get_blockchain(TEXT) TO anon, authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- 13. GET MARKETPLACE SUPPLIERS (listings offered by farmers)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.farm_dev_get_suppliers(dev_token TEXT)
RETURNS TABLE (
  id UUID, user_id UUID, title TEXT, description TEXT,
  type TEXT, status TEXT, price NUMERIC, location TEXT,
  district TEXT, views INTEGER, created_at TIMESTAMPTZ
)
SECURITY DEFINER SET search_path = public LANGUAGE plpgsql AS $$
BEGIN
  IF dev_token != 'dev_Farm_Ag3nt_KV25' THEN RAISE EXCEPTION 'unauthorized'; END IF;
  RETURN QUERY
    SELECT ml.id::UUID, ml.user_id,
           COALESCE(ml.title,'—'), COALESCE(ml.description,''),
           COALESCE(ml.type,'other'), COALESCE(ml.status,'active'),
           COALESCE(ml.price,0), COALESCE(ml.location,''),
           COALESCE(ml.district,''), COALESCE(ml.views,0),
           ml.created_at
    FROM public.marketplace_listings ml
    ORDER BY ml.created_at DESC;
EXCEPTION WHEN undefined_table THEN RETURN;
END; $$;
GRANT EXECUTE ON FUNCTION public.farm_dev_get_suppliers(TEXT) TO anon, authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- DONE — verify:
--   SELECT routine_name FROM information_schema.routines
--   WHERE routine_schema = 'public' AND routine_name LIKE 'farm_dev_%';
-- ─────────────────────────────────────────────────────────────────────────────
