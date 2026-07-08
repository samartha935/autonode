import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { workflow } from "@/db/schema";
import { topologicalSort } from "./utils";
import { getExecutor } from "@/features/executions/lib/executor-registry";

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: 0,
    triggers: { event: "workflows/execute.workflow" },
  },
  async ({ event, step }) => {
    const workflowId = event.data.workflowId;
    const userId = event.data.userId;

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

    //Initialize the context with any initial data from the trigger
    let context = event.data.initialData || {};

    //Execute each node
    for (const node of sortedNodes) {
      const executor = getExecutor(node.type);
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        context,
        step,
        userId
      });
    }

    return { workflowId, result: context };
  },
);
