-- RUN THESE COMMANDS IN YOUR SUPABASE SQL EDITOR --

-- 1. Create the social_rooms table
CREATE TABLE IF NOT EXISTS social_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic TEXT NOT NULL,
    vibe TEXT DEFAULT 'Any',
    capacity INT DEFAULT 12,
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add social_room_id to existing tables
ALTER TABLE users_temp ADD COLUMN IF NOT EXISTS social_room_id UUID REFERENCES social_rooms(id) ON DELETE SET NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS social_room_id UUID REFERENCES social_rooms(id) ON DELETE CASCADE;

-- 3. Enable RLS
ALTER TABLE social_rooms ENABLE ROW LEVEL SECURITY;

-- 4. Set Policies
DROP POLICY IF EXISTS "Public read access to social_rooms" ON social_rooms;
CREATE POLICY "Public read access to social_rooms" ON social_rooms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert access to social_rooms" ON social_rooms;
CREATE POLICY "Public insert access to social_rooms" ON social_rooms FOR INSERT WITH CHECK (true);

-- 5. Add to Realtime
-- Use this if you want to see room changes live on the homepage
-- ALTER PUBLICATION supabase_realtime ADD TABLE social_rooms; 
-- Note: If it says "already exists", you can ignore it or use:
-- DO $$ BEGIN
--   IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'social_rooms') THEN
--     ALTER PUBLICATION supabase_realtime ADD TABLE social_rooms;
--   END IF;
-- END $$;
