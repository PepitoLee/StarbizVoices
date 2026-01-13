-- ============================================
-- FIX: Content RLS policy for admin INSERT
-- The original policy was missing WITH CHECK clause
-- ============================================

-- Drop existing policy
DROP POLICY IF EXISTS "Admins can manage content" ON content;

-- Create corrected policy with WITH CHECK for INSERT operations
CREATE POLICY "Admins can manage content"
ON content FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);
