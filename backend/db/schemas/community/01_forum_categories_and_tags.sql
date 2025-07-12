-- =============================================
-- FORUM CATEGORIES AND TAGS TABLES
-- =============================================

-- Forum Categories Table (Enhanced)
CREATE TABLE IF NOT EXISTS public.forum_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT, -- Material-UI icon name or custom icon URL
    parent_id INTEGER REFERENCES public.forum_categories(id) ON DELETE SET NULL,
    display_order INTEGER DEFAULT 0,
    color_hex TEXT DEFAULT '#1976d2', -- Category color for UI
    is_active BOOLEAN DEFAULT TRUE,
    post_count INTEGER DEFAULT 0, -- Denormalized for performance
    latest_post_id INTEGER, -- Will be set via trigger
    moderators TEXT[] DEFAULT '{}', -- Array of user IDs who can moderate this category
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum Tags Table (Enhanced)
CREATE TABLE IF NOT EXISTS public.forum_tags (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    color_hex TEXT DEFAULT '#2196f3',
    usage_count INTEGER DEFAULT 0, -- Denormalized for trending tags
    is_featured BOOLEAN DEFAULT FALSE, -- For highlighting popular tags
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_forum_categories_slug ON public.forum_categories(slug);
CREATE INDEX IF NOT EXISTS idx_forum_categories_parent_id ON public.forum_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_forum_categories_display_order ON public.forum_categories(display_order);
CREATE INDEX IF NOT EXISTS idx_forum_tags_slug ON public.forum_tags(slug);
CREATE INDEX IF NOT EXISTS idx_forum_tags_usage_count ON public.forum_tags(usage_count DESC);

-- Enable Row Level Security
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_tags ENABLE ROW LEVEL SECURITY;

-- Forum Categories Policies
CREATE POLICY "Anyone can view forum categories"
    ON public.forum_categories
    FOR SELECT
    USING (is_active = true);
    
CREATE POLICY "Authenticated users can suggest categories"
    ON public.forum_categories
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Forum Tags Policies
CREATE POLICY "Anyone can view forum tags"
    ON public.forum_tags
    FOR SELECT
    USING (true);
    
CREATE POLICY "Authenticated users can create tags"
    ON public.forum_tags
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
    
CREATE POLICY "Only admins can update or delete tags"
    ON public.forum_tags
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Insert default forum categories
INSERT INTO public.forum_categories (name, slug, description, icon, color_hex, display_order) VALUES
('General Discussion', 'general', 'General farming discussions and community chat', 'Forum', '#1976d2', 1),
('Crop Farming', 'crop-farming', 'Discussions about crop cultivation, planting, and harvesting', 'Agriculture', '#4caf50', 2),
('Livestock Management', 'livestock', 'Everything about raising and caring for farm animals', 'Pets', '#ff9800', 3),
('Market & Trading', 'market-trading', 'Buy, sell, and trade agricultural products and services', 'LocalMall', '#f44336', 4),
('Technology & Innovation', 'technology', 'Modern farming techniques, tools, and agricultural technology', 'BioTech', '#9c27b0', 5),
('Weather & Climate', 'weather', 'Weather patterns, climate change, and seasonal farming advice', 'WbSunny', '#00bcd4', 6),
('Success Stories', 'success-stories', 'Share your farming achievements and inspire others', 'EmojiEvents', '#ffc107', 7),
('Questions & Help', 'questions-help', 'Ask for help and get expert advice from the community', 'Help', '#607d8b', 8)
ON CONFLICT (slug) DO NOTHING;

-- Insert default forum tags
INSERT INTO public.forum_tags (name, slug, description, color_hex) VALUES
('Beginner', 'beginner', 'Questions and discussions for new farmers', '#4caf50'),
('Expert Tips', 'expert-tips', 'Advanced advice from experienced farmers', '#f44336'),
('Organic Farming', 'organic', 'Sustainable and organic farming practices', '#8bc34a'),
('Pest Control', 'pest-control', 'Managing pests and diseases in crops', '#ff5722'),
('Irrigation', 'irrigation', 'Water management and irrigation systems', '#2196f3'),
('Soil Health', 'soil-health', 'Soil management and fertility', '#795548'),
('Seeds & Varieties', 'seeds-varieties', 'Seed selection and crop varieties', '#9c27b0'),
('Harvest', 'harvest', 'Harvesting techniques and timing', '#ff9800'),
('Equipment', 'equipment', 'Farm tools and machinery', '#607d8b'),
('Finance', 'finance', 'Agricultural loans and financial planning', '#009688'),
('Seasonal', 'seasonal', 'Season-specific farming advice', '#ffc107'),
('Emergency', 'emergency', 'Urgent farming issues requiring immediate help', '#e91e63')
ON CONFLICT (slug) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Forum Categories and Tags tables created successfully!';
END $$;
