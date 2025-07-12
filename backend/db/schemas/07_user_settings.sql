-- =============================================
-- USER SETTINGS TABLES
-- =============================================

-- Create user_settings table to store user preferences
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Appearance settings
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
    color_scheme TEXT DEFAULT 'green' CHECK (color_scheme IN ('green', 'blue', 'amber', 'purple', 'teal')),
    font_size INTEGER DEFAULT 100 CHECK (font_size >= 80 AND font_size <= 120),
    reduced_motion BOOLEAN DEFAULT FALSE,
    
    -- Language & Localization settings
    language TEXT DEFAULT 'en' CHECK (language IN ('en', 'sw', 'lg', 'fr')),
    date_format TEXT DEFAULT 'MM/DD/YYYY' CHECK (date_format IN ('MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD')),
    time_format TEXT DEFAULT '12h' CHECK (time_format IN ('12h', '24h')),
    timezone TEXT DEFAULT 'UTC',
    
    -- Notification settings
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT FALSE,
    marketplace_alerts BOOLEAN DEFAULT TRUE,
    community_alerts BOOLEAN DEFAULT TRUE,
    weather_alerts BOOLEAN DEFAULT TRUE,
    event_reminders BOOLEAN DEFAULT TRUE,
    message_notifications BOOLEAN DEFAULT TRUE,
    
    -- Privacy settings
    profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'connections', 'private')),
    contact_info_visibility TEXT DEFAULT 'connections' CHECK (contact_info_visibility IN ('public', 'connections', 'private')),
    activity_tracking BOOLEAN DEFAULT TRUE,
    location_sharing BOOLEAN DEFAULT FALSE,
    
    -- Data usage settings
    auto_play BOOLEAN DEFAULT FALSE,
    high_quality_images BOOLEAN DEFAULT TRUE,
    data_usage_optimization BOOLEAN DEFAULT FALSE,
    download_over_cellular BOOLEAN DEFAULT FALSE,
    
    -- Accessibility settings
    high_contrast BOOLEAN DEFAULT FALSE,
    large_text BOOLEAN DEFAULT FALSE,
    screen_reader_support BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one settings record per user
    UNIQUE(user_id)
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for user_settings
CREATE POLICY "Users can view their own settings" 
    ON public.user_settings 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
    ON public.user_settings 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
    ON public.user_settings 
    FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" 
    ON public.user_settings 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- Create function to automatically create default settings for new users
CREATE OR REPLACE FUNCTION public.create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_settings (user_id, created_at)
    VALUES (NEW.id, NOW())
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- Log the error but don't prevent user creation
        RAISE LOG 'Error in create_default_user_settings: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create settings when a new user is created
CREATE TRIGGER on_user_settings_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.create_default_user_settings();

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the updated_at timestamp
CREATE TRIGGER update_user_settings_timestamp
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_user_settings_updated_at();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_settings TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
