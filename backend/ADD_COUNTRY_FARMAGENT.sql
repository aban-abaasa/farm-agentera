-- ============================================================================
-- ADD: country column on public.profiles, populated from signup metadata
-- ============================================================================
-- frontend/src/pages/auth/Register.jsx now collects a required "country"
-- field (Step 2, alongside the existing Region/location field) and
-- frontend/src/services/api/authService.js's signUp() passes it as
-- `options.data.country`. This extends AgriBone's own namespaced trigger
-- (handle_new_user_farmagent, see
-- FIX_AUTO_SIGNUP_TRIGGER_NAMESPACE_FARMAGENT.sql) to copy that value into
-- public.profiles.country.
--
-- Run this in FARM-AGENT's Supabase SQL editor, after
-- FIX_AUTO_SIGNUP_TRIGGER_NAMESPACE_FARMAGENT.sql has already been applied.
-- ============================================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT;

CREATE OR REPLACE FUNCTION public.handle_new_user_farmagent()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    first_name_val TEXT;
    last_name_val TEXT;
    phone_val TEXT;
    country_val TEXT;
    location_val TEXT;
    role_val TEXT;
    farmer_type_val TEXT;
    farm_size_val NUMERIC;
    bio_val TEXT;
BEGIN
    first_name_val := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
    last_name_val := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
    phone_val := COALESCE(NEW.raw_user_meta_data->>'phone', NULL);
    country_val := COALESCE(NEW.raw_user_meta_data->>'country', NULL);
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
        id, email, first_name, last_name, phone_number, country, location, role,
        farmer_type, farm_size, bio, created_at
    )
    VALUES (
        NEW.id, NEW.email, first_name_val, last_name_val, phone_val,
        country_val, location_val, role_val, farmer_type_val, farm_size_val, bio_val, NOW()
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
        country = COALESCE(public.profiles.country, country_val),
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
  RAISE NOTICE '✅ public.profiles.country added and handle_new_user_farmagent now populates it from signup metadata.';
END $$;
