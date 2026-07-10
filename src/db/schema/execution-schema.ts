import {
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { workflow } from "./workflow-schema";

export const executionStatusEnum = pgEnum("execution_status", [
  "RUNNING",
  "SUCCESS",
  "FAILED",
]);

export const ExecutionType = Object.fromEntries(
  executionStatusEnum.enumValues.map((v) => [v, v]),
) as { [K in (typeof executionStatusEnum.enumValues)[number]]: K };

export const execution = pgTable("execution", {
  id: uuid("id").defaultRandom().primaryKey(),

  workflowId: uuid("workflow_id").references(() => workflow.id, {
    onDelete: "cascade",
  }),

  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),

  status: executionStatusEnum("status").default("RUNNING"),
  error: text("error"),
  errorStack: text("error_stack"),

  inngestEventId: text("inngest_event_id").unique(),

  output: jsonb("output"),
});
