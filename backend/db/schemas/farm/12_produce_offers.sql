-- ============================================================================
-- PRODUCE OFFERS — farmers say what they have and at what price; suppliers
-- (Supermartkera / Digital City Era) see it.
--
-- Run in the Supabase SQL editor. Safe to run twice. No dependency on other
-- farm schema files (it only references auth.users); the supplier check reads
-- public.users / public.supermarkets when they exist (the shared project).
--
-- Both apps share this Supabase project, so this one file serves:
--   * farm-agentera  -> farmers post / manage offers   ("Tell suppliers what you have")
--   * digital-city-era -> suppliers browse offers and show interest ("Farm Produce" tab)
--
-- Rules the database enforces (the apps only mirror them):
--   * An offer is readable by any signed-in user while it is 'active' and not
--     past expires_at; its owner always sees all of their own offers.
--   * Only the owner can create / change / delete an offer.
--   * An offer can stay open for at most 60 days; the apps default to 7 so a
--     stale price never lingers. Prices are in UGX per unit.
--   * Only supplier-capable users (the same rule as the supplier portal) can
--     show interest, once per offer, and never in their own offer.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.farm_produce_offers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farmer_name     TEXT NOT NULL CHECK (char_length(btrim(farmer_name)) BETWEEN 1 AND 120),
  contact_phone   TEXT NOT NULL CHECK (char_length(btrim(contact_phone)) BETWEEN 7 AND 20),
  crop            TEXT NOT NULL CHECK (char_length(btrim(crop)) BETWEEN 2 AND 80),
  quantity        NUMERIC NOT NULL CHECK (quantity > 0 AND quantity <= 1000000000),
  unit            TEXT NOT NULL CHECK (unit IN ('kg', 'ton', 'bag', 'crate', 'bunch', 'basket', 'tray', 'piece', 'litre')),
  price_per_unit  NUMERIC NOT NULL CHECK (price_per_unit > 0 AND price_per_unit <= 1000000000),  -- UGX
  region          TEXT,
  sub_region      TEXT,
  district        TEXT,
  ready_date      DATE,                                    -- NULL = ready now
  is_organic      BOOLEAN NOT NULL DEFAULT FALSE,
  notes           TEXT CHECK (notes IS NULL OR char_length(notes) <= 500),
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'sold')),
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS farm_produce_offers_open_idx
  ON public.farm_produce_offers (status, expires_at DESC);
CREATE INDEX IF NOT EXISTS farm_produce_offers_farmer_idx
  ON public.farm_produce_offers (farmer_id, created_at DESC);

-- Keeps updated_at honest and stops an offer being parked open for months.
CREATE OR REPLACE FUNCTION public.farm_produce_offers_guard()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.expires_at > now() + interval '60 days' THEN
    RAISE EXCEPTION 'An offer can stay open for at most 60 days.' USING ERRCODE = '22023';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS farm_produce_offers_guard ON public.farm_produce_offers;
CREATE TRIGGER farm_produce_offers_guard
  BEFORE INSERT OR UPDATE ON public.farm_produce_offers
  FOR EACH ROW EXECUTE FUNCTION public.farm_produce_offers_guard();

ALTER TABLE public.farm_produce_offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "produce offers: read open or own" ON public.farm_produce_offers;
CREATE POLICY "produce offers: read open or own" ON public.farm_produce_offers
  FOR SELECT TO authenticated
  USING (farmer_id = auth.uid() OR (status = 'active' AND expires_at > now()));

DROP POLICY IF EXISTS "produce offers: farmer inserts own" ON public.farm_produce_offers;
CREATE POLICY "produce offers: farmer inserts own" ON public.farm_produce_offers
  FOR INSERT TO authenticated
  WITH CHECK (farmer_id = auth.uid());

DROP POLICY IF EXISTS "produce offers: farmer updates own" ON public.farm_produce_offers;
CREATE POLICY "produce offers: farmer updates own" ON public.farm_produce_offers
  FOR UPDATE TO authenticated
  USING (farmer_id = auth.uid())
  WITH CHECK (farmer_id = auth.uid());

