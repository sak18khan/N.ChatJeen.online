import { rtdb } from '@/lib/firebaseClient';
import { ref, push, set } from 'firebase/database';
import { NextResponse } from 'next/server';
import { createClient } from 'redis';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { reason, sessionId, reporterId, timestamp } = data;
    
    if (!reason || !sessionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const reportObj = {
      reason,
      sessionId,
      reporterId: reporterId || 'anonymous',
      timestamp: timestamp || Date.now(),
      created_at: Date.now()
    };

    // 1. Store report in Firebase RTDB reports_list
    const reportsListRef = ref(rtdb, 'reports_list');
    const newReportRef = push(reportsListRef);
    await set(newReportRef, {
      id: newReportRef.key,
      ...reportObj
    });

    // 2. Optional: Store report in Redis list "reports" if REDIS_URL is configured
    const redisUrl = process.env.REDIS_URL || process.env.REDIS_TLS_URL;
    if (redisUrl) {
      try {
        const redisClient = createClient({ url: redisUrl });
        await redisClient.connect();
        await redisClient.lPush('reports', JSON.stringify({
          id: newReportRef.key,
          ...reportObj
        }));
        await redisClient.disconnect();
        console.log("Logged report to Redis successfully");
      } catch (redisErr) {
        console.warn("Failed to write report to Redis:", redisErr);
      }
    }

    return NextResponse.json({ status: 'ok', id: newReportRef.key });
  } catch (error: any) {
    console.error("Error in report API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
