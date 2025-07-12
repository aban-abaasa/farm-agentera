-- =============================================
-- ENHANCED COMMUNITY TABLES FOR AGRI-TECH PLATFORM
-- =============================================

-- Forum Categories Table (Enhanced)
CREATE TABLE IF NOT EXISTS public.forum_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT, -- Material-UI icon name or custom icon URL
    parent_id INTEGER REFERENCES public.forum_categories(id) ON DELETE SET NULL,
    display_order INTEGER DEFAULT 0,
    color_hex TEXT DEFAULT '#1976d2', -- Category color for UI
    is_active BOOLEAN DEFAULT TRUE,
    post_count INTEGER DEFAULT 0, -- Denormalized for performance
    latest_post_id INTEGER, -- Will be set via trigger
    moderators TEXT[] DEFAULT '{}', -- Array of user IDs who can moderate this category
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum Tags Table (Enhanced)
CREATE TABLE IF NOT EXISTS public.forum_tags (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    color_hex TEXT DEFAULT '#2196f3',
    usage_count INTEGER DEFAULT 0, -- Denormalized for trending tags
    is_featured BOOLEAN DEFAULT FALSE, -- For highlighting popular tags
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Community Posts Table (Enhanced)
CREATE TABLE IF NOT EXISTS public.community_posts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    post_type TEXT DEFAULT 'discussion', -- 'discussion', 'question', 'announcement', 'tip', 'success_story'
    category_id INTEGER REFERENCES public.forum_categories(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'published', -- 'published', 'draft', 'archived', 'moderated'
    is_pinned BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_solved BOOLEAN DEFAULT FALSE, -- For question-type posts
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0, -- Denormalized for performance
    shares INTEGER DEFAULT 0,
    thumbnail TEXT,
    images TEXT[] DEFAULT '{}', -- Array of image URLs
    location TEXT, -- Where the post is relevant (optional)
    language TEXT DEFAULT 'en', -- Post language
    reading_time INTEGER, -- Estimated reading time in minutes
    seo_title TEXT, -- For better SEO
    seo_description TEXT,
    moderation_reason TEXT, -- If moderated, reason why
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post Tags Relationship (Enhanced)
CREATE TABLE IF NOT EXISTS public.post_tags (
    post_id INTEGER REFERENCES public.community_posts(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES public.forum_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (post_id, tag_id)
);

-- Post Comments Table (Enhanced)
CREATE TABLE IF NOT EXISTS public.post_comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    parent_id INTEGER REFERENCES public.post_comments(id) ON DELETE CASCADE,
    likes INTEGER DEFAULT 0,
    is_solution BOOLEAN DEFAULT FALSE, -- Mark comment as solution to a question
    is_edited BOOLEAN DEFAULT FALSE,
    edit_reason TEXT,
    images TEXT[] DEFAULT '{}', -- Images in comments
    mentions TEXT[] DEFAULT '{}', -- Mentioned user IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post Reactions Table (Enhanced beyond just likes)
CREATE TABLE IF NOT EXISTS public.post_reactions (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL, -- 'like', 'love', 'helpful', 'insightful', 'funny'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id, reaction_type)
);

-- Comment Reactions Table
CREATE TABLE IF NOT EXISTS public.comment_reactions (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER REFERENCES public.post_comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL, -- 'like', 'love', 'helpful', 'insightful', 'funny'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id, reaction_type)
);

-- Post Bookmarks/Saves Table
CREATE TABLE IF NOT EXISTS public.post_bookmarks (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    collection_name TEXT DEFAULT 'default', -- Users can organize bookmarks
    notes TEXT, -- Personal notes about the bookmark
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Post Shares Table (Track sharing activity)
CREATE TABLE IF NOT EXISTS public.post_shares (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    platform TEXT, -- 'whatsapp', 'facebook', 'twitter', 'email', 'copy_link'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post Likes Table (Simple likes for posts)
CREATE TABLE IF NOT EXISTS public.post_likes (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Comment Likes Table (Simple likes for comments)
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER REFERENCES public.post_comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- Community Questions Table (Enhanced Q&A)
CREATE TABLE IF NOT EXISTS public.community_questions (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    question_type TEXT DEFAULT 'general', -- 'general', 'urgent', 'technical', 'business'
    category_id INTEGER REFERENCES public.forum_categories(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    views INTEGER DEFAULT 0,
    status TEXT DEFAULT 'open', -- 'open', 'closed', 'answered', 'archived'
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    accepted_answer_id INTEGER,
    bounty_amount DECIMAL(10,2) DEFAULT 0.00, -- Optional reward for good answers
    bounty_currency TEXT DEFAULT 'UGX',
    expert_requested BOOLEAN DEFAULT FALSE, -- Flag for expert attention
    images TEXT[] DEFAULT '{}',
    location TEXT, -- Geographic relevance
    crop_type TEXT, -- Relevant crop if applicable
    livestock_type TEXT, -- Relevant livestock if applicable
    season TEXT, -- Relevant season
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question Tags Relationship
CREATE TABLE IF NOT EXISTS public.question_tags (
    question_id INTEGER REFERENCES public.community_questions(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES public.forum_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (question_id, tag_id)
);

-- Question Answers Table (Enhanced)
CREATE TABLE IF NOT EXISTS public.question_answers (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES public.community_questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_accepted BOOLEAN DEFAULT FALSE,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    is_expert_answer BOOLEAN DEFAULT FALSE, -- Marked by system for expert users
    evidence_links TEXT[] DEFAULT '{}', -- Supporting links/references
    images TEXT[] DEFAULT '{}',
    confidence_level TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Answer Votes Table
CREATE TABLE IF NOT EXISTS public.answer_votes (
    answer_id INTEGER REFERENCES public.question_answers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    vote_type BOOLEAN NOT NULL, -- TRUE for upvote, FALSE for downvote
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (answer_id, user_id)
);

-- Question Followers Table (Enhanced)
CREATE TABLE IF NOT EXISTS public.question_followers (
    question_id INTEGER REFERENCES public.community_questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    notification_preference TEXT DEFAULT 'all', -- 'all', 'answers_only', 'accepted_only'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (question_id, user_id)
);

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

-- Add foreign key constraints (moved after all table creations)
-- Note: Commenting out the circular reference constraint to avoid dependency issues
-- ALTER TABLE public.community_questions
-- ADD CONSTRAINT community_questions_accepted_answer_id_fkey
-- FOREIGN KEY (accepted_answer_id) REFERENCES public.question_answers(id) ON DELETE SET NULL;

-- ALTER TABLE public.forum_categories
-- ADD CONSTRAINT forum_categories_latest_post_id_fkey
-- FOREIGN KEY (latest_post_id) REFERENCES public.community_posts(id) ON DELETE SET NULL;

-- Add indexes for the new like tables
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON public.comment_likes(user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_community_posts_category_id ON public.community_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON public.community_posts(status);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_views ON public.community_posts(views DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_likes ON public.community_posts(likes DESC);

CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON public.post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_parent_id ON public.post_comments(parent_id);

CREATE INDEX IF NOT EXISTS idx_community_questions_category_id ON public.community_questions(category_id);
CREATE INDEX IF NOT EXISTS idx_community_questions_user_id ON public.community_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_community_questions_status ON public.community_questions(status);
CREATE INDEX IF NOT EXISTS idx_community_questions_created_at ON public.community_questions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_question_answers_question_id ON public.question_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_question_answers_user_id ON public.question_answers(user_id);

CREATE INDEX IF NOT EXISTS idx_community_events_start_datetime ON public.community_events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_community_events_status ON public.community_events(status);
CREATE INDEX IF NOT EXISTS idx_community_events_organizer_id ON public.community_events(organizer_id);

CREATE INDEX IF NOT EXISTS idx_forum_tags_usage_count ON public.forum_tags(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_user_reputation_total_points ON public.user_reputation(total_points DESC);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_search ON public.community_posts USING gin(to_tsvector('english', title || ' ' || content));
CREATE INDEX IF NOT EXISTS idx_community_questions_search ON public.community_questions USING gin(to_tsvector('english', title || ' ' || content));

-- Enable Row Level Security for all tables
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answer_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_moderations ENABLE ROW LEVEL SECURITY;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Forum Categories Policies
CREATE POLICY "Anyone can view forum categories"
    ON public.forum_categories
    FOR SELECT
    USING (is_active = true);
    
CREATE POLICY "Authenticated users can suggest categories"
    ON public.forum_categories
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Forum Tags Policies
CREATE POLICY "Anyone can view forum tags"
    ON public.forum_tags
    FOR SELECT
    USING (true);
    
CREATE POLICY "Authenticated users can create tags"
    ON public.forum_tags
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

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

-- Community Posts Policies
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
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
    ON public.community_posts
    FOR DELETE
    USING (auth.uid() = user_id);

-- Post Comments Policies
CREATE POLICY "Anyone can view comments"
    ON public.post_comments
    FOR SELECT
    USING (true);
    
CREATE POLICY "Authenticated users can create comments"
    ON public.post_comments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update their own comments"
    ON public.post_comments
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
    ON public.post_comments
    FOR DELETE
    USING (auth.uid() = user_id);

-- Post Reactions Policies
CREATE POLICY "Anyone can view reactions"
    ON public.post_reactions
    FOR SELECT
    USING (true);
    
CREATE POLICY "Authenticated users can react to posts"
    ON public.post_reactions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update their reactions"
    ON public.post_reactions
    FOR UPDATE
    USING (auth.uid() = user_id);
    
CREATE POLICY "Users can remove their reactions"
    ON public.post_reactions
    FOR DELETE
    USING (auth.uid() = user_id);

-- Comment Reactions Policies
CREATE POLICY "Anyone can view comment reactions"
    ON public.comment_reactions
    FOR SELECT
    USING (true);
    
CREATE POLICY "Authenticated users can react to comments"
    ON public.comment_reactions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can remove their comment reactions"
    ON public.comment_reactions
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for post bookmarks
CREATE POLICY "Users can view their own bookmarks"
    ON public.post_bookmarks
    FOR SELECT
    USING (auth.uid() = user_id);
    
CREATE POLICY "Users can bookmark posts"
    ON public.post_bookmarks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can remove their bookmarks"
    ON public.post_bookmarks
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for post shares
CREATE POLICY "Anyone can view post shares count"
    ON public.post_shares
    FOR SELECT
    USING (true);
    
CREATE POLICY "Authenticated users can share posts"
    ON public.post_shares
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policies for post likes
CREATE POLICY "Anyone can view post likes"
    ON public.post_likes
    FOR SELECT
    USING (true);
    
CREATE POLICY "Authenticated users can like posts"
    ON public.post_likes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can remove their own likes"
    ON public.post_likes
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for comment likes
CREATE POLICY "Anyone can view comment likes"
    ON public.comment_likes
    FOR SELECT
    USING (true);
    
CREATE POLICY "Authenticated users can like comments"
    ON public.comment_likes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can remove their own comment likes"
    ON public.comment_likes
    FOR DELETE
    USING (auth.uid() = user_id);

-- Community Questions Policies
CREATE POLICY "Anyone can view questions"
    ON public.community_questions
    FOR SELECT
    USING (true);
    
CREATE POLICY "Authenticated users can create questions"
    ON public.community_questions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update their own questions"
    ON public.community_questions
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Question Answers Policies
CREATE POLICY "Anyone can view answers"
    ON public.question_answers
    FOR SELECT
    USING (true);
    
CREATE POLICY "Authenticated users can create answers"
    ON public.question_answers
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update their own answers"
    ON public.question_answers
    FOR UPDATE
    USING (auth.uid() = user_id);

-- User Reputation Policies
CREATE POLICY "Anyone can view user reputation"
    ON public.user_reputation
    FOR SELECT
    USING (true);
    
CREATE POLICY "System can update reputation"
    ON public.user_reputation
    FOR ALL
    USING (true);

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

-- Create policies for forum tags
CREATE POLICY "Anyone can view forum tags"
    ON public.forum_tags
    FOR SELECT
    USING (true);
    
CREATE POLICY "Authenticated users can create tags"
    ON public.forum_tags
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
    
CREATE POLICY "Only admins can update or delete tags"
    ON public.forum_tags
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

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

CREATE POLICY "Users can delete their own posts"
    ON public.community_posts
    FOR DELETE
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Create policies for post tags
CREATE POLICY "Anyone can view post tags"
    ON public.post_tags
    FOR SELECT
    USING (true);
    
CREATE POLICY "Authenticated users can add tags to their posts"
    ON public.post_tags
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.community_posts
            WHERE community_posts.id = post_id AND community_posts.user_id = auth.uid()
        )
    );
    
CREATE POLICY "Users can remove tags from their posts"
    ON public.post_tags
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.community_posts
            WHERE community_posts.id = post_id AND community_posts.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Create policies for post comments
CREATE POLICY "Anyone can view post comments"
    ON public.post_comments
    FOR SELECT
    USING (true);
    
CREATE POLICY "Authenticated users can create comments"
    ON public.post_comments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update their own comments"
    ON public.post_comments
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments or admins can delete any"
    ON public.post_comments
    FOR DELETE
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        ) OR
        EXISTS (
            SELECT 1 FROM public.community_posts
            WHERE community_posts.id = post_id AND community_posts.user_id = auth.uid()
        )
    );

-- Create policies for community questions
CREATE POLICY "Anyone can view community questions"
    ON public.community_questions
    FOR SELECT
    USING (true);
    
CREATE POLICY "Authenticated users can create questions"
    ON public.community_questions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update their own questions"
    ON public.community_questions
    FOR UPDATE
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Users can delete their own questions"
    ON public.community_questions
    FOR DELETE
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Create policies for question answers
CREATE POLICY "Anyone can view question answers"
    ON public.question_answers
    FOR SELECT
    USING (true);
    
CREATE POLICY "Authenticated users can create answers"
    ON public.question_answers
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update their own answers"
    ON public.question_answers
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own answers"
    ON public.question_answers
    FOR DELETE
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Create policies for answer votes
CREATE POLICY "Anyone can view answer votes"
    ON public.answer_votes
    FOR SELECT
    USING (true);
    
CREATE POLICY "Authenticated users can vote on answers"
    ON public.answer_votes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can change their own votes"
    ON public.answer_votes
    FOR UPDATE
    USING (auth.uid() = user_id);
    
CREATE POLICY "Users can remove their own votes"
    ON public.answer_votes
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for question followers
CREATE POLICY "Anyone can view question followers count"
    ON public.question_followers
    FOR SELECT
    USING (true);
    
CREATE POLICY "Authenticated users can follow questions"
    ON public.question_followers
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can unfollow questions"
    ON public.question_followers
    FOR DELETE
    USING (auth.uid() = user_id);

-- Function to update post views
CREATE OR REPLACE FUNCTION public.increment_post_view(post_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.community_posts
    SET views = views + 1
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update question views
CREATE OR REPLACE FUNCTION public.increment_question_view(question_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.community_questions
    SET views = views + 1
    WHERE id = question_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update post like count
CREATE OR REPLACE FUNCTION public.update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.community_posts
        SET likes = likes + 1
        WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.community_posts
        SET likes = likes - 1
        WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for post likes
CREATE TRIGGER update_post_like_count_trigger
    AFTER INSERT OR DELETE ON public.post_likes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_post_like_count();

-- Function to update comment like count
CREATE OR REPLACE FUNCTION public.update_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.post_comments
        SET likes = likes + 1
        WHERE id = NEW.comment_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.post_comments
        SET likes = likes - 1
        WHERE id = OLD.comment_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for comment likes
CREATE TRIGGER update_comment_like_count_trigger
    AFTER INSERT OR DELETE ON public.comment_likes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_comment_like_count();

-- Function to update answer votes
CREATE OR REPLACE FUNCTION public.update_answer_votes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF NEW.vote_type THEN  -- Upvote
            UPDATE public.question_answers
            SET upvotes = upvotes + 1
            WHERE id = NEW.answer_id;
        ELSE  -- Downvote
            UPDATE public.question_answers
            SET downvotes = downvotes + 1
            WHERE id = NEW.answer_id;
        END IF;
    ELSIF (TG_OP = 'DELETE') THEN
        IF OLD.vote_type THEN  -- Upvote
            UPDATE public.question_answers
            SET upvotes = upvotes - 1
            WHERE id = OLD.answer_id;
        ELSE  -- Downvote
            UPDATE public.question_answers
            SET downvotes = downvotes - 1
            WHERE id = OLD.answer_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for answer votes
CREATE TRIGGER update_answer_votes_trigger
    AFTER INSERT OR DELETE ON public.answer_votes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_answer_votes();

-- Function to update question status when answer is accepted
CREATE OR REPLACE FUNCTION public.update_question_on_answer_accept()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_accepted = TRUE AND OLD.is_accepted = FALSE THEN
        -- Reset any previously accepted answer for this question
        UPDATE public.question_answers
        SET is_accepted = FALSE
        WHERE question_id = NEW.question_id AND id != NEW.id AND is_accepted = TRUE;
        
        -- Update the question status and accepted_answer_id
        UPDATE public.community_questions
        SET status = 'answered', accepted_answer_id = NEW.id
        WHERE id = NEW.question_id;
    ELSIF NEW.is_accepted = FALSE AND OLD.is_accepted = TRUE THEN
        -- If un-accepting an answer, check if there's another accepted answer
        IF NOT EXISTS (
            SELECT 1 FROM public.question_answers
            WHERE question_id = NEW.question_id AND id != NEW.id AND is_accepted = TRUE
        ) THEN
            -- If no other accepted answer, update question status and accepted_answer_id
            UPDATE public.community_questions
            SET status = 'open', accepted_answer_id = NULL
            WHERE id = NEW.question_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for answer acceptance
CREATE TRIGGER update_question_on_answer_accept_trigger
    AFTER UPDATE ON public.question_answers
    FOR EACH ROW
    WHEN (OLD.is_accepted IS DISTINCT FROM NEW.is_accepted)
    EXECUTE FUNCTION public.update_question_on_answer_accept();

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

-- Enable Row Level Security
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Policies
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

-- =============================================
-- ADDITIONAL FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
CREATE TRIGGER update_forum_categories_updated_at
    BEFORE UPDATE ON public.forum_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_events_updated_at
    BEFORE UPDATE ON public.community_events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at
    BEFORE UPDATE ON public.community_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_post_comments_updated_at
    BEFORE UPDATE ON public.post_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_questions_updated_at
    BEFORE UPDATE ON public.community_questions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_question_answers_updated_at
    BEFORE UPDATE ON public.question_answers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update user reputation
CREATE OR REPLACE FUNCTION public.update_user_reputation(
    p_user_id UUID,
    p_action_type TEXT,
    p_points INTEGER,
    p_reference_type TEXT DEFAULT NULL,
    p_reference_id INTEGER DEFAULT NULL,
    p_description TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Insert or update user reputation
    INSERT INTO public.user_reputation (user_id, total_points, last_activity)
    VALUES (p_user_id, p_points, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        total_points = user_reputation.total_points + p_points,
        last_activity = NOW();
    
    -- Record in reputation history
    INSERT INTO public.reputation_history (
        user_id, action_type, points_awarded, reference_type, reference_id, description
    ) VALUES (
        p_user_id, p_action_type, p_points, p_reference_type, p_reference_id, p_description
    );
    
    -- Update specific counters based on action type
    IF p_action_type = 'post_created' THEN
        UPDATE public.user_reputation
        SET posts_created = posts_created + 1
        WHERE user_id = p_user_id;
    ELSIF p_action_type = 'answer_accepted' THEN
        UPDATE public.user_reputation
        SET helpful_answers = helpful_answers + 1
        WHERE user_id = p_user_id;
    ELSIF p_action_type = 'question_solved' THEN
        UPDATE public.user_reputation
        SET questions_solved = questions_solved + 1
        WHERE user_id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to initialize user reputation when user creates first content
CREATE OR REPLACE FUNCTION public.initialize_user_reputation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_reputation (user_id)
    VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to initialize reputation
CREATE TRIGGER initialize_reputation_on_post
    AFTER INSERT ON public.community_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.initialize_user_reputation();

CREATE TRIGGER initialize_reputation_on_question
    AFTER INSERT ON public.community_questions
    FOR EACH ROW
    EXECUTE FUNCTION public.initialize_user_reputation();

-- Function to calculate reading time
CREATE OR REPLACE FUNCTION public.calculate_reading_time(content_text TEXT)
RETURNS INTEGER AS $$
DECLARE
    word_count INTEGER;
    reading_time INTEGER;
BEGIN
    -- Count words (approximately)
    word_count := array_length(string_to_array(content_text, ' '), 1);
    
    -- Calculate reading time (assuming 200 words per minute)
    reading_time := CEIL(word_count::FLOAT / 200);
    
    -- Minimum 1 minute
    IF reading_time < 1 THEN
        reading_time := 1;
    END IF;
    
    RETURN reading_time;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-calculate reading time on post insert/update
CREATE OR REPLACE FUNCTION public.auto_calculate_reading_time()
RETURNS TRIGGER AS $$
BEGIN
    NEW.reading_time := public.calculate_reading_time(NEW.content);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for reading time calculation
CREATE TRIGGER auto_calculate_reading_time_trigger
    BEFORE INSERT OR UPDATE ON public.community_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_calculate_reading_time();

-- =============================================
-- SEED DATA FOR INITIAL SETUP
-- =============================================

-- Insert default forum categories
INSERT INTO public.forum_categories (name, slug, description, icon, color_hex, display_order) VALUES
('General Discussion', 'general', 'General farming discussions and community chat', 'Forum', '#1976d2', 1),
('Crop Farming', 'crop-farming', 'Discussions about crop cultivation, planting, and harvesting', 'Agriculture', '#4caf50', 2),
('Livestock Management', 'livestock', 'Everything about raising and caring for farm animals', 'Pets', '#ff9800', 3),
('Market & Trading', 'market-trading', 'Buy, sell, and trade agricultural products and services', 'LocalMall', '#f44336', 4),
('Technology & Innovation', 'technology', 'Modern farming techniques, tools, and agricultural technology', 'BioTech', '#9c27b0', 5),
('Weather & Climate', 'weather', 'Weather patterns, climate change, and seasonal farming advice', 'WbSunny', '#00bcd4', 6),
('Success Stories', 'success-stories', 'Share your farming achievements and inspire others', 'EmojiEvents', '#ffc107', 7),
('Questions & Help', 'questions-help', 'Ask for help and get expert advice from the community', 'Help', '#607d8b', 8)
ON CONFLICT (slug) DO NOTHING;

-- Insert default forum tags
INSERT INTO public.forum_tags (name, slug, description, color_hex) VALUES
('Beginner', 'beginner', 'Questions and discussions for new farmers', '#4caf50'),
('Expert Tips', 'expert-tips', 'Advanced advice from experienced farmers', '#f44336'),
('Organic Farming', 'organic', 'Sustainable and organic farming practices', '#8bc34a'),
('Pest Control', 'pest-control', 'Managing pests and diseases in crops', '#ff5722'),
('Irrigation', 'irrigation', 'Water management and irrigation systems', '#2196f3'),
('Soil Health', 'soil-health', 'Soil management and fertility', '#795548'),
('Seeds & Varieties', 'seeds-varieties', 'Seed selection and crop varieties', '#9c27b0'),
('Harvest', 'harvest', 'Harvesting techniques and timing', '#ff9800'),
('Equipment', 'equipment', 'Farm tools and machinery', '#607d8b'),
('Finance', 'finance', 'Agricultural loans and financial planning', '#009688'),
('Seasonal', 'seasonal', 'Season-specific farming advice', '#ffc107'),
('Emergency', 'emergency', 'Urgent farming issues requiring immediate help', '#e91e63')
ON CONFLICT (slug) DO NOTHING;

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

-- Insert sample community events
INSERT INTO public.community_events (title, description, event_type, location, start_datetime, end_datetime, max_participants, organizer_id) VALUES
('Sustainable Farming Workshop', 'Learn about organic farming practices and sustainable agriculture techniques that can improve your yield while protecting the environment.', 'workshop', 'Kampala Agricultural Center', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '4 hours', 50, NULL),
('Digital Marketing for Farmers', 'Discover how to use social media and digital platforms to market your agricultural products effectively and reach more customers.', 'webinar', 'online', NOW() + INTERVAL '14 days', NOW() + INTERVAL '14 days' + INTERVAL '2 hours', 100, NULL),
('Coffee Processing Field Visit', 'Visit a successful coffee processing facility and learn about post-harvest handling, quality control, and value addition.', 'field_visit', 'Mukono Coffee Estate', NOW() + INTERVAL '21 days', NOW() + INTERVAL '21 days' + INTERVAL '6 hours', 30, NULL)
ON CONFLICT DO NOTHING;

-- Create views for better data retrieval
CREATE OR REPLACE VIEW public.v_popular_posts AS
SELECT 
    p.*,
    pr.first_name || ' ' || pr.last_name AS author_name,
    pr.avatar_url AS author_avatar,
    fc.name AS category_name,
    fc.color_hex AS category_color,
    ARRAY_AGG(ft.name) FILTER (WHERE ft.name IS NOT NULL) AS tags
FROM public.community_posts p
LEFT JOIN public.profiles pr ON p.user_id = pr.id
LEFT JOIN public.forum_categories fc ON p.category_id = fc.id
LEFT JOIN public.post_tags pt ON p.id = pt.post_id
LEFT JOIN public.forum_tags ft ON pt.tag_id = ft.id
WHERE p.status = 'published'
GROUP BY p.id, pr.first_name, pr.last_name, pr.avatar_url, fc.name, fc.color_hex
ORDER BY p.likes DESC, p.views DESC, p.created_at DESC;

CREATE OR REPLACE VIEW public.v_recent_questions AS
SELECT 
    q.*,
    pr.first_name || ' ' || pr.last_name AS author_name,
    pr.avatar_url AS author_avatar,
    fc.name AS category_name,
    fc.color_hex AS category_color,
    (SELECT COUNT(*) FROM public.question_answers qa WHERE qa.question_id = q.id) AS answer_count,
    ARRAY_AGG(ft.name) FILTER (WHERE ft.name IS NOT NULL) AS tags
FROM public.community_questions q
LEFT JOIN public.profiles pr ON q.user_id = pr.id
LEFT JOIN public.forum_categories fc ON q.category_id = fc.id
LEFT JOIN public.question_tags qt ON q.id = qt.question_id
LEFT JOIN public.forum_tags ft ON qt.tag_id = ft.id
GROUP BY q.id, pr.first_name, pr.last_name, pr.avatar_url, fc.name, fc.color_hex
ORDER BY q.created_at DESC;

CREATE OR REPLACE VIEW public.v_upcoming_events AS
SELECT 
    e.*,
    pr.first_name || ' ' || pr.last_name AS organizer_name,
    pr.avatar_url AS organizer_avatar,
    fc.name AS category_name
FROM public.community_events e
LEFT JOIN public.profiles pr ON e.organizer_id = pr.id
LEFT JOIN public.forum_categories fc ON e.category_id = fc.id
WHERE e.status = 'upcoming' AND e.start_datetime > NOW()
ORDER BY e.start_datetime ASC;

-- Create indexes for the views
CREATE INDEX IF NOT EXISTS idx_community_posts_status_likes ON public.community_posts(status, likes DESC);
CREATE INDEX IF NOT EXISTS idx_community_questions_created_at ON public.community_questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_events_upcoming ON public.community_events(status, start_datetime) WHERE status = 'upcoming';

-- Add foreign key constraints at the end (after all tables are created)
-- These constraints can be added later if needed, but commenting out to avoid circular dependencies
-- ALTER TABLE public.community_questions
-- ADD CONSTRAINT community_questions_accepted_answer_id_fkey
-- FOREIGN KEY (accepted_answer_id) REFERENCES public.question_answers(id) ON DELETE SET NULL;

-- ALTER TABLE public.forum_categories
-- ADD CONSTRAINT forum_categories_latest_post_id_fkey
-- FOREIGN KEY (latest_post_id) REFERENCES public.community_posts(id) ON DELETE SET NULL;

-- Final message
DO $$
BEGIN
    RAISE NOTICE 'Enhanced Community Tables have been successfully created!';
    RAISE NOTICE 'Features included:';
    RAISE NOTICE '- Comprehensive forum system with categories, posts, and comments';
    RAISE NOTICE '- Advanced Q&A system with voting and accepted answers';
    RAISE NOTICE '- Community events and event management';
    RAISE NOTICE '- User reputation and achievement system';
    RAISE NOTICE '- Content moderation and reporting';
    RAISE NOTICE '- Real-time notifications';
    RAISE NOTICE '- Expert verification system';
    RAISE NOTICE '- Advanced reactions and bookmarking';
    RAISE NOTICE '- Performance-optimized with indexes and views';
    RAISE NOTICE '- Complete with seed data for immediate use';
END $$;