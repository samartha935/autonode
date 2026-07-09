import { InitialNode } from "@/components/shared/initial-node";
import { NodeType } from "@/db/schema/workflow-schema";
import { AnthropicNode } from "@/features/executions/components/anthropic/node";
import { DiscordNode } from "@/features/executions/components/discord/node";
import { GeminiNode } from "@/features/executions/components/gemini/node";
import { HttpRequestNode } from "@/features/executions/components/http-request/node";
import { OpenAiNode } from "@/features/executions/components/openai/node";
import { TelegramNode } from "@/features/executions/components/telegram/node";
import { GoogleFormTriggerNode } from "@/features/triggers/components/google-form-trigger/node";
import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/node";
import { PolarTriggerNode } from "@/features/triggers/components/polar-trigger/node";
import { StripeTriggerNode } from "@/features/triggers/components/stripe-trigger/node";
import type { NodeTypes } from "@xyflow/react";

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
  [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTriggerNode,
  [NodeType.STRIPE_TRIGGER]: StripeTriggerNode,
  [NodeType.POLAR_TRIGGER]: PolarTriggerNode,
  [NodeType.GEMINI]: GeminiNode,
  [NodeType.ANTHROPIC]: AnthropicNode,
  [NodeType.OPENAI]: OpenAiNode,
  [NodeType.DISCORD]: DiscordNode,
  [NodeType.TELEGRAM]: TelegramNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;
