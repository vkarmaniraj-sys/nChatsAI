type Role = "user" | "assistant" | "system" | "tool";

interface ChatMessage {
  role: Role;
  content: string;
  ts: number;               // epoch seconds
  meta?: Record<string, any>;
}

interface EphemeralState {
  goals?: string[];
  entities?: Record<string, string>;
  decisions?: string[];
  language?: string;
  topic?: string;
}