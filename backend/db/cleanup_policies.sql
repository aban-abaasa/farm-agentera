-- =============================================
-- CHECK AND CLEANUP COMMUNITY POLICIES
-- =============================================

-- Check for existing community-related policies
DO $$
DECLARE
    policy_rec RECORD;
BEGIN
    RAISE NOTICE 'Checking for existing community-related policies...';
    
    FOR policy_rec IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND (
            tablename LIKE '%forum%' OR 
            tablename LIKE '%community%' OR 
            tablename LIKE '%post%' OR 
            tablename LIKE '%question%' OR 
            tablename LIKE '%answer%' OR 
            tablename LIKE '%comment%' OR 
            tablename LIKE '%event%' OR 
            tablename LIKE '%reputation%' OR 
            tablename LIKE '%tag%' OR 
            tablename LIKE '%badge%' OR 
            tablename LIKE '%notification%' OR
            tablename LIKE '%reaction%' OR
            tablename LIKE '%bookmark%' OR
            tablename LIKE '%expert%' OR
            tablename LIKE '%report%' OR
            tablename LIKE '%moderation%' OR
            tablename LIKE '%opportunities%'
        )
    LOOP
        RAISE NOTICE 'Found policy: %.% on table %', policy_rec.schemaname, policy_rec.policyname, policy_rec.tablename;
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', policy_rec.policyname, policy_rec.schemaname, policy_rec.tablename);
        RAISE NOTICE 'Dropped policy: %', policy_rec.policyname;
    END LOOP;
    
    RAISE NOTICE 'Community policies cleanup completed!';
END $$;
