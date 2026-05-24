'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Download } from 'lucide-react';

export default function PwaBanner() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    const isDismissed = localStorage.getItem('chatjeen_pwa_dismissed') === '1';
    if (isDismissed) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      
      // Show after 20 seconds if captured
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 20000);

      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Do NOT show if user is in an active chat session or matchmaking
  const isChatSession = 
    pathname.startsWith('/text/') || 
    pathname.startsWith('/voice/') || 
    pathname.startsWith('/social-chat/') || 
    pathname.startsWith('/matching');
  
  if (isChatSession || !showBanner || !deferredPrompt) {
    return null;
  }

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('chatjeen_pwa_dismissed', '1');
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-black via-[#111] to-black border-t border-white/10 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 max-w-lg mx-auto sm:rounded-t-[1.5rem] md:bottom-4 md:border md:rounded-[1.5rem]"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 shrink-0">
            <Download className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-white leading-tight">Add ChatJeen to your home screen</p>
            <p className="text-[11px] text-white/50 font-medium">Meet new people safely. Anonymous text chat.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            onClick={handleDismiss}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white border border-white/5 hover:bg-white/5 transition-all uppercase tracking-wider"
          >
            Later
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs font-black bg-yellow-400 hover:bg-yellow-300 text-black shadow-lg shadow-yellow-400/10 transition-all uppercase tracking-widest"
          >
            Add
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
