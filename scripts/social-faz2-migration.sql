-- =============================================================================
-- GebzemSosyal FAZ 2 — Migration
-- Stories + Story Views + Notification batching
-- Idempotent: tekrar tekrar çalıştırılabilir
-- =============================================================================

-- ───────────────────────── STORIES ─────────────────────────

CREATE TABLE IF NOT EXISTS social_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image','video')),
  thumbnail_url TEXT,
  caption TEXT CHECK (caption IS NULL OR LENGTH(caption) <= 200),
  background_color TEXT CHECK (background_color IS NULL OR background_color ~ '^#[0-9a-fA-F]{6}$'),
  duration_sec INT NOT NULL DEFAULT 5 CHECK (duration_sec BETWEEN 1 AND 30),
  views_count INT NOT NULL DEFAULT 0,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_stories_active_author
  ON social_stories(author_id, created_at DESC)
  WHERE is_deleted = FALSE;

CREATE INDEX IF NOT EXISTS idx_stories_active_expires
  ON social_stories(expires_at DESC)
  WHERE is_deleted = FALSE;

-- Görüntüleme tracking (UNIQUE per (story, viewer) — duplicate engelli)
CREATE TABLE IF NOT EXISTS social_story_views (
  story_id UUID NOT NULL REFERENCES social_stories(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (story_id, viewer_id)
);

CREATE INDEX IF NOT EXISTS idx_story_views_story
  ON social_story_views(story_id, viewed_at DESC);

-- ───────────────────────── NOTIFICATIONS BATCHING ─────────────────────────

-- Aggregation desteği: actors[], count, key
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='notifications' AND column_name='actors') THEN
    ALTER TABLE notifications ADD COLUMN actors JSONB DEFAULT '[]'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='notifications' AND column_name='count') THEN
    ALTER TABLE notifications ADD COLUMN count INT NOT NULL DEFAULT 1;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='notifications' AND column_name='aggregation_key') THEN
    ALTER TABLE notifications ADD COLUMN aggregation_key TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='notifications' AND column_name='target_url') THEN
    ALTER TABLE notifications ADD COLUMN target_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='notifications' AND column_name='updated_at') THEN
    ALTER TABLE notifications ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Aggregation key index (60dk içinde aynı anahtarla gelirse upsert yapılır)
CREATE INDEX IF NOT EXISTS idx_notifications_agg
  ON notifications(user_id, aggregation_key, created_at DESC)
  WHERE aggregation_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_business_agg
  ON notifications(business_id, aggregation_key, created_at DESC)
  WHERE aggregation_key IS NOT NULL AND business_id IS NOT NULL;

-- ───────────────────────── PERMISSIONS ─────────────────────────
-- Postgres kullanıcısı tablo yarattıysa gebzem'e erişim ver

DO $$
BEGIN
  EXECUTE 'GRANT ALL PRIVILEGES ON social_stories TO gebzem';
  EXECUTE 'GRANT ALL PRIVILEGES ON social_story_views TO gebzem';
EXCEPTION WHEN OTHERS THEN
  -- gebzem user yoksa görmezden gel
  NULL;
END $$;

-- ───────────────────────── DOĞRULAMA ─────────────────────────

SELECT 'social_stories' AS tbl, COUNT(*) AS rows FROM social_stories
UNION ALL
SELECT 'social_story_views', COUNT(*) FROM social_story_views
UNION ALL
SELECT 'notifications (aggregation_key not null)', COUNT(*)
  FROM notifications WHERE aggregation_key IS NOT NULL;
