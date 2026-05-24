import { redis } from '@/lib/redisClient';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { userId, state } = data;
    
    if (!userId || !state) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }
    
    const key = `user_state:${userId}`;
    
    if (state === 'OFFLINE') {
      await redis.del(key);
    } else {
      // Set value with an expiry of 120 seconds to prevent dead states
      await redis.set(key, state, { ex: 120 });
    }
    
    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error("Error setting user state in Redis:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
