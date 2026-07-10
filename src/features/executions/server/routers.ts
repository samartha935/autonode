import { PAGINATION } from "@/config/constants";
import { db } from "@/db";
import { execution, ExecutionType, workflow } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, ilike } from "drizzle-orm";
import z from "zod";

const executionStatusSchema = z.enum([
  ExecutionType.RUNNING,
  ExecutionType.SUCCESS,
  ExecutionType.FAILED,
]);

export const executionsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({ executionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [result] = await db
        .select({
          id: execution.id,
          workflowId: execution.workflowId,
          startedAt: execution.startedAt,
          completedAt: execution.completedAt,
          status: execution.status,
          error: execution.error,
          errorStack: execution.errorStack,
          inngestEventId: execution.inngestEventId,
          output: execution.output,
          workflow: {
            id: workflow.id,
            name: workflow.name,
          },
        })
        .from(execution)
        .innerJoin(workflow, eq(execution.workflowId, workflow.id))
        .where(
          and(
            eq(workflow.userId, ctx.auth.user.id),
            eq(execution.id, input.executionId),
          ),
        )
        .limit(1);

      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Execution not found",
        });
      }

      return result;
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
        status: executionStatusSchema.nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search, status } = input;

      const whereClause = and(
        eq(workflow.userId, ctx.auth.user.id),
        search ? ilike(workflow.name, `%${search}%`) : undefined,
        status ? eq(execution.status, status) : undefined,
      );

      const [items, [{ totalCount }]] = await Promise.all([
        db
          .select({
            id: execution.id,
            workflowId: execution.workflowId,
            startedAt: execution.startedAt,
            completedAt: execution.completedAt,
            status: execution.status,
            error: execution.error,
            errorStack: execution.errorStack,
            inngestEventId: execution.inngestEventId,
            output: execution.output,
            workflow: {
              id: workflow.id,
              name: workflow.name,
            },
          })
          .from(execution)
          .innerJoin(workflow, eq(execution.workflowId, workflow.id))
          .where(whereClause)
          .orderBy(desc(execution.startedAt))
          .offset((page - 1) * pageSize)
          .limit(pageSize),
        db
          .select({ totalCount: count() })
          .from(execution)
          .innerJoin(workflow, eq(execution.workflowId, workflow.id))
          .where(whereClause),
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

  remove: protectedProcedure
    .input(z.object({ executionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [owned] = await db
        .select({ id: execution.id })
        .from(execution)
        .innerJoin(workflow, eq(execution.workflowId, workflow.id))
        .where(
          and(
            eq(execution.id, input.executionId),
            eq(workflow.userId, ctx.auth.user.id),
          ),
        )
        .limit(1);

      if (!owned) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Execution not found",
        });
      }

      const [deleted] = await db
        .delete(execution)
        .where(eq(execution.id, input.executionId))
        .returning();

      return deleted;
    }),
});
