import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { db } from "@/db";
import { user} from "@/db/schema";
import { eq } from "drizzle-orm";

export const appRouter = createTRPCRouter({
  getUsers: protectedProcedure.query(async ({ ctx }) => {
    const users = await db.query.user.findMany();

    return users;
  }),
  
});
// export type definition of API
export type AppRouter = typeof appRouter;
