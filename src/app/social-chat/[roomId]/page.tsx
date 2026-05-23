'use client';

import { use, useEffect, useState } from 'react';
import SocialChatUI from '@/components/SocialChatUI';
import { v4 as uuidv4 } from 'uuid';

export default function SocialRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    // Get or create unique ID for the user session
    let id = localStorage.getItem('chatjeen_user_id');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('chatjeen_user_id', id);
    }
    setMyId(id);
  }, []);

  if (!myId) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <SocialChatUI roomId={roomId} userId={myId} />;
}
