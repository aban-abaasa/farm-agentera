-- Farm Management Tables
-- This file contains all tables needed for comprehensive farm management functionality

-- =============================================
-- FARMS TABLE - Main farm information
-- =============================================
CREATE TABLE IF NOT EXISTS farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    address TEXT,
    coordinates POINT, -- For GPS coordinates (longitude, latitude)
    total_area_hectares DECIMAL(10,2),
    established_date DATE,
    farm_type VARCHAR(100), -- 'livestock', 'crops', 'mixed', 'dairy', 'poultry', etc.
    primary_crops TEXT[], -- Array of main crops grown
    certifications TEXT[], -- Organic, Fair Trade, etc.
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'setup_pending'
    
    -- Settings and preferences
    timezone VARCHAR(100) DEFAULT 'Africa/Kampala',
    currency VARCHAR(10) DEFAULT 'UGX',
    measurement_system VARCHAR(20) DEFAULT 'metric', -- 'metric', 'imperial'
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    CONSTRAINT farms_user_id_unique UNIQUE(user_id)
);

-- =============================================
-- FARM FIELDS/SECTIONS - Different areas of the farm
-- =============================================
CREATE TABLE IF NOT EXISTS farm_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    area_hectares DECIMAL(8,2),
    soil_type VARCHAR(100), -- 'clay', 'sandy', 'loam', 'silt', etc.
    terrain VARCHAR(100), -- 'flat', 'hilly', 'sloped', etc.
    drainage VARCHAR(100), -- 'good', 'poor', 'moderate'
    current_use VARCHAR(100), -- 'crops', 'pasture', 'fallow', 'construction'
    coordinates POLYGON, -- Field boundaries
    
    -- Field status
    status VARCHAR(50) DEFAULT 'active',
    last_soil_test_date DATE,
    soil_ph DECIMAL(3,1),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- LIVESTOCK MANAGEMENT
-- =============================================
CREATE TABLE IF NOT EXISTS livestock_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- 'Cattle', 'Goats', 'Chickens', 'Pigs', etc.
    species VARCHAR(100), -- 'Cow', 'Goat', 'Chicken', etc.
    breed VARCHAR(100),
    description TEXT,
    care_instructions TEXT,
    typical_lifespan_years INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS livestock_animals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES livestock_categories(id) ON DELETE CASCADE,
    
    -- Animal identification
    tag_number VARCHAR(100) UNIQUE,
    name VARCHAR(255),
    breed VARCHAR(100),
    gender VARCHAR(20), -- 'male', 'female', 'unknown'
    
    -- Basic info
    birth_date DATE,
    acquisition_date DATE,
    acquisition_type VARCHAR(50), -- 'born', 'purchased', 'gift', 'transfer'
    acquisition_cost DECIMAL(12,2),
    current_weight_kg DECIMAL(8,2),
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'sold', 'deceased', 'transferred'
    health_status VARCHAR(50) DEFAULT 'healthy', -- 'healthy', 'sick', 'quarantined', 'recovering'
    location VARCHAR(255), -- Current location/field
    
    -- Parent tracking
    mother_id UUID REFERENCES livestock_animals(id),
    father_id UUID REFERENCES livestock_animals(id),
    
    -- Additional info
    notes TEXT,
    photo_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- LIVESTOCK HEALTH RECORDS
