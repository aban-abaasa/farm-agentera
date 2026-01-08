-- =============================================
-- DATABASE VIEWS AND FINAL SETUP
-- =============================================

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

-- Create view for user statistics
CREATE OR REPLACE VIEW public.v_user_stats AS
SELECT 
    p.id,
    p.first_name || ' ' || p.last_name AS full_name,
    p.avatar_url,
    ur.total_points,
    ur.expert_level,
    ur.posts_created,
    ur.helpful_answers,
    ur.questions_solved,
    (SELECT COUNT(*) FROM public.community_posts cp WHERE cp.user_id = p.id AND cp.status = 'published') AS total_posts,
    (SELECT COUNT(*) FROM public.community_questions cq WHERE cq.user_id = p.id) AS total_questions,
    (SELECT COUNT(*) FROM public.question_answers qa WHERE qa.user_id = p.id) AS total_answers,
    (SELECT COUNT(*) FROM public.user_badges ub WHERE ub.user_id = p.id) AS total_badges
FROM public.profiles p
LEFT JOIN public.user_reputation ur ON p.id = ur.user_id
WHERE p.id IS NOT NULL;

-- Create view for trending topics
CREATE OR REPLACE VIEW public.v_trending_topics AS
SELECT 
    ft.id,
    ft.name,
    ft.slug,
    ft.color_hex,
    ft.usage_count,
    COUNT(pt.post_id) AS recent_posts,
    COUNT(qt.question_id) AS recent_questions
FROM public.forum_tags ft
LEFT JOIN public.post_tags pt ON ft.id = pt.tag_id 
    AND EXISTS (SELECT 1 FROM public.community_posts cp WHERE cp.id = pt.post_id AND cp.created_at > NOW() - INTERVAL '7 days')
LEFT JOIN public.question_tags qt ON ft.id = qt.tag_id 
    AND EXISTS (SELECT 1 FROM public.community_questions cq WHERE cq.id = qt.question_id AND cq.created_at > NOW() - INTERVAL '7 days')
GROUP BY ft.id, ft.name, ft.slug, ft.color_hex, ft.usage_count
ORDER BY (COUNT(pt.post_id) + COUNT(qt.question_id)) DESC, ft.usage_count DESC
LIMIT 20;

-- Add foreign key constraints (commented out to avoid circular dependencies)
-- Note: These can be added later if needed, but commenting out to avoid dependency issues
-- ALTER TABLE public.community_questions
-- ADD CONSTRAINT community_questions_accepted_answer_id_fkey
-- FOREIGN KEY (accepted_answer_id) REFERENCES public.question_answers(id) ON DELETE SET NULL;

-- ALTER TABLE public.forum_categories
-- ADD CONSTRAINT forum_categories_latest_post_id_fkey
-- FOREIGN KEY (latest_post_id) REFERENCES public.community_posts(id) ON DELETE SET NULL;

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'ENHANCED COMMUNITY TABLES SETUP COMPLETED!';
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'All community tables, views, functions, and triggers have been created successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'Features included:';
    RAISE NOTICE '✓ Comprehensive forum system with categories, posts, and comments';
    RAISE NOTICE '✓ Advanced Q&A system with voting and accepted answers';
    RAISE NOTICE '✓ Community events and event management';
    RAISE NOTICE '✓ User reputation and achievement system';
    RAISE NOTICE '✓ Content moderation and reporting';
    RAISE NOTICE '✓ Real-time notifications';
    RAISE NOTICE '✓ Expert verification system';
    RAISE NOTICE '✓ Advanced reactions and bookmarking';
    RAISE NOTICE '✓ Performance-optimized with indexes and views';
    RAISE NOTICE '✓ Complete with seed data for immediate use';
    RAISE NOTICE '✓ Row Level Security policies for all tables';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Review the created tables and policies';
    RAISE NOTICE '2. Test the database schema with your application';
    RAISE NOTICE '3. Add additional sample data if needed';
    RAISE NOTICE '4. Configure your application to use these tables';
    RAISE NOTICE '====================================================';
END $$;
