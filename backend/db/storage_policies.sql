-- Storage Policies for AGRI-TECH Platform
-- This script sets up Row Level Security (RLS) policies for Supabase Storage buckets

-- First, ensure the storage schema and buckets exist
-- Note: These buckets should be created via the initialize_storage.js script

-- =============================================
-- SIMPLIFIED STORAGE POLICIES
-- =============================================

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete avatars" ON storage.objects;

DROP POLICY IF EXISTS "Anyone can view marketplace content" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to marketplace" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own marketplace content" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own marketplace content" ON storage.objects;

DROP POLICY IF EXISTS "Anyone can view resources" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can upload resources" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can update resources" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can delete resources" ON storage.objects;

DROP POLICY IF EXISTS "Anyone can view community content" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to community" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own community content" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own community content" ON storage.objects;

-- =============================================
-- USER-CONTENT BUCKET POLICIES
-- =============================================

-- Anyone can view avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-content' AND 
  (storage.foldername(name))[1] = 'avatars'
);

-- Authenticated users can upload avatars
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-content' AND 
  (storage.foldername(name))[1] = 'avatars' AND
  auth.role() = 'authenticated'
);

-- Authenticated users can update avatars
CREATE POLICY "Authenticated users can update avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-content' AND 
  (storage.foldername(name))[1] = 'avatars' AND
  auth.role() = 'authenticated'
);

-- Authenticated users can delete avatars
CREATE POLICY "Authenticated users can delete avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-content' AND 
  (storage.foldername(name))[1] = 'avatars' AND
  auth.role() = 'authenticated'
);

-- =============================================
-- MARKETPLACE BUCKET POLICIES
-- =============================================

-- Anyone can view marketplace content
CREATE POLICY "Anyone can view marketplace content"
ON storage.objects FOR SELECT
USING (bucket_id = 'marketplace');

-- Authenticated users can upload to marketplace
CREATE POLICY "Authenticated users can upload to marketplace"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'marketplace' AND 
  auth.role() = 'authenticated'
);

-- Authenticated users can update marketplace content
CREATE POLICY "Authenticated users can update marketplace content"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'marketplace' AND 
  auth.role() = 'authenticated'
);

-- Authenticated users can delete marketplace content
CREATE POLICY "Authenticated users can delete marketplace content"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'marketplace' AND 
  auth.role() = 'authenticated'
);

-- =============================================
-- RESOURCES BUCKET POLICIES
-- =============================================

-- Anyone can view resources
CREATE POLICY "Anyone can view resources"
ON storage.objects FOR SELECT
USING (bucket_id = 'resources');

-- Authenticated users can upload resources
CREATE POLICY "Authenticated users can upload resources"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resources' AND 
  auth.role() = 'authenticated'
);

-- Authenticated users can update resources
CREATE POLICY "Authenticated users can update resources"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'resources' AND 
  auth.role() = 'authenticated'
);

-- Authenticated users can delete resources
CREATE POLICY "Authenticated users can delete resources"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'resources' AND 
  auth.role() = 'authenticated'
);

-- =============================================
-- COMMUNITY BUCKET POLICIES
-- =============================================

-- Anyone can view community content
CREATE POLICY "Anyone can view community content"
ON storage.objects FOR SELECT
USING (bucket_id = 'community');

-- Authenticated users can upload to community
CREATE POLICY "Authenticated users can upload to community"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'community' AND 
  auth.role() = 'authenticated'
);

-- Authenticated users can update community content
CREATE POLICY "Authenticated users can update community content"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'community' AND 
  auth.role() = 'authenticated'
);

-- Authenticated users can delete community content
CREATE POLICY "Authenticated users can delete community content"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'community' AND 
  auth.role() = 'authenticated'
);
-- =============================================
-- STATUS STORAGE POLICIES (ICAN)
-- =============================================

-- Anyone can view statuses
CREATE POLICY "Anyone can view statuses"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-content' AND 
  (storage.foldername(name))[1] = 'statuses'
);

-- Authenticated users can upload statuses
CREATE POLICY "Authenticated users can upload statuses"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-content' AND 
  (storage.foldername(name))[1] = 'statuses' AND
  auth.role() = 'authenticated'
);

-- Authenticated users can update their own statuses
CREATE POLICY "Users can update their own statuses"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-content' AND 
  (storage.foldername(name))[1] = 'statuses' AND
  auth.role() = 'authenticated'
);

-- Authenticated users can delete their own statuses
CREATE POLICY "Users can delete their own statuses"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-content' AND 
  (storage.foldername(name))[1] = 'statuses' AND
  auth.role() = 'authenticated'
);
-- Update schema cache for PostgREST
NOTIFY pgrst, 'reload schema'; 