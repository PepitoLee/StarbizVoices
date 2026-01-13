-- ============================================
-- FIX: Make storage buckets public
--
-- Problem: audio-files and pdf-files were private
-- but code uses getPublicUrl() which requires public buckets
-- ============================================

-- Make audio-files bucket public
UPDATE storage.buckets
SET public = true
WHERE id = 'audio-files';

-- Make pdf-files bucket public
UPDATE storage.buckets
SET public = true
WHERE id = 'pdf-files';
