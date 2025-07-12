-- =============================================
-- DATABASE TRIGGERS
-- =============================================

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

-- Create trigger for post likes
CREATE TRIGGER update_post_like_count_trigger
    AFTER INSERT OR DELETE ON public.post_likes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_post_like_count();

-- Create trigger for comment likes
CREATE TRIGGER update_comment_like_count_trigger
    AFTER INSERT OR DELETE ON public.comment_likes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_comment_like_count();

-- Create trigger for answer votes
CREATE TRIGGER update_answer_votes_trigger
    AFTER INSERT OR DELETE ON public.answer_votes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_answer_votes();

-- Create trigger for answer acceptance
CREATE TRIGGER update_question_on_answer_accept_trigger
    AFTER UPDATE ON public.question_answers
    FOR EACH ROW
    WHEN (OLD.is_accepted IS DISTINCT FROM NEW.is_accepted)
    EXECUTE FUNCTION public.update_question_on_answer_accept();

-- Triggers to initialize reputation
CREATE TRIGGER initialize_reputation_on_post
    AFTER INSERT ON public.community_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.initialize_user_reputation();

CREATE TRIGGER initialize_reputation_on_question
    AFTER INSERT ON public.community_questions
    FOR EACH ROW
    EXECUTE FUNCTION public.initialize_user_reputation();

-- Trigger for reading time calculation
CREATE TRIGGER auto_calculate_reading_time_trigger
    BEFORE INSERT OR UPDATE ON public.community_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_calculate_reading_time();

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database Triggers created successfully!';
END $$;
