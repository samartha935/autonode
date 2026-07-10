import toposort from "toposort";
import type { InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { execution, node, connection, workflow } from "@/db/schema/index";
import { db } from "@/db";
import { inngest } from "./client";

type Node = InferSelectModel<typeof node>;

type Connection = InferSelectModel<typeof connection>;

export const topologicalSort = (
  nodes: Node[],
  connections: Connection[],
): Node[] => {
  //If no connections, return node as-is (they're all independet)
  if (connections.length === 0) {
    // return []; // nothing connected = nothing to execute
    return nodes;
  }

  //Create edges array for toposort
  const edges: [string, string][] = connections.map((conn) => [
    conn.fromNodeId,
    conn.toNodeId,
  ]);

  //Add nodes with no connections as self-edges to ensure they're included
  const connectedNodeIds = new Set<string>();
  for (const conn of connections) {
    connectedNodeIds.add(conn.fromNodeId);
    connectedNodeIds.add(conn.toNodeId);
  }

  for (const node of nodes) {
    if (!connectedNodeIds.has(node.id)) {
      edges.push([node.id, node.id]);
    }
  }

  //Perform topological sort
  let sortedNodeIds: string[];
  try {
    sortedNodeIds = toposort(edges);
    //Remove duplicates (from self-edges)
    sortedNodeIds = [...new Set(sortedNodeIds)];
  } catch (error) {
    if (error instanceof Error && error.message.includes("Cyclic")) {
      throw new Error("Workflow contains a cycle");
    }
    throw error;
  }

  //Map sorted IDs back to node objects
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  return sortedNodeIds.map((id) => nodeMap.get(id)!).filter(Boolean);
};

export const sendWorkflowExecution = async (data: {
  workflowId: string;
  userId?: string;
  initialData?: Record<string, unknown>;
}) => {
  let userId = data.userId;

  // Webhooks may only pass workflowId — resolve owner from the workflow
  if (!userId) {
    const workflowResult = await db.query.workflow.findFirst({
      where: eq(workflow.id, data.workflowId),
      columns: { userId: true },
    });

    if (!workflowResult) {
      throw new Error("Workflow not found");
    }

    userId = workflowResult.userId;
  }

  // Create a RUNNING execution so it appears in history immediately
  const [createdExecution] = await db
    .insert(execution)
    .values({
      workflowId: data.workflowId,
      status: "RUNNING",
    })
    .returning();

  try {
    const result = await inngest.send({
      name: "workflows/execute.workflow",
      data: {
        workflowId: data.workflowId,
        userId,
        initialData: data.initialData,
        executionId: createdExecution.id,
      },
    });

    const eventId = result.ids[0];
    if (eventId) {
      await db
        .update(execution)
        .set({ inngestEventId: eventId })
        .where(eq(execution.id, createdExecution.id));
    }

    return {
      ...result,
      executionId: createdExecution.id,
    };
  } catch (error) {
    // If we fail to enqueue the job, surface that on the execution record
    await db
      .update(execution)
      .set({
        status: "FAILED",
        error:
          error instanceof Error
            ? error.message
            : "Failed to enqueue workflow execution",
        errorStack: error instanceof Error ? (error.stack ?? null) : null,
        completedAt: new Date(),
      })
      .where(eq(execution.id, createdExecution.id));
    throw error;
  }
};
