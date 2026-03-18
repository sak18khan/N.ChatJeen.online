import { supabase } from './supabaseClient';

export type UserStatus = 'waiting' | 'matched';
export type ChatMode = 'text' | 'voice';

export async function updatePing(userId: string) {
  try {
    await supabase
      .from('users_temp')
      .update({ last_ping: new Date().toISOString() })
      .eq('id', userId);
  } catch (err) {
    console.warn('Ping update failed:', err);
  }
}

export async function findMatch(userId: string, mode: ChatMode) {
  // 1. Update our own ping
  await updatePing(userId);

  // 2. Get another waiting user with activity in last 30s
  let query = supabase
    .from('users_temp')
    .select('id')
    .eq('status', 'waiting')
    .eq('vibe', mode) // Separate text vs voice queues
    .neq('id', userId)
    .gt('last_ping', new Date(Date.now() - 30000).toISOString())
    .order('created_at', { ascending: true });

  const { data: waitingUser, error: findError } = await query.limit(1).maybeSingle();

  if (findError) {
    console.error('Error finding match:', JSON.stringify(findError, null, 2));
    return null;
  }

  if (waitingUser) {
    // 3. Atomically attempt to claim the match
    // Update both users to 'matched' only if both are still 'waiting'
    const { data: updatedUsers, error: updateError } = await supabase
      .from('users_temp')
      .update({ status: 'matched' })
      .in('id', [userId, waitingUser.id])
      .eq('status', 'waiting') // Crucial: Only updates if they are still waiting
      .select('id');

    if (updateError || !updatedUsers || updatedUsers.length < 2) {
      // If we couldn't match both (e.g. someone else grabbed one), revert any matches we claimed
      if (updatedUsers && updatedUsers.length > 0) {
        await supabase
          .from('users_temp')
          .update({ status: 'waiting' })
          .in('id', updatedUsers.map((u: any) => u.id));
      }
      return null;
    }

    // 4. Both users claimed. Create a room.
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .insert({
        user1: userId,
        user2: waitingUser.id,
        mode: mode
      })
      .select()
      .single();

    if (roomError) {
      console.error('Error creating room:', JSON.stringify(roomError, null, 2));
      // Revert status if room creation fails
      await supabase
        .from('users_temp')
        .update({ status: 'waiting' })
        .in('id', [userId, waitingUser.id]);
      return null;
    }

    return room;
  }

  return null;
}

export async function cleanupStaleUsers() {
  const sixtySecondsAgo = new Date(Date.now() - 60000).toISOString();
  
  const { error } = await supabase
    .from('users_temp')
    .delete()
    .lt('last_ping', sixtySecondsAgo);

  if (error) {
    console.error('Error cleaning up stale users:', error);
  }
}
