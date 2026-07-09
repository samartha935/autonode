import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "@/features/executions/lib/handlebars-helpers";
import { geminiChannel } from "@/inngest/channels/gemini";
import { GOOGLE_MODELS, type GoogleModel } from "@/config/ai-models";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { db } from "@/db";
import { credential } from "@/db/schema/credential-schema";
import { and, eq } from "drizzle-orm";
import { findOrThrow } from "@/features/workflows/server/routers";

type GeminiData = {
  variableName: string;
  credentialId: string;
  model: GoogleModel;
  systemPrompt: string;
  userPrompt: string;
};

export const geminiExecutor: NodeExecutor<GeminiData> = async ({
  data,
  nodeId,
  context,
  step,
  userId,
}) => {
  await step.realtime.publish(
    `${nodeId}-status-loading`,
    geminiChannel.status,
    {
      nodeId,
      status: "loading",
    },
  );

  if (!data.variableName) {
    await step.realtime.publish(
      `${nodeId}-status-error`,
      geminiChannel.status,
      {
        nodeId,
        status: "error",
      },
    );

    throw new NonRetriableError("Gemini node: Variable name is missing.");
  }

  if (!data.userPrompt) {
    await step.realtime.publish(
      `${nodeId}-status-error`,
      geminiChannel.status,
      {
        nodeId,
        status: "error",
      },
    );

    throw new NonRetriableError("Gemini node: User prompt is missing.");
  }

  if (!data.credentialId) {
    await step.realtime.publish(
      `${nodeId}-status-error`,
      geminiChannel.status,
      {
        nodeId,
        status: "error",
      },
    );

    throw new NonRetriableError("Gemini node: Credential is required.");
  }

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";

  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  const credentialKey = await step.run("get-credential", async () => {
    const credentialResult = await findOrThrow(
      db.query.credential.findFirst({
        where: and(
          eq(credential.id, data.credentialId),
          eq(credential.userId, userId),
        ),
      }),
    );

    return credentialResult;
  });

  if (!credentialKey) {
    await step.realtime.publish(
      `${nodeId}-status-error`,
      geminiChannel.status,
      {
        nodeId,
        status: "error",
      },
    );

    throw new NonRetriableError("Gemini node: Credential not found");
  }

  const google = createGoogleGenerativeAI({
    apiKey: credentialKey.value,
  });

  try {
    const { steps } = await step.ai.wrap("gemini-generate-text", generateText, {
      model: google(data.model || GOOGLE_MODELS[0]),
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
      geminiChannel.status,
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
      geminiChannel.status,
      {
        nodeId,
        status: "error",
      },
    );

    throw error;
  }
};
