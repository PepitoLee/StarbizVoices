-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all profiles"
    ON profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- CATEGORIES POLICIES
-- ============================================
CREATE POLICY "Anyone can view active categories"
    ON categories FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can manage categories"
    ON categories FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- CONTENT POLICIES
-- ============================================
CREATE POLICY "Anyone can view published free content"
    ON content FOR SELECT
    USING (is_published = true AND access_level = 'free');

CREATE POLICY "Premium users can view premium content"
    ON content FOR SELECT
    USING (
        is_published = true AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND (role = 'premium' OR role = 'admin')
        )
    );

CREATE POLICY "Admins can manage content"
    ON content FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- PODCAST SERIES POLICIES
-- ============================================
CREATE POLICY "Anyone can view active podcast series"
    ON podcast_series FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can manage podcast series"
    ON podcast_series FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- PLAYLISTS POLICIES
-- ============================================
CREATE POLICY "Users can view own playlists"
    ON playlists FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Anyone can view public playlists"
    ON playlists FOR SELECT
    USING (is_public = true);

CREATE POLICY "Users can create playlists"
    ON playlists FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own playlists"
    ON playlists FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own playlists"
    ON playlists FOR DELETE
    USING (user_id = auth.uid());

-- ============================================
-- PLAYLIST ITEMS POLICIES
-- ============================================
CREATE POLICY "Users can view playlist items"
    ON playlist_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM playlists
            WHERE id = playlist_id
            AND (user_id = auth.uid() OR is_public = true)
        )
    );

CREATE POLICY "Users can manage own playlist items"
    ON playlist_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM playlists
            WHERE id = playlist_id
            AND user_id = auth.uid()
        )
    );

-- ============================================
-- FAVORITES POLICIES
-- ============================================
CREATE POLICY "Users can view own favorites"
    ON favorites FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage own favorites"
    ON favorites FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================
-- LISTENING HISTORY POLICIES
-- ============================================
CREATE POLICY "Users can view own history"
    ON listening_history FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage own history"
    ON listening_history FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================
-- DOWNLOADS POLICIES
-- ============================================
CREATE POLICY "Users can view own downloads"
    ON downloads FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage own downloads"
    ON downloads FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================
-- SUBSCRIPTIONS POLICIES
-- ============================================
CREATE POLICY "Users can view own subscriptions"
    ON subscriptions FOR SELECT
    USING (user_id = auth.uid());

-- ============================================
-- ANALYTICS POLICIES
-- ============================================
CREATE POLICY "Users can insert own analytics"
    ON analytics_events FOR INSERT
    WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Admins can view analytics"
    ON analytics_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
