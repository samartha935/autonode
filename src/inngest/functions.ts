import { db } from "@/db";
import { inngest } from "./client";
import { workflow } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export const createWorkflow = inngest.createFunction(
  { id: "create-workflow", triggers: { event: "app/create.workflow" } },
  async ({ event, step }) => {
    const result = await step.run("handle-task", async () => {
      await db.insert(workflow).values({ name: event.data.name }).returning();
    });

    await step.sleep("pause", "1s");

    return { message: `Task ${event.data.id} complete`, result };
  },
);

export const deleteWorkflow = inngest.createFunction(
  { id: "delete-workflow", triggers: { event: "app/delete.workflow" } },
  async ({ event, step }) => {
    const result = await step.run("handle-task", async () => {
      await db.delete(workflow).where(eq(workflow.id, event.data.id));
    });

    return { message: `Task ${event.data.id} complete`, result };
  },
);

export const AIResponse = inngest.createFunction(
  { id: "AI-request", triggers: { event: "app/AI.request" } },
  async ({ event, step }) => {
    const { text } = await step.ai.wrap("gemini-generate-text", generateText, {
      model: google("gemini-2.5-flash"),
      prompt: event.data.prompt,
    });

    return text;
  },
);
