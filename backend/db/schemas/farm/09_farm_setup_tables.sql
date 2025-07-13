-- Farm Setup and Onboarding Tables
-- This file contains tables for the initial farm setup process

-- =============================================
-- FARM SETUP WIZARD PROGRESS
-- =============================================
CREATE TABLE IF NOT EXISTS farm_setup_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    
    -- Setup steps completed
    basic_info_completed BOOLEAN DEFAULT false,
    farm_type_selected BOOLEAN DEFAULT false,
    fields_configured BOOLEAN DEFAULT false,
    livestock_setup BOOLEAN DEFAULT false,
    crops_setup BOOLEAN DEFAULT false,
    financial_setup BOOLEAN DEFAULT false,
    preferences_set BOOLEAN DEFAULT false,
    
    -- Overall progress
    setup_completed BOOLEAN DEFAULT false,
    completion_percentage INTEGER DEFAULT 0,
    
    -- Current step
    current_step VARCHAR(100) DEFAULT 'basic_info',
    
    -- Form data storage
    form_data JSONB,
    last_completed_step INTEGER DEFAULT 0,
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT farm_setup_progress_user_unique UNIQUE(user_id)
);

-- =============================================
-- FARM SETUP RESPONSES
-- =============================================
CREATE TABLE IF NOT EXISTS farm_setup_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    setup_progress_id UUID NOT NULL REFERENCES farm_setup_progress(id) ON DELETE CASCADE,
    
    -- Step identifier
    step_name VARCHAR(100) NOT NULL,
    question_key VARCHAR(255) NOT NULL,
    
    -- Response data
    response_value TEXT,
    response_data JSONB, -- For complex responses
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(setup_progress_id, step_name, question_key)
);

-- =============================================
-- FARM SETUP TEMPLATES
-- =============================================
CREATE TABLE IF NOT EXISTS farm_setup_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    farm_type VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Template configuration
    template_data JSONB NOT NULL,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(255) DEFAULT 'system',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- FARM GOALS AND OBJECTIVES
-- =============================================
CREATE TABLE IF NOT EXISTS farm_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    
    -- Goal details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    goal_type VARCHAR(100), -- 'financial', 'production', 'sustainability', 'efficiency', 'expansion'
    category VARCHAR(100), -- 'livestock', 'crops', 'general', 'management'
    
    -- Targets
    target_value DECIMAL(15,2),
    target_unit VARCHAR(100),
    target_date DATE,
    
    -- Current progress
    current_value DECIMAL(15,2) DEFAULT 0,
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'paused', 'cancelled'
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
    
    -- Tracking
    last_updated_date DATE,
    completion_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- FARM SETUP QUESTION BANK
-- =============================================
CREATE TABLE IF NOT EXISTS farm_setup_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Question identification
    step_name VARCHAR(100) NOT NULL,
    question_key VARCHAR(255) NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL, -- 'text', 'number', 'select', 'multiselect', 'boolean', 'date'
    
    -- Question configuration
    is_required BOOLEAN DEFAULT true,
    validation_rules JSONB,
    options JSONB, -- For select/multiselect questions
    default_value TEXT,
    
    -- Conditional logic
    depends_on VARCHAR(255), -- Other question key
    condition_value TEXT,
    
    -- Display
    display_order INTEGER,
    help_text TEXT,
    placeholder TEXT,
    
    -- Farm type targeting
    applicable_farm_types TEXT[], -- ['livestock', 'crops', 'mixed', etc.]
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(step_name, question_key)
);

