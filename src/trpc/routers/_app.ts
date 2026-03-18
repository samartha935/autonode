import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { db } from "@/db";
import { usersTable } from "@/db/schema/schema";

export const appRouter = createTRPCRouter({
  getUsers: baseProcedure.query(() => {
    return db.select().from(usersTable);
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
