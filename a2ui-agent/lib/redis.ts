import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis: Redis };

export const redis = globalForRedis.redis ?? new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 5) return null;
    return Math.min(times * 200, 2000);
  },
  lazyConnect: true,
});

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

// Redis 工具函数
export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>,
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const value = await fetchFn();
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  return value;
}

export async function invalidateCache(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
