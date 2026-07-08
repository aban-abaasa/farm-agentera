-- =============================================
-- FIX PROFILE COLUMNS - Add missing columns if they don't exist
-- Run this in Supabase SQL Editor
-- 
-- IMPORTANT: This Supabase project is shared across multiple apps:
-- - ICAN Core
-- - Farm Agent (Backbone)
-- - My Boda Guy
-- - Digital City Era (Supermarket)
--
-- This script ONLY ADDS missing columns, never removes or modifies existing ones.
-- Safe to run - won't break other applications.
-- =============================================

-- First, let's see what currently exists
SELECT 'Current profiles table structure:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

SELECT '---' as separator;
SELECT 'Adding missing columns...' as info;

-- Add missing columns to profiles table if they don't exist
DO $$ 
BEGIN
    -- Add first_name if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'first_name') THEN
        ALTER TABLE public.profiles ADD COLUMN first_name TEXT;
        RAISE NOTICE 'Added first_name column';
    END IF;

    -- Add last_name if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'last_name') THEN
        ALTER TABLE public.profiles ADD COLUMN last_name TEXT;
        RAISE NOTICE 'Added last_name column';
    END IF;

    -- Add phone_number if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'phone_number') THEN
        ALTER TABLE public.profiles ADD COLUMN phone_number TEXT;
        RAISE NOTICE 'Added phone_number column';
    END IF;

    -- Add bio if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'bio') THEN
        ALTER TABLE public.profiles ADD COLUMN bio TEXT;
        RAISE NOTICE 'Added bio column';
    END IF;

    -- Add location if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'location') THEN
        ALTER TABLE public.profiles ADD COLUMN location TEXT;
        RAISE NOTICE 'Added location column';
    END IF;

    -- Add avatar_url if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
        RAISE NOTICE 'Added avatar_url column';
    END IF;

    -- Add cover_photo if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'cover_photo') THEN
        ALTER TABLE public.profiles ADD COLUMN cover_photo TEXT;
        RAISE NOTICE 'Added cover_photo column';
    END IF;

    -- Add farmer_type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'farmer_type') THEN
        ALTER TABLE public.profiles ADD COLUMN farmer_type TEXT;
        RAISE NOTICE 'Added farmer_type column';
    END IF;

    -- Add farm_size if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'farm_size') THEN
        ALTER TABLE public.profiles ADD COLUMN farm_size NUMERIC;
        RAISE NOTICE 'Added farm_size column';
    END IF;

    -- Add farm_location if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'farm_location') THEN
        ALTER TABLE public.profiles ADD COLUMN farm_location TEXT;
        RAISE NOTICE 'Added farm_location column';
    END IF;

    -- Add specialty if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'specialty') THEN
        ALTER TABLE public.profiles ADD COLUMN specialty TEXT;
        RAISE NOTICE 'Added specialty column';
    END IF;

    -- Add role if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user';
        RAISE NOTICE 'Added role column';
    END IF;

    -- Add certifications if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'certifications') THEN
        ALTER TABLE public.profiles ADD COLUMN certifications TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added certifications column';
    END IF;

    -- Add facebook_url if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'facebook_url') THEN
        ALTER TABLE public.profiles ADD COLUMN facebook_url TEXT;
        RAISE NOTICE 'Added facebook_url column';
    END IF;

    -- Add twitter_url if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'twitter_url') THEN
        ALTER TABLE public.profiles ADD COLUMN twitter_url TEXT;
        RAISE NOTICE 'Added twitter_url column';
    END IF;

    -- Add is_verified if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'is_verified') THEN
        ALTER TABLE public.profiles ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added is_verified column';
    END IF;

    -- Add updated_at if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'updated_at') THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added updated_at column';
    END IF;

END $$;

-- Show what was done
SELECT '---' as separator;
SELECT 'Migration complete! Current profiles table structure:' as info;

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Note: All existing data and columns from other apps remain unchanged.
-- This only adds columns that were missing for the Farm Agent app.
