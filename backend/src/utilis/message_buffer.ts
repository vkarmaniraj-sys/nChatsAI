import { redis } from "../redish-connect/redis-tools";

const MSG_KEY = (sid: string) => `msg:${sid}`;
const MAX_TURNS = 16;    // tune per model/token window
const SESSION_TTL = 60 * 60; // 1 hour

export async function pushMessage(sid: string, msg: ChatMessage) {
  await redis.rPush(MSG_KEY(sid), JSON.stringify(msg));
  await redis.expire(MSG_KEY(sid), SESSION_TTL);
  // keep only last 2*MAX_TURNS entries (user+assistant)
  const len = await redis.lLen(MSG_KEY(sid));
  if (len > 2 * MAX_TURNS) {
    await redis.lTrim(MSG_KEY(sid), len - 2 * MAX_TURNS, -1); // what that lTrim...
  }
}

export async function fetchMessages(sid: string): Promise<ChatMessage[]> {
  const raw = await redis.lRange(MSG_KEY(sid), 0, -1);
  return raw.map((r:any) => JSON.parse(r));
}
