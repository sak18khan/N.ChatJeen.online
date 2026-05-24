import { rtdb } from '@/lib/firebaseClient';
import { ref, push, set } from 'firebase/database';
import { NextResponse } from 'next/server';
import { redis } from '@/lib/redisClient';

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

    // 2. Store report in Redis list "reports" as JSON string
    try {
      await redis.lpush('reports', JSON.stringify({
        id: newReportRef.key,
        ...reportObj
      }));
      console.log("Logged report to Upstash Redis successfully");
    } catch (redisErr) {
      console.warn("Failed to write report to Upstash Redis:", redisErr);
    }

    return NextResponse.json({ status: 'ok', id: newReportRef.key });
  } catch (error: any) {
    console.error("Error in report API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
