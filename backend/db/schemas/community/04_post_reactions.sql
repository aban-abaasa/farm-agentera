-- =============================================
-- POST REACTIONS AND INTERACTIONS
-- =============================================

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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON public.post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id ON public.post_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment_id ON public.comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_user_id ON public.comment_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_post_bookmarks_post_id ON public.post_bookmarks(post_id);
CREATE INDEX IF NOT EXISTS idx_post_bookmarks_user_id ON public.post_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_post_id ON public.post_shares(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON public.comment_likes(user_id);

-- Enable Row Level Security
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

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

-- Post Bookmarks Policies
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

-- Post Shares Policies
CREATE POLICY "Anyone can view post shares count"
    ON public.post_shares
    FOR SELECT
    USING (true);
    
CREATE POLICY "Authenticated users can share posts"
    ON public.post_shares
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Post Likes Policies
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

-- Comment Likes Policies
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

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Post Reactions and Interactions tables created successfully!';
END $$;
