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

-- Listing Reviews Table
CREATE TABLE IF NOT EXISTS public.listing_reviews (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
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

-- Enable Row Level Security
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.land_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produce_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_messages ENABLE ROW LEVEL SECURITY;

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
    
CREATE POLICY "Users can create land listings for their marketplace listings"
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
            WHERE marketplace_listings.id = listing_id AND marketplace_listings.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Users can delete their own land listings"
    ON public.land_listings
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.marketplace_listings
            WHERE marketplace_listings.id = listing_id AND marketplace_listings.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Similar policies for produce listings
CREATE POLICY "Anyone can view produce listings"
    ON public.produce_listings
    FOR SELECT
    USING (true);
    
-- Rest of policies for produce listings follow the same pattern as land listings

-- Similar policies for service listings
CREATE POLICY "Anyone can view service listings"
    ON public.service_listings
    FOR SELECT
    USING (true);
    
-- Rest of policies for service listings follow the same pattern as land listings

-- Create policies for user saved listings
CREATE POLICY "Users can see their own saved listings"
    ON public.user_saved_listings
    FOR SELECT
    USING (auth.uid() = user_id);
    
CREATE POLICY "Users can save listings"
    ON public.user_saved_listings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can remove their saved listings"
    ON public.user_saved_listings
    FOR DELETE
    USING (auth.uid() = user_id);

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

-- Create policies for listing messages
CREATE POLICY "Users can see messages they sent or received"
    ON public.listing_messages
    FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
    
CREATE POLICY "Users can send messages"
    ON public.listing_messages
    FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

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