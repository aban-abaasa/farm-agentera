-- Farm Management Cleanup Script
-- This file drops all farm-related tables and policies to allow for clean re-running of migrations
-- Run this file BEFORE running the farm management schema files (08, 09, 10, 11)

/*
WARNING: This will permanently delete all farm data!
Note: This cleanup script should only be run in development environments or when you need to completely reset the farm management system. Running this in production will permanently delete all farm data!
*/

-- Only run this in development or when you want to completely reset the farm management system

-- =============================================
-- DROP ALL FARM VIEWS FIRST
-- =============================================
DROP VIEW IF EXISTS farm_overview CASCADE;
DROP VIEW IF EXISTS farms_with_farmer_details CASCADE;
DROP VIEW IF EXISTS farm_analytics_by_farmer_type CASCADE;

-- =============================================
-- DROP ALL FARM TABLES (in reverse dependency order)
-- =============================================

-- Analytics and metrics
DROP TABLE IF EXISTS farm_analytics_metrics CASCADE;

-- Alerts and notifications
DROP TABLE IF EXISTS farm_alerts CASCADE;

-- Weather data
DROP TABLE IF EXISTS farm_weather_data CASCADE;

-- Tasks and activities
DROP TABLE IF EXISTS farm_tasks CASCADE;

-- Inventory management
DROP TABLE IF EXISTS farm_inventory_items CASCADE;
DROP TABLE IF EXISTS farm_inventory_categories CASCADE;

-- Financial management
DROP TABLE IF EXISTS farm_transactions CASCADE;
DROP TABLE IF EXISTS farm_financial_categories CASCADE;

-- Irrigation management
DROP TABLE IF EXISTS irrigation_schedules CASCADE;
DROP TABLE IF EXISTS irrigation_systems CASCADE;

-- Crop management
DROP TABLE IF EXISTS crop_plantings CASCADE;
DROP TABLE IF EXISTS crop_varieties CASCADE;

-- Livestock management
DROP TABLE IF EXISTS livestock_breeding_records CASCADE;
DROP TABLE IF EXISTS livestock_health_records CASCADE;
DROP TABLE IF EXISTS livestock_animals CASCADE;
DROP TABLE IF EXISTS livestock_categories CASCADE;

-- Farm structure
DROP TABLE IF EXISTS farm_fields CASCADE;

-- Farm setup and onboarding (from 09_farm_setup_tables.sql)
DROP TABLE IF EXISTS farm_setup_responses CASCADE;
DROP TABLE IF EXISTS farm_setup_templates CASCADE;
DROP TABLE IF EXISTS farm_goals CASCADE;
DROP TABLE IF EXISTS farm_setup_questions CASCADE;
DROP TABLE IF EXISTS farm_module_preferences CASCADE;
DROP TABLE IF EXISTS farm_setup_progress CASCADE;

-- Main farms table (must be last due to foreign key dependencies)
DROP TABLE IF EXISTS farms CASCADE;

-- =============================================
-- DROP ALL FARM-RELATED FUNCTIONS
-- =============================================
DROP FUNCTION IF EXISTS update_farm_updated_at() CASCADE;
DROP FUNCTION IF EXISTS create_default_farm_setup() CASCADE;
DROP FUNCTION IF EXISTS update_farm_setup_progress() CASCADE;
DROP FUNCTION IF EXISTS calculate_setup_completion() CASCADE;
DROP FUNCTION IF EXISTS check_profile_readiness_for_farm() CASCADE;
DROP FUNCTION IF EXISTS user_is_verified_farmer() CASCADE;

-- =============================================
-- DROP ALL FARM-RELATED POLICIES
-- =============================================

-- Drop all RLS policies for farm tables (wrap in DO blocks to handle non-existent tables)

-- Farms table policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view their own farms" ON farms;
    DROP POLICY IF EXISTS "Users can create their own farms" ON farms;
    DROP POLICY IF EXISTS "Users can update their own farms" ON farms;
    DROP POLICY IF EXISTS "Users can delete their own farms" ON farms;
EXCEPTION WHEN undefined_table THEN
    -- Table doesn't exist, which is fine
    NULL;
END $$;

-- Farm setup policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view their own farm setup progress" ON farm_setup_progress;
    DROP POLICY IF EXISTS "Users can create their own farm setup progress" ON farm_setup_progress;
    DROP POLICY IF EXISTS "Users can update their own farm setup progress" ON farm_setup_progress;
    DROP POLICY IF EXISTS "Users can delete their own farm setup progress" ON farm_setup_progress;
EXCEPTION WHEN undefined_table THEN
    NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view their own farm setup responses" ON farm_setup_responses;
    DROP POLICY IF EXISTS "Users can create their own farm setup responses" ON farm_setup_responses;
    DROP POLICY IF EXISTS "Users can update their own farm setup responses" ON farm_setup_responses;
    DROP POLICY IF EXISTS "Users can delete their own farm setup responses" ON farm_setup_responses;
EXCEPTION WHEN undefined_table THEN
    NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Everyone can view farm setup templates" ON farm_setup_templates;
