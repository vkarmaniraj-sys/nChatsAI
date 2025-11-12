import { getEphemeralState } from "./empherimal_session_storage";
import { fetchMessages } from "./message_buffer";
import { getSummary } from "./summary_context";

interface ComposeOpts {
  tokenLimit: number;        // model context size minus headroom
  includeTools?: boolean;
}

export async function composePrompt(sid: string, opts: ComposeOpts) {
  const msgs = await fetchMessages(sid);
  const eph = await getEphemeralState(sid);
  const sum = await getSummary(sid);

  // 1) build skeleton sections
  const head: ChatMessage[] = [{
    role: "system",
    content: "you are a helpful assistant. Use the session summary and recent turns.",
    ts: Date.now()/1000|0
  }];

  const ephemeralBlock: ChatMessage[] = [];
  if (sum) ephemeralBlock.push({ role: "system", content: `SESSION SUMMARY:\n${sum}`, ts: Date.now()/1000|0 });
  if (eph && Object.keys(eph).length) {
    ephemeralBlock.push({
      role: "system",
      content:
        `EPHEMERAL STATE:\n` +
        `goals: ${JSON.stringify(eph.goals||[])}\n` +
        `entities: ${JSON.stringify(eph.entities||{})}\n` +
        `decisions: ${JSON.stringify(eph.decisions||[])}\n` +
        `language: ${eph.language||"auto"}\n` +
        `topic: ${eph.topic||"n/a"}`,
      ts: Date.now()/1000|0
    });
  }

  // 2) append most recent messages (reverse walk until token budget)
  const assembled: ChatMessage[] = [...head, ...ephemeralBlock];
  let budget = opts.tokenLimit - countTokens(assembled.map(m=>m.content).join("\n"));

  // greedy from the end
  for (let i = msgs.length - 1; i >= 0; i--) {
    const t = countTokens(msgs[i].content);
    if (t <= budget) {
      assembled.unshift(msgs[i]); // keep order: oldest → newest
      budget -= t;
    } else {
      break;
    }
  }

  // 3) if over budget, trigger summarization outside (caller) then re-compose
  return assembled;
}

export function countTokens(text: string): number {
  return Math.ceil(text.length / 4); /// counts token of charactors.
}
