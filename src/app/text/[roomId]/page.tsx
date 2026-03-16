'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { use } from 'react';
import ChatUI from '@/components/ChatUI';

export default function ChatPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const searchParams = useSearchParams();
  const myId = searchParams.get('me');
  const router = useRouter();

  if (!myId) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
      <ChatUI 
        roomId={roomId} 
        myId={myId} 
        mode="text"
        onSkip={() => router.push('/')}
        onReport={() => {
            alert('User reported. Safety team will investigate.');
            router.push('/');
        }}
      />
    </div>
  );
}