EXCEPTION WHEN undefined_table THEN
    NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view their own farm goals" ON farm_goals;
    DROP POLICY IF EXISTS "Users can create their own farm goals" ON farm_goals;
    DROP POLICY IF EXISTS "Users can update their own farm goals" ON farm_goals;
    DROP POLICY IF EXISTS "Users can delete their own farm goals" ON farm_goals;
EXCEPTION WHEN undefined_table THEN
    NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Everyone can view farm setup questions" ON farm_setup_questions;
EXCEPTION WHEN undefined_table THEN
    NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view their own farm module preferences" ON farm_module_preferences;
    DROP POLICY IF EXISTS "Users can create their own farm module preferences" ON farm_module_preferences;
    DROP POLICY IF EXISTS "Users can update their own farm module preferences" ON farm_module_preferences;
    DROP POLICY IF EXISTS "Users can delete their own farm module preferences" ON farm_module_preferences;
EXCEPTION WHEN undefined_table THEN
    NULL;
END $$;

-- Farm fields policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view fields of their own farms" ON farm_fields;
    DROP POLICY IF EXISTS "Users can create fields for their own farms" ON farm_fields;
    DROP POLICY IF EXISTS "Users can update fields of their own farms" ON farm_fields;
    DROP POLICY IF EXISTS "Users can delete fields of their own farms" ON farm_fields;
EXCEPTION WHEN undefined_table THEN
    NULL;
END $$;

-- Livestock policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view livestock categories of their own farms" ON livestock_categories;
    DROP POLICY IF EXISTS "Users can create livestock categories for their own farms" ON livestock_categories;
    DROP POLICY IF EXISTS "Users can update livestock categories of their own farms" ON livestock_categories;
    DROP POLICY IF EXISTS "Users can delete livestock categories of their own farms" ON livestock_categories;
EXCEPTION WHEN undefined_table THEN
    NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view livestock animals of their own farms" ON livestock_animals;
    DROP POLICY IF EXISTS "Users can create livestock animals for their own farms" ON livestock_animals;
    DROP POLICY IF EXISTS "Users can update livestock animals of their own farms" ON livestock_animals;
    DROP POLICY IF EXISTS "Users can delete livestock animals of their own farms" ON livestock_animals;
EXCEPTION WHEN undefined_table THEN
    NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view health records of their own animals" ON livestock_health_records;
    DROP POLICY IF EXISTS "Users can create health records for their own animals" ON livestock_health_records;
    DROP POLICY IF EXISTS "Users can update health records of their own animals" ON livestock_health_records;
    DROP POLICY IF EXISTS "Users can delete health records of their own animals" ON livestock_health_records;
EXCEPTION WHEN undefined_table THEN
    NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view breeding records of their own farms" ON livestock_breeding_records;
    DROP POLICY IF EXISTS "Users can create breeding records for their own farms" ON livestock_breeding_records;
    DROP POLICY IF EXISTS "Users can update breeding records of their own farms" ON livestock_breeding_records;
    DROP POLICY IF EXISTS "Users can delete breeding records of their own farms" ON livestock_breeding_records;
EXCEPTION WHEN undefined_table THEN
    NULL;
END $$;

-- Crop policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Everyone can view crop varieties" ON crop_varieties;
EXCEPTION WHEN undefined_table THEN
    NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view crop plantings of their own farms" ON crop_plantings;
    DROP POLICY IF EXISTS "Users can create crop plantings for their own farms" ON crop_plantings;
    DROP POLICY IF EXISTS "Users can update crop plantings of their own farms" ON crop_plantings;
    DROP POLICY IF EXISTS "Users can delete crop plantings of their own farms" ON crop_plantings;
EXCEPTION WHEN undefined_table THEN
    NULL;
END $$;

-- Irrigation policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view irrigation systems of their own farms" ON irrigation_systems;
    DROP POLICY IF EXISTS "Users can create irrigation systems for their own farms" ON irrigation_systems;
    DROP POLICY IF EXISTS "Users can update irrigation systems of their own farms" ON irrigation_systems;
    DROP POLICY IF EXISTS "Users can delete irrigation systems of their own farms" ON irrigation_systems;
EXCEPTION WHEN undefined_table THEN
    NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view irrigation schedules of their own systems" ON irrigation_schedules;
    DROP POLICY IF EXISTS "Users can create irrigation schedules for their own systems" ON irrigation_schedules;
    DROP POLICY IF EXISTS "Users can update irrigation schedules of their own systems" ON irrigation_schedules;
    DROP POLICY IF EXISTS "Users can delete irrigation schedules of their own systems" ON irrigation_schedules;
EXCEPTION WHEN undefined_table THEN
    NULL;
END $$;

-- Financial policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view financial categories of their own farms" ON farm_financial_categories;
    DROP POLICY IF EXISTS "Users can create financial categories for their own farms" ON farm_financial_categories;
    DROP POLICY IF EXISTS "Users can update financial categories of their own farms" ON farm_financial_categories;
    DROP POLICY IF EXISTS "Users can delete financial categories of their own farms" ON farm_financial_categories;
