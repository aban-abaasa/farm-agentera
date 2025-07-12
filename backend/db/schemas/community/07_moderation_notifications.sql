-- =============================================
-- MODERATION AND NOTIFICATIONS SYSTEM
-- =============================================

-- Community Reports (Content moderation)
CREATE TABLE IF NOT EXISTS public.community_reports (
    id SERIAL PRIMARY KEY,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reported_content_type TEXT NOT NULL, -- 'post', 'comment', 'question', 'answer', 'user'
    reported_content_id INTEGER NOT NULL,
    reported_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reason TEXT NOT NULL, -- 'spam', 'inappropriate', 'misinformation', 'harassment', 'other'
    description TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'dismissed'
    moderator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    moderator_notes TEXT,
    action_taken TEXT, -- 'none', 'warning', 'content_removed', 'user_suspended', 'user_banned'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Community Notifications
CREATE TABLE IF NOT EXISTS public.community_notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'new_comment', 'answer_accepted', 'question_answered', 'post_liked', 'event_reminder'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    reference_type TEXT, -- 'post', 'comment', 'question', 'event'
    reference_id INTEGER,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Moderations
CREATE TABLE IF NOT EXISTS public.content_moderations (
    id SERIAL PRIMARY KEY,
    content_type TEXT NOT NULL, -- 'post', 'comment', 'question', 'answer'
    content_id INTEGER NOT NULL,
    moderator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- 'approved', 'rejected', 'edited', 'flagged'
    reason TEXT,
    original_content TEXT, -- Backup of original content before moderation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opportunities Table for Investments Page
CREATE TABLE IF NOT EXISTS public.opportunities (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL, -- Land Lease, Agri-Project, Support Request
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    summary TEXT NOT NULL,
    image TEXT, -- URL to image
    owner TEXT NOT NULL,
    role TEXT NOT NULL, -- Land Owner, Investor, Supporter
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_community_reports_reporter_id ON public.community_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_community_reports_reported_user_id ON public.community_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_community_reports_status ON public.community_reports(status);
CREATE INDEX IF NOT EXISTS idx_community_notifications_user_id ON public.community_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_community_notifications_is_read ON public.community_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_content_moderations_content_type_id ON public.content_moderations(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON public.opportunities(type);

-- Enable Row Level Security
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_moderations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Community Reports Policies
CREATE POLICY "Authenticated users can create reports"
    ON public.community_reports
    FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);
    
CREATE POLICY "Admins can view all reports"
    ON public.community_reports
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
    
CREATE POLICY "Users can view their own reports"
    ON public.community_reports
    FOR SELECT
    USING (auth.uid() = reporter_id);

-- Community Notifications Policies
CREATE POLICY "Users can view their own notifications"
    ON public.community_notifications
    FOR SELECT
    USING (auth.uid() = user_id);
    
CREATE POLICY "System can create notifications"
    ON public.community_notifications
    FOR INSERT
    WITH CHECK (true);
    
CREATE POLICY "Users can update their notification status"
    ON public.community_notifications
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Content Moderations Policies
CREATE POLICY "Admins can manage content moderations"
    ON public.content_moderations
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Opportunities Policies
CREATE POLICY "Anyone can view opportunities"
    ON public.opportunities
    FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create opportunities"
    ON public.opportunities
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own opportunities"
    ON public.opportunities
    FOR UPDATE
    USING (true);

CREATE POLICY "Users can delete their own opportunities"
    ON public.opportunities
    FOR DELETE
    USING (true);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Moderation and Notifications System tables created successfully!';
END $$;
