import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { execution, workflow } from "@/db/schema";
import { topologicalSort } from "./utils";
import { getExecutor } from "@/features/executions/lib/executor-registry";

const markExecutionFailed = async (
  executionId: string | undefined,
  error: Error,
) => {
  if (!executionId) return;

  await db
    .update(execution)
    .set({
      status: "FAILED",
      error: error.message || "Unknown error",
      errorStack: error.stack ?? null,
      completedAt: new Date(),
    })
    .where(eq(execution.id, executionId));
};

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: process.env.NODE_ENV === "production" ? 3 : 0,
    triggers: { event: "workflows/execute.workflow" },
    onFailure: async ({ event, error }) => {
      const originalEvent = event.data.event;
      const executionId = originalEvent.data?.executionId as string | undefined;
      await markExecutionFailed(executionId, error);
    },
  },
  async ({ event, step }) => {
    const workflowId = event.data.workflowId as string | undefined;
    const userId = event.data.userId as string | undefined;
    const executionId = event.data.executionId as string | undefined;

    if (!workflowId) {
      throw new NonRetriableError("Workflow ID is missing");
    }

    if (!userId) {
      throw new NonRetriableError("User ID is missing");
    }

    const sortedNodes = await step.run("prepare-workflow", async () => {
      const workflowResult = await db.query.workflow.findFirst({
        where: eq(workflow.id, workflowId),
        with: {
          nodes: true,
          connections: true,
        },
      });

      if (!workflowResult) {
        throw new NonRetriableError("Workflow not found");
      }

      return topologicalSort(workflowResult.nodes, workflowResult.connections);
    });

    let context = (event.data.initialData as Record<string, unknown>) || {};

    //Execute each node
    for (const node of sortedNodes) {
      const executor = getExecutor(node.type);
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        context,
        step,
        userId,
      });
    }

    if (executionId) {
      await step.run("mark-execution-success", async () => {
        await db
          .update(execution)
          .set({
            status: "SUCCESS",
            output: context,
            completedAt: new Date(),
            error: null,
            errorStack: null,
          })
          .where(eq(execution.id, executionId));
      });
    }

    return { workflowId, result: context };
  },
);