EXCEPTION WHEN undefined_table THEN
    NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view transactions of their own farms" ON farm_transactions;
    DROP POLICY IF EXISTS "Users can create transactions for their own farms" ON farm_transactions;
    DROP POLICY IF EXISTS "Users can update transactions of their own farms" ON farm_transactions;
    DROP POLICY IF EXISTS "Users can delete transactions of their own farms" ON farm_transactions;
EXCEPTION WHEN undefined_table THEN
    NULL;
END $$;

-- Inventory policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view inventory categories of their own farms" ON farm_inventory_categories;
    DROP POLICY IF EXISTS "Users can create inventory categories for their own farms" ON farm_inventory_categories;
    DROP POLICY IF EXISTS "Users can update inventory categories of their own farms" ON farm_inventory_categories;
    DROP POLICY IF EXISTS "Users can delete inventory categories of their own farms" ON farm_inventory_categories;
EXCEPTION WHEN undefined_table THEN
    NULL;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view inventory items of their own farms" ON farm_inventory_items;
    DROP POLICY IF EXISTS "Users can create inventory items for their own farms" ON farm_inventory_items;
    DROP POLICY IF EXISTS "Users can update inventory items of their own farms" ON farm_inventory_items;
    DROP POLICY IF EXISTS "Users can delete inventory items of their own farms" ON farm_inventory_items;
EXCEPTION WHEN undefined_table THEN
    NULL;
END $$;

-- Task policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view tasks of their own farms" ON farm_tasks;
    DROP POLICY IF EXISTS "Users can create tasks for their own farms" ON farm_tasks;
    DROP POLICY IF EXISTS "Users can update tasks of their own farms" ON farm_tasks;
    DROP POLICY IF EXISTS "Users can delete tasks of their own farms" ON farm_tasks;
EXCEPTION WHEN undefined_table THEN
    NULL;
END $$;

-- Weather data policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view weather data of their own farms" ON farm_weather_data;
    DROP POLICY IF EXISTS "Users can create weather data for their own farms" ON farm_weather_data;
    DROP POLICY IF EXISTS "Users can update weather data of their own farms" ON farm_weather_data;
    DROP POLICY IF EXISTS "Users can delete weather data of their own farms" ON farm_weather_data;
EXCEPTION WHEN undefined_table THEN
    NULL;
END $$;

-- Alert policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view alerts of their own farms" ON farm_alerts;
    DROP POLICY IF EXISTS "Users can create alerts for their own farms" ON farm_alerts;
    DROP POLICY IF EXISTS "Users can update alerts of their own farms" ON farm_alerts;
    DROP POLICY IF EXISTS "Users can delete alerts of their own farms" ON farm_alerts;
EXCEPTION WHEN undefined_table THEN
    NULL;
END $$;

-- Analytics policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view analytics of their own farms" ON farm_analytics_metrics;
    DROP POLICY IF EXISTS "Users can create analytics for their own farms" ON farm_analytics_metrics;
    DROP POLICY IF EXISTS "Users can update analytics of their own farms" ON farm_analytics_metrics;
    DROP POLICY IF EXISTS "Users can delete analytics of their own farms" ON farm_analytics_metrics;
EXCEPTION WHEN undefined_table THEN
    NULL;
END $$;

-- =============================================
-- RESET SEQUENCE COUNTERS (if any were used)
-- =============================================
-- Note: We're using UUIDs, so no sequences to reset

-- =============================================
-- VERIFICATION QUERIES
-- =============================================
-- Run these to confirm cleanup was successful

-- Check that all farm tables are gone
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND (table_name LIKE 'farm_%' OR table_name LIKE '%livestock%' OR table_name LIKE 'crop_%' OR table_name LIKE 'irrigation_%');
    
    IF table_count > 0 THEN
        RAISE NOTICE 'WARNING: % farm-related tables still exist. Check for any remaining dependencies.', table_count;
    ELSE
        RAISE NOTICE 'SUCCESS: All farm-related tables have been dropped.';
    END IF;
END $$;

-- Check that all farm policies are gone
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND (tablename LIKE 'farm_%' OR tablename LIKE '%livestock%' OR tablename LIKE 'crop_%' OR tablename LIKE 'irrigation_%');
    
    IF policy_count > 0 THEN
        RAISE NOTICE 'WARNING: % farm-related policies still exist.', policy_count;
    ELSE
        RAISE NOTICE 'SUCCESS: All farm-related policies have been dropped.';
    END IF;
END $$;

-- =============================================
-- USAGE INSTRUCTIONS
-- =============================================
/*
To completely reset the farm management system:

1. Run this cleanup script first:
   \i backend/db/schemas/farm/00_farm_cleanup.sql

2. Then run the farm management schema files in order:
   \i backend/db/schemas/farm/08_farm_management_tables.sql
   \i backend/db/schemas/farm/09_farm_setup_tables.sql
   \i backend/db/schemas/farm/10_farm_security_policies.sql
   \i backend/db/schemas/farm/11_farm_profile_integration.sql

3. Verify the setup by checking that tables and policies exist:
   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'farm_%';
   SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' AND tablename LIKE 'farm_%';

Note: This cleanup script should only be run in development environments or when you need to completely reset the farm management system. Running this in production will permanently delete all farm data!
*/