-- =============================================
-- FARM MODULES PREFERENCES
-- =============================================
CREATE TABLE IF NOT EXISTS farm_module_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    
    -- Module settings
    livestock_enabled BOOLEAN DEFAULT false,
    crops_enabled BOOLEAN DEFAULT false,
    irrigation_enabled BOOLEAN DEFAULT false,
    financial_enabled BOOLEAN DEFAULT true,
    inventory_enabled BOOLEAN DEFAULT false,
    analytics_enabled BOOLEAN DEFAULT true,
    weather_enabled BOOLEAN DEFAULT true,
    tasks_enabled BOOLEAN DEFAULT true,
    
    -- Advanced features
    breeding_tracking BOOLEAN DEFAULT false,
    health_monitoring BOOLEAN DEFAULT false,
    automated_alerts BOOLEAN DEFAULT true,
    mobile_notifications BOOLEAN DEFAULT true,
    
    -- Integration preferences
    weather_api_enabled BOOLEAN DEFAULT true,
    market_price_alerts BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT farm_module_preferences_farm_unique UNIQUE(farm_id)
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_farm_setup_progress_user ON farm_setup_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_farm_setup_responses_progress ON farm_setup_responses(setup_progress_id);
CREATE INDEX IF NOT EXISTS idx_farm_setup_responses_step ON farm_setup_responses(step_name);
CREATE INDEX IF NOT EXISTS idx_farm_goals_farm ON farm_goals(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_goals_status ON farm_goals(status);
CREATE INDEX IF NOT EXISTS idx_farm_questions_step ON farm_setup_questions(step_name);
CREATE INDEX IF NOT EXISTS idx_farm_module_prefs_farm ON farm_module_preferences(farm_id);

-- =============================================
-- TRIGGERS
-- =============================================
CREATE TRIGGER trigger_farm_setup_progress_updated_at
    BEFORE UPDATE ON farm_setup_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_farm_updated_at();

CREATE TRIGGER trigger_farm_goals_updated_at
    BEFORE UPDATE ON farm_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_farm_updated_at();

-- =============================================
-- INITIAL SETUP QUESTIONS DATA
-- =============================================
INSERT INTO farm_setup_questions (step_name, question_key, question_text, question_type, is_required, options, display_order, help_text, applicable_farm_types) VALUES

-- Basic Information Step
('basic_info', 'farm_name', 'What is the name of your farm?', 'text', true, null, 1, 'Choose a name that represents your farm', '{}'),
('basic_info', 'farm_location', 'Where is your farm located?', 'text', true, null, 2, 'Enter your farm''s location (district, region)', '{}'),
('basic_info', 'farm_address', 'What is your farm''s physical address?', 'text', false, null, 3, 'Detailed address for deliveries and visits', '{}'),
('basic_info', 'total_area', 'What is the total area of your farm (in hectares)?', 'number', true, null, 4, 'Enter the total land area you farm on', '{}'),
('basic_info', 'established_year', 'When was your farm established?', 'date', false, null, 5, 'Year you started farming operations', '{}'),
('basic_info', 'farm_description', 'Briefly describe your farm', 'text', false, null, 6, 'What makes your farm unique?', '{}'),

-- Farm Type Selection
('farm_type', 'primary_farm_type', 'What is your primary farming focus?', 'select', true, 
 '["livestock", "crops", "mixed", "dairy", "poultry", "aquaculture", "beekeeping", "other"]', 1, 
 'Choose your main farming activity', '{}'),
('farm_type', 'secondary_activities', 'What other farming activities do you do?', 'multiselect', false,
 '["cattle", "goats", "pigs", "chickens", "ducks", "maize", "coffee", "beans", "bananas", "vegetables", "fruits", "dairy_production", "egg_production", "fish_farming", "beekeeping"]', 2,
 'Select all that apply', '{}'),
('farm_type', 'farming_experience', 'How many years of farming experience do you have?', 'select', true,
 '["less_than_1", "1_3_years", "4_10_years", "11_20_years", "more_than_20"]', 3,
 'Your total experience in farming', '{}'),
('farm_type', 'farming_method', 'What farming methods do you use?', 'multiselect', true,
 '["organic", "conventional", "sustainable", "precision", "traditional", "mixed"]', 4,
 'Select your farming approach', '{}'),

-- Livestock Setup (conditional on farm type)
('livestock_setup', 'has_livestock', 'Do you currently have livestock?', 'boolean', true, null, 1, 'Any animals on your farm', '{"livestock", "mixed", "dairy", "poultry"}'),
('livestock_setup', 'livestock_types', 'What types of livestock do you have?', 'multiselect', true,
 '["cattle", "goats", "sheep", "pigs", "chickens", "ducks", "turkeys", "rabbits", "other"]', 2,
 'Select all livestock types', '{"livestock", "mixed", "dairy", "poultry"}'),
('livestock_setup', 'total_cattle', 'How many cattle do you have?', 'number', false, null, 3, 'Current number of cattle', '{"livestock", "mixed", "dairy"}'),
('livestock_setup', 'total_goats', 'How many goats do you have?', 'number', false, null, 4, 'Current number of goats', '{"livestock", "mixed"}'),
('livestock_setup', 'total_chickens', 'How many chickens do you have?', 'number', false, null, 5, 'Current number of chickens', '{"livestock", "mixed", "poultry"}'),
('livestock_setup', 'breeding_program', 'Do you have a breeding program?', 'boolean', false, null, 6, 'Planned breeding activities', '{"livestock", "mixed", "dairy"}'),
('livestock_setup', 'veterinary_care', 'Do you have regular veterinary care?', 'boolean', false, null, 7, 'Regular vet visits or healthcare plan', '{"livestock", "mixed", "dairy", "poultry"}'),

-- Crops Setup (conditional on farm type)
('crops_setup', 'has_crops', 'Do you grow crops?', 'boolean', true, null, 1, 'Any crop production on your farm', '{"crops", "mixed"}'),
('crops_setup', 'main_crops', 'What are your main crops?', 'multiselect', true,
 '["maize", "coffee", "beans", "bananas", "sweet_potato", "cassava", "groundnuts", "tomatoes", "onions", "irish_potato", "rice", "millet", "sorghum", "other"]', 2,
 'Select your primary crops', '{"crops", "mixed"}'),
('crops_setup', 'cropping_seasons', 'How many cropping seasons do you have per year?', 'select', true,
 '["1", "2", "3", "continuous"]', 3,
 'Number of planting/harvesting cycles', '{"crops", "mixed"}'),
('crops_setup', 'irrigation_available', 'Do you have irrigation systems?', 'boolean', false, null, 4, 'Any form of irrigation', '{"crops", "mixed"}'),
('crops_setup', 'organic_certification', 'Do you have organic certification?', 'boolean', false, null, 5, 'Certified organic farming', '{"crops", "mixed"}'),
('crops_setup', 'main_markets', 'Where do you sell your crops?', 'multiselect', false,
 '["local_market", "cooperatives", "direct_consumers", "processors", "exporters", "farm_gate"]', 6,
 'Your main sales channels', '{"crops", "mixed"}'),

-- Financial Setup
('financial_setup', 'track_finances', 'Do you currently track farm finances?', 'boolean', true, null, 1, 'Any form of financial record keeping', '{}'),
('financial_setup', 'financial_method', 'How do you currently track finances?', 'select', false,
 '["none", "notebook", "spreadsheet", "accounting_software", "mobile_app", "bank_records"]', 2,
 'Current method of financial tracking', '{}'),
('financial_setup', 'main_revenue_sources', 'What are your main sources of farm income?', 'multiselect', true,
 '["livestock_sales", "milk_sales", "egg_sales", "crop_sales", "processed_products", "services", "government_subsidies", "other"]', 3,
 'Select all revenue sources', '{}'),
('financial_setup', 'major_expenses', 'What are your major farm expenses?', 'multiselect', true,
 '["feed", "seeds", "fertilizers", "veterinary", "labor", "equipment", "fuel", "utilities", "rent", "insurance", "other"]', 4,
 'Select main cost categories', '{}'),
('financial_setup', 'annual_revenue', 'What is your approximate annual farm revenue?', 'select', false,
 '["under_1m", "1m_5m", "5m_10m", "10m_25m", "25m_50m", "50m_100m", "over_100m"]', 5,
 'Rough estimate in Uganda Shillings', '{}'),
('financial_setup', 'financial_goals', 'What are your main financial goals?', 'multiselect', false,
 '["increase_revenue", "reduce_costs", "improve_profitability", "diversify_income", "access_credit", "save_for_expansion", "retirement_planning"]', 6,
 'Your financial objectives', '{}'),

-- Goals and Preferences
('preferences', 'primary_goals', 'What are your main farming goals?', 'multiselect', true,
 '["increase_production", "improve_quality", "reduce_costs", "expand_farm", "sustainable_farming", "technology_adoption", "market_access", "food_security"]', 1,
 'Select your top priorities', '{}'),
('preferences', 'technology_comfort', 'How comfortable are you with farm technology?', 'select', true,
 '["beginner", "basic", "intermediate", "advanced", "expert"]', 2,
 'Your technology adoption level', '{}'),
('preferences', 'mobile_notifications', 'Would you like to receive mobile notifications?', 'boolean', true, null, 3, 'Alerts and reminders on your phone', '{}'),
('preferences', 'preferred_language', 'What is your preferred language?', 'select', true,
 '["english", "luganda", "swahili", "runyankole", "ateso", "other"]', 4,
 'Language for the interface', '{}'),
('preferences', 'support_level', 'What level of support do you need?', 'select', true,
 '["minimal", "basic", "regular", "intensive"]', 5,
 'How much guidance you would like', '{}'),
('preferences', 'training_interest', 'Are you interested in training programs?', 'multiselect', false,
 '["livestock_management", "crop_production", "financial_planning", "technology_use", "marketing", "sustainable_practices", "none"]', 6,
 'Areas where you''d like to learn more', '{}')

ON CONFLICT (step_name, question_key) DO NOTHING;

-- =============================================
-- FARM SETUP TEMPLATES
-- =============================================
INSERT INTO farm_setup_templates (name, farm_type, description, template_data) VALUES
('Small Scale Livestock Farm', 'livestock', 'Template for farmers with 10-50 animals', '{
  "default_fields": [
    {"name": "Grazing Area 1", "area_hectares": 2.0, "current_use": "pasture"},
    {"name": "Grazing Area 2", "area_hectares": 2.0, "current_use": "pasture"}
  ],
  "livestock_categories": [
    {"name": "Cattle", "species": "Cow"},
    {"name": "Goats", "species": "Goat"}
  ],
  "default_tasks": [
    {"title": "Morning Feeding", "task_type": "feeding", "recurrence_pattern": "daily"},
    {"title": "Evening Feeding", "task_type": "feeding", "recurrence_pattern": "daily"},
    {"title": "Water Check", "task_type": "watering", "recurrence_pattern": "daily"}
  ],
  "financial_categories": {
    "income": ["Livestock Sales", "Milk Sales", "Breeding Fees"],
    "expense": ["Feed", "Veterinary", "Labor", "Equipment"]
  }
}'),

('Small Scale Crop Farm', 'crops', 'Template for farmers with 1-10 hectares', '{
  "default_fields": [
    {"name": "Field A", "area_hectares": 2.0, "current_use": "crops"},
    {"name": "Field B", "area_hectares": 2.0, "current_use": "crops"}
  ],
  "default_crops": ["maize", "beans", "bananas"],
  "default_tasks": [
    {"title": "Land Preparation", "task_type": "preparation", "recurrence_pattern": "seasonal"},
    {"title": "Planting", "task_type": "planting", "recurrence_pattern": "seasonal"},
    {"title": "Weeding", "task_type": "maintenance", "recurrence_pattern": "weekly"}
  ],
  "financial_categories": {
    "income": ["Crop Sales", "Processed Products"],
    "expense": ["Seeds", "Fertilizers", "Labor", "Equipment"]
  }
}'),

('Mixed Farm', 'mixed', 'Template for farmers with both livestock and crops', '{
  "default_fields": [
    {"name": "Crop Field 1", "area_hectares": 2.0, "current_use": "crops"},
    {"name": "Pasture Area", "area_hectares": 2.0, "current_use": "pasture"}
  ],
  "livestock_categories": [
    {"name": "Cattle", "species": "Cow"},
    {"name": "Chickens", "species": "Chicken"}
  ],
  "default_crops": ["maize", "beans"],
  "default_tasks": [
    {"title": "Feed Animals", "task_type": "feeding", "recurrence_pattern": "daily"},
    {"title": "Collect Eggs", "task_type": "collection", "recurrence_pattern": "daily"},
    {"title": "Check Crops", "task_type": "monitoring", "recurrence_pattern": "weekly"}
  ],
  "financial_categories": {
    "income": ["Livestock Sales", "Crop Sales", "Egg Sales"],
    "expense": ["Feed", "Seeds", "Veterinary", "Labor"]
  }
}')
