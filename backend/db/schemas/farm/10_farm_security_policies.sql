-- Farm Management Security Policies
-- This file contains Row Level Security (RLS) policies for all farm management tables
-- Ensures users can only access their own farm data

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

-- Farm Management Tables
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestock_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestock_animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestock_health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestock_breeding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_plantings ENABLE ROW LEVEL SECURITY;
ALTER TABLE irrigation_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE irrigation_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_financial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_analytics_metrics ENABLE ROW LEVEL SECURITY;

-- Farm Setup Tables
ALTER TABLE farm_setup_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_setup_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_module_preferences ENABLE ROW LEVEL SECURITY;

-- =============================================
-- FARMS TABLE POLICIES
-- =============================================

-- Users can view their own farms
CREATE POLICY "Users can view own farms" ON farms
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own farms
CREATE POLICY "Users can insert own farms" ON farms
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own farms
CREATE POLICY "Users can update own farms" ON farms
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own farms
CREATE POLICY "Users can delete own farms" ON farms
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- FARM FIELDS POLICIES
-- =============================================

-- Users can view fields for their farms
CREATE POLICY "Users can view own farm fields" ON farm_fields
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_fields.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can insert fields for their farms
CREATE POLICY "Users can insert farm fields" ON farm_fields
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_fields.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can update fields for their farms
CREATE POLICY "Users can update farm fields" ON farm_fields
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_fields.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can delete fields for their farms
CREATE POLICY "Users can delete farm fields" ON farm_fields
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_fields.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- =============================================
-- LIVESTOCK CATEGORIES POLICIES
-- =============================================

-- Users can view livestock categories for their farms
CREATE POLICY "Users can view own livestock categories" ON livestock_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = livestock_categories.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can insert livestock categories for their farms
CREATE POLICY "Users can insert livestock categories" ON livestock_categories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = livestock_categories.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can update livestock categories for their farms
CREATE POLICY "Users can update livestock categories" ON livestock_categories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = livestock_categories.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can delete livestock categories for their farms
CREATE POLICY "Users can delete livestock categories" ON livestock_categories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = livestock_categories.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- =============================================
-- LIVESTOCK ANIMALS POLICIES
-- =============================================

-- Users can view animals for their farms
CREATE POLICY "Users can view own livestock animals" ON livestock_animals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = livestock_animals.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can insert animals for their farms
CREATE POLICY "Users can insert livestock animals" ON livestock_animals
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = livestock_animals.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can update animals for their farms
CREATE POLICY "Users can update livestock animals" ON livestock_animals
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = livestock_animals.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can delete animals for their farms
CREATE POLICY "Users can delete livestock animals" ON livestock_animals
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = livestock_animals.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- =============================================
-- LIVESTOCK HEALTH RECORDS POLICIES
-- =============================================

-- Users can view health records for their animals
CREATE POLICY "Users can view own livestock health records" ON livestock_health_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM livestock_animals la
            JOIN farms f ON f.id = la.farm_id
            WHERE la.id = livestock_health_records.animal_id 
            AND f.user_id = auth.uid()
        )
    );

-- Users can insert health records for their animals
CREATE POLICY "Users can insert livestock health records" ON livestock_health_records
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM livestock_animals la
            JOIN farms f ON f.id = la.farm_id
            WHERE la.id = livestock_health_records.animal_id 
            AND f.user_id = auth.uid()
        )
    );

-- Users can update health records for their animals
CREATE POLICY "Users can update livestock health records" ON livestock_health_records
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM livestock_animals la
            JOIN farms f ON f.id = la.farm_id
            WHERE la.id = livestock_health_records.animal_id 
            AND f.user_id = auth.uid()
        )
    );

-- Users can delete health records for their animals
CREATE POLICY "Users can delete livestock health records" ON livestock_health_records
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM livestock_animals la
            JOIN farms f ON f.id = la.farm_id
            WHERE la.id = livestock_health_records.animal_id 
            AND f.user_id = auth.uid()
        )
    );

-- =============================================
-- LIVESTOCK BREEDING RECORDS POLICIES
-- =============================================

