import { rtdb } from './firebaseClient';
import { ref, set, get, update, remove, runTransaction, child } from 'firebase/database';

export type UserStatus = 'waiting' | 'matched';
export type ChatMode = 'text';

export interface MatchingEntry {
  id: string;
  status: UserStatus;
  mode: ChatMode;
  vibe: string;
  joined_at: number;
  last_ping: number;
  answers?: {
    question: string;
    answer: string;
  };
  debate?: {
    topic: string;
    stance: 'Pro' | 'Con' | 'Random';
  };
  roomId?: string;
  interests?: string;
  country?: string;
}

export async function updatePing(userId: string) {
  try {
    const pingRef = ref(rtdb, `pings/${userId}`);
    await set(pingRef, Date.now());

    // Also update ping in waitlist queue if present
    const queueRef = ref(rtdb, `queue/${userId}`);
    const queueSnap = await get(queueRef);
    if (queueSnap.exists()) {
      await update(queueRef, { last_ping: Date.now() });
    }
  } catch (err) {
    console.warn('Ping update failed:', err);
  }
}

export async function findMatch(
  userId: string, 
  mode: ChatMode, 
  vibe: string = 'Any', 
  answers: any = null,
  debate: any = null,
  interests: string = "",
  country: string = ""
): Promise<any> {
  console.warn("findMatch client-side is deprecated. Matchmaking is now managed by the server-side API `/api/match`.");
  return null;
}

export async function cleanupStaleUsers() {
  try {
    const queueRef = ref(rtdb, 'queue');
    const snapshot = await get(queueRef);
    if (!snapshot.exists()) return;

    const queueData = snapshot.val() as Record<string, MatchingEntry>;
    const now = Date.now();
    const updates: Record<string, null> = {};

    Object.entries(queueData).forEach(([key, user]) => {
      const lastPing = user.last_ping || 0;
      if (now - lastPing > 60000) {
        updates[`queue/${key}`] = null;
        updates[`interests/${key}`] = null;
        updates[`country/${key}`] = null;
      }
    });

    if (Object.keys(updates).length > 0) {
      await update(ref(rtdb), updates);
      console.log(`Cleaned up ${Object.keys(updates).length} stale users`);
    }
  } catch (error) {
    console.error('Error cleaning up stale users:', error);
  }
}

// --- ROOM-BASED SOCIAL EXPERIENCE ---

export interface SocialRoom {
  id: string;
  topic: string;
  vibe: string;
  capacity: number;
  is_private: boolean;
  created_at: number;
  occupancy?: number;
}

export async function getActiveSocialRooms(): Promise<SocialRoom[]> {
  try {
    const roomsRef = ref(rtdb, 'social_rooms');
    const snapshot = await get(roomsRef);
    if (!snapshot.exists()) {
      // Insert default rooms if none exist
      const defaultRooms: Record<string, SocialRoom> = {
        'room-general': {
          id: 'room-general',
          topic: 'General Chit-Chat 💬',
          vibe: 'Chill',
          capacity: 12,
          is_private: false,
          created_at: Date.now()
        },
        'room-deep': {
          id: 'room-deep',
          topic: 'Deep Thoughts & Philosophy 🌌',
          vibe: 'Deep',
          capacity: 12,
          is_private: false,
          created_at: Date.now()
        },
        'room-debate': {
          id: 'room-debate',
          topic: 'Friendly Debate Arena ⚡',
          vibe: 'Debate',
          capacity: 12,
          is_private: false,
          created_at: Date.now()
        }
      };
      await set(roomsRef, defaultRooms);
      return Object.values(defaultRooms).map(r => ({ ...r, occupancy: 0 }));
    }

    const roomsData = snapshot.val() as Record<string, SocialRoom>;
    const rooms = Object.values(roomsData);

    // Calculate occupancy for each room
    const now = Date.now();
    for (const room of rooms) {
      const occupantsRef = ref(rtdb, `social_rooms/${room.id}/occupants`);
      const occSnap = await get(occupantsRef);
      let count = 0;
      if (occSnap.exists()) {
        const occupants = occSnap.val() as Record<string, any>;
        Object.values(occupants).forEach((occ: any) => {
          if (now - (occ.last_active || 0) < 30000) {
            count++;
          }
        });
      }
      room.occupancy = count;
    }

    return rooms.sort((a, b) => b.created_at - a.created_at);
  } catch (error) {
    console.error('Error fetching social rooms:', error);
    return [];
  }
}

export async function createSocialRoom(topic: string, vibe: string = 'Any'): Promise<SocialRoom | null> {
  try {
    const roomId = `sroom-${Date.now()}`;
    const roomRef = ref(rtdb, `social_rooms/${roomId}`);
    const newRoom: SocialRoom = {
      id: roomId,
      topic,
      vibe,
      capacity: 12,
      is_private: false,
      created_at: Date.now()
    };
    await set(roomRef, newRoom);
    return newRoom;
  } catch (error) {
    console.error('Error creating social room:', error);
    return null;
  }
}

export async function joinSocialRoom(userId: string, roomId: string, alias: string): Promise<boolean> {
  try {
    const occupantRef = ref(rtdb, `social_rooms/${roomId}/occupants/${userId}`);
    await set(occupantRef, {
      id: userId,
      name: alias,
      joined_at: Date.now(),
      last_active: Date.now(),
      isTyping: false,
      isSpeaking: false,
      xp: 0,
      level: 1,
      karma: 0,
      badges: []
    });
    return true;
  } catch (error) {
    console.error('Error joining social room:', error);
    return false;
  }
}

export async function leaveSocialRoom(userId: string, roomId: string): Promise<boolean> {
  try {
    const occupantRef = ref(rtdb, `social_rooms/${roomId}/occupants/${userId}`);
    await remove(occupantRef);
    return true;
  } catch (error) {
    console.error('Error leaving social room:', error);
    return false;
  }
}
