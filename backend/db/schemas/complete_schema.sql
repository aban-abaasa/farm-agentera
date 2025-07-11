-- AGRI-TECH Platform - Complete Database Schema
-- This file contains all the necessary tables and configurations for the AGRI-TECH platform
-- Run this in your Supabase SQL Editor to set up the database

-- =============================================
-- CLEANUP - Drop existing tables if needed
-- =============================================
-- Uncomment this section if you want to completely reset the database

/*
-- Drop community tables
DROP TABLE IF EXISTS public.question_followers CASCADE;
DROP TABLE IF EXISTS public.answer_votes CASCADE;
DROP TABLE IF EXISTS public.question_answers CASCADE;
DROP TABLE IF EXISTS public.question_tags CASCADE;
DROP TABLE IF EXISTS public.community_questions CASCADE;
DROP TABLE IF EXISTS public.comment_likes CASCADE;
DROP TABLE IF EXISTS public.post_likes CASCADE;
DROP TABLE IF EXISTS public.post_comments CASCADE;
DROP TABLE IF EXISTS public.post_tags CASCADE;
DROP TABLE IF EXISTS public.community_posts CASCADE;
DROP TABLE IF EXISTS public.forum_tags CASCADE;
DROP TABLE IF EXISTS public.forum_categories CASCADE;

-- Drop marketplace tables
DROP TABLE IF EXISTS public.listing_messages CASCADE;
DROP TABLE IF EXISTS public.listing_reviews CASCADE;
DROP TABLE IF EXISTS public.user_saved_listings CASCADE;
DROP TABLE IF EXISTS public.service_listings CASCADE;
DROP TABLE IF EXISTS public.produce_listings CASCADE;
DROP TABLE IF EXISTS public.land_listings CASCADE;
DROP TABLE IF EXISTS public.marketplace_listings CASCADE;

-- Drop events tables
DROP TABLE IF EXISTS public.event_registrations CASCADE;
DROP TABLE IF EXISTS public.community_events CASCADE;

-- Drop resources tables
DROP TABLE IF EXISTS public.resource_ratings CASCADE;
DROP TABLE IF EXISTS public.resource_tag_relationships CASCADE;
DROP TABLE IF EXISTS public.resource_tags CASCADE;
DROP TABLE IF EXISTS public.resources CASCADE;
DROP TABLE IF EXISTS public.resource_categories CASCADE;

-- Drop profiles table last
DROP TABLE IF EXISTS public.profiles CASCADE;
*/

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
    farmer_type TEXT, -- e.g. 'crop', 'livestock', 'mixed'
    farm_size NUMERIC,
    farm_location TEXT,
    role TEXT DEFAULT 'user',
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

-- =============================================
-- RESOURCES
-- =============================================

