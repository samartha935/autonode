import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { ANTHROPIC_MODELS, type AnthropicModel } from "@/config/ai-models";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { anthropicChannel } from "@/inngest/channels/anthropic";

Handlebars.registerHelper("json", (value) => {
  try {
    const jsonString = JSON.stringify(value, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);

    return safeString;
  } catch (error) {
    throw new Error(
      `Failed to serialize context to JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
});

type AnthropicData = {
  variableName: string;
  model: AnthropicModel;
  systemPrompt: string;
  userPrompt: string;
};

export const AnthropicExecutor: NodeExecutor<AnthropicData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  await step.realtime.publish(
    `${nodeId}-status-loading`,
    anthropicChannel.status,
    {
      nodeId,
      status: "loading",
    },
  );

  if (!data.variableName) {
    await step.realtime.publish(
      `${nodeId}-status-error`,
      anthropicChannel.status,
      {
        nodeId,
        status: "error",
      },
    );

    throw new NonRetriableError("Anthropic node: Variable name is missing.");
  }

  if (!data.userPrompt) {
    await step.realtime.publish(
      `${nodeId}-status-error`,
      anthropicChannel.status,
      {
        nodeId,
        status: "error",
      },
    );

    throw new NonRetriableError("Anthropic node: User prompt is missing.");
  }

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";

  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  const credentialValue = process.env.GOOGLE_GENERATIVE_AI_API_KEY!;

  const Anthropic = createAnthropic({
    apiKey: credentialValue,
  });

  try {
    const { steps } = await step.ai.wrap("Anthropic-generate-text", generateText, {
      model: Anthropic(data.model || ANTHROPIC_MODELS[0]),
      system: systemPrompt,
      prompt: userPrompt,
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });

    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";

    await step.realtime.publish(
      `${nodeId}-status-success`,
      anthropicChannel.status,
      {
        nodeId,
        status: "success",
      },
    );

    return {
      ...context,
      [data.variableName]: {
        text,
      },
    };
  } catch (error) {
    await step.realtime.publish(
      `${nodeId}-status-error`,
      anthropicChannel.status,
      {
        nodeId,
        status: "error",
      },
    );

    throw error;
  }
};
