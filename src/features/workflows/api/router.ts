import { db } from "@/db";
import { workflow } from "@/db/schema";
import {
  createTRPCRouter,
  premiumProcedure,
  protectedProcedure,
} from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import { generateSlug } from "random-word-slugs";
import z from "zod";

export const workflowsRouter = createTRPCRouter({
  create: premiumProcedure.mutation(async ({ ctx }) => {
    return await db
      .insert(workflow)
      .values({
        name: generateSlug(3),
        userId: ctx.auth.user.id,
      })
      .returning()
      .then((rows) => rows[0]);
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
          and(eq(workflow.userId, ctx.auth.user.id), eq(workflow.id, input.workflowId)),
        )
        .returning()
        .then((rows) => rows[0]);
    }),

  getOne: protectedProcedure
    .input(z.object({ workflowId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await db
        .select()
        .from(workflow)
        .where(
          and(eq(workflow.userId, ctx.auth.user.id), eq(workflow.id, input.workflowId)),
        )
        .limit(1)
        .then((rows) => rows[0] ?? null);
    }),

  getMany: protectedProcedure.query(async ({ ctx }) => {
    return await db
      .select()
      .from(workflow)
      .where(eq(workflow.userId, ctx.auth.user.id));
  }),
});
