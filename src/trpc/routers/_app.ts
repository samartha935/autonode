import { workflow } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "../init";
import { db } from "@/db";
import { inngest } from "@/inngest/client";
import z from "zod";

export const appRouter = createTRPCRouter({
  getWorkflows: protectedProcedure.query(async ({ ctx }) => {
    const workflow = await db.query.workflow.findMany();

    return workflow;
  }),

  createWorkflow: protectedProcedure.mutation(async () => {
    const newWorkflow = await inngest.send({
      name: "app/create.workflow",
      data: {
        name: "new Workflow using Inngest.",
      },
    });

    console.log(newWorkflow, "inngest event triggered. ");

    return newWorkflow;
  }),

  deleteWorkflow: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (opts) => {
      const deletedWorkflow = await inngest.send({
        name: "app/delete.workflow",
        data: {
          id: opts.input.id,
        },
      });

       console.log(deletedWorkflow, "deleted workflwoooooooo");

    return deletedWorkflow;
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
