import { relations } from "drizzle-orm";
import { account, session, user } from "./auth-schema";
import { credential } from "./credential-schema";
import { node, workflow, connection } from "./workflow-schema";

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  credentials: many(credential),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const workflowRelations = relations(workflow, ({ many }) => ({
  nodes: many(node),
  connections: many(connection),
}));

export const nodeRelations = relations(node, ({ one }) => ({
  workflow: one(workflow, {
    fields: [node.workflowId],
    references: [workflow.id],
  }),
  credential: one(credential, {
    fields: [node.credentialId],
    references: [credential.id],
  }),
}));

export const connectionRelations = relations(connection, ({ one }) => ({
  workflow: one(workflow, {
    fields: [connection.workflowId],
    references: [workflow.id],
  }),
}));

export const credentialRelations = relations(credential, ({ one, many }) => ({
  user: one(user, {
    fields: [credential.userId],
    references: [user.id],
  }),
  nodes: many(node),
}));
