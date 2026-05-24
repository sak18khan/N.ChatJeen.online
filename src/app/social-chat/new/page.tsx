import { Metadata } from 'next';
import NewRoomClient from './NewRoomClient';

export const metadata: Metadata = {
  title: 'Start a Social Room | ChatJeen',
  robots: {
    index: false,
    follow: false
  }
};

export default function NewRoomPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-400/5 via-black to-black">
      <NewRoomClient />
    </main>
  );
}