-- Users can view breeding records for their farms
CREATE POLICY "Users can view own breeding records" ON livestock_breeding_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = livestock_breeding_records.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can insert breeding records for their farms
CREATE POLICY "Users can insert breeding records" ON livestock_breeding_records
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = livestock_breeding_records.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can update breeding records for their farms
CREATE POLICY "Users can update breeding records" ON livestock_breeding_records
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = livestock_breeding_records.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can delete breeding records for their farms
CREATE POLICY "Users can delete breeding records" ON livestock_breeding_records
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = livestock_breeding_records.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- =============================================
-- CROP PLANTINGS POLICIES
-- =============================================

-- Users can view crop plantings for their farms
CREATE POLICY "Users can view own crop plantings" ON crop_plantings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = crop_plantings.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can insert crop plantings for their farms
CREATE POLICY "Users can insert crop plantings" ON crop_plantings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = crop_plantings.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can update crop plantings for their farms
CREATE POLICY "Users can update crop plantings" ON crop_plantings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = crop_plantings.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can delete crop plantings for their farms
CREATE POLICY "Users can delete crop plantings" ON crop_plantings
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = crop_plantings.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- =============================================
-- IRRIGATION SYSTEMS POLICIES
-- =============================================

-- Users can view irrigation systems for their farms
CREATE POLICY "Users can view own irrigation systems" ON irrigation_systems
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = irrigation_systems.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can insert irrigation systems for their farms
CREATE POLICY "Users can insert irrigation systems" ON irrigation_systems
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = irrigation_systems.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can update irrigation systems for their farms
CREATE POLICY "Users can update irrigation systems" ON irrigation_systems
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = irrigation_systems.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can delete irrigation systems for their farms
CREATE POLICY "Users can delete irrigation systems" ON irrigation_systems
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = irrigation_systems.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- =============================================
-- IRRIGATION SCHEDULES POLICIES
-- =============================================

-- Users can view irrigation schedules for their systems
CREATE POLICY "Users can view own irrigation schedules" ON irrigation_schedules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM irrigation_systems isy
            JOIN farms f ON f.id = isy.farm_id
            WHERE isy.id = irrigation_schedules.system_id 
            AND f.user_id = auth.uid()
        )
    );

-- Users can insert irrigation schedules for their systems
CREATE POLICY "Users can insert irrigation schedules" ON irrigation_schedules
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM irrigation_systems isy
            JOIN farms f ON f.id = isy.farm_id
            WHERE isy.id = irrigation_schedules.system_id 
            AND f.user_id = auth.uid()
        )
    );

-- Users can update irrigation schedules for their systems
CREATE POLICY "Users can update irrigation schedules" ON irrigation_schedules
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM irrigation_systems isy
            JOIN farms f ON f.id = isy.farm_id
            WHERE isy.id = irrigation_schedules.system_id 
            AND f.user_id = auth.uid()
        )
    );

-- Users can delete irrigation schedules for their systems
CREATE POLICY "Users can delete irrigation schedules" ON irrigation_schedules
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM irrigation_systems isy
            JOIN farms f ON f.id = isy.farm_id
            WHERE isy.id = irrigation_schedules.system_id 
            AND f.user_id = auth.uid()
        )
    );

-- =============================================
-- FINANCIAL CATEGORIES POLICIES
-- =============================================

-- Users can view financial categories for their farms
CREATE POLICY "Users can view own financial categories" ON farm_financial_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_financial_categories.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can insert financial categories for their farms
CREATE POLICY "Users can insert financial categories" ON farm_financial_categories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_financial_categories.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can update financial categories for their farms
CREATE POLICY "Users can update financial categories" ON farm_financial_categories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_financial_categories.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can delete financial categories for their farms
CREATE POLICY "Users can delete financial categories" ON farm_financial_categories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_financial_categories.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- =============================================
-- FARM TRANSACTIONS POLICIES
-- =============================================

-- Users can view transactions for their farms
CREATE POLICY "Users can view own farm transactions" ON farm_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_transactions.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can insert transactions for their farms
CREATE POLICY "Users can insert farm transactions" ON farm_transactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_transactions.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can update transactions for their farms
CREATE POLICY "Users can update farm transactions" ON farm_transactions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_transactions.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can delete transactions for their farms
CREATE POLICY "Users can delete farm transactions" ON farm_transactions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_transactions.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- =============================================
-- INVENTORY CATEGORIES POLICIES
-- =============================================

