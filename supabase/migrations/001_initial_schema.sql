-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- CUSTOM TYPES
-- ============================================
CREATE TYPE user_role AS ENUM ('user', 'premium', 'admin');
CREATE TYPE content_type AS ENUM ('audio', 'podcast', 'pdf');
CREATE TYPE content_access AS ENUM ('free', 'premium');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing');

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'user' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    language TEXT DEFAULT 'es',
    notifications_enabled BOOLEAN DEFAULT true,
    stripe_customer_id TEXT UNIQUE,
    subscription_status subscription_status,
    subscription_end_date TIMESTAMPTZ,
    total_listening_time INTEGER DEFAULT 0,
    last_active_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_stripe_customer ON profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active) WHERE is_active = true;

-- ============================================
-- PODCAST SERIES TABLE
-- ============================================
CREATE TABLE podcast_series (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    author TEXT,
    thumbnail_url TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    access_level content_access DEFAULT 'free' NOT NULL,
    is_active BOOLEAN DEFAULT true,
    episode_count INTEGER DEFAULT 0,
    total_duration INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- CONTENT TABLE
-- ============================================
CREATE TABLE content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    content_type content_type NOT NULL,
    access_level content_access DEFAULT 'free' NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    duration INTEGER,
    thumbnail_url TEXT,
    waveform_data JSONB,
    author TEXT,
    narrator TEXT,
    release_date DATE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    podcast_series_id UUID REFERENCES podcast_series(id) ON DELETE SET NULL,
    episode_number INTEGER,
    season_number INTEGER,
    page_count INTEGER,
    play_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    is_explicit BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    published_at TIMESTAMPTZ,
    search_vector tsvector
);

CREATE INDEX idx_content_type ON content(content_type);
CREATE INDEX idx_content_access ON content(access_level);
CREATE INDEX idx_content_category ON content(category_id);
CREATE INDEX idx_content_published ON content(is_published) WHERE is_published = true;
CREATE INDEX idx_content_featured ON content(is_featured) WHERE is_featured = true;
CREATE INDEX idx_content_podcast_series ON content(podcast_series_id) WHERE podcast_series_id IS NOT NULL;
CREATE INDEX idx_content_search ON content USING GIN(search_vector);
CREATE INDEX idx_content_tags ON content USING GIN(tags);
CREATE INDEX idx_content_created ON content(created_at DESC);

-- ============================================
-- PLAYLISTS TABLE
-- ============================================
CREATE TABLE playlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    is_public BOOLEAN DEFAULT false,
    is_collaborative BOOLEAN DEFAULT false,
    item_count INTEGER DEFAULT 0,
    total_duration INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_playlists_user ON playlists(user_id);
CREATE INDEX idx_playlists_public ON playlists(is_public) WHERE is_public = true;

-- ============================================
-- PLAYLIST ITEMS TABLE
-- ============================================
CREATE TABLE playlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    added_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(playlist_id, content_id)
);

CREATE INDEX idx_playlist_items_playlist ON playlist_items(playlist_id);
CREATE INDEX idx_playlist_items_position ON playlist_items(playlist_id, position);

-- ============================================
-- FAVORITES TABLE
-- ============================================
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, content_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_content ON favorites(content_id);
CREATE INDEX idx_favorites_created ON favorites(user_id, created_at DESC);

-- ============================================
-- LISTENING HISTORY TABLE
-- ============================================
CREATE TABLE listening_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    progress_seconds INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    listened_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    duration_listened INTEGER DEFAULT 0,
    device_type TEXT,
    UNIQUE(user_id, content_id)
);

CREATE INDEX idx_history_user ON listening_history(user_id);
CREATE INDEX idx_history_recent ON listening_history(user_id, listened_at DESC);
CREATE INDEX idx_history_content ON listening_history(content_id);

-- ============================================
-- DOWNLOADS TABLE
-- ============================================
CREATE TABLE downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    downloaded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    file_size INTEGER,
    expires_at TIMESTAMPTZ,
    UNIQUE(user_id, content_id)
);

CREATE INDEX idx_downloads_user ON downloads(user_id);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    stripe_price_id TEXT NOT NULL,
    stripe_product_id TEXT NOT NULL,
    status subscription_status NOT NULL,
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ============================================
-- ANALYTICS EVENTS TABLE
-- ============================================
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    content_id UUID REFERENCES content(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    session_id TEXT,
    device_type TEXT,
    app_version TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_analytics_user ON analytics_events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_content ON analytics_events(content_id) WHERE content_id IS NOT NULL;
CREATE INDEX idx_analytics_created ON analytics_events(created_at DESC);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update favorite count
CREATE OR REPLACE FUNCTION update_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE content SET favorite_count = favorite_count + 1 WHERE id = NEW.content_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE content SET favorite_count = favorite_count - 1 WHERE id = OLD.content_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update playlist stats
CREATE OR REPLACE FUNCTION update_playlist_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'DELETE' THEN
        UPDATE playlists p SET
            item_count = (SELECT COUNT(*) FROM playlist_items WHERE playlist_id = COALESCE(NEW.playlist_id, OLD.playlist_id)),
            total_duration = (
                SELECT COALESCE(SUM(c.duration), 0)
                FROM playlist_items pi
                JOIN content c ON pi.content_id = c.id
                WHERE pi.playlist_id = COALESCE(NEW.playlist_id, OLD.playlist_id)
            ),
            updated_at = NOW()
        WHERE id = COALESCE(NEW.playlist_id, OLD.playlist_id);
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for full-text search
CREATE OR REPLACE FUNCTION search_content(search_query TEXT, limit_count INTEGER DEFAULT 20)
RETURNS SETOF content AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM content
    WHERE is_published = true
    AND search_vector @@ plainto_tsquery('simple', search_query)
    ORDER BY ts_rank(search_vector, plainto_tsquery('simple', search_query)) DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER on_favorite_change
    AFTER INSERT OR DELETE ON favorites
    FOR EACH ROW EXECUTE FUNCTION update_favorite_count();

CREATE TRIGGER on_playlist_item_change
    AFTER INSERT OR DELETE ON playlist_items
    FOR EACH ROW EXECUTE FUNCTION update_playlist_stats();

-- Function to update search vector (usa simple que es inmutable)
CREATE OR REPLACE FUNCTION update_content_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('simple', coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(NEW.description, '')), 'B') ||
        setweight(to_tsvector('simple', coalesce(NEW.author, '')), 'C') ||
        setweight(to_tsvector('simple', array_to_string(NEW.tags, ' ')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar search_vector automaticamente
CREATE TRIGGER on_content_search_update
    BEFORE INSERT OR UPDATE OF title, description, author, tags ON content
    FOR EACH ROW EXECUTE FUNCTION update_content_search_vector();
