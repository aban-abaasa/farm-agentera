-- =============================================
-- COMMUNITY POSTS AND INTERACTIONS
-- =============================================

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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_category_id ON public.community_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON public.community_posts(status);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_views ON public.community_posts(views DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_likes ON public.community_posts(likes DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_status_likes ON public.community_posts(status, likes DESC);

CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON public.post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_parent_id ON public.post_comments(parent_id);

CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON public.post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON public.post_tags(tag_id);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_search ON public.community_posts USING gin(to_tsvector('english', title || ' ' || content));

-- Enable Row Level Security
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

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

-- Post Tags Policies
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

-- Post Comments Policies
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

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Community Posts and Comments tables created successfully!';
END $$;
