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

-- Enable Row Level Security
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

CREATE POLICY "Users can delete their own events or admins can delete any"
    ON public.community_events
    FOR DELETE
    USING (
        auth.uid() = organizer_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Create policies for event registrations
CREATE POLICY "Users can see their own registrations or event organizers can see all for their events"
    ON public.event_registrations
    FOR SELECT
    USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.community_events
            WHERE community_events.id = event_id AND community_events.organizer_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
    
CREATE POLICY "Authenticated users can register for events"
    ON public.event_registrations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update their own registrations"
    ON public.event_registrations
    FOR UPDATE
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.community_events
            WHERE community_events.id = event_id AND community_events.organizer_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Users can cancel their own registrations or organizers can cancel any"
    ON public.event_registrations
    FOR DELETE
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.community_events
            WHERE community_events.id = event_id AND community_events.organizer_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Function to get attendees count for an event
CREATE OR REPLACE FUNCTION public.get_event_attendees_count(event_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    attendee_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO attendee_count
    FROM public.event_registrations
    WHERE event_registrations.event_id = get_event_attendees_count.event_id
    AND status = 'confirmed';
    
    RETURN attendee_count;
END;
$$ LANGUAGE plpgsql;

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