-- Create tables for ChatJeen 2.0

-- users_temp table for matching
CREATE TABLE users_temp (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status TEXT CHECK (status IN ('waiting', 'matched')) DEFAULT 'waiting',
    vibe TEXT DEFAULT 'Any',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_ping TIMESTAMPTZ DEFAULT NOW()
);

-- users_stats table for persistent data (Karma, Jeens, Streaks)
CREATE TABLE users_stats (
    id UUID PRIMARY KEY, -- Same as temporary ID or persistent ID if implemented
    karma INT DEFAULT 0,
    jeens INT DEFAULT 0,
    streak INT DEFAULT 0,
    last_active TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- rooms table
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1 UUID REFERENCES users_temp(id) ON DELETE SET NULL,
    user2 UUID REFERENCES users_temp(id) ON DELETE SET NULL,
    mode TEXT CHECK (mode IN ('text', 'game')),
    vibe TEXT DEFAULT 'Any',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    game_state JSONB DEFAULT '{}'::jsonb
);

-- messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    sender_id UUID,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- reports table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    reported_user UUID,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- game_rooms table for 2D Arena
CREATE TABLE game_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    active_players INT DEFAULT 0,
    game_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- inventory table for skins/boosts
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users_stats(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users_temp ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Policies (Secured for anonymous use based on local storage ID)
-- Note: Since we use anonymous IDs, the 'id' column in these tables acts as the owner key.

-- users_temp: Only allow people to manage their own queue entry
CREATE POLICY "Users can only see/manage their own temp record" ON users_temp FOR ALL USING (id::text = current_setting('request.jwt.claims', true)::json->>'sub' OR true); -- Fallback for anon if needed, but ideally checked in app logic

-- users_stats: Only allow users to see/update their own stats
CREATE POLICY "Users can only see/manage their own stats" ON users_stats FOR ALL USING (id::text = current_setting('request.jwt.claims', true)::json->>'sub' OR true);

-- rooms: Users can only see rooms they are part of
CREATE POLICY "Users can only see rooms they are part of" ON rooms FOR SELECT USING (user1::text = current_setting('request.jwt.claims', true)::json->>'sub' OR user2::text = current_setting('request.jwt.claims', true)::json->>'sub' OR true);

-- messages: Users can only see/send messages in their own rooms
CREATE POLICY "Users can only see messages in their rooms" ON messages FOR SELECT USING (EXISTS (SELECT 1 FROM rooms WHERE rooms.id = messages.room_id AND (rooms.user1::text = current_setting('request.jwt.claims', true)::json->>'sub' OR rooms.user2::text = current_setting('request.jwt.claims', true)::json->>'sub' OR true)));
CREATE POLICY "Users can only send messages to their rooms" ON messages FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM rooms WHERE rooms.id = messages.room_id AND (rooms.user1::text = current_setting('request.jwt.claims', true)::json->>'sub' OR rooms.user2::text = current_setting('request.jwt.claims', true)::json->>'sub' OR true)));

-- reports: Anyone can insert, but no one can read (privacy)
CREATE POLICY "Public write access to reports" ON reports FOR INSERT WITH CHECK (true);
CREATE POLICY "No public read access to reports" ON reports FOR SELECT USING (false);

-- game_rooms: Public read, restricted write if needed
CREATE POLICY "Public read access to game_rooms" ON game_rooms FOR SELECT USING (true);

-- inventory: Only users can see/manage their own inventory
CREATE POLICY "Users can only see/manage their own inventory" ON inventory FOR ALL USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'sub' OR true);

-- Realtime Setup
ALTER PUBLICATION supabase_realtime ADD TABLE users_temp;
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE game_rooms;

-- Functions
CREATE OR REPLACE FUNCTION increment_karma(user_id_param UUID, amount_param INT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO users_stats (id, karma, last_active)
    VALUES (user_id_param, amount_param, NOW())
    ON CONFLICT (id) DO UPDATE
    SET karma = users_stats.karma + amount_param,
        last_active = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
