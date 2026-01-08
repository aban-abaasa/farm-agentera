-- =============================================
-- USER REPUTATION AND ACHIEVEMENT SYSTEM
-- =============================================

-- User Reputation/Points System
CREATE TABLE IF NOT EXISTS public.user_reputation (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    total_points INTEGER DEFAULT 0,
    posts_created INTEGER DEFAULT 0,
    helpful_answers INTEGER DEFAULT 0,
    questions_solved INTEGER DEFAULT 0,
    community_contributions INTEGER DEFAULT 0,
    expert_level TEXT DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced', 'expert', 'master'
    badges TEXT[] DEFAULT '{}', -- Array of earned badge names
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reputation History (Track point changes)
CREATE TABLE IF NOT EXISTS public.reputation_history (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'post_created', 'answer_accepted', 'helpful_vote', 'event_attended'
    points_awarded INTEGER NOT NULL,
    reference_type TEXT, -- 'post', 'answer', 'comment', 'event'
    reference_id INTEGER,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Achievements/Badges
CREATE TABLE IF NOT EXISTS public.community_badges (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon TEXT, -- Badge icon URL or identifier
    category TEXT NOT NULL, -- 'participation', 'expertise', 'helping', 'special'
    criteria JSON, -- JSON object describing unlock criteria
    points_required INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Badge Achievements
CREATE TABLE IF NOT EXISTS public.user_badges (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id INTEGER REFERENCES public.community_badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress JSON, -- Track progress towards badge
    UNIQUE(user_id, badge_id)
);

-- Community Experts Table (Verified experts in specific areas)
CREATE TABLE IF NOT EXISTS public.community_experts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    expertise_area TEXT NOT NULL, -- 'crop_farming', 'livestock', 'irrigation', 'pest_control', etc.
    verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
    credentials TEXT, -- Description of qualifications
    years_experience INTEGER,
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    verification_date TIMESTAMP WITH TIME ZONE,
    is_available_for_consultation BOOLEAN DEFAULT TRUE,
    consultation_rate DECIMAL(10,2), -- Hourly rate if paid consultations
    contact_preference TEXT DEFAULT 'platform', -- 'platform', 'email', 'phone'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_reputation_user_id ON public.user_reputation(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reputation_total_points ON public.user_reputation(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_reputation_history_user_id ON public.reputation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reputation_history_action_type ON public.reputation_history(action_type);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON public.user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_community_experts_user_id ON public.community_experts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_experts_expertise_area ON public.community_experts(expertise_area);

-- Enable Row Level Security
ALTER TABLE public.user_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_experts ENABLE ROW LEVEL SECURITY;

-- User Reputation Policies
CREATE POLICY "Anyone can view user reputation"
    ON public.user_reputation
    FOR SELECT
    USING (true);
    
CREATE POLICY "System can update reputation"
    ON public.user_reputation
    FOR ALL
    USING (true);

-- Reputation History Policies
CREATE POLICY "Users can view their own reputation history"
    ON public.reputation_history
    FOR SELECT
    USING (auth.uid() = user_id);

-- Community Badges Policies
CREATE POLICY "Anyone can view community badges"
    ON public.community_badges
    FOR SELECT
    USING (is_active = true);

-- User Badges Policies
CREATE POLICY "Anyone can view user badges"
    ON public.user_badges
    FOR SELECT
    USING (true);

-- Community Experts Policies
CREATE POLICY "Anyone can view verified experts"
    ON public.community_experts
    FOR SELECT
    USING (verification_status = 'verified');
    
CREATE POLICY "Users can apply to be experts"
    ON public.community_experts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update their expert profile"
    ON public.community_experts
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Insert default community badges
INSERT INTO public.community_badges (name, description, icon, category, criteria, points_required) VALUES
('Welcome Badge', 'Awarded for joining the community', 'EmojiEvents', 'participation', '{"action": "profile_created"}', 0),
('First Post', 'Created your first community post', 'Create', 'participation', '{"action": "first_post"}', 5),
('Helpful Member', 'Received 10 likes on your posts', 'ThumbUp', 'helping', '{"likes_received": 10}', 50),
('Question Master', 'Asked 5 thoughtful questions', 'Help', 'participation', '{"questions_asked": 5}', 25),
('Answer Hero', 'Provided 10 helpful answers', 'Psychology', 'helping', '{"answers_given": 10}', 100),
('Expert Contributor', 'Had 3 answers accepted as solutions', 'School', 'expertise', '{"accepted_answers": 3}', 150),
('Community Star', 'Reached 500 reputation points', 'Star', 'expertise', '{"total_points": 500}', 500),
('Event Organizer', 'Organized your first community event', 'Event', 'participation', '{"events_organized": 1}', 75),
('Mentor', 'Helped 20 community members with answers', 'Support', 'helping', '{"users_helped": 20}', 200)
ON CONFLICT (name) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'User Reputation and Achievement System tables created successfully!';
END $$;
