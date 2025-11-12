import { redis } from "../redish-connect/redis-tools";

const SUM_KEY = (sid: string) => `sum:${sid}`;
const SESSION_TTL = 60 * 60;

export async function getSummary(sid: string): Promise<string|undefined> {
  const s = await redis.get(SUM_KEY(sid));
  return s ?? undefined;
}

export async function setSummary(sid: string, summary: string) {
  await redis.set(SUM_KEY(sid), summary, { EX: SESSION_TTL });
}