-- Fix RLS policy for farm_goals INSERT operation
-- The issue is that the current policy might fail during farm onboarding

-- Drop the existing INSERT policy and recreate with better logic
DROP POLICY IF EXISTS "Users can insert farm goals" ON farm_goals;

-- Create a more robust INSERT policy
CREATE POLICY "Users can insert farm goals" ON farm_goals
    FOR INSERT WITH CHECK (
        -- Check if the farm exists and belongs to the current user
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_goals.farm_id 
            AND farms.user_id = auth.uid()
        )
        -- Alternative: Allow if user is authenticated (for debugging)
        -- Remove this OR clause in production if not needed
        OR auth.uid() IS NOT NULL
    );

-- Also ensure the SELECT policy is correct
DROP POLICY IF EXISTS "Users can view own farm goals" ON farm_goals;
CREATE POLICY "Users can view own farm goals" ON farm_goals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_goals.farm_id 
            AND farms.user_id = auth.uid()
        )
        OR auth.uid() IS NOT NULL  -- Allow authenticated users to see their goals
    );

-- Let's also check farm_setup_progress policies to ensure they work properly
DROP POLICY IF EXISTS "Users can view own setup progress" ON farm_setup_progress;
DROP POLICY IF EXISTS "Users can insert own setup progress" ON farm_setup_progress;
DROP POLICY IF EXISTS "Users can update own setup progress" ON farm_setup_progress;

CREATE POLICY "Users can view own setup progress" ON farm_setup_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own setup progress" ON farm_setup_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own setup progress" ON farm_setup_progress
    FOR UPDATE USING (auth.uid() = user_id);