-- Resource Categories Table
CREATE TABLE IF NOT EXISTS public.resource_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT, -- SVG or icon name
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Resources Table
CREATE TABLE IF NOT EXISTS public.resources (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    content TEXT,
    type TEXT NOT NULL, -- 'guide', 'document', 'video', etc.
    thumbnail TEXT, -- URL to thumbnail image
    file_url TEXT, -- URL to downloadable file if applicable
    external_url TEXT, -- External URL if applicable
    source TEXT, -- Source/author of the resource
    featured BOOLEAN DEFAULT FALSE,
    category_id INTEGER REFERENCES public.resource_categories(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    views INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Resource Tags Table
CREATE TABLE IF NOT EXISTS public.resource_tags (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resource Tag Relationships
CREATE TABLE IF NOT EXISTS public.resource_tag_relationships (
    resource_id INTEGER REFERENCES public.resources(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES public.resource_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (resource_id, tag_id)
);

-- Resource Ratings Table
CREATE TABLE IF NOT EXISTS public.resource_ratings (
    id SERIAL PRIMARY KEY,
    resource_id INTEGER REFERENCES public.resources(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (resource_id, user_id)
);

-- Enable Row Level Security for resources tables
ALTER TABLE public.resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_tag_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for resource categories
CREATE POLICY "Anyone can view resource categories"
    ON public.resource_categories
    FOR SELECT
    USING (true);
    
CREATE POLICY "Only admins can insert resource categories"
    ON public.resource_categories
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ));
    
CREATE POLICY "Only admins can update resource categories"
    ON public.resource_categories
    FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ));

-- Create policies for resources
CREATE POLICY "Anyone can view resources"
    ON public.resources
    FOR SELECT
    USING (true);
    
CREATE POLICY "Authenticated users can create resources"
    ON public.resources
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
    
CREATE POLICY "Users can update their own resources or admins can update any"
    ON public.resources
    FOR UPDATE
    USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- =============================================
-- EVENTS
-- =============================================

-- Community Events Table
CREATE TABLE IF NOT EXISTS public.community_events (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT,  -- Store as text like "10:00 AM - 02:00 PM"
    end_date DATE, -- For multi-day events
    location TEXT NOT NULL,
    address TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    category TEXT NOT NULL, -- 'Workshop', 'Seminar', 'Market', etc.
    imageUrl TEXT, -- URL to event image
    organizer TEXT NOT NULL,
    organizer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    website TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    cost NUMERIC DEFAULT 0, -- 0 for free events
    is_online BOOLEAN DEFAULT FALSE,
    meeting_link TEXT, -- For online events
    max_attendees INTEGER, -- NULL for unlimited
    is_featured BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'upcoming', -- 'upcoming', 'ongoing', 'completed', 'cancelled'
    tags TEXT[], -- Array of tags
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Event Registrations Table
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES public.community_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'confirmed', -- 'confirmed', 'cancelled', 'waitlisted'
    attended BOOLEAN DEFAULT FALSE,
    notes TEXT,
    UNIQUE (event_id, user_id)
);

-- Enable Row Level Security for events
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for community events
CREATE POLICY "Anyone can view community events"
    ON public.community_events
    FOR SELECT
    USING (true);
    
CREATE POLICY "Authenticated users can create community events"
    ON public.community_events
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
    
CREATE POLICY "Users can update their own events or admins can update any"
    ON public.community_events
    FOR UPDATE
    USING (
        auth.uid() = organizer_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- =============================================
-- MARKETPLACE
-- =============================================

-- Marketplace Listings Table (base table for all listing types)
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC, -- Price in UGX, can be null for negotiable items
    is_negotiable BOOLEAN DEFAULT FALSE,
    type TEXT NOT NULL, -- 'land', 'produce', 'service'
    status TEXT DEFAULT 'active', -- 'active', 'sold', 'expired', 'unavailable'
    location TEXT NOT NULL, -- General location name
    district TEXT,
    coordinates GEOMETRY(Point, 4326), -- Geographic coordinates
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    thumbnail TEXT, -- URL to the main image
    images TEXT[], -- Array of image URLs
    contact_phone TEXT,
    contact_email TEXT,
    contact_whatsapp TEXT,
    expiry_date DATE, -- When the listing expires
    views INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create spatial index for coordinates
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_coordinates 
ON public.marketplace_listings USING GIST(coordinates);

-- Land Listings Table (extends marketplace_listings)
CREATE TABLE IF NOT EXISTS public.land_listings (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
    size_acres NUMERIC NOT NULL,
    land_type TEXT NOT NULL, -- 'agricultural', 'residential', 'commercial', etc.
    ownership_type TEXT NOT NULL, -- 'freehold', 'leasehold', 'mailo', etc.
    is_for_sale BOOLEAN DEFAULT TRUE, -- FALSE means for rent/lease
    lease_term TEXT, -- If for leasing, e.g. '1 year', '5 years', etc.
    soil_type TEXT,
    water_source TEXT,
    has_road_access BOOLEAN DEFAULT FALSE,
    has_electricity BOOLEAN DEFAULT FALSE,
    cadastral_information TEXT, -- Legal/survey information
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Produce Listings Table (extends marketplace_listings)
CREATE TABLE IF NOT EXISTS public.produce_listings (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
    produce_type TEXT NOT NULL, -- 'fruits', 'vegetables', 'grains', etc.
    crop_name TEXT NOT NULL,
    quantity NUMERIC,
    unit TEXT, -- 'kg', 'ton', 'bag', etc.
    harvest_date DATE,
    is_organic BOOLEAN DEFAULT FALSE,
    quality_description TEXT,
    min_order_quantity NUMERIC,
    availability TEXT, -- 'in stock', 'pre-order', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Service Listings Table (extends marketplace_listings)
CREATE TABLE IF NOT EXISTS public.service_listings (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL, -- 'tractor', 'consulting', 'labor', etc.
    availability_schedule TEXT, -- When the service is available
    price_unit TEXT, -- 'per hour', 'per acre', 'per day', etc.
    experience_years INTEGER,
    skills TEXT[],
    equipment TEXT[], -- Equipment used
    service_area TEXT, -- Geographic area covered
    qualifications TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- User Saved Listings Table
CREATE TABLE IF NOT EXISTS public.user_saved_listings (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id INTEGER REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, listing_id)
);

-- Enable Row Level Security for marketplace
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.land_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produce_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_listings ENABLE ROW LEVEL SECURITY;

-- Create policies for marketplace listings
CREATE POLICY "Anyone can view marketplace listings"
    ON public.marketplace_listings
    FOR SELECT
    USING (true);
    
CREATE POLICY "Authenticated users can create marketplace listings"
    ON public.marketplace_listings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update their own marketplace listings"
    ON public.marketplace_listings
    FOR UPDATE
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- =============================================
-- COMMUNITY
-- =============================================

-- Forum Categories Table
CREATE TABLE IF NOT EXISTS public.forum_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE,
    icon TEXT, -- Icon identifier or URL
    parent_id INTEGER REFERENCES public.forum_categories(id) ON DELETE SET NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Forum Tags Table
CREATE TABLE IF NOT EXISTS public.forum_tags (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Posts Table
CREATE TABLE IF NOT EXISTS public.community_posts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category_id INTEGER REFERENCES public.forum_categories(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'published', -- 'published', 'draft', 'archived'
    is_pinned BOOLEAN DEFAULT FALSE, -- Featured/pinned posts
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    thumbnail TEXT, -- URL to thumbnail image
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Post Comments Table
CREATE TABLE IF NOT EXISTS public.post_comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    parent_id INTEGER REFERENCES public.post_comments(id) ON DELETE CASCADE, -- For nested comments
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Community Questions Table (for Q&A section)
CREATE TABLE IF NOT EXISTS public.community_questions (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category_id INTEGER REFERENCES public.forum_categories(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    views INTEGER DEFAULT 0,
    status TEXT DEFAULT 'open', -- 'open', 'closed', 'answered'
    accepted_answer_id INTEGER, -- Filled in after an answer is accepted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Question Answers Table
CREATE TABLE IF NOT EXISTS public.question_answers (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES public.community_questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_accepted BOOLEAN DEFAULT FALSE,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Populate the constraint for accepted_answer_id
ALTER TABLE public.community_questions
ADD CONSTRAINT community_questions_accepted_answer_id_fkey
FOREIGN KEY (accepted_answer_id) REFERENCES public.question_answers(id) ON DELETE SET NULL;

-- Enable Row Level Security for community
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_answers ENABLE ROW LEVEL SECURITY;

-- Create policies for community posts
CREATE POLICY "Anyone can view published posts"
    ON public.community_posts
    FOR SELECT
    USING (status = 'published' OR auth.uid() = user_id);
    
CREATE POLICY "Authenticated users can create posts"
    ON public.community_posts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update their own posts"
    ON public.community_posts
    FOR UPDATE
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- =============================================
-- INITIAL DATA
-- =============================================

-- Insert initial forum categories
INSERT INTO public.forum_categories (name, description, slug, icon, display_order)
VALUES 
('General Discussion', 'General farming discussions', 'general-discussion', 'chat', 1),
('Crop Farming', 'Discussions about crop farming', 'crop-farming', 'grass', 2),
('Livestock', 'Discussions about livestock farming', 'livestock', 'pets', 3),
('Market Prices', 'Updates and discussions about agricultural market prices', 'market-prices', 'trending_up', 4),
('Equipment & Technology', 'Discussions about farming equipment and technology', 'equipment-technology', 'agriculture', 5),
('Weather & Climate', 'Weather forecasts and climate discussions', 'weather-climate', 'cloud', 6),
('Help & Support', 'Get help with farming issues', 'help-support', 'help', 7);

-- Insert initial resource categories
INSERT INTO public.resource_categories (name, description, icon)
VALUES 
('Farming Guides', 'Step-by-step guides for various farming activities', 'menu_book'),
('Market Information', 'Market prices and trends', 'trending_up'),
('Government Programs', 'Information about government agricultural programs', 'policy'),
('Training Materials', 'Educational materials for farmers', 'school'),
('Research Papers', 'Agricultural research findings', 'science'),
('Videos', 'Instructional videos', 'videocam'),
('Tools & Calculators', 'Tools to help with farm planning', 'calculate');

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Drop triggers and functions if they already exist
DROP TRIGGER IF EXISTS update_event_status_trigger ON public.community_events;
DROP FUNCTION IF EXISTS public.update_event_status();
DROP FUNCTION IF EXISTS public.increment_post_view(INTEGER);
DROP FUNCTION IF EXISTS public.increment_question_view(INTEGER);

-- Function to update event status based on dates
CREATE OR REPLACE FUNCTION public.update_event_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if event is in the past
    IF NEW.date < CURRENT_DATE THEN
        NEW.status := 'completed';
    -- Check if event is today
    ELSIF NEW.date = CURRENT_DATE THEN
        NEW.status := 'ongoing';
    ELSE
        NEW.status := 'upcoming';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic event status updates
CREATE TRIGGER update_event_status_trigger
    BEFORE INSERT OR UPDATE ON public.community_events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_event_status();

-- Function to increment post view count
CREATE OR REPLACE FUNCTION public.increment_post_view(post_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.community_posts
    SET views = views + 1
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment question view count
CREATE OR REPLACE FUNCTION public.increment_question_view(question_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.community_questions
    SET views = views + 1
    WHERE id = question_id;
END;
$$ LANGUAGE plpgsql; 