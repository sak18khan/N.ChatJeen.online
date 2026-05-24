import { Metadata } from 'next';
import ChatClient from './ChatClient';

export const metadata: Metadata = {
  title: 'Private Chat Room | ChatJeen',
  robots: {
    index: false,
    follow: false
  }
};

export default async function ChatPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  return <ChatClient roomId={roomId} />;
}
