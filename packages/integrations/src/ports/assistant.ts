export type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AssistantRequest = {
  /** Server-controlled instructions; never built from user-supplied text. */
  system: string;
  messages: AssistantMessage[];
  maxOutputTokens: number;
  timeoutMs: number;
};

export type AssistantResult =
  | { kind: "ok"; text: string }
  | { kind: "unavailable"; reason: string };

export interface AssistantProvider {
  generate(request: AssistantRequest): Promise<AssistantResult>;
}
