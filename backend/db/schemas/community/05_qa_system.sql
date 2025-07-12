-- =============================================
-- COMMUNITY Q&A SYSTEM
-- =============================================

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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_community_questions_category_id ON public.community_questions(category_id);
CREATE INDEX IF NOT EXISTS idx_community_questions_user_id ON public.community_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_community_questions_status ON public.community_questions(status);
CREATE INDEX IF NOT EXISTS idx_community_questions_created_at ON public.community_questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_question_answers_question_id ON public.question_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_question_answers_user_id ON public.question_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_answer_votes_answer_id ON public.answer_votes(answer_id);
CREATE INDEX IF NOT EXISTS idx_answer_votes_user_id ON public.answer_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_question_followers_question_id ON public.question_followers(question_id);
CREATE INDEX IF NOT EXISTS idx_question_followers_user_id ON public.question_followers(user_id);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_community_questions_search ON public.community_questions USING gin(to_tsvector('english', title || ' ' || content));

-- Enable Row Level Security
ALTER TABLE public.community_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answer_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_followers ENABLE ROW LEVEL SECURITY;

-- Community Questions Policies
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

-- Question Answers Policies
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

-- Answer Votes Policies
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

-- Question Followers Policies
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

-- Question Tags Policies
CREATE POLICY "Anyone can view question tags"
    ON public.question_tags
    FOR SELECT
    USING (true);
    
CREATE POLICY "Authenticated users can add tags to their questions"
    ON public.question_tags
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.community_questions
            WHERE community_questions.id = question_id AND community_questions.user_id = auth.uid()
        )
    );

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Community Q&A System tables created successfully!';
END $$;
