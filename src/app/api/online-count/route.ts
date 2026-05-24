import { redis } from '@/lib/redisClient';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let count = 0;
    let cursor = "0";
    
    do {
      const [nextCursor, keys] = await redis.scan(cursor, {
        match: "user_state:*",
        count: 100
      });
      
      cursor = nextCursor;
      
      if (keys.length > 0) {
        // Fetch values for these keys to check if they are WAITING or CHATTING
        const values = await redis.mget<string[]>(...keys);
        values.forEach((val) => {
          if (val === 'WAITING' || val === 'CHATTING') {
            count++;
          }
        });
      }
    } while (cursor !== "0");
    
    return NextResponse.json({ count });
  } catch (error: any) {
    console.error("Error counting online users via Redis:", error);
    // Fallback default value on error
    return NextResponse.json({ count: 10482 }, { status: 500 });
  }
}
