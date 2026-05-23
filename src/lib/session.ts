'use client';

const ADJECTIVES = ['Midnight', 'Silent', 'Curious', 'Golden', 'Electric', 'Swift', 'Deep', 'Neon', 'Brave', 'Candid'];
const NOUNS = ['Thinker', 'Wolf', 'Mind', 'Star', 'Pilot', 'Nomad', 'Seeker', 'Echo', 'Flame', 'Ghost'];

export interface SessionStats {
  xp: number;
  karma: number;
  level: number;
  alias: string;
  variant: number;
  startTime: number;
  messageCount: number;
  reactionCount: number;
  badges: string[];
}

export function generateAlias(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}${noun}${num}`;
}

export function calculateLevel(xp: number): { level: number; title: string } {
  if (xp < 100) return { level: 1, title: 'Newcomer' };
  if (xp < 300) return { level: 2, title: 'Active' };
  if (xp < 700) return { level: 3, title: 'Engage' };
  if (xp < 1500) return { level: 4, title: 'Popular' };
  return { level: 5, title: 'Legend' };
}

export function getXPForAction(action: 'message' | 'reaction' | 'time'): number {
  switch (action) {
    case 'message': return 10;
    case 'reaction': return 25;
    case 'time': return 5; // per minute
    default: return 0;
  }
}

export function checkForBadges(stats: SessionStats): string[] {
  const newBadges: string[] = [];
  if (stats.messageCount >= 5 && !stats.badges.includes('Getting Started')) {
    newBadges.push('Getting Started');
  }
  if (stats.reactionCount >= 10 && !stats.badges.includes('Crowd Favorite')) {
    newBadges.push('Crowd Favorite');
  }
  if (Date.now() - stats.startTime >= 300000 && !stats.badges.includes('In the Zone')) { // 5 mins
    newBadges.push('In the Zone');
  }
  return newBadges;
}

export function getReputationTag(stats: SessionStats): string | null {
  if (stats.messageCount > 20) return '🔥 Top Contributor';
  if (stats.reactionCount > 15) return '😂 Entertainer';
  if (stats.messageCount < 5 && (Date.now() - stats.startTime > 300000)) return '👀 Observer';
  return null;
}