DROP POLICY IF EXISTS "produce offers: farmer deletes own" ON public.farm_produce_offers;
CREATE POLICY "produce offers: farmer deletes own" ON public.farm_produce_offers
  FOR DELETE TO authenticated
  USING (farmer_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.farm_produce_offers TO authenticated;

-- ── Who counts as a supplier ────────────────────────────────────────────────
-- Mirrors the supplier portal (frontend/src/utils/supplierAccess.js in
-- digital-city-era): a 'supplier' or 'admin' account, or a 'manager' whose store
-- is supply-enabled (or who has no store). SECURITY DEFINER so the check does
-- not depend on the caller's own read access to public.users; plpgsql so the
-- file still installs in a project that has no Supermartkera tables (it then
-- simply answers false).
CREATE OR REPLACE FUNCTION public.farm_is_supplier()
RETURNS BOOLEAN
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
      FROM public.users u
     WHERE (u.auth_id = auth.uid() OR u.id = auth.uid())
       AND (
         lower(coalesce(u.role, '')) IN ('supplier', 'admin')
         OR (
           lower(coalesce(u.role, '')) = 'manager'
           AND (
             u.supermarket_id IS NULL
             OR EXISTS (
               SELECT 1 FROM public.supermarkets s
                WHERE s.id = u.supermarket_id AND s.supports_supply_orders IS TRUE
             )
           )
         )
       )
  );
EXCEPTION WHEN undefined_table OR undefined_column THEN
  RETURN FALSE;
END; $$;

REVOKE ALL ON FUNCTION public.farm_is_supplier() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.farm_is_supplier() TO authenticated;

-- ── Supplier interest ───────────────────────────────────────────────────────
-- "I'd like this" from a supplier. The farmer sees who, with their phone and an
-- optional message; the supplier can withdraw it.
CREATE TABLE IF NOT EXISTS public.farm_produce_interests (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id         UUID NOT NULL REFERENCES public.farm_produce_offers(id) ON DELETE CASCADE,
  supplier_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplier_name    TEXT NOT NULL CHECK (char_length(btrim(supplier_name)) BETWEEN 1 AND 120),
  supplier_phone   TEXT CHECK (supplier_phone IS NULL OR char_length(btrim(supplier_phone)) BETWEEN 7 AND 20),
  message          TEXT CHECK (message IS NULL OR char_length(message) <= 300),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (offer_id, supplier_user_id)
);

CREATE INDEX IF NOT EXISTS farm_produce_interests_offer_idx    ON public.farm_produce_interests (offer_id);
CREATE INDEX IF NOT EXISTS farm_produce_interests_supplier_idx ON public.farm_produce_interests (supplier_user_id);

ALTER TABLE public.farm_produce_interests ENABLE ROW LEVEL SECURITY;

-- The supplier who filed it, and the farmer whose offer it is.
DROP POLICY IF EXISTS "produce interests: supplier or offer owner reads" ON public.farm_produce_interests;
CREATE POLICY "produce interests: supplier or offer owner reads" ON public.farm_produce_interests
  FOR SELECT TO authenticated
  USING (
    supplier_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.farm_produce_offers o
       WHERE o.id = offer_id AND o.farmer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "produce interests: supplier files own" ON public.farm_produce_interests;
CREATE POLICY "produce interests: supplier files own" ON public.farm_produce_interests
  FOR INSERT TO authenticated
  WITH CHECK (
    supplier_user_id = auth.uid()
    AND public.farm_is_supplier()
    AND EXISTS (
      SELECT 1 FROM public.farm_produce_offers o
       WHERE o.id = offer_id
         AND o.status = 'active'
         AND o.expires_at > now()
         AND o.farmer_id <> auth.uid()
    )
  );

DROP POLICY IF EXISTS "produce interests: supplier withdraws own" ON public.farm_produce_interests;
CREATE POLICY "produce interests: supplier withdraws own" ON public.farm_produce_interests
  FOR DELETE TO authenticated
  USING (supplier_user_id = auth.uid());

GRANT SELECT, INSERT, DELETE ON public.farm_produce_interests TO authenticated;

-- ── Live updates ────────────────────────────────────────────────────────────
-- Lets the supplier board show a new offer the moment a farmer posts it. Realtime
-- applies the read policy above, so suppliers only ever receive open offers.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'farm_produce_offers'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.farm_produce_offers;
  END IF;
END $$;