-- =============================================
CREATE TABLE IF NOT EXISTS livestock_health_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID NOT NULL REFERENCES livestock_animals(id) ON DELETE CASCADE,
    
    record_type VARCHAR(50) NOT NULL, -- 'vaccination', 'treatment', 'checkup', 'injury', 'illness'
    date_recorded DATE NOT NULL,
    description TEXT NOT NULL,
    
    -- Medical details
    symptoms TEXT,
    diagnosis TEXT,
    treatment TEXT,
    medication VARCHAR(255),
    dosage VARCHAR(100),
    administered_by VARCHAR(255), -- Vet name or farmer
    
    -- Follow-up
    next_checkup_date DATE,
    recovery_status VARCHAR(50), -- 'recovered', 'ongoing', 'chronic'
    
    -- Costs
    cost DECIMAL(10,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- LIVESTOCK BREEDING RECORDS
-- =============================================
CREATE TABLE IF NOT EXISTS livestock_breeding_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    mother_id UUID NOT NULL REFERENCES livestock_animals(id),
    father_id UUID REFERENCES livestock_animals(id),
    
    breeding_date DATE,
    expected_due_date DATE,
    actual_birth_date DATE,
    
    -- Birth details
    number_of_offspring INTEGER DEFAULT 1,
    birth_complications TEXT,
    birth_weight_kg DECIMAL(6,2),
    
    -- Status
    status VARCHAR(50) DEFAULT 'planned', -- 'planned', 'confirmed', 'completed', 'failed'
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- CROP MANAGEMENT
-- =============================================
CREATE TABLE IF NOT EXISTS crop_varieties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    crop_type VARCHAR(100), -- 'grain', 'vegetable', 'fruit', 'legume', etc.
    season VARCHAR(50), -- 'wet', 'dry', 'both'
    maturity_days INTEGER,
    expected_yield_per_hectare DECIMAL(8,2),
    description TEXT,
    
    -- Growing requirements
    soil_ph_min DECIMAL(3,1),
    soil_ph_max DECIMAL(3,1),
    water_requirements VARCHAR(50), -- 'low', 'medium', 'high'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crop_plantings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES farm_fields(id) ON DELETE CASCADE,
    variety_id UUID NOT NULL REFERENCES crop_varieties(id),
    
    -- Planting details
    planting_date DATE NOT NULL,
    expected_harvest_date DATE,
    actual_harvest_date DATE,
    area_planted_hectares DECIMAL(8,2),
    
    -- Seeds/inputs
    seed_quantity_kg DECIMAL(8,2),
    seed_cost DECIMAL(10,2),
    fertilizer_used TEXT,
    fertilizer_cost DECIMAL(10,2),
    
    -- Status and results
    status VARCHAR(50) DEFAULT 'planted', -- 'planned', 'planted', 'growing', 'harvested', 'failed'
    actual_yield_kg DECIMAL(10,2),
    quality_grade VARCHAR(50), -- 'A', 'B', 'C', 'premium', 'standard'
    
    -- Costs and revenue
    total_production_cost DECIMAL(12,2),
    revenue DECIMAL(12,2),
    
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- IRRIGATION MANAGEMENT
-- =============================================
CREATE TABLE IF NOT EXISTS irrigation_systems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    system_type VARCHAR(100), -- 'drip', 'sprinkler', 'furrow', 'flood', 'manual'
    
    -- Coverage
    coverage_area_hectares DECIMAL(8,2),
    fields_covered UUID[], -- Array of field IDs
    
    -- Technical details
    installation_date DATE,
    capacity_liters_per_hour DECIMAL(10,2),
    water_source VARCHAR(100), -- 'well', 'river', 'pond', 'municipal', 'rainwater'
    
    -- Status and performance
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'maintenance', 'broken', 'inactive'
    efficiency_percentage DECIMAL(5,2),
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    
    installation_cost DECIMAL(12,2),
    annual_maintenance_cost DECIMAL(10,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS irrigation_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    system_id UUID NOT NULL REFERENCES irrigation_systems(id) ON DELETE CASCADE,
    field_id UUID REFERENCES farm_fields(id),
    
    -- Schedule details
    schedule_name VARCHAR(255),
    start_time TIME,
    duration_minutes INTEGER,
    frequency VARCHAR(50), -- 'daily', 'weekly', 'custom'
    days_of_week INTEGER[], -- [1,2,3,4,5,6,7] for days
    
    -- Water management
    water_amount_liters DECIMAL(10,2),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_run_date TIMESTAMP WITH TIME ZONE,
    next_run_date TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- FINANCIAL MANAGEMENT
-- =============================================
CREATE TABLE IF NOT EXISTS farm_financial_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category_type VARCHAR(50), -- 'income', 'expense'
    parent_category_id UUID REFERENCES farm_financial_categories(id),
    description TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS farm_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES farm_financial_categories(id),
    
    -- Transaction details
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'income', 'expense'
    
    -- References to farm entities
    animal_id UUID REFERENCES livestock_animals(id),
    planting_id UUID REFERENCES crop_plantings(id),
    system_id UUID REFERENCES irrigation_systems(id),
    
    -- Additional details
    payment_method VARCHAR(100), -- 'cash', 'bank_transfer', 'mobile_money', 'credit'
    receipt_number VARCHAR(255),
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INVENTORY MANAGEMENT
-- =============================================
CREATE TABLE IF NOT EXISTS farm_inventory_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS farm_inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES farm_inventory_categories(id),
    
    -- Item details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit_of_measure VARCHAR(50), -- 'kg', 'bags', 'pieces', 'liters'
    
    -- Quantity tracking
    current_quantity DECIMAL(10,2) DEFAULT 0,
    minimum_quantity DECIMAL(10,2) DEFAULT 0,
    maximum_quantity DECIMAL(10,2),
    
    -- Pricing
    unit_cost DECIMAL(10,2),
    supplier VARCHAR(255),
    
    -- Storage
    storage_location VARCHAR(255),
    expiry_date DATE,
    
    status VARCHAR(50) DEFAULT 'in_stock', -- 'in_stock', 'low_stock', 'out_of_stock', 'expired'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TASKS AND ACTIVITIES
-- =============================================
CREATE TABLE IF NOT EXISTS farm_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    
    -- Task details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(100), -- 'feeding', 'watering', 'vaccination', 'harvesting', 'maintenance'
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    
    -- Scheduling
    scheduled_date DATE,
    scheduled_time TIME,
    estimated_duration_minutes INTEGER,
    
    -- Assignment
    assigned_to VARCHAR(255), -- Can be expanded to reference users table
    
    -- References
    animal_id UUID REFERENCES livestock_animals(id),
    field_id UUID REFERENCES farm_fields(id),
    planting_id UUID REFERENCES crop_plantings(id),
    system_id UUID REFERENCES irrigation_systems(id),
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled', 'overdue'
    completion_date TIMESTAMP WITH TIME ZONE,
    completion_notes TEXT,
    
    -- Recurring tasks
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern VARCHAR(100), -- 'daily', 'weekly', 'monthly', 'custom'
    recurrence_interval INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- WEATHER DATA STORAGE
-- =============================================
CREATE TABLE IF NOT EXISTS farm_weather_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    
    -- Date and time
    recorded_date DATE NOT NULL,
    recorded_time TIME,
    
    -- Weather metrics
    temperature_celsius DECIMAL(5,2),
    humidity_percentage DECIMAL(5,2),
    rainfall_mm DECIMAL(6,2),
    wind_speed_kmh DECIMAL(5,2),
    wind_direction VARCHAR(10), -- 'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'
    pressure_mbar DECIMAL(6,2),
    
    -- Conditions
    weather_condition VARCHAR(100), -- 'sunny', 'cloudy', 'rainy', 'stormy'
    visibility_km DECIMAL(5,2),
    
    -- Data source
    data_source VARCHAR(100), -- 'manual', 'weather_station', 'api', 'sensor'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- FARM ALERTS AND NOTIFICATIONS
-- =============================================
CREATE TABLE IF NOT EXISTS farm_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    
    -- Alert details
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    alert_type VARCHAR(100), -- 'health', 'weather', 'task', 'inventory', 'finance', 'general'
    severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    
    -- References
    animal_id UUID REFERENCES livestock_animals(id),
    field_id UUID REFERENCES farm_fields(id),
    task_id UUID REFERENCES farm_tasks(id),
    item_id UUID REFERENCES farm_inventory_items(id),
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'acknowledged', 'resolved', 'dismissed'
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Auto-resolution
    auto_resolve_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- FARM ANALYTICS DATA
-- =============================================
CREATE TABLE IF NOT EXISTS farm_analytics_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    
    -- Time period
    metric_date DATE NOT NULL,
    metric_period VARCHAR(20) DEFAULT 'daily', -- 'daily', 'weekly', 'monthly', 'yearly'
    
    -- Financial metrics
    total_revenue DECIMAL(15,2) DEFAULT 0,
    total_expenses DECIMAL(15,2) DEFAULT 0,
    net_profit DECIMAL(15,2) DEFAULT 0,
    
    -- Livestock metrics
    total_livestock_count INTEGER DEFAULT 0,
    healthy_livestock_count INTEGER DEFAULT 0,
    livestock_births INTEGER DEFAULT 0,
    livestock_deaths INTEGER DEFAULT 0,
    
    -- Crop metrics
    total_planted_area DECIMAL(10,2) DEFAULT 0,
    total_harvested_area DECIMAL(10,2) DEFAULT 0,
    total_yield_kg DECIMAL(12,2) DEFAULT 0,
    
    -- Efficiency metrics
    feed_efficiency_ratio DECIMAL(5,2),
    water_usage_liters DECIMAL(12,2) DEFAULT 0,
    productivity_index DECIMAL(5,2),
    
    -- Calculated at insert/update
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(farm_id, metric_date, metric_period)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Farms indexes
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON farms(user_id);
CREATE INDEX IF NOT EXISTS idx_farms_status ON farms(status);

-- Fields indexes
CREATE INDEX IF NOT EXISTS idx_farm_fields_farm_id ON farm_fields(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_fields_status ON farm_fields(status);

-- Livestock indexes
CREATE INDEX IF NOT EXISTS idx_livestock_animals_farm_id ON livestock_animals(farm_id);
CREATE INDEX IF NOT EXISTS idx_livestock_animals_category ON livestock_animals(category_id);
CREATE INDEX IF NOT EXISTS idx_livestock_animals_status ON livestock_animals(status);
CREATE INDEX IF NOT EXISTS idx_livestock_animals_tag ON livestock_animals(tag_number);

-- Health records indexes
CREATE INDEX IF NOT EXISTS idx_health_records_animal_id ON livestock_health_records(animal_id);
CREATE INDEX IF NOT EXISTS idx_health_records_date ON livestock_health_records(date_recorded);
CREATE INDEX IF NOT EXISTS idx_health_records_type ON livestock_health_records(record_type);

-- Crop indexes
CREATE INDEX IF NOT EXISTS idx_crop_plantings_farm_id ON crop_plantings(farm_id);
CREATE INDEX IF NOT EXISTS idx_crop_plantings_field_id ON crop_plantings(field_id);
CREATE INDEX IF NOT EXISTS idx_crop_plantings_status ON crop_plantings(status);
CREATE INDEX IF NOT EXISTS idx_crop_plantings_dates ON crop_plantings(planting_date, expected_harvest_date);

-- Financial indexes
CREATE INDEX IF NOT EXISTS idx_farm_transactions_farm_id ON farm_transactions(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_transactions_date ON farm_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_farm_transactions_type ON farm_transactions(transaction_type);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_farm_tasks_farm_id ON farm_tasks(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_tasks_status ON farm_tasks(status);
CREATE INDEX IF NOT EXISTS idx_farm_tasks_scheduled ON farm_tasks(scheduled_date);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_farm_date ON farm_analytics_metrics(farm_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_analytics_period ON farm_analytics_metrics(metric_period);

-- =============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Update farm updated_at timestamp
CREATE OR REPLACE FUNCTION update_farm_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_farms_updated_at
    BEFORE UPDATE ON farms
    FOR EACH ROW
    EXECUTE FUNCTION update_farm_updated_at();

-- Similar triggers for other tables
CREATE TRIGGER trigger_farm_fields_updated_at
    BEFORE UPDATE ON farm_fields
    FOR EACH ROW
    EXECUTE FUNCTION update_farm_updated_at();

CREATE TRIGGER trigger_livestock_animals_updated_at
    BEFORE UPDATE ON livestock_animals
    FOR EACH ROW
    EXECUTE FUNCTION update_farm_updated_at();

CREATE TRIGGER trigger_crop_plantings_updated_at
    BEFORE UPDATE ON crop_plantings
    FOR EACH ROW
    EXECUTE FUNCTION update_farm_updated_at();

CREATE TRIGGER trigger_irrigation_systems_updated_at
    BEFORE UPDATE ON irrigation_systems
    FOR EACH ROW
    EXECUTE FUNCTION update_farm_updated_at();

-- =============================================
-- INITIAL DATA SEEDING
-- =============================================

-- Insert common crop varieties
INSERT INTO crop_varieties (name, scientific_name, crop_type, season, maturity_days, expected_yield_per_hectare, description, soil_ph_min, soil_ph_max, water_requirements) VALUES
('Maize', 'Zea mays', 'grain', 'both', 120, 6000.00, 'Staple grain crop suitable for most soil types', 6.0, 7.5, 'medium'),
('Coffee Arabica', 'Coffea arabica', 'beverage', 'both', 2190, 1200.00, 'High-quality coffee for export and local consumption', 6.0, 6.5, 'medium'),
('Beans', 'Phaseolus vulgaris', 'legume', 'both', 90, 1500.00, 'Nitrogen-fixing legume, good for soil health', 6.0, 7.0, 'medium'),
('Bananas', 'Musa acuminata', 'fruit', 'both', 365, 25000.00, 'Perennial crop, year-round production', 5.5, 7.0, 'high'),
('Sweet Potato', 'Ipomoea batatas', 'root', 'both', 120, 8000.00, 'Nutritious root crop, drought tolerant', 5.8, 6.2, 'low'),
('Cassava', 'Manihot esculenta', 'root', 'both', 300, 12000.00, 'Drought-resistant staple crop', 5.5, 7.0, 'low'),
('Groundnuts', 'Arachis hypogaea', 'legume', 'dry', 120, 2000.00, 'Oil crop and protein source', 6.0, 7.0, 'medium'),
('Tomatoes', 'Solanum lycopersicum', 'vegetable', 'both', 75, 30000.00, 'High-value vegetable crop', 6.0, 6.8, 'medium'),
('Onions', 'Allium cepa', 'vegetable', 'dry', 100, 20000.00, 'Storage vegetable with good market demand', 6.0, 7.0, 'medium'),
('Irish Potato', 'Solanum tuberosum', 'root', 'dry', 90, 15000.00, 'Cool season root crop', 5.2, 6.4, 'medium')
ON CONFLICT DO NOTHING;

-- Insert default farm financial categories
-- These will be inserted when a farm is created via the service functions

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- Farm overview view
CREATE OR REPLACE VIEW farm_overview AS
SELECT 
    f.id,
    f.name,
    f.location,
    f.total_area_hectares,
    f.farm_type,
    f.status,
    COUNT(DISTINCT fa.id) as total_animals,
    COUNT(DISTINCT ff.id) as total_fields,
    COUNT(DISTINCT cp.id) as active_plantings,
    COALESCE(SUM(CASE WHEN ft.transaction_type = 'income' THEN ft.amount ELSE 0 END), 0) as total_revenue,
    COALESCE(SUM(CASE WHEN ft.transaction_type = 'expense' THEN ft.amount ELSE 0 END), 0) as total_expenses
FROM farms f
LEFT JOIN livestock_animals fa ON f.id = fa.farm_id AND fa.status = 'active'
LEFT JOIN farm_fields ff ON f.id = ff.farm_id AND ff.status = 'active'
LEFT JOIN crop_plantings cp ON f.id = cp.farm_id AND cp.status IN ('planted', 'growing')
LEFT JOIN farm_transactions ft ON f.id = ft.farm_id AND ft.transaction_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY f.id, f.name, f.location, f.total_area_hectares, f.farm_type, f.status;
