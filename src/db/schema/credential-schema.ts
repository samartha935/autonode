import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const credentialTypeEnum = pgEnum("credential_type", [
  "ANTHROPIC",
  "GEMINI",
  "OPENAI",
]);

export const CredentialType = Object.fromEntries(
  credentialTypeEnum.enumValues.map((v) => [v, v]),
) as { [K in (typeof credentialTypeEnum.enumValues)[number]]: K };

export const credential = pgTable("credential", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  value: text("value").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: credentialTypeEnum("type"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
