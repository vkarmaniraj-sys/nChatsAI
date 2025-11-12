import { redis } from "../redish-connect/redis-tools";

const SESS_KEY = (sid: string) => `sess:${sid}`;
const SESSION_TTL = 60 * 60;

export async function getEphemeralState(sid: string): Promise<EphemeralState> {
  const h = await redis.hGetAll(SESS_KEY(sid));
  if (!h) return {};
  return {
    goals: h.goals ? JSON.parse(h.goals) : undefined,
    entities: h.entities ? JSON.parse(h.entities) : undefined,
    decisions: h.decisions ? JSON.parse(h.decisions) : undefined,
    language: h.language,
    topic: h.topic,
  };
}

export async function setEphemeralState(sid: string, patch: Partial<EphemeralState>) {
  const toSet: Record<string,string> = {};
  if (patch.goals) toSet.goals = JSON.stringify(patch.goals);
  if (patch.entities) toSet.entities = JSON.stringify(patch.entities);
  if (patch.decisions) toSet.decisions = JSON.stringify(patch.decisions);
  if (patch.language) toSet.language = patch.language;
  if (patch.topic) toSet.topic = patch.topic;

  if (Object.keys(toSet).length) {
    await redis.hSet(SESS_KEY(sid), toSet);
    await redis.expire(SESS_KEY(sid), SESSION_TTL);
  }
}
