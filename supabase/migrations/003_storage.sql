-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Audio files bucket (protected)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'audio-files',
    'audio-files',
    false,
    524288000,
    ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/m4a', 'audio/x-m4a']
);

-- PDF files bucket (protected)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'pdf-files',
    'pdf-files',
    false,
    104857600,
    ARRAY['application/pdf']
);

-- Thumbnails bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'thumbnails',
    'thumbnails',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Avatars bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    2097152,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Thumbnails: Anyone can view
CREATE POLICY "Public thumbnails access"
ON storage.objects FOR SELECT
USING (bucket_id = 'thumbnails');

-- Thumbnails: Admins can upload
CREATE POLICY "Admins can upload thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'thumbnails' AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Thumbnails: Admins can update
CREATE POLICY "Admins can update thumbnails"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'thumbnails' AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Thumbnails: Admins can delete
CREATE POLICY "Admins can delete thumbnails"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'thumbnails' AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Avatars: Anyone can view
CREATE POLICY "Public avatars access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Avatars: Users can upload their own
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Avatars: Users can update their own
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Avatars: Users can delete their own
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Audio files: Authenticated can access free audio
CREATE POLICY "Authenticated can access free audio"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'audio-files' AND
    auth.role() = 'authenticated' AND
    EXISTS (
        SELECT 1 FROM content
        WHERE file_url LIKE '%' || name
        AND access_level = 'free'
        AND is_published = true
    )
);

-- Audio files: Premium users can access premium audio
CREATE POLICY "Premium can access premium audio"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'audio-files' AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND (role = 'premium' OR role = 'admin')
    )
);

-- Audio files: Admins can upload
CREATE POLICY "Admins can upload audio"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'audio-files' AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Audio files: Admins can update
CREATE POLICY "Admins can update audio"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'audio-files' AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Audio files: Admins can delete
CREATE POLICY "Admins can delete audio"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'audio-files' AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- PDF files: Same policies as audio
CREATE POLICY "Authenticated can access free pdfs"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'pdf-files' AND
    auth.role() = 'authenticated' AND
    EXISTS (
        SELECT 1 FROM content
        WHERE file_url LIKE '%' || name
        AND access_level = 'free'
        AND is_published = true
    )
);

CREATE POLICY "Premium can access premium pdfs"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'pdf-files' AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND (role = 'premium' OR role = 'admin')
    )
);

CREATE POLICY "Admins can upload pdfs"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'pdf-files' AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admins can update pdfs"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'pdf-files' AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admins can delete pdfs"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'pdf-files' AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);
