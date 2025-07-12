-- =============================================
-- CLEANUP SCRIPT FOR COMMUNITY TABLES
-- =============================================

-- Drop all community-related tables and their dependencies
-- Note: This will remove all data in these tables!

-- Drop views first
DROP VIEW IF EXISTS public.v_popular_posts CASCADE;
DROP VIEW IF EXISTS public.v_recent_questions CASCADE;
DROP VIEW IF EXISTS public.v_upcoming_events CASCADE;

-- Drop tables (in reverse dependency order) - CASCADE will drop triggers and constraints
DROP TABLE IF EXISTS public.content_moderations CASCADE;
DROP TABLE IF EXISTS public.community_notifications CASCADE;
DROP TABLE IF EXISTS public.community_reports CASCADE;
DROP TABLE IF EXISTS public.user_badges CASCADE;
DROP TABLE IF EXISTS public.community_badges CASCADE;
DROP TABLE IF EXISTS public.reputation_history CASCADE;
DROP TABLE IF EXISTS public.user_reputation CASCADE;
DROP TABLE IF EXISTS public.community_experts CASCADE;
DROP TABLE IF EXISTS public.question_followers CASCADE;
DROP TABLE IF EXISTS public.answer_votes CASCADE;
DROP TABLE IF EXISTS public.question_answers CASCADE;
DROP TABLE IF EXISTS public.question_tags CASCADE;
DROP TABLE IF EXISTS public.community_questions CASCADE;
DROP TABLE IF EXISTS public.post_shares CASCADE;
DROP TABLE IF EXISTS public.post_bookmarks CASCADE;
DROP TABLE IF EXISTS public.comment_reactions CASCADE;
DROP TABLE IF EXISTS public.post_reactions CASCADE;
DROP TABLE IF EXISTS public.post_comments CASCADE;
DROP TABLE IF EXISTS public.post_tags CASCADE;
DROP TABLE IF EXISTS public.community_posts CASCADE;
DROP TABLE IF EXISTS public.event_participants CASCADE;
DROP TABLE IF EXISTS public.community_events CASCADE;
DROP TABLE IF EXISTS public.forum_tags CASCADE;
DROP TABLE IF EXISTS public.forum_categories CASCADE;
DROP TABLE IF EXISTS public.opportunities CASCADE;

-- Drop legacy tables if they exist
DROP TABLE IF EXISTS public.post_likes CASCADE;
DROP TABLE IF EXISTS public.comment_likes CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.increment_post_view(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.increment_question_view(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.update_post_reaction_count() CASCADE;
DROP FUNCTION IF EXISTS public.update_comment_count() CASCADE;
DROP FUNCTION IF EXISTS public.update_answer_votes() CASCADE;
DROP FUNCTION IF EXISTS public.update_question_on_answer_accept() CASCADE;
DROP FUNCTION IF EXISTS public.update_user_reputation(UUID, TEXT, INTEGER, TEXT, INTEGER, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.initialize_user_reputation() CASCADE;
DROP FUNCTION IF EXISTS public.update_tag_usage_count() CASCADE;
DROP FUNCTION IF EXISTS public.update_event_participant_count() CASCADE;
DROP FUNCTION IF EXISTS public.update_category_post_count() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_reading_time(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.auto_calculate_reading_time() CASCADE;
DROP FUNCTION IF EXISTS public.update_post_like_count() CASCADE;
DROP FUNCTION IF EXISTS public.update_comment_like_count() CASCADE;

-- Completion message
DO $$
BEGIN
    RAISE NOTICE 'Community tables cleanup completed successfully!';
    RAISE NOTICE 'All community-related tables, triggers, functions, and views have been removed.';
    RAISE NOTICE 'You can now run the community schema initialization again.';
END $$;
