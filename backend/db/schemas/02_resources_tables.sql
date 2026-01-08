-- Resource Categories Table
CREATE TABLE IF NOT EXISTS public.resource_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT, -- SVG or icon name
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Resources Table
CREATE TABLE IF NOT EXISTS public.resources (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    content TEXT,
    type TEXT NOT NULL, -- 'guide', 'document', 'video', etc.
    thumbnail TEXT, -- URL to thumbnail image
    file_url TEXT, -- URL to downloadable file if applicable
    external_url TEXT, -- External URL if applicable
    source TEXT, -- Source/author of the resource
    featured BOOLEAN DEFAULT FALSE,
    category_id INTEGER REFERENCES public.resource_categories(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    views INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Resource Tags Table
CREATE TABLE IF NOT EXISTS public.resource_tags (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resource Tag Relationships
CREATE TABLE IF NOT EXISTS public.resource_tag_relationships (
    resource_id INTEGER REFERENCES public.resources(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES public.resource_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (resource_id, tag_id)
);

-- Resource Ratings Table
CREATE TABLE IF NOT EXISTS public.resource_ratings (
    id SERIAL PRIMARY KEY,
    resource_id INTEGER REFERENCES public.resources(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (resource_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_tag_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for resource categories
CREATE POLICY "Anyone can view resource categories"
    ON public.resource_categories
    FOR SELECT
    USING (true);
    
CREATE POLICY "Only admins can insert resource categories"
    ON public.resource_categories
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ));
    
CREATE POLICY "Only admins can update resource categories"
    ON public.resource_categories
    FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ));

CREATE POLICY "Only admins can delete resource categories"
    ON public.resource_categories
    FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ));

-- Create policies for resources
CREATE POLICY "Anyone can view resources"
    ON public.resources
    FOR SELECT
    USING (true);
    
CREATE POLICY "Authenticated users can create resources"
    ON public.resources
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
    
CREATE POLICY "Users can update their own resources or admins can update any"
    ON public.resources
    FOR UPDATE
    USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Users can delete their own resources or admins can delete any"
    ON public.resources
    FOR DELETE
    USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Create policies for resource tags
CREATE POLICY "Anyone can view resource tags"
    ON public.resource_tags
    FOR SELECT
    USING (true);
    
CREATE POLICY "Authenticated users can create resource tags"
    ON public.resource_tags
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Create policies for resource tag relationships
CREATE POLICY "Anyone can view resource tag relationships"
    ON public.resource_tag_relationships
    FOR SELECT
    USING (true);
    
CREATE POLICY "Authenticated users can create resource tag relationships"
    ON public.resource_tag_relationships
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
    
CREATE POLICY "Users can delete their own resource tag relationships or admins can delete any"
    ON public.resource_tag_relationships
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.resources
            WHERE resources.id = resource_id AND resources.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Create policies for resource ratings
CREATE POLICY "Anyone can view resource ratings"
    ON public.resource_ratings
    FOR SELECT
    USING (true);
    
CREATE POLICY "Authenticated users can create resource ratings"
    ON public.resource_ratings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update their own resource ratings"
    ON public.resource_ratings
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resource ratings"
    ON public.resource_ratings
    FOR DELETE
    USING (auth.uid() = user_id);

-- Function to update resource view count
CREATE OR REPLACE FUNCTION public.increment_resource_views(resource_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.resources
    SET views = views + 1
    WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update resource download count
CREATE OR REPLACE FUNCTION public.increment_resource_downloads(resource_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.resources
    SET downloads = downloads + 1
    WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql; 