-- Users can view inventory categories for their farms
CREATE POLICY "Users can view own inventory categories" ON farm_inventory_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_inventory_categories.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can insert inventory categories for their farms
CREATE POLICY "Users can insert inventory categories" ON farm_inventory_categories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_inventory_categories.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can update inventory categories for their farms
CREATE POLICY "Users can update inventory categories" ON farm_inventory_categories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_inventory_categories.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can delete inventory categories for their farms
CREATE POLICY "Users can delete inventory categories" ON farm_inventory_categories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_inventory_categories.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- =============================================
-- INVENTORY ITEMS POLICIES
-- =============================================

-- Users can view inventory items for their farms
CREATE POLICY "Users can view own inventory items" ON farm_inventory_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_inventory_items.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can insert inventory items for their farms
CREATE POLICY "Users can insert inventory items" ON farm_inventory_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_inventory_items.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can update inventory items for their farms
CREATE POLICY "Users can update inventory items" ON farm_inventory_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_inventory_items.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can delete inventory items for their farms
CREATE POLICY "Users can delete inventory items" ON farm_inventory_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_inventory_items.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- =============================================
-- FARM TASKS POLICIES
-- =============================================

-- Users can view tasks for their farms
CREATE POLICY "Users can view own farm tasks" ON farm_tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_tasks.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can insert tasks for their farms
CREATE POLICY "Users can insert farm tasks" ON farm_tasks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_tasks.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can update tasks for their farms
CREATE POLICY "Users can update farm tasks" ON farm_tasks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_tasks.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can delete tasks for their farms
CREATE POLICY "Users can delete farm tasks" ON farm_tasks
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_tasks.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- =============================================
-- WEATHER DATA POLICIES
-- =============================================

-- Users can view weather data for their farms
CREATE POLICY "Users can view own weather data" ON farm_weather_data
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_weather_data.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can insert weather data for their farms
CREATE POLICY "Users can insert weather data" ON farm_weather_data
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_weather_data.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can update weather data for their farms
CREATE POLICY "Users can update weather data" ON farm_weather_data
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_weather_data.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can delete weather data for their farms
CREATE POLICY "Users can delete weather data" ON farm_weather_data
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_weather_data.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- =============================================
-- FARM ALERTS POLICIES
-- =============================================

-- Users can view alerts for their farms
CREATE POLICY "Users can view own farm alerts" ON farm_alerts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_alerts.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can insert alerts for their farms
CREATE POLICY "Users can insert farm alerts" ON farm_alerts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_alerts.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can update alerts for their farms
CREATE POLICY "Users can update farm alerts" ON farm_alerts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_alerts.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can delete alerts for their farms
CREATE POLICY "Users can delete farm alerts" ON farm_alerts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_alerts.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- =============================================
-- ANALYTICS METRICS POLICIES
-- =============================================

-- Users can view analytics for their farms
CREATE POLICY "Users can view own analytics metrics" ON farm_analytics_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_analytics_metrics.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can insert analytics for their farms
CREATE POLICY "Users can insert analytics metrics" ON farm_analytics_metrics
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_analytics_metrics.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can update analytics for their farms
CREATE POLICY "Users can update analytics metrics" ON farm_analytics_metrics
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_analytics_metrics.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can delete analytics for their farms
CREATE POLICY "Users can delete analytics metrics" ON farm_analytics_metrics
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_analytics_metrics.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- =============================================
-- FARM SETUP PROGRESS POLICIES
-- =============================================

-- Users can view their own setup progress
CREATE POLICY "Users can view own setup progress" ON farm_setup_progress
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own setup progress
CREATE POLICY "Users can insert own setup progress" ON farm_setup_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own setup progress
CREATE POLICY "Users can update own setup progress" ON farm_setup_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own setup progress
CREATE POLICY "Users can delete own setup progress" ON farm_setup_progress
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- FARM SETUP RESPONSES POLICIES
-- =============================================

