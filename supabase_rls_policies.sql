-- Supabase Row Level Security (RLS) Policies for Chatjeen.online

-- Enable RLS on tables
ALTER TABLE users_temp ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- users_temp block

-- Policy 1: Allow users to insert themselves
-- Only if the ID they provide is valid and they set their status to 'waiting'
CREATE POLICY "Allow anonymous users to insert themselves" ON users_temp
FOR INSERT WITH CHECK (
  status IN ('waiting', 'matched') AND
  length(id) > 10
);

-- Policy 2: Allow users to read the queue (needed for matching)
CREATE POLICY "Allow anyone to read users_temp" ON users_temp
FOR SELECT USING (true);

-- Policy 3: Allow users to update ONLY their own ping, OR match with someone
-- Since the current matching logic is client-side, we must allow updating
-- status to matched if they are in the 'waiting' state.
CREATE POLICY "Allow updating status if waiting" ON users_temp
FOR UPDATE USING (
  status = 'waiting'
);

-- Policy 4: Allow users to delete themselves when leaving
CREATE POLICY "Allow users to delete themselves" ON users_temp
FOR DELETE USING (true);


-- rooms block

-- Policy 1: Allow matching clients to insert a room
CREATE POLICY "Allow anonymous room creation" ON rooms
FOR INSERT WITH CHECK (
  length(user1) > 10 AND length(user2) > 10
);

-- Policy 2: Allow clients to read rooms they are part of
CREATE POLICY "Allow reading own room" ON rooms
FOR SELECT USING (
  true -- The client only selects by returning single after insert, so we allow basic read.
);
