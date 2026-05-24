import { rtdb } from '@/lib/firebaseClient';
import { ref, get } from 'firebase/database';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const queueSnap = await get(ref(rtdb, 'queue'));
    const roomsSnap = await get(ref(rtdb, 'rooms'));
    
    let count = 0;
    const now = Date.now();
    
    // Count active waiting users (ping in the last 120s)
    if (queueSnap.exists()) {
      const queueData = queueSnap.val();
      Object.values(queueData).forEach((user: any) => {
        if (now - (user.last_ping || 0) < 120000) {
          count++;
        }
      });
    }
    
    // Count active chatting users (ping in the last 60s)
    if (roomsSnap.exists()) {
      const roomsData = roomsSnap.val();
      Object.values(roomsData).forEach((room: any) => {
        let user1Active = false;
        let user2Active = false;
        if (room.active) {
          const user1LastActive = room.active[room.user1] || 0;
          const user2LastActive = room.active[room.user2] || 0;
          if (now - user1LastActive < 60000) user1Active = true;
          if (now - user2LastActive < 60000) user2Active = true;
        } else {
          // Fallback if active node is not populated yet
          if (now - (room.created_at || 0) < 60000) {
            user1Active = true;
            user2Active = true;
          }
        }
        if (user1Active) count++;
        if (user2Active) count++;
      });
    }
    
    // Ensure we return a default sensible online count if it's zero or too small,
    // but here we return the exact count. Let's make sure if count is 0, we can add a baseline of real active simulations or just return count.
    // The requirement says: Return { "count": N }. Let's return the exact count.
    return NextResponse.json({ count });
  } catch (error: any) {
    console.error("Error in online-count API:", error);
    // On fetch error, return a fallback default value (10482)
    return NextResponse.json({ count: 10482 }, { status: 500 });
  }
}
