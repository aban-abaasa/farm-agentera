-- Forum Categories Table
CREATE TABLE IF NOT EXISTS public.forum_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE,
    icon TEXT, -- Icon identifier or URL
    parent_id INTEGER REFERENCES public.forum_categories(id) ON DELETE SET NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Forum Tags Table
CREATE TABLE IF NOT EXISTS public.forum_tags (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Posts Table
CREATE TABLE IF NOT EXISTS public.community_posts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category_id INTEGER REFERENCES public.forum_categories(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'published', -- 'published', 'draft', 'archived'
    is_pinned BOOLEAN DEFAULT FALSE, -- Featured/pinned posts
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    thumbnail TEXT, -- URL to thumbnail image
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Post Tags Relationship
CREATE TABLE IF NOT EXISTS public.post_tags (
    post_id INTEGER REFERENCES public.community_posts(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES public.forum_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- Post Comments Table
CREATE TABLE IF NOT EXISTS public.post_comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    parent_id INTEGER REFERENCES public.post_comments(id) ON DELETE CASCADE, -- For nested comments
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Post Likes Table
CREATE TABLE IF NOT EXISTS public.post_likes (
    post_id INTEGER REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);

-- Comment Likes Table
CREATE TABLE IF NOT EXISTS public.comment_likes (
    comment_id INTEGER REFERENCES public.post_comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (comment_id, user_id)
);

-- Community Questions Table (for Q&A section)
CREATE TABLE IF NOT EXISTS public.community_questions (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category_id INTEGER REFERENCES public.forum_categories(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    views INTEGER DEFAULT 0,
    status TEXT DEFAULT 'open', -- 'open', 'closed', 'answered'
    accepted_answer_id INTEGER, -- Filled in after an answer is accepted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Question Tags Relationship
CREATE TABLE IF NOT EXISTS public.question_tags (
    question_id INTEGER REFERENCES public.community_questions(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES public.forum_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (question_id, tag_id)
);

-- Question Answers Table
CREATE TABLE IF NOT EXISTS public.question_answers (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES public.community_questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_accepted BOOLEAN DEFAULT FALSE,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Answer Votes Table
CREATE TABLE IF NOT EXISTS public.answer_votes (
    answer_id INTEGER REFERENCES public.question_answers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    vote_type BOOLEAN NOT NULL, -- TRUE for upvote, FALSE for downvote
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (answer_id, user_id)
);

-- Question Followers Table
CREATE TABLE IF NOT EXISTS public.question_followers (
    question_id INTEGER REFERENCES public.community_questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (question_id, user_id)
);

-- Populate the constraint for accepted_answer_id
ALTER TABLE public.community_questions
ADD CONSTRAINT community_questions_accepted_answer_id_fkey
FOREIGN KEY (accepted_answer_id) REFERENCES public.question_answers(id) ON DELETE SET NULL;

-- Enable Row Level Security
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answer_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_followers ENABLE ROW LEVEL SECURITY;

-- Create policies for forum categories
CREATE POLICY "Anyone can view forum categories"
    ON public.forum_categories
    FOR SELECT
    USING (true);
    
CREATE POLICY "Only admins can manage forum categories"
    ON public.forum_categories
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

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

-- Create similar policies for comment likes
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