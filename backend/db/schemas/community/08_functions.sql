-- =============================================
-- DATABASE FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database Functions created successfully!';
END $$;
