-- AGRI-TECH Platform - Marketplace Tables Schema
-- This file contains all the marketplace-related tables for the AGRI-TECH platform

-- =============================================
-- MARKETPLACE TABLES
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

-- Listing Messages Table (for buyer-seller communication)
CREATE TABLE IF NOT EXISTS public.listing_messages (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listing Reviews Table (for buyer feedback after transactions)
CREATE TABLE IF NOT EXISTS public.listing_reviews (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (listing_id, reviewer_id)
);

-- Enable Row Level Security for marketplace
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.land_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produce_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_reviews ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Users can delete their own marketplace listings"
    ON public.marketplace_listings
    FOR DELETE
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Create policies for land listings
CREATE POLICY "Anyone can view land listings"
    ON public.land_listings
    FOR SELECT
    USING (true);
    
CREATE POLICY "Authenticated users can create land listings"
    ON public.land_listings
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.marketplace_listings
            WHERE marketplace_listings.id = listing_id AND marketplace_listings.user_id = auth.uid()
        )
    );
    
CREATE POLICY "Users can update their own land listings"
    ON public.land_listings
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.marketplace_listings
            WHERE marketplace_listings.id = listing_id AND 
            (marketplace_listings.user_id = auth.uid() OR
             EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
             ))
        )
    );

-- Create policies for produce listings
CREATE POLICY "Anyone can view produce listings"
    ON public.produce_listings
    FOR SELECT
    USING (true);
    
CREATE POLICY "Authenticated users can create produce listings"
    ON public.produce_listings
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.marketplace_listings
            WHERE marketplace_listings.id = listing_id AND marketplace_listings.user_id = auth.uid()
        )
    );
    
CREATE POLICY "Users can update their own produce listings"
    ON public.produce_listings
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.marketplace_listings
            WHERE marketplace_listings.id = listing_id AND 
            (marketplace_listings.user_id = auth.uid() OR
             EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
             ))
        )
    );

-- Create policies for service listings
CREATE POLICY "Anyone can view service listings"
    ON public.service_listings
    FOR SELECT
    USING (true);
    
CREATE POLICY "Authenticated users can create service listings"
    ON public.service_listings
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.marketplace_listings
            WHERE marketplace_listings.id = listing_id AND marketplace_listings.user_id = auth.uid()
        )
    );
    
CREATE POLICY "Users can update their own service listings"
    ON public.service_listings
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.marketplace_listings
            WHERE marketplace_listings.id = listing_id AND 
            (marketplace_listings.user_id = auth.uid() OR
             EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
             ))
        )
    );

-- Create policies for user saved listings
CREATE POLICY "Users can view their own saved listings"
    ON public.user_saved_listings
    FOR SELECT
    USING (auth.uid() = user_id);
    
CREATE POLICY "Users can save listings"
    ON public.user_saved_listings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can remove their own saved listings"
    ON public.user_saved_listings
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for listing messages
CREATE POLICY "Users can view their own messages"
    ON public.listing_messages
    FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
    
CREATE POLICY "Users can send messages"
    ON public.listing_messages
    FOR INSERT
    WITH CHECK (auth.uid() = sender_id);
    
CREATE POLICY "Users can update their own messages"
    ON public.listing_messages
    FOR UPDATE
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Create policies for listing reviews
CREATE POLICY "Anyone can view listing reviews"
    ON public.listing_reviews
    FOR SELECT
    USING (true);
    
CREATE POLICY "Authenticated users can create reviews"
    ON public.listing_reviews
    FOR INSERT
    WITH CHECK (auth.uid() = reviewer_id);
    
CREATE POLICY "Users can update their own reviews"
    ON public.listing_reviews
    FOR UPDATE
    USING (auth.uid() = reviewer_id);

