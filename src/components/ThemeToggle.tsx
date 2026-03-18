'use client';

import { Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check local storage or system preference
    let stored = null;
    try {
      stored = localStorage.getItem('theme');
    } catch (err) {
      console.warn('localStorage access denied for theme.');
    }
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (stored === 'dark' || (!stored && system)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    try {
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    } catch (err) {
      console.warn('localStorage setItem denied for theme.');
    }
  };

  return (
    <button
      onClick={toggle}
      className="fixed top-6 right-6 p-3 rounded-xl bg-muted border border-border shadow-sm hover:bg-accent transition-colors z-50 group"
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-primary group-hover:rotate-45 transition-transform" />
      ) : (
        <Moon className="w-5 h-5 text-primary group-hover:-rotate-12 transition-transform" />
      )}
    </button>
  );
}
