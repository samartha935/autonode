import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const workflow = pgTable("workflow", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
});
