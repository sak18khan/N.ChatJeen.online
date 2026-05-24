import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'https://enjoyed-chigger-87070.upstash.io',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'gQAAAAAAAVQeAAIgcDE0NmJmNDI3MTM4ZjE0MWUzOGZlMTBiYmYxYTQxMDQyZg',
});
