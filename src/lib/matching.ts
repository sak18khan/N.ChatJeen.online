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
  // 1. Update/Write our own queue entry
  const myQueueRef = ref(rtdb, `queue/${userId}`);
  const entry: MatchingEntry = {
    id: userId,
    status: 'waiting',
    mode,
    vibe,
    joined_at: Date.now(),
    last_ping: Date.now(),
    answers,
    debate,
    interests,
    country
  };
  await set(myQueueRef, entry);
  await updatePing(userId);

  // Store user-specific interests and country keys for cleanup/state reference
  if (interests) {
    await set(ref(rtdb, `interests/${userId}`), interests);
  }
  if (country) {
    await set(ref(rtdb, `country/${userId}`), country);
  }

  // 2. Fetch all waiting users to find a suitable partner
  const queueRef = ref(rtdb, 'queue');
  const snapshot = await get(queueRef);
  
  if (!snapshot.exists()) {
    return null;
  }

  const queueData = snapshot.val() as Record<string, MatchingEntry>;
  const now = Date.now();

  // Find candidate partners matching basic filters
  const candidates = Object.values(queueData).filter((user) => {
    // Basic criteria
    if (user.id === userId) return false;
    if (user.status !== 'waiting') return false;
    if (user.mode !== mode) return false;
    
    // Check if partner is active (ping in last 120 seconds to prevent clock-skew mismatch)
    const lastPing = user.last_ping || 0;
    if (now - lastPing > 120000) return false;

    // Vibe filter
    if (vibe !== 'Any' && user.vibe !== 'Any' && user.vibe !== vibe) {
      return false;
    }

    // Debate Mode filter (if we are in debate mode, we should match with another debate user)
    if (vibe === 'Debate') {
      if (user.vibe !== 'Debate') return false;
      // If we specified topics, try to match same topic, or fallback
      if (debate?.topic && user.debate?.topic && user.debate.topic !== debate.topic) {
        return false;
      }
      // If we specified stances, try to match opposite stances
      if (debate?.stance && user.debate?.stance) {
        const myStance = debate.stance;
        const theirStance = user.debate.stance;
        if (myStance !== 'Random' && theirStance !== 'Random' && myStance === theirStance) {
          return false; // Can't have same stance (e.g. Pro vs Pro)
        }
      }
    } else {
      // If we are not in debate mode, don't match with debate users
      if (user.vibe === 'Debate') return false;
    }

    return true;
  });

  // Sort by oldest joined first (FIFO queue behavior)
  candidates.sort((a, b) => a.joined_at - b.joined_at);

  // Scan the top 50 queue entries (equivalent to LRANGE 0 49)
  const scannedCandidates = candidates.slice(0, 50);

  // Parse my interest selections
  const myInterestsSet = new Set(
    interests.split(',')
      .map(i => i.trim().toLowerCase())
      .filter(i => i && i !== 'just random')
  );

  const getOverlappingInterestsCount = (candidateInterestsStr?: string) => {
    if (!candidateInterestsStr || myInterestsSet.size === 0) return 0;
    const candidateInterests = candidateInterestsStr.split(',')
      .map(i => i.trim().toLowerCase())
      .filter(i => i);
    let overlapCount = 0;
    for (const interest of candidateInterests) {
      if (myInterestsSet.has(interest)) {
        overlapCount++;
      }
    }
    return overlapCount;
  };

  let partner = null;

  // Phase 1: Scan for overlapping interest & country priority
  // Priority 1: same interests + same country
  if (myInterestsSet.size > 0 && country) {
    partner = scannedCandidates.find(c => getOverlappingInterestsCount(c.interests) > 0 && c.country === country);
  }
  // Priority 2: same interests
  if (!partner && myInterestsSet.size > 0) {
    partner = scannedCandidates.find(c => getOverlappingInterestsCount(c.interests) > 0);
  }
  // Priority 3: same country
  if (!partner && country) {
    partner = scannedCandidates.find(c => c.country === country);
  }
  // Phase 2: Fallback to first compatible user (FIFO random matchmaking)
  if (!partner && scannedCandidates.length > 0) {
    partner = scannedCandidates[0];
  }

  if (partner) {
    const roomId = `room-${userId}-${partner.id}-${Date.now()}`;

    // Determine stances for debate mode
    let user1Stance = debate?.stance || 'Random';
    let user2Stance = partner.debate?.stance || 'Random';
    if (vibe === 'Debate') {
      if (user1Stance === 'Random' && user2Stance === 'Random') {
        user1Stance = Math.random() > 0.5 ? 'Pro' : 'Con';
        user2Stance = user1Stance === 'Pro' ? 'Con' : 'Pro';
      } else if (user1Stance === 'Random') {
        user1Stance = user2Stance === 'Pro' ? 'Con' : 'Pro';
      } else if (user2Stance === 'Random') {
        user2Stance = user1Stance === 'Pro' ? 'Con' : 'Pro';
      }
    }

    // 1. Pre-create the room details
    const roomRef = ref(rtdb, `rooms/${roomId}`);
    const roomDetails = {
      id: roomId,
      user1: userId,
      user2: partner.id,
      mode,
      vibe,
      created_at: now,
      answers: {
        [userId]: answers || null,
        [partner.id]: partner.answers || null
      },
      debate: vibe === 'Debate' ? {
        topic: debate?.topic || partner.debate?.topic || 'General Debate',
        stances: {
          [userId]: user1Stance,
          [partner.id]: user2Stance
        }
      } : null
    };

    // Try to atomically claim the partner
    const partnerQueueRef = ref(rtdb, `queue/${partner.id}`);
    
    try {
      // Write room first
      await set(roomRef, roomDetails);

      const result = await runTransaction(partnerQueueRef, (currentData: MatchingEntry | null) => {
        if (currentData === null) {
          return {
            status: 'matched',
            roomId: roomId
          } as any;
        }
        if (currentData.status === 'waiting') {
          return {
            ...currentData,
            status: 'matched',
            roomId: roomId
          };
        }
        return undefined; 
      });

      if (result.committed && result.snapshot.exists()) {
        // Partner claimed successfully! Update our own queue status
        await update(myQueueRef, {
          status: 'matched',
          roomId: roomId
        });

        // Remove our own waitlist entry since we are matched
        await remove(myQueueRef);

        // Clean up interests and country keys for both matched users
        await remove(ref(rtdb, `interests/${userId}`));
        await remove(ref(rtdb, `country/${userId}`));
        await remove(ref(rtdb, `interests/${partner.id}`));
        await remove(ref(rtdb, `country/${partner.id}`));

        return roomDetails;
      } else {
        // Claim failed, clean up the pre-created room
        await remove(roomRef);
      }
    } catch (err) {
      console.error('Transaction match failed:', err);
      await remove(roomRef);
    }
  }

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
