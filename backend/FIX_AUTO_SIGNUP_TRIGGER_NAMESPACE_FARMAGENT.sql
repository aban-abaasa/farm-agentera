-- ============================================================================
-- FIX: signups failing / silently losing FARM-AGENT profile creation
-- ============================================================================
-- ROOT CAUSE: auth.users is a single shared table across 4 apps (ICAN,
-- digital-city-era, FARM-AGENT, mybodaguy) on one Supabase project.
-- FARM-AGENT's own migration (01_auth_tables.sql) — and ICAN's and
-- digital-city-era's — all installed a trigger under the SAME generic
-- name (on_auth_user_created -> public.handle_new_user()). Each app's
-- migration does `DROP TRIGGER IF EXISTS on_auth_user_created` then
-- recreates it, so whichever app's SQL was run most recently in the
-- Supabase SQL editor silently overwrites the other two apps' signup
-- logic — meaning FARM-AGENT's public.profiles row may never get created
-- for new signups if a different app's migration ran after this one.
--
-- FIX: give FARM-AGENT's trigger a unique name so it can never collide
-- with or be overwritten by another app's migration again — the same
-- pattern mybodaguy already correctly uses (on_auth_user_created_mbg).
--
-- Run this in FARM-AGENT's Supabase SQL editor. Also run the matching
-- FIX_AUTO_SIGNUP_TRIGGER_NAMESPACE_ICAN.sql (ICAN) and
-- FIX_AUTO_SIGNUP_TRIGGER_NAMESPACE_DCE.sql (digital-city-era) so all
-- three end up as independent, non-colliding triggers.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user_farmagent()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    first_name_val TEXT;
    last_name_val TEXT;
    phone_val TEXT;
    location_val TEXT;
    role_val TEXT;
    farmer_type_val TEXT;
    farm_size_val NUMERIC;
    bio_val TEXT;
BEGIN
    first_name_val := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
    last_name_val := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
    phone_val := COALESCE(NEW.raw_user_meta_data->>'phone', NULL);
    location_val := COALESCE(NEW.raw_user_meta_data->>'location', NULL);
    role_val := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
    farmer_type_val := COALESCE(NEW.raw_user_meta_data->>'farmer_type', NULL);

    BEGIN
        farm_size_val := (NEW.raw_user_meta_data->>'farm_size')::NUMERIC;
    EXCEPTION WHEN OTHERS THEN
        farm_size_val := NULL;
    END;

    bio_val := COALESCE(NEW.raw_user_meta_data->>'bio', NULL);

    INSERT INTO public.profiles (
        id, email, first_name, last_name, phone_number, location, role,
        farmer_type, farm_size, bio, created_at
    )
    VALUES (
        NEW.id, NEW.email, first_name_val, last_name_val, phone_val,
        location_val, role_val, farmer_type_val, farm_size_val, bio_val, NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = NEW.email,
        first_name = CASE
            WHEN public.profiles.first_name = '' OR public.profiles.first_name IS NULL
            THEN first_name_val ELSE public.profiles.first_name
        END,
        last_name = CASE
            WHEN public.profiles.last_name = '' OR public.profiles.last_name IS NULL
            THEN last_name_val ELSE public.profiles.last_name
        END,
        phone_number = COALESCE(public.profiles.phone_number, phone_val),
        location = COALESCE(public.profiles.location, location_val),
        role = COALESCE(public.profiles.role, role_val),
        farmer_type = COALESCE(public.profiles.farmer_type, farmer_type_val),
        farm_size = COALESCE(public.profiles.farm_size, farm_size_val),
        bio = COALESCE(public.profiles.bio, bio_val),
        updated_at = NOW();

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'handle_new_user_farmagent error for %: %', NEW.email, SQLERRM;
        RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_farmagent ON auth.users;
CREATE TRIGGER on_auth_user_created_farmagent
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_farmagent();

DO $$
BEGIN
  RAISE NOTICE '✅ AgriBone (FARM-AGENT) signup trigger renamed to on_auth_user_created_farmagent — can no longer be overwritten by another app''s migration.';
END $$;