-- Users can view their own setup responses
CREATE POLICY "Users can view own setup responses" ON farm_setup_responses
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own setup responses
CREATE POLICY "Users can insert own setup responses" ON farm_setup_responses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own setup responses
CREATE POLICY "Users can update own setup responses" ON farm_setup_responses
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own setup responses
CREATE POLICY "Users can delete own setup responses" ON farm_setup_responses
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- FARM GOALS POLICIES
-- =============================================

-- Users can view goals for their farms
CREATE POLICY "Users can view own farm goals" ON farm_goals
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_goals.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can insert goals for their farms
CREATE POLICY "Users can insert farm goals" ON farm_goals
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_goals.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can update goals for their farms
CREATE POLICY "Users can update farm goals" ON farm_goals
    FOR UPDATE USING (
        auth.uid() IS NOT NULL AND EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_goals.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can delete goals for their farms
CREATE POLICY "Users can delete farm goals" ON farm_goals
    FOR DELETE USING (
        auth.uid() IS NOT NULL AND EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_goals.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- =============================================
-- FARM MODULE PREFERENCES POLICIES
-- =============================================

-- Users can view module preferences for their farms
CREATE POLICY "Users can view own module preferences" ON farm_module_preferences
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_module_preferences.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can insert module preferences for their farms
CREATE POLICY "Users can insert module preferences" ON farm_module_preferences
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_module_preferences.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can update module preferences for their farms
CREATE POLICY "Users can update module preferences" ON farm_module_preferences
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_module_preferences.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- Users can delete module preferences for their farms
CREATE POLICY "Users can delete module preferences" ON farm_module_preferences
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM farms 
            WHERE farms.id = farm_module_preferences.farm_id 
            AND farms.user_id = auth.uid()
        )
    );

-- =============================================
-- PUBLIC READ POLICIES FOR REFERENCE DATA
-- =============================================

-- Allow all authenticated users to read crop varieties (reference data)
ALTER TABLE crop_varieties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view crop varieties" ON crop_varieties
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow all authenticated users to read farm setup templates (reference data)
CREATE POLICY "Authenticated users can view setup templates" ON farm_setup_templates
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow all authenticated users to read farm setup questions (reference data)
CREATE POLICY "Authenticated users can view setup questions" ON farm_setup_questions
    FOR SELECT USING (auth.role() = 'authenticated');

-- =============================================
-- ADMIN POLICIES (Optional - for system administrators)
-- =============================================

-- Note: These policies would allow system administrators to access all data
-- Uncomment and modify as needed for your admin requirements

/*
-- Admins can view all farms
CREATE POLICY "Admins can view all farms" ON farms
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );

-- Similar admin policies can be created for other tables as needed
*/

-- =============================================
-- SECURITY FUNCTIONS
-- =============================================

-- Function to check if user owns a farm
CREATE OR REPLACE FUNCTION user_owns_farm(farm_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM farms 
        WHERE id = farm_uuid 
        AND user_id = auth.uid()
    );
$$;

-- Function to get user's farm ID (if they have one)
CREATE OR REPLACE FUNCTION get_user_farm_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT id FROM farms 
    WHERE user_id = auth.uid() 
    LIMIT 1;
$$;

-- Function to check if user has completed setup
CREATE OR REPLACE FUNCTION user_has_completed_setup()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM farm_setup_progress 
        WHERE user_id = auth.uid() 
        AND setup_completed = true
    );
$$;

-- =============================================
-- GRANTS FOR SERVICE ROLES
-- =============================================

-- Grant necessary permissions to the service role for backend operations
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant read access to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON POLICY "Users can view own farms" ON farms IS 
'Allows users to view only their own farm records';

COMMENT ON POLICY "Users can view own farm fields" ON farm_fields IS 
'Allows users to view fields only for farms they own';

COMMENT ON POLICY "Users can view own livestock animals" ON livestock_animals IS 
'Allows users to view animals only for farms they own';

COMMENT ON FUNCTION user_owns_farm(UUID) IS 
'Helper function to check if the current user owns a specific farm';

COMMENT ON FUNCTION get_user_farm_id() IS 
'Helper function to get the current user''s farm ID';

COMMENT ON FUNCTION user_has_completed_setup() IS 
'Helper function to check if the current user has completed farm setup';
