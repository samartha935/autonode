import { PAGINATION } from "@/config/constants";
import { db } from "@/db";
import { credential, CredentialType } from "@/db/schema";
import {
  createTRPCRouter,
  premiumProcedure,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, ilike } from "drizzle-orm";
import z from "zod";

export async function findOrThrow<T>(
  query: Promise<T | undefined>,
  message = "Record not found",
): Promise<T> {
  const result = await query;
  if (!result) throw new TRPCError({ code: "NOT_FOUND", message });
  return result;
}

export const credentialsRouter = createTRPCRouter({
  create: premiumProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        type: z.enum(CredentialType),
        value: z.string().min(1, "Value is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, value, type } = input;

      return await db
        .insert(credential)
        .values({
          name,
          value,
          type,
          userId: ctx.auth.user.id,
        })
        .returning()
        .then((rows) => rows[0]);
    }),

  remove: protectedProcedure
    .input(z.object({ credentialId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await db
        .delete(credential)
        .where(
          and(
            eq(credential.userId, ctx.auth.user.id),
            eq(credential.id, input.credentialId),
          ),
        )
        .returning()
        .then((rows) => rows[0]);
    }),

  update: protectedProcedure
    .input(
      z.object({
        credentialId: z.string(),
        name: z.string().min(1, "Name is required"),
        type: z.enum(CredentialType),
        value: z.string().min(1, "Value is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { credentialId, name, type, value } = input;

      return await findOrThrow(
        db
          .update(credential)
          .set({ name, type, value })
          .where(
            and(
              eq(credential.userId, ctx.auth.user.id),
              eq(credential.id, credentialId),
            ),
          )
          .returning()
          .then((rows) => rows[0]),
      );
    }),

  getOne: protectedProcedure
    .input(z.object({ credentialId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await findOrThrow(
        db.query.credential.findFirst({
          where: and(
            eq(credential.userId, ctx.auth.user.id),
            eq(credential.id, input.credentialId),
          ),
        }),
      );
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
          .from(credential)
          .where(
            and(
              eq(credential.userId, ctx.auth.user.id),
              search ? ilike(credential.name, `%${search}%`) : undefined,
            ),
          )
          .orderBy(desc(credential.updatedAt))
          .offset((page - 1) * pageSize)
          .limit(pageSize),
        db
          .select({ totalCount: count() })
          .from(credential)
          .where(
            and(
              eq(credential.userId, ctx.auth.user.id),
              search ? ilike(credential.name, `%${search}%`) : undefined,
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

  getByType: protectedProcedure
    .input(
      z.object({
        type: z.enum(CredentialType),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { type } = input;

      return await findOrThrow(
        db
          .select()
          .from(credential)
          .where(
            and(
              eq(credential.userId, ctx.auth.user.id),
              eq(credential.type, type),
            ),
          )
          .orderBy(desc(credential.updatedAt)),
      );
    }),
});
