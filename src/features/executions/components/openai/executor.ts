import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { openAiChannel } from "@/inngest/channels/openai";
import { OPENAI_MODELS, type OpenAIModel } from "@/config/ai-models";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

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

type OpenAiData = {
  variableName: string;
  model: OpenAIModel;
  systemPrompt: string;
  userPrompt: string;
};

export const openAiExecutor: NodeExecutor<OpenAiData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  await step.realtime.publish(
    `${nodeId}-status-loading`,
    openAiChannel.status,
    {
      nodeId,
      status: "loading",
    },
  );

  if (!data.variableName) {
    await step.realtime.publish(
      `${nodeId}-status-error`,
      openAiChannel.status,
      {
        nodeId,
        status: "error",
      },
    );

    throw new NonRetriableError("OpenAI node: Variable name is missing.");
  }

  if (!data.userPrompt) {
    await step.realtime.publish(
      `${nodeId}-status-error`,
      openAiChannel.status,
      {
        nodeId,
        status: "error",
      },
    );

    throw new NonRetriableError("OpenAI node: User prompt is missing.");
  }

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";

  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  const credentialValue = process.env.GOOGLE_GENERATIVE_AI_API_KEY!;

  const openai = createOpenAI({
    apiKey: credentialValue,
  });

  try {
    const { steps } = await step.ai.wrap("openai-generate-text", generateText, {
      model: openai(data.model || OPENAI_MODELS[0]),
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
      openAiChannel.status,
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
      openAiChannel.status,
      {
        nodeId,
        status: "error",
      },
    );

    throw error;
  }
};
