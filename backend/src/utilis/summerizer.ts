import { callLLMForSummary } from "../handler/together_API";
import { redis } from "../redish-connect/redis-tools";
import { fetchMessages } from "./message_buffer";
import { setSummary } from "./summary_context";

const MSG_KEY = (sid: string) => `msg:${sid}`;

export async function maybeSummarize(sid: string, threshold=24) {
    const msgs = await fetchMessages(sid);
    if (msgs.length < threshold) return;
    
  // take first half (oldest), produce a 250-token summary with your LLM:
  const oldest = msgs.slice(0, Math.floor(msgs.length/2));
  const summaryInput = oldest.map(m => `${m.role}: ${m.content}`).join("\n");
    const summary = await callLLMForSummary(
        `Summarize for continuity. Capture goals, entities, decisions, unresolved questions. Max 250 tokens.\n\n${summaryInput}`
    );
    
    await setSummary(sid, summary);

  const keep = msgs.slice(Math.floor(msgs.length/2));
  await redis.del(MSG_KEY(sid));
  for (const m of keep) await redis.rPush(MSG_KEY(sid), JSON.stringify(m));
}
