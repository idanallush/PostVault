-- טבלת הפוסטים השמורים
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'youtube')),
  post_type TEXT NOT NULL CHECK (post_type IN ('image', 'video', 'carousel', 'text')),

  -- תוכן מקורי
  original_text TEXT,
  media_url TEXT,
  thumbnail_url TEXT,
  author_name TEXT,
  author_handle TEXT,

  -- ניתוח AI
  ai_summary TEXT NOT NULL,
  ai_category TEXT NOT NULL,
  ai_key_points JSONB DEFAULT '[]',
  ai_content_type TEXT,
  ai_action_items JSONB DEFAULT '[]',

  -- מטאדאטה
  is_favorite BOOLEAN DEFAULT false,
  personal_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- טבלת תגיות
CREATE TABLE tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- טבלת קשרים פוסטים-תגיות
CREATE TABLE posts_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Full text search index (using 'simple' config — works better for Hebrew)
CREATE INDEX idx_posts_search ON posts
  USING GIN (to_tsvector('simple', coalesce(original_text, '') || ' ' || coalesce(ai_summary, '')));

-- Additional indexes
CREATE INDEX idx_posts_platform ON posts(platform);
CREATE INDEX idx_posts_category ON posts(ai_category);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_favorite ON posts(is_favorite) WHERE is_favorite = true;

-- Search function
CREATE OR REPLACE FUNCTION search_posts(search_query TEXT)
RETURNS SETOF posts AS $$
  SELECT * FROM posts
  WHERE to_tsvector('simple', coalesce(original_text, '') || ' ' || coalesce(ai_summary, ''))
  @@ plainto_tsquery('simple', search_query)
  ORDER BY created_at DESC;
$$ LANGUAGE sql STABLE;

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS: מכיוון שזה לשימוש אישי, נפתח הכל
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on posts" ON posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on tags" ON tags FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on posts_tags" ON posts_tags FOR ALL USING (true) WITH CHECK (true);
