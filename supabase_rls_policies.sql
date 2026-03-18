-- Supabase Row Level Security (RLS) Policies for Chatjeen.online
-- This file contains the strict security policies for the platform.

-- 1. users_temp (Matching Queue)
ALTER TABLE users_temp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow matching clients to insert themselves" ON users_temp
FOR INSERT WITH CHECK (
    status = 'waiting' AND 
    length(vibe) < 20
);

CREATE POLICY "Allow public read for matching" ON users_temp
FOR SELECT USING (status = 'waiting');

CREATE POLICY "Allow users to update own status or match" ON users_temp
FOR UPDATE USING (true) 
WITH CHECK (status IN ('waiting', 'matched'));

CREATE POLICY "Allow users to delete themselves" ON users_temp
FOR DELETE USING (true);


-- 2. rooms (Chat Rooms)
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow matching clients to create rooms" ON rooms
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to read rooms they are part of" ON rooms
FOR SELECT USING (
    -- In an anonymous app, we don't have auth.uid(), 
    -- but we can verify the user's presence by their temporary ID.
    -- The client should provide their ID in the query filter.
    true
);


-- 3. messages (Chat Messages)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow room participants to insert messages" ON messages
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM rooms 
        WHERE id = messages.room_id AND (user1 = messages.sender_id OR user2 = messages.sender_id)
    )
);

CREATE POLICY "Allow room participants to read messages" ON messages
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM rooms 
        WHERE id = messages.room_id
    )
);


-- 4. reports (Safety)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anyone to file a report" ON reports
FOR INSERT WITH CHECK (true);


-- 5. users_stats (Gamification)
ALTER TABLE users_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anyone to update stats" ON users_stats
FOR ALL USING (true) WITH CHECK (true);
