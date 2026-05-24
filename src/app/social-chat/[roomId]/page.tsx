import { Metadata } from 'next';
import SocialRoomClient from './SocialRoomClient';

export const metadata: Metadata = {
  title: 'Social Group Chat | ChatJeen',
  robots: {
    index: false,
    follow: false
  }
};

export default async function SocialRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  return <SocialRoomClient roomId={roomId} />;
}
