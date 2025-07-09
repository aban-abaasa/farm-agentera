-- Note: The auth tables are managed by Supabase Auth
-- This schema extends the default auth with custom profile fields

-- Profiles table extension
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone_number TEXT,
    bio TEXT,
    location TEXT,
    avatar_url TEXT,
    farmer_type TEXT, -- e.g. 'crop', 'livestock', 'mixed'
    farm_size NUMERIC,
    farm_location TEXT,
    role TEXT DEFAULT 'user',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" 
    ON public.profiles 
    FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles 
    FOR UPDATE 
    USING (auth.uid() = id);

-- Create a trigger to automatically insert a profile record when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, created_at)
    VALUES (
        NEW.id, 
        NEW.email, 
        NEW.raw_user_meta_data->>'first_name' || '', 
        NEW.raw_user_meta_data->>'last_name' || '', 
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure public access to the profiles table
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, UPDATE ON public.profiles TO authenticated; 