const BANNED_WORDS = [
  'offensiveword1', // Placeholders for actual banned words
  'offensiveword2',
];

export function filterMessage(text: string): string {
  let filtered = text;
  BANNED_WORDS.forEach(word => {
    const regex = new RegExp(word, 'gi');
    filtered = filtered.replace(regex, '***');
  });
  return filtered;
}

const userMessageCounts = new Map<string, { count: number, lastReset: number }>();

export function checkRateLimit(userId: string): boolean {
  const limit = 5; // messages
  const window = 5000; // ms (5 seconds)
  const now = Date.now();

  const userStats = userMessageCounts.get(userId) || { count: 0, lastReset: now };

  if (now - userStats.lastReset > window) {
    userStats.count = 1;
    userStats.lastReset = now;
    userMessageCounts.set(userId, userStats);
    return true;
  }

  if (userStats.count >= limit) {
    return false;
  }

  userStats.count += 1;
  userMessageCounts.set(userId, userStats);
  return true;
}
