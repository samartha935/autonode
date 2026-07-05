import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { relations } from "drizzle-orm";

export const workflow = pgTable(
  "workflow",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    webhookSecret: text("webhook_secret").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("workflow_userId_idx").on(table.userId)],
);

export const nodeTypeEnum = pgEnum("node_type", [
  "INITIAL",
  "MANUAL_TRIGGER",
  "HTTP_REQUEST",
  "GOOGLE_FORM_TRIGGER",
]);

export const NodeType = Object.fromEntries(
  nodeTypeEnum.enumValues.map((v) => [v, v]),
) as { [K in (typeof nodeTypeEnum.enumValues)[number]]: K };

export const node = pgTable("node", {
  id: uuid("id").defaultRandom().primaryKey(),
  workflowId: uuid("workflow_id")
    .notNull()
    .references(() => workflow.id, { onDelete: "cascade" }),
  name: text().notNull(),
  type: nodeTypeEnum("type").notNull(),
  position: jsonb("position").notNull(),
  data: jsonb("data").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const connection = pgTable(
  "connection",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workflowId: uuid("workflow_id")
      .notNull()
      .references(() => workflow.id, { onDelete: "cascade" }),
    fromNodeId: uuid("from_node_id")
      .references(() => node.id, { onDelete: "cascade" })
      .notNull(),
    toNodeId: uuid("to_node_id")
      .references(() => node.id, { onDelete: "cascade" })
      .notNull(),
    fromOutput: text("from_output").notNull(),
    toInput: text("to_input").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("uq_connection_from_output").on(table.fromNodeId, table.fromOutput),
  ],
);

export const workflowRelations = relations(workflow, ({ many }) => ({
  nodes: many(node),
  connections: many(connection),
}));

export const nodeRelations = relations(node, ({ one }) => ({
  workflow: one(workflow, {
    fields: [node.workflowId],
    references: [workflow.id],
  }),
}));

export const connectionRelations = relations(connection, ({ one }) => ({
  workflow: one(workflow, {
    fields: [connection.workflowId],
    references: [workflow.id],
  }),
}));
