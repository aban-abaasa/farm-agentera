-- =============================================
-- COMMUNITY EVENTS TABLES
-- =============================================

-- Community Events Table (New for events feature)
CREATE TABLE IF NOT EXISTS public.community_events (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'webinar', 'workshop', 'field_visit', 'conference', 'market_day'
    location TEXT, -- Physical location or 'online'
    virtual_link TEXT, -- For online events
    organizer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    category_id INTEGER REFERENCES public.forum_categories(id) ON DELETE SET NULL,
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    price DECIMAL(10,2) DEFAULT 0.00, -- Event fee if any
    currency TEXT DEFAULT 'UGX',
    image_url TEXT,
    status TEXT DEFAULT 'upcoming', -- 'upcoming', 'ongoing', 'completed', 'cancelled'
    is_featured BOOLEAN DEFAULT FALSE,
    requirements TEXT, -- Prerequisites or what to bring
    contact_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event Participants Table
CREATE TABLE IF NOT EXISTS public.event_participants (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES public.community_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    attendance_status TEXT DEFAULT 'registered', -- 'registered', 'attended', 'no_show'
    payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'refunded'
    payment_reference TEXT,
    notes TEXT,
    UNIQUE(event_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_community_events_start_datetime ON public.community_events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_community_events_status ON public.community_events(status);
CREATE INDEX IF NOT EXISTS idx_community_events_organizer_id ON public.community_events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_community_events_upcoming ON public.community_events(status, start_datetime) WHERE status = 'upcoming';
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON public.event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON public.event_participants(user_id);

-- Enable Row Level Security
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

-- Community Events Policies
CREATE POLICY "Anyone can view active events"
    ON public.community_events
    FOR SELECT
    USING (status != 'cancelled');
    
CREATE POLICY "Authenticated users can create events"
    ON public.community_events
    FOR INSERT
    WITH CHECK (auth.uid() = organizer_id);
    
CREATE POLICY "Organizers can update their events"
    ON public.community_events
    FOR UPDATE
    USING (auth.uid() = organizer_id);

-- Event Participants Policies
CREATE POLICY "Anyone can view event participants count"
    ON public.event_participants
    FOR SELECT
    USING (true);
    
CREATE POLICY "Users can register for events"
    ON public.event_participants
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update their registration"
    ON public.event_participants
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own event registrations"
    ON public.event_participants
    FOR SELECT
    USING (auth.uid() = user_id);

-- Insert sample community events
-- INSERT INTO public.community_events (title, description, event_type, location, start_datetime, end_datetime, max_participants, organizer_id) VALUES
-- ('Sustainable Farming Workshop', 'Learn about organic farming practices and sustainable agriculture techniques that can improve your yield while protecting the environment.', 'workshop', 'Kampala Agricultural Center', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '4 hours', 50, NULL),
-- ('Digital Marketing for Farmers', 'Discover how to use social media and digital platforms to market your agricultural products effectively and reach more customers.', 'webinar', 'online', NOW() + INTERVAL '14 days', NOW() + INTERVAL '14 days' + INTERVAL '2 hours', 100, NULL),
-- ('Coffee Processing Field Visit', 'Visit a successful coffee processing facility and learn about post-harvest handling, quality control, and value addition.', 'field_visit', 'Mukono Coffee Estate', NOW() + INTERVAL '21 days', NOW() + INTERVAL '21 days' + INTERVAL '6 hours', 30, NULL)
-- ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Community Events tables created successfully!';
END $$;
