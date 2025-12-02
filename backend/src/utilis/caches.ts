import { redis } from "../redish-connect/redis-tools";

const CACHE_KEY = (sid: string, key: string) => `cache:${sid}:${key}`;

export async function setCache(sid: string, key: string, value: any, ttlSec=900) {
  await redis.set(CACHE_KEY(sid, key), JSON.stringify(value), { EX: ttlSec });
}
export async function getCache<T=any>(sid: string, key: string): Promise<T|undefined> {
  const v = await redis.get(CACHE_KEY(sid, key));
  return v ? JSON.parse(v) as T : undefined;
}
