import { PAGINATION } from "@/config/constants";
import { db } from "@/db";
import { connection, node, workflow } from "@/db/schema";
import {
  createTRPCRouter,
  premiumProcedure,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, ilike } from "drizzle-orm";
import { generateSlug } from "random-word-slugs";
import z from "zod";
import type { Node, Edge } from "@xyflow/react";
import { RegisteredNodeType } from "@/config/node-components";
import { sendWorkflowExecution } from "@/inngest/utils";

export async function findOrThrow<T>(
  query: Promise<T | undefined>,
  message = "Record not found",
): Promise<T> {
  const result = await query;
  if (!result) throw new TRPCError({ code: "NOT_FOUND", message });
  return result;
}

export const workflowsRouter = createTRPCRouter({
  execute: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const workflowResult = await findOrThrow(
        db.query.workflow.findFirst({
          where: and(
            eq(workflow.id, input.workflowId),
            eq(workflow.userId, ctx.auth.user.id),
          ),
        }),
      );

      await sendWorkflowExecution({
        workflowId: input.workflowId,
        userId: ctx.auth.user.id,
      });

      return workflowResult;
    }),

  create: premiumProcedure.mutation(async ({ ctx }) => {
    return await db.transaction(async (tx) => {
      const newWorkflow = await tx
        .insert(workflow)
        .values({
          name: generateSlug(3),
          webhookSecret: crypto.randomUUID(),
          userId: ctx.auth.user.id,
        })
        .returning()
        .then((rows) => rows[0]);

      await tx.insert(node).values({
        workflowId: newWorkflow.id,
        name: "INITIAL",
        type: "INITIAL",
        position: { x: 0, y: 0 },
        data: {},
      });
      return newWorkflow;
    });
  }),

  remove: protectedProcedure
    .input(z.object({ workflowId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await db
        .delete(workflow)
        .where(
          and(
            eq(workflow.userId, ctx.auth.user.id),
            eq(workflow.id, input.workflowId),
          ),
        )
        .returning()
        .then((rows) => rows[0]);
    }),

  updateName: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        updatedName: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await db
        .update(workflow)
        .set({ name: input.updatedName })
        .where(
          and(
            eq(workflow.userId, ctx.auth.user.id),
            eq(workflow.id, input.workflowId),
          ),
        )
        .returning()
        .then((rows) => rows[0]);
    }),

  update: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        nodes: z.array(
          z.object({
            id: z.string(),
            type: z.string().nullish(),
            position: z.object({ x: z.number(), y: z.number() }),
            data: z.record(z.string(), z.any()).optional(),
          }),
        ),
        edges: z.array(
          z.object({
            source: z.string(),
            target: z.string(),
            sourceHandle: z.string().nullish(),
            targetHandle: z.string().nullish(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { workflowId, nodes, edges } = input;

      await findOrThrow(
        db.query.workflow.findFirst({
          where: and(
            eq(workflow.id, workflowId),
            eq(workflow.userId, ctx.auth.user.id),
          ),
        }),
      );

      return await db.transaction(async (tx) => {
        //delete existing nodes and connections (cascade deletes connections)
        await tx.delete(node).where(eq(node.workflowId, workflowId));

        //create nodes.
        await tx.insert(node).values(
          nodes.map((node) => ({
            id: node.id,
            workflowId: workflowId,
            name: node.type ?? "unknown",
            type: node.type as RegisteredNodeType,
            position: node.position,
            data: node.data || {},
          })),
        );

        //create connections.
        await tx.insert(connection).values(
          edges.map((edge) => ({
            workflowId: workflowId,
            fromNodeId: edge.source,
            toNodeId: edge.target,
            fromOutput: edge.sourceHandle || "main",
            toInput: edge.targetHandle || "main",
          })),
        );

        //updating the workflow's updateAt timestamp
        const [updatedWorkflow] = await tx
          .update(workflow)
          .set({ updatedAt: new Date() })
          .where(eq(workflow.id, workflowId))
          .returning();

        return updatedWorkflow;
      });
    }),

  getOne: protectedProcedure
    .input(z.object({ workflowId: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await findOrThrow(
        db.query.workflow.findFirst({
          where: and(
            eq(workflow.userId, ctx.auth.user.id),
            eq(workflow.id, input.workflowId),
          ),
          with: {
            nodes: true,
            connections: true,
          },
        }),
        "Workflow not found",
      );

      const nodes: Node[] = result.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position as { x: number; y: number },
        data: (node.data as Record<string, unknown>) || {},
      }));

      const edges: Edge[] = result.connections.map((connection) => ({
        id: connection.id,
        source: connection.fromNodeId,
        target: connection.toNodeId,
        sourceHandle: connection.fromOutput,
        targetHandle: connection.toInput,
      }));

      return {
        id: result.id,
        name: result.name,
        webhookSecret: result.webhookSecret,
        nodes,
        edges,
      };
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;

      const [items, [{ totalCount }]] = await Promise.all([
        db
          .select()
          .from(workflow)
          .where(
            and(
              eq(workflow.userId, ctx.auth.user.id),
              search ? ilike(workflow.name, `%${search}%`) : undefined,
            ),
          )
          .orderBy(desc(workflow.updatedAt))
          .offset((page - 1) * pageSize)
          .limit(pageSize),
        db
          .select({ totalCount: count() })
          .from(workflow)
          .where(
            and(
              eq(workflow.userId, ctx.auth.user.id),
              search ? ilike(workflow.name, `%${search}%`) : undefined,
            ),
          ),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        items,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      };
    }),
});
