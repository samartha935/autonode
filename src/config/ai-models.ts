// src/config/ai-models.ts

export const GOOGLE_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
] as const;

export const OPENAI_MODELS = [
  "gpt-4o-mini",
  "gpt-4o",
  "gpt-4.1",
  "gpt-4.1-mini",
  "o3",
  "o4-mini",
] as const;

export const ANTHROPIC_MODELS = [
  "claude-sonnet-4-20250514",
  "claude-haiku-4-20250514",
  "claude-opus-4-20250514",
] as const;

export const ALL_MODELS = [
  ...GOOGLE_MODELS,
  ...OPENAI_MODELS,
  ...ANTHROPIC_MODELS,
] as const;

export type GoogleModel = (typeof GOOGLE_MODELS)[number];
export type OpenAIModel = (typeof OPENAI_MODELS)[number];
export type AnthropicModel = (typeof ANTHROPIC_MODELS)[number];
export type AIModel = (typeof ALL_MODELS)[number];
