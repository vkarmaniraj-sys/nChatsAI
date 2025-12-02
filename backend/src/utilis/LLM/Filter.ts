import llmsummarize from "./LLM_summerizer";

interface FilterResult {
  storeInLTM: boolean;
  finalText: string;
}

const repetitionMap = new Map<string, number>();

// 🔹 Importance scoring (heuristic: length + keywords)
function importanceScore(text: string): number {
  let score = 0;
  if (text.includes("important") || text.includes("remember")) score += 5;
  score += Math.min(text.length / 5, 5); // longer = more important
  return Math.min(score, 10);
}

// 🔹 Repetition detector
function repetitionScore(text: string): boolean {
  const count = repetitionMap.get(text) || 0;
  repetitionMap.set(text, count + 1);
  return count + 1 >= 3; // seen 3 times → LTM
}

export async function applyFilters(text: string): Promise<FilterResult> {
  const importance = importanceScore(text);
  const repeated = repetitionScore(text);
  // const isPersonal =  shouldStoreInLTM(text);

  const shouldStore = importance >= 7 || repeated;

  if (shouldStore) {
    const summary = await llmsummarize(text); // ✅ wait for summarization
    return {
      storeInLTM: true,
      finalText: summary,
    };
  }

  return {
    storeInLTM: false,
    finalText: text, // raw text for STM
  };
}

function shouldStoreInLTM(text: string): boolean {
  const keywords = ["like", "prefer", "love", "important", "always", "never"];
  const isPersonalFact = keywords.some((k) =>
    text.toLowerCase().includes(k)
  );

  // Example rules:
  return isPersonalFact || text.length > 60; // longer stuff → LTM
}