-- Create policies for users to delete their own reviews
CREATE POLICY "Users can delete their own reviews"
    ON public.listing_reviews
    FOR DELETE
    USING (
        auth.uid() = reviewer_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- =============================================
-- UTILITY FUNCTIONS
-- =============================================

-- Function to increment listing view count
CREATE OR REPLACE FUNCTION public.increment_listing_view(listing_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.marketplace_listings
    SET views = views + 1
    WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if a listing is expired and update its status
CREATE OR REPLACE FUNCTION public.update_listing_status()
RETURNS VOID AS $$
BEGIN
    UPDATE public.marketplace_listings
    SET status = 'expired'
    WHERE expiry_date < CURRENT_DATE AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Create a cron job to run this function daily
-- Note: This requires pg_cron extension to be enabled
-- SELECT cron.schedule('0 0 * * *', 'SELECT public.update_listing_status();');

-- Function to calculate average rating for a listing
CREATE OR REPLACE FUNCTION public.calculate_listing_avg_rating(p_listing_id INTEGER)
RETURNS NUMERIC AS $$
DECLARE
    avg_rating NUMERIC;
BEGIN
    SELECT AVG(rating) INTO avg_rating
    FROM public.listing_reviews
    WHERE listing_id = p_listing_id;
    
    RETURN COALESCE(avg_rating, 0);
END;
$$ LANGUAGE plpgsql; 

-- =============================================
-- STORED PROCEDURES
-- =============================================

-- Create listing procedure (handles transaction for base listing and specialized details)
CREATE OR REPLACE FUNCTION public.create_listing(
    listing_data JSONB,
    details_data JSONB,
    listing_type TEXT
) RETURNS JSONB AS $$
DECLARE
    new_listing_id INTEGER;
    details_table TEXT;
    result JSONB;
    images_array TEXT[];
    skills_array TEXT[];
    equipment_array TEXT[];
BEGIN
    -- Determine the details table based on listing type
    CASE listing_type
        WHEN 'land' THEN details_table := 'land_listings';
        WHEN 'produce' THEN details_table := 'produce_listings';
        WHEN 'service' THEN details_table := 'service_listings';
        ELSE RAISE EXCEPTION 'Invalid listing type: %', listing_type;
    END CASE;
    
    -- Handle images array properly
    IF listing_data->'images' IS NOT NULL AND jsonb_typeof(listing_data->'images') = 'array' THEN
        -- Convert JSONB array to text array more safely
        SELECT array_agg(elem::text) INTO images_array
        FROM jsonb_array_elements_text(listing_data->'images') AS elem;
    ELSE
        images_array := ARRAY[]::TEXT[];
    END IF;
    
    -- Pre-process service-specific arrays outside the main query
    IF listing_type = 'service' THEN
        -- Handle skills array
        IF details_data->'skills' IS NOT NULL AND jsonb_typeof(details_data->'skills') = 'array' THEN
            SELECT array_agg(elem::text) INTO skills_array
            FROM jsonb_array_elements_text(details_data->'skills') AS elem;
        ELSE
            skills_array := ARRAY[]::TEXT[];
        END IF;
        
        -- Handle equipment array
        IF details_data->'equipment' IS NOT NULL AND jsonb_typeof(details_data->'equipment') = 'array' THEN
            SELECT array_agg(elem::text) INTO equipment_array
            FROM jsonb_array_elements_text(details_data->'equipment') AS elem;
        ELSE
            equipment_array := ARRAY[]::TEXT[];
        END IF;
    END IF;
    
    -- Start transaction
    BEGIN
        -- Insert base listing
        INSERT INTO marketplace_listings (
            title,
            description,
            price,
            is_negotiable,
            type,
            status,
            location,
            district,
            coordinates,
            user_id,
            thumbnail,
            images,
            contact_phone,
            contact_email,
            contact_whatsapp,
            expiry_date,
            featured,
            created_at,
            updated_at
        )
        VALUES (
            listing_data->>'title',
            listing_data->>'description',
            (listing_data->>'price')::NUMERIC,
            COALESCE((listing_data->>'is_negotiable')::BOOLEAN, FALSE),
            listing_type,
            COALESCE(listing_data->>'status', 'active'),
            listing_data->>'location',
            listing_data->>'district',
            CASE 
                WHEN listing_data->>'latitude' IS NOT NULL AND listing_data->>'longitude' IS NOT NULL THEN
                    ST_SetSRID(ST_MakePoint(
                        (listing_data->>'longitude')::FLOAT,
                        (listing_data->>'latitude')::FLOAT
                    ), 4326)
                ELSE NULL
            END,
            (listing_data->>'user_id')::UUID,
            listing_data->>'thumbnail',
            images_array,
            listing_data->>'contact_phone',
            listing_data->>'contact_email',
            listing_data->>'contact_whatsapp',
            CASE 
                WHEN listing_data->>'expiry_date' IS NOT NULL THEN
                    (listing_data->>'expiry_date')::DATE
                ELSE
                    (CURRENT_DATE + INTERVAL '90 days')::DATE -- Default 90 days expiry
            END,
            COALESCE((listing_data->>'featured')::BOOLEAN, FALSE),
            NOW(),
            NOW()
        )
        RETURNING id INTO new_listing_id;
        
        -- Insert specialized details based on listing type
        IF listing_type = 'land' THEN
            INSERT INTO land_listings (
                listing_id,
                size_acres,
                land_type,
                ownership_type,
                is_for_sale,
                lease_term,
                soil_type,
                water_source,
                has_road_access,
                has_electricity,
                cadastral_information,
                created_at,
                updated_at
            )
            VALUES (
                new_listing_id,
                COALESCE((details_data->>'size_acres')::NUMERIC, 0),
                COALESCE(details_data->>'land_type', 'agricultural'),
                COALESCE(details_data->>'ownership_type', 'freehold'),
                COALESCE((details_data->>'is_for_sale')::BOOLEAN, TRUE),
                details_data->>'lease_term',
                details_data->>'soil_type',
                details_data->>'water_source',
                COALESCE((details_data->>'has_road_access')::BOOLEAN, FALSE),
                COALESCE((details_data->>'has_electricity')::BOOLEAN, FALSE),
                details_data->>'cadastral_information',
                NOW(),
                NOW()
            );
        ELSIF listing_type = 'produce' THEN
            INSERT INTO produce_listings (
                listing_id,
                produce_type,
                crop_name,
                quantity,
                unit,
                harvest_date,
                is_organic,
                quality_description,
                min_order_quantity,
                availability,
                created_at,
                updated_at
            )
            VALUES (
                new_listing_id,
                COALESCE(details_data->>'produce_type', 'other'),
                COALESCE(details_data->>'crop_name', 'Not specified'),
                COALESCE((details_data->>'quantity')::NUMERIC, NULL),
                details_data->>'unit',
                CASE 
                    WHEN details_data->>'harvest_date' IS NOT NULL THEN
                        (details_data->>'harvest_date')::DATE
                    ELSE NULL
                END,
                COALESCE((details_data->>'is_organic')::BOOLEAN, FALSE),
                details_data->>'quality_description',
                COALESCE((details_data->>'min_order_quantity')::NUMERIC, NULL),
                COALESCE(details_data->>'availability', 'in stock'),
                NOW(),
                NOW()
            );
        ELSIF listing_type = 'service' THEN
            INSERT INTO service_listings (
                listing_id,
                service_type,
                availability_schedule,
                price_unit,
                experience_years,
                skills,
                equipment,
                service_area,
                qualifications,
                created_at,
                updated_at
            )
            VALUES (
                new_listing_id,
                COALESCE(details_data->>'service_type', 'other'),
                details_data->>'availability_schedule',
                details_data->>'price_unit',
                COALESCE((details_data->>'experience_years')::INTEGER, NULL),
                skills_array,
                equipment_array,
                details_data->>'service_area',
                details_data->>'qualifications',
                NOW(),
                NOW()
            );
        END IF;
        
        -- Prepare result JSON with the new listing ID
        SELECT jsonb_build_object(
            'id', new_listing_id,
            'type', listing_type,
            'status', 'success'
        ) INTO result;
        
        RETURN result;
    EXCEPTION
        WHEN OTHERS THEN
            -- Roll back transaction on error
            RAISE;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 