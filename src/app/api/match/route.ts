import { redis } from '@/lib/redisClient';
import { rtdb } from '@/lib/firebaseClient';
import { ref, set, get, remove } from 'firebase/database';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface WaitlistEntry {
  id: string;
  mode: string;
  vibe: string;
  interests: string;
  country: string;
  debate?: {
    topic: string;
    stance: 'Pro' | 'Con' | 'Random';
  } | null;
  answers?: {
    question: string;
    answer: string;
  } | null;
  joinedAt: number;
  lastPing: number;
}

// Distributed Redis Lock
async function acquireLock(lockKey: string, timeoutMs = 3000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    // Set lock if not exists, expires in 4 seconds
    const acquired = await redis.set(lockKey, "1", { nx: true, ex: 4 });
    if (acquired) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  return false;
}

async function releaseLock(lockKey: string) {
  await redis.del(lockKey);
}

const matchDebate = (user1: WaitlistEntry, user2: WaitlistEntry) => {
  if (user1.vibe !== 'Debate' || user2.vibe !== 'Debate') return false;

  // Topic check
  if (user1.debate?.topic && user2.debate?.topic && user1.debate.topic !== user2.debate.topic) {
    return false;
  }

  // Stance check: stances must not be the same unless one is Random
  const stance1 = user1.debate?.stance || 'Random';
  const stance2 = user2.debate?.stance || 'Random';
  if (stance1 !== 'Random' && stance2 !== 'Random' && stance1 === stance2) {
    return false;
  }
  return true;
};

const isCompatible = (user: WaitlistEntry, candidate: WaitlistEntry) => {
  if (user.id === candidate.id) return false;
  if (user.mode !== candidate.mode) return false;

  // Debate specific rules
  if (user.vibe === 'Debate') {
    return matchDebate(user, candidate);
  } else {
    // Non-debate cannot match debate
    if (candidate.vibe === 'Debate') return false;

    // Vibe filter
    if (user.vibe !== 'Any' && candidate.vibe !== 'Any' && user.vibe !== candidate.vibe) {
      return false;
    }
  }
  return true;
};

export async function POST(request: Request) {
  const lockKey = "lock:matchmaking";
  let lockAcquired = false;

  try {
    const data = await request.json();
    const { userId, mode, vibe, interests, country, debate, answers } = data;

    if (!userId || !mode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Try to acquire the lock to guarantee serialization
    lockAcquired = await acquireLock(lockKey);
    if (!lockAcquired) {
      return NextResponse.json({ status: "busy", message: "Server busy, please retry" }, { status: 503 });
    }

    // 1. Check if this user was already matched by another concurrent request
    const myQueueRef = ref(rtdb, `queue/${userId}`);
    const myQueueSnap = await get(myQueueRef);
    if (myQueueSnap.exists()) {
      const val = myQueueSnap.val();
      if (val.status === 'matched' && val.roomId) {
        await releaseLock(lockKey);
        lockAcquired = false;
        return NextResponse.json({ status: "matched", roomId: val.roomId });
      }
    }

    const now = Date.now();
    const userEntry: WaitlistEntry = {
      id: userId,
      mode,
      vibe: vibe || 'Any',
      interests: interests || '',
      country: country || '',
      debate: debate || null,
      answers: answers || null,
      joinedAt: now,
      lastPing: now
    };

    // 2. Fetch waitlist from Redis
    const queueData = await redis.hgetall("khantalk:matchmaking_queue") as Record<string, string> | null;
    const allCandidates: WaitlistEntry[] = [];
    const staleIds: string[] = [];

    if (queueData) {
      Object.entries(queueData).forEach(([key, valStr]) => {
        try {
          const entry = typeof valStr === 'string' ? JSON.parse(valStr) : valStr as WaitlistEntry;
          // Filter out stale users (>15s since last ping or joined >60s ago without ping)
          if (now - entry.lastPing > 15000) {
            staleIds.push(key);
          } else {
            allCandidates.push(entry);
          }
        } catch (e) {
          staleIds.push(key);
        }
      });
    }

    // Clean up stale Redis waitlist items in background/concurrently
    if (staleIds.length > 0) {
      await redis.hdel("khantalk:matchmaking_queue", ...staleIds);
    }

    // 3. Find compatible partner
    const candidates = allCandidates.filter(c => isCompatible(userEntry, c));
    candidates.sort((a, b) => a.joinedAt - b.joinedAt); // FIFO (oldest first)

    const scannedCandidates = candidates.slice(0, 50);

    // Interest tag set for overlap calculation
    const myInterestsSet = new Set(
      userEntry.interests.split(',')
        .map(i => i.trim().toLowerCase())
        .filter(i => i && i !== 'just random')
    );

    const getOverlapCount = (candInterestsStr: string) => {
      if (myInterestsSet.size === 0 || !candInterestsStr) return 0;
      const candInterests = candInterestsStr.split(',')
        .map(i => i.trim().toLowerCase())
        .filter(i => i);
      let count = 0;
      for (const interest of candInterests) {
        if (myInterestsSet.has(interest)) count++;
      }
      return count;
    };

    let partner: WaitlistEntry | null = null;

    // Phase 1: Interest + Country overlaps
    // P1: interests overlap + same country
    if (myInterestsSet.size > 0 && userEntry.country) {
      partner = scannedCandidates.find(c => getOverlapCount(c.interests) > 0 && c.country === userEntry.country) || null;
    }
    // P2: interests overlap
    if (!partner && myInterestsSet.size > 0) {
      partner = scannedCandidates.find(c => getOverlapCount(c.interests) > 0) || null;
    }
    // P3: same country
    if (!partner && userEntry.country) {
      partner = scannedCandidates.find(c => c.country === userEntry.country) || null;
    }
    // P4: oldest compatible user
    if (!partner && scannedCandidates.length > 0) {
      partner = scannedCandidates[0];
    }

    if (partner) {
      // 4. WE HAVE A MATCH!
      // Remove both users from the waitlist
      await redis.hdel("khantalk:matchmaking_queue", partner.id, userId);

      // Release lock early to optimize concurrency for others
      await releaseLock(lockKey);
      lockAcquired = false;

      const roomId = `room-${userId}-${partner.id}-${now}`;

      // Calculate debate stances
      let user1Stance = userEntry.debate?.stance || 'Random';
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

      // Create room in Firebase RTDB
      await set(ref(rtdb, `rooms/${roomId}`), roomDetails);

      // Write match status to Firebase for both users so their listeners fire
      await set(ref(rtdb, `queue/${partner.id}`), {
        id: partner.id,
        status: 'matched',
        roomId
      });
      await set(ref(rtdb, `queue/${userId}`), {
        id: userId,
        status: 'matched',
        roomId
      });

      // Cleanup waitlist keys
      await remove(ref(rtdb, `interests/${userId}`));
      await remove(ref(rtdb, `country/${userId}`));
      await remove(ref(rtdb, `interests/${partner.id}`));
      await remove(ref(rtdb, `country/${partner.id}`));

      return NextResponse.json({ status: "matched", roomId });
    } else {
      // 5. NO MATCH FOUND
      // Update/add our own entry in the Redis matchmaking waitlist
      await redis.hset("khantalk:matchmaking_queue", {
        [userId]: JSON.stringify(userEntry)
      });

      // Write waiting status to Firebase RTDB for client tracking
      await set(ref(rtdb, `queue/${userId}`), {
        id: userId,
        status: 'waiting',
        mode,
        vibe,
        joined_at: now,
        last_ping: now,
        interests: interests || "",
        country: country || ""
      });

      await releaseLock(lockKey);
      lockAcquired = false;

      return NextResponse.json({ status: "searching" });
    }
  } catch (error: any) {
    console.error("Matchmaking API POST error:", error);
    if (lockAcquired) {
      await releaseLock(lockKey);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Remove from Redis queue
    await redis.hdel("khantalk:matchmaking_queue", userId);

    // Remove from Firebase queue/interests/country
    await remove(ref(rtdb, `queue/${userId}`));
    await remove(ref(rtdb, `interests/${userId}`));
    await remove(ref(rtdb, `country/${userId}`));

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error("Matchmaking API DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
