-- =============================================
-- AUTH & PROFILES
-- =============================================

-- First, drop the trigger if it already exists to avoid errors on recreation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Profiles table extension
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone_number TEXT,
    bio TEXT,
    location TEXT,
    avatar_url TEXT,
    cover_photo TEXT,
    farmer_type TEXT, -- e.g. 'crop', 'livestock', 'mixed'
    farm_size NUMERIC,
    farm_location TEXT,
    specialty TEXT,
    role TEXT DEFAULT 'user',
    certifications TEXT[] DEFAULT '{}',
    facebook_url TEXT,
    twitter_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" 
    ON public.profiles 
    FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can view other users' public profile info"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() IS NOT NULL AND auth.uid() != id);

CREATE POLICY "Anonymous users can view basic profile info"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() IS NULL);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles 
    FOR UPDATE 
    USING (auth.uid() = id);

-- Allow all inserts to profiles (needed for the trigger function)
CREATE POLICY "Allow all profile inserts" 
    ON public.profiles 
    FOR INSERT 
    WITH CHECK (true);

-- Create a trigger to automatically insert a profile record when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
    -- Extract user metadata with null handling
    first_name_val := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
    last_name_val := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
    phone_val := COALESCE(NEW.raw_user_meta_data->>'phone', NULL);
    location_val := COALESCE(NEW.raw_user_meta_data->>'location', NULL);
    role_val := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
    farmer_type_val := COALESCE(NEW.raw_user_meta_data->>'farmer_type', NULL);
    
    -- Handle numeric conversion safely
    BEGIN
        farm_size_val := (NEW.raw_user_meta_data->>'farm_size')::NUMERIC;
    EXCEPTION WHEN OTHERS THEN
        farm_size_val := NULL;
    END;
    
    bio_val := COALESCE(NEW.raw_user_meta_data->>'bio', NULL);
    
    -- Insert or update the profile
    INSERT INTO public.profiles (
        id, 
        email, 
        first_name, 
        last_name,
        phone_number,
        location,
        role,
        farmer_type,
        farm_size,
        bio,
        created_at
    )
    VALUES (
        NEW.id, 
        NEW.email, 
        first_name_val,
        last_name_val,
        phone_val,
        location_val,
        role_val,
        farmer_type_val,
        farm_size_val,
        bio_val,
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = NEW.email,
        first_name = CASE 
            WHEN public.profiles.first_name = '' OR public.profiles.first_name IS NULL 
            THEN first_name_val 
            ELSE public.profiles.first_name 
        END,
        last_name = CASE 
            WHEN public.profiles.last_name = '' OR public.profiles.last_name IS NULL 
            THEN last_name_val 
            ELSE public.profiles.last_name 
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
    WHEN others THEN
        -- Log the error (this will appear in Supabase logs)
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW; -- Still return NEW to allow the user creation to proceed
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure the trigger function has necessary permissions
GRANT INSERT ON public.profiles TO postgres;
-- Note: profiles table uses UUID as primary key, no sequence needed

-- Ensure public access to the profiles table
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, UPDATE ON public.profiles TO authenticated